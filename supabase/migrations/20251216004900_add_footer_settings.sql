-- Add footer-specific settings columns to site_settings table
-- These complement existing social media fields

ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS footer_newsletter_title TEXT DEFAULT 'Newsletter',
ADD COLUMN IF NOT EXISTS footer_newsletter_text TEXT DEFAULT 'Subscribe to receive updates, access to exclusive deals, and more.',
ADD COLUMN IF NOT EXISTS footer_copyright_text TEXT;

-- Update the default row with initial values
UPDATE public.site_settings 
SET 
    footer_newsletter_title = COALESCE(footer_newsletter_title, 'Newsletter'),
    footer_newsletter_text = COALESCE(footer_newsletter_text, 'Subscribe to receive updates, access to exclusive deals, and more.')
WHERE id IS NOT NULL;
