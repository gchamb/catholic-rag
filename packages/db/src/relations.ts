import { defineRelations } from "drizzle-orm";
import { documentTable, chunkingJobTable, chunks } from "./schema.js";

export const relations = defineRelations({ documentTable, chunkingJobTable, chunks }, (r) => ({
  documentTable: {
    chunkingJobs: r.one.chunkingJobTable({
      from: r.documentTable.id,
      to: r.chunkingJobTable.documentId,
    }),
    chunks: r.many.chunks(),
  },
  chunkingJobTable: {
    document: r.one.documentTable({
      from: r.chunkingJobTable.documentId,
      to: r.documentTable.id,
    }),
  },
  chunks: {
    document: r.one.documentTable({
      from: r.chunks.documentId,
      to: r.documentTable.id,
    }),
  },
}));
