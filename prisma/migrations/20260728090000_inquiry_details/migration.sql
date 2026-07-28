-- AlterTable
ALTER TABLE "contact_inquiries" ADD COLUMN IF NOT EXISTS "nationality" VARCHAR(100);
ALTER TABLE "contact_inquiries" ADD COLUMN IF NOT EXISTS "country_code" VARCHAR(20);
ALTER TABLE "contact_inquiries" ADD COLUMN IF NOT EXISTS "travelers" VARCHAR(50);
ALTER TABLE "contact_inquiries" ADD COLUMN IF NOT EXISTS "reference_id" VARCHAR(255);
ALTER TABLE "contact_inquiries" ADD COLUMN IF NOT EXISTS "reference_name" VARCHAR(255);
ALTER TABLE "contact_inquiries" ADD COLUMN IF NOT EXISTS "reference_summary" TEXT;
ALTER TABLE "contact_inquiries" ADD COLUMN IF NOT EXISTS "meta" JSONB;
ALTER TABLE "contact_inquiries" ADD COLUMN IF NOT EXISTS "locale" VARCHAR(10);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "contact_inquiries_created_at_idx" ON "contact_inquiries"("created_at" DESC);
CREATE INDEX IF NOT EXISTS "contact_inquiries_status_idx" ON "contact_inquiries"("status");
CREATE INDEX IF NOT EXISTS "contact_inquiries_is_read_idx" ON "contact_inquiries"("is_read");
