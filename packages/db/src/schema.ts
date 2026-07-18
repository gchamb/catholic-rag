import { uuid, pgTable, timestamp, text, pgEnum, jsonb, integer, vector } from "drizzle-orm/pg-core";

export const documentStatusEnum = pgEnum("document_status_enum", [
  'awaiting_approval',
  'approved',
  // no denied, because if denied we are deleting it.
]);

export const documentTable = pgTable("document", {
  id: uuid("id").primaryKey().defaultRandom(),
  fileKey: text("file_key").notNull(),
  status: documentStatusEnum("status").notNull().default("awaiting_approval"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
export const chunkingJobEnum = pgEnum("chunking_job_status_enum", [
  'scheduled',
  'running',
  'succeeded',
  'failed'
]);

export const chunkingJobTable = pgTable("chunking_job", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentId: uuid("document_id").notNull().references(() => documentTable.id, { onDelete: "cascade" }),
  status: chunkingJobEnum("status").notNull().default("scheduled"),
  createdAt: timestamp("created_at", { withTimezone: true }),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  error: jsonb()
});

export const chunks = pgTable("chunks", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentId: uuid("document_id").notNull().references(() => documentTable.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  chunkIndex: integer("chunk_index").notNull(),
  embedding: vector({
    dimensions: 1536 // matches the model
  }),
  createdAt: timestamp("created_at", { withTimezone: true }),
});
