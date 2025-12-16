-- Add page_id column to collections table for page builder customization
ALTER TABLE collections ADD COLUMN IF NOT EXISTS page_id uuid REFERENCES pages(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_collections_page_id ON collections(page_id);

-- Add comment
COMMENT ON COLUMN collections.page_id IS 'Optional reference to a page for custom collection page content';
