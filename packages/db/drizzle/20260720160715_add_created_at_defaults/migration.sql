ALTER TABLE "chunking_job" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "chunks" ALTER COLUMN "created_at" SET DEFAULT now();