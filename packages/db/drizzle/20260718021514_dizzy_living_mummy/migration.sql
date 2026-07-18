CREATE EXTENSION IF NOT EXISTS vector;--> statement-breakpoint
CREATE TYPE "chunking_job_status_enum" AS ENUM('awaiting_approval', 'scheduled', 'running', 'succeeded', 'failed');--> statement-breakpoint
CREATE TABLE "chunking_job" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"document_id" uuid NOT NULL,
	"status" "chunking_job_status_enum" DEFAULT 'awaiting_approval'::"chunking_job_status_enum" NOT NULL,
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
	"created_at" timestamp with time zone DEFAULT now()
);
