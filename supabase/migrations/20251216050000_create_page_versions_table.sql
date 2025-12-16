-- Create page_versions table for tracking page history
CREATE TABLE IF NOT EXISTS page_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    content JSONB NOT NULL DEFAULT '[]'::jsonb,
    meta_title TEXT,
    description TEXT,
    meta_image TEXT,
    version_number INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create index for faster queries by page_id
CREATE INDEX IF NOT EXISTS idx_page_versions_page_id ON page_versions(page_id);

-- Create index for ordering by version number
CREATE INDEX IF NOT EXISTS idx_page_versions_version ON page_versions(page_id, version_number DESC);

-- Enable RLS
ALTER TABLE page_versions ENABLE ROW LEVEL SECURITY;

-- Policy for admin users to manage versions
CREATE POLICY "Admins can manage page versions"
ON page_versions
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid()
        AND role = 'admin'
    )
);

-- Function to get next version number
CREATE OR REPLACE FUNCTION get_next_page_version(p_page_id UUID)
RETURNS INTEGER AS $$
DECLARE
    next_version INTEGER;
BEGIN
    SELECT COALESCE(MAX(version_number), 0) + 1
    INTO next_version
    FROM page_versions
    WHERE page_id = p_page_id;
    
    RETURN next_version;
END;
$$ LANGUAGE plpgsql;
