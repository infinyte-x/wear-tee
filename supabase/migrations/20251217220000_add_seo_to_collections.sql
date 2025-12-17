-- Add SEO fields to collections table
ALTER TABLE public.collections
    ADD COLUMN IF NOT EXISTS meta_title TEXT,
    ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- Add a comment to describe the columns
COMMENT ON COLUMN public.collections.meta_title IS 'SEO meta title for the collection page';
COMMENT ON COLUMN public.collections.meta_description IS 'SEO meta description for the collection page';
