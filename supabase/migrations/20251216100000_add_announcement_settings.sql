-- Add announcement animation and visibility settings
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS announcement_animation TEXT DEFAULT 'none',
ADD COLUMN IF NOT EXISTS announcement_show_on TEXT DEFAULT 'all';

-- Add comments
COMMENT ON COLUMN site_settings.announcement_animation IS 'Animation style: none, marquee, pulse, bounce, slide';
COMMENT ON COLUMN site_settings.announcement_show_on IS 'Page visibility: all, home, products';
