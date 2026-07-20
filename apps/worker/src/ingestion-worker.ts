import { s3, DOCUMENT_BUCKET_NAME } from "s3"
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { TokenTextSplitter } from "@langchain/textsplitters";
import { PDFParse } from "pdf-parse";
import cron, { type ScheduledTask, type TaskContext } from "node-cron";
import { chunkingJobTable, chunks, db, type ChunkingJob, type ChunkInsert } from "db";
import { eq, inArray } from "drizzle-orm";
import { OpenRouter } from "@openrouter/sdk";
import { Logger } from "./logger.js";

export class IngestionWorker {
  private openRouterClient: OpenRouter;
  private task?: ScheduledTask;
  private processing = false;
  private stopped = false;
  private currentTick: Promise<void> | null = null;

  // Batch size is the amount we will claim (lock) and process
  constructor(
    private readonly cronSchedule: string,
    private readonly batchSize: number,
    openRouterApiKey: string
  ) {
    this.openRouterClient = new OpenRouter({
      apiKey: openRouterApiKey,
      retryConfig: {
        strategy: "backoff",
        backoff: {
          initialInterval: 1000,
          maxInterval: 16000,
          exponent: 2,
          maxElapsedTime: 60000,
        },
        retryConnectionErrors: true,
      },
    });
  }

  async start() {
    Logger.info("Ingestion schedule worker is starting");
    const task = cron.schedule(
      this.cronSchedule,
      (taskCtx) => {
        this.currentTick = this.handleScheduledJob(taskCtx);
        return this.currentTick;
      }
    );
    this.task = task;
    this.listeners(task);
  }

  async stop() {
    if (this.stopped) {
      Logger.info("The worker process has already been stopped...returning")
      return;
    }

    this.stopped = true;
    this.task?.stop();
    if (this.currentTick) {
      await this.currentTick.catch(() => { });
    }
  }

  private listeners(task: ScheduledTask) {
    task.on("execution:finished", (context) => {
      Logger.info("processed scheduled task", { taskId: context.task?.id, date: context.dateLocalIso, error: context.error })
    })
  }

  private async handleScheduledJob(context: TaskContext) {
    if (this.stopped) {
      Logger.info("The worker process has been stopped, so no jobs can continue")
      return;
    }
    if (this.processing) {
      Logger.info("The worker process still has a job processing.")
      return;
    }


    this.processing = true;
    try {
      Logger.info("processing scheduled task", { taskId: context.task?.id, date: context.dateLocalIso })

      // Get a row level lock on this current batch and another worker will skip if there is multiple instances of this worker.
      // Update its status and started_at columns

      //   UPDATE chunking_job
      //   SET status = 'running',
      //   started_at = now()
      //   WHERE id IN(
      //     SELECT id FROM chunking_job
      //     WHERE status = 'scheduled'
      //     ORDER BY created_at
      //     FOR UPDATE SKIP LOCKED
      //     LIMIT ${ this.batchSize }
      //   )
      //  RETURNING *;
      const claimedJobs = await db
        .update(chunkingJobTable)
        .set({
          status: "running",
          startedAt: new Date()
        })
        .where(
          inArray(
            chunkingJobTable.id,
            db.select({ id: chunkingJobTable.id })
              .from(chunkingJobTable)
              .where(eq(chunkingJobTable.status, "scheduled"))
              .orderBy(chunkingJobTable.createdAt)
              .limit(this.batchSize)
              .for("update", { skipLocked: true })
          ),
        )
        .returning();

      Logger.info("processable jobs", { jobCount: claimedJobs.length })

      if (claimedJobs.length === 0) {
        Logger.info("There are no jobs...returning.");
        return;
      }

      const settledJobs = await Promise.allSettled(
        claimedJobs.map(
          (job) => this.processJob(job)
        )
      );

      const failedJobs: { id: string; reason: unknown }[] = [];
      let succeededCount = 0;
      for (let i = 0; i < settledJobs.length; i++) {
        const settledJob = settledJobs[i]!;
        const claimedJob = claimedJobs[i]!;
        if (settledJob.status === "fulfilled") {
          succeededCount++;
        } else {
          failedJobs.push({ id: claimedJob.id, reason: settledJob.reason });
        }
      }

      Logger.info("succeeded jobs", { jobCount: succeededCount })

      if (failedJobs.length > 0) {
        Logger.info("failed jobs", { jobCount: failedJobs.length })
        for (const failedJob of failedJobs) {
          const reason = failedJob.reason instanceof Error
            ? failedJob.reason.message
            : String(failedJob.reason);
          Logger.error("job failed", { jobId: failedJob.id, reason });
          await db
            .update(chunkingJobTable)
            .set({
              status: "failed",
              completedAt: new Date(),
              error: { reason },
            })
            .where(eq(chunkingJobTable.id, failedJob.id));
        }
      }
    } finally {
      this.processing = false;
    }
  }

  private async processJob(job: ChunkingJob) {
    Logger.info("processing job", { jobId: job.id })
    // Fetch the document row to get its S3 fileKey.
    const document = await db.query.documentTable.findFirst({
      where: {
        id: job.documentId
      }
    });

    if (!document) {
      Logger.error(
        `document not found for chunking job ${job.id} (documentId=${job.documentId})`,
        {
          jobId: job.id,
        }
      );
      throw new Error(`document not found for chunking job ${job.id} (documentId = ${job.documentId})`);
    }

    Logger.info("document has been fetched", {
      jobId: job.id,
    })

    // Fetch the PDF bytes from S3 and extract its text.
    const object = await s3.send(
      new GetObjectCommand({ Bucket: DOCUMENT_BUCKET_NAME, Key: document.fileKey }),
    );
    if (!object.Body) {
      Logger.error(`S3 object body was empty for key ${document.fileKey}`, {
        jobId: job.id,
      });
      throw new Error(`S3 object body was empty for key ${document.fileKey}`);
    }

    Logger.info("document object has been pulled", {
      jobId: job.id,
    });

    const bytes = await object.Body.transformToByteArray();
    const parser = new PDFParse({ data: Buffer.from(bytes) });
    const { text } = await parser.getText();

    // Break the extracted text into token-bounded batches.
    const splitter = new TokenTextSplitter({ chunkSize: 500, chunkOverlap: 50 });
    const batches = await splitter.splitText(text);

    Logger.info("document contents have been segmented", {
      jobId: job.id,
    });


    // Create an embedding for each batch.
    const unstoredChunks: ChunkInsert[] = [];
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i]!;

      const embeddingResponse = await this.openRouterClient.embeddings.generate(
        {
          requestBody: {
            input: batch,
            model: "openai/text-embedding-3-small",
          },
        },
        {

          retryCodes: ["429"]
        }
      );

      if (typeof embeddingResponse === "string") {
        Logger.error(`embedding request failed for job ${job.id} chunk ${i}: ${embeddingResponse}`, {
          jobId: job.id,
        });
        throw new Error(`embedding request failed for job ${job.id} chunk ${i}: ${embeddingResponse} `);
      }

      const embedding = embeddingResponse.data[0]?.embedding;
      if (!Array.isArray(embedding)) {
        Logger.error(`unexpected embedding shape for job ${job.id} chunk ${i}`, {
          jobId: job.id,
        });
        throw new Error(`unexpected embedding shape for job ${job.id} chunk ${i} `);
      }

      Logger.info("create chunk", {
        chunkIndex: i,
        content: batch,
        jobId: job.id,
      });

      unstoredChunks.push({
        documentId: job.documentId,
        content: batch,
        chunkIndex: i,
        embedding,
      });
    }

    // Bulk write the chunks and mark the job succeeded in a single transaction.
    await db.transaction(async (tx) => {
      if (unstoredChunks.length > 0) {
        await tx.insert(chunks).values(unstoredChunks);
      }
      await tx
        .update(chunkingJobTable)
        .set({ status: "succeeded", completedAt: new Date() })
        .where(eq(chunkingJobTable.id, job.id));
    });

    Logger.info("job has been processed", {
      jobId: job.id,
    });
  }
}

