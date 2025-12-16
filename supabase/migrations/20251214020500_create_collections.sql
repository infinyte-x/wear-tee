-- Create collections table
CREATE TABLE IF NOT EXISTS "public"."collections" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "title" text NOT NULL,
  "slug" text NOT NULL,
  "description" text,
  "image" text,
  "is_active" boolean DEFAULT true,
  PRIMARY KEY ("id"),
  UNIQUE ("slug")
);

-- Create product_collections junction table
CREATE TABLE IF NOT EXISTS "public"."product_collections" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "collection_id" uuid NOT NULL,
  "product_id" uuid NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id"),
  FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE CASCADE,
  FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE,
  UNIQUE ("collection_id", "product_id")
);

-- Add RLS policies (simple public read, authenticated insert/update for now to match other tables if needed, 
-- but usually admin panels rely on service roles or specific admin policies. 
-- For this project, assuming open or authenticated access based on existing patterns)
ALTER TABLE "public"."collections" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."product_collections" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON "public"."collections"
AS PERMISSIVE FOR SELECT TO public USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."collections"
AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" ON "public"."collections"
AS PERMISSIVE FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable delete for authenticated users only" ON "public"."collections"
AS PERMISSIVE FOR DELETE TO authenticated USING (true);

-- Same for junction table
CREATE POLICY "Enable read access for all users" ON "public"."product_collections"
AS PERMISSIVE FOR SELECT TO public USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."product_collections"
AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only" ON "public"."product_collections"
AS PERMISSIVE FOR DELETE TO authenticated USING (true);
