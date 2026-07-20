import type { chunkingJobTable, chunks, documentTable } from "./schema.js";

export type Document = typeof documentTable.$inferSelect;
export type DocumentInsert = typeof documentTable.$inferInsert;
export type ChunkingJob = typeof chunkingJobTable.$inferSelect;
export type ChunkingJobInsert = typeof chunkingJobTable.$inferInsert;
export type Chunk = typeof chunks.$inferSelect;
export type ChunkInsert = typeof chunks.$inferInsert;
