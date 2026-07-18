CREATE EXTENSION IF NOT EXISTS vector;
CREATE TYPE "chunking_job_status_enum" AS ENUM('scheduled', 'running', 'succeeded', 'failed');--> statement-breakpoint
CREATE TYPE "document_status_enum" AS ENUM('awaiting_approval', 'approved');--> statement-breakpoint
CREATE TABLE "chunking_job" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"document_id" uuid NOT NULL,
	"status" "chunking_job_status_enum" DEFAULT 'scheduled'::"chunking_job_status_enum" NOT NULL,
	"created_at" timestamp with time zone,
	"approved_at" timestamp with time zone,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"error" jsonb
);
--> statement-breakpoint
CREATE TABLE "chunks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"document_id" uuid NOT NULL,
	"content" text NOT NULL,
	"chunk_index" integer NOT NULL,
	"embedding" vector(1536),
	"created_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "document" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"file_key" text NOT NULL,
	"status" "document_status_enum" DEFAULT 'awaiting_approval'::"document_status_enum" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "chunking_job" ADD CONSTRAINT "chunking_job_document_id_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "document"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "chunks" ADD CONSTRAINT "chunks_document_id_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "document"("id") ON DELETE CASCADE;
