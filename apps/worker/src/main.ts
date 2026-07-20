import { IngestionWorker } from "./ingestion-worker.js";
import { Logger } from "./logger.js";

async function main() {
  const ingestionWorkerCronSchedule = process.env.INGESTION_WORKER_CRON_SCHEDULE;
  if (!ingestionWorkerCronSchedule) {
    Logger.error("INGESTION_WORKER_CRON_SCHEDULE is not set.");
    process.exit(1);
  }

  const ingestionWorkerBatchSize = Number(process.env.INGESTION_WORKER_BATCH_SIZE);
  if (!Number.isInteger(ingestionWorkerBatchSize) || ingestionWorkerBatchSize <= 0) {
    Logger.error("INGESTION_WORKER_BATCH_SIZE must be a positive integer.");
    process.exit(1);
  }

  const openRouterApiKey = process.env.OPEN_ROUTER_API_KEY;
  if (!openRouterApiKey) {
    Logger.error("OPEN_ROUTER_API_KEY is not set.");
    process.exit(1);
  }

  const worker = new IngestionWorker(
    ingestionWorkerCronSchedule,
    ingestionWorkerBatchSize,
    openRouterApiKey
  );

  await worker.start();

  let shuttingDown = false;
  const shutdown = async (signal: string) => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;

    Logger.info("received signal, shutting down", { signal });

    await worker.stop();

    process.exit(0);
  };

  process.on("SIGTERM", () => { void shutdown("SIGTERM"); });
  process.on("SIGINT", () => { void shutdown("SIGINT"); });
}

main().catch((err) => {
  Logger.error("Unexpected error has occurred.", {
    err: err instanceof Error ? err.message : String(err),
  });
  process.exit(1);
});
