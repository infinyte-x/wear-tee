-- Add new columns for enhanced product management

ALTER TABLE "public"."products" 
ADD COLUMN IF NOT EXISTS "tags" text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS "attributes" jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'active';

-- Add comment to status column
COMMENT ON COLUMN "public"."products"."status" IS 'Product status: draft, active, or archived';
