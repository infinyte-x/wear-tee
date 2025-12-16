-- Add missing fields for customization pages

-- Navigation settings
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS show_wishlist boolean DEFAULT true;

-- Additional social media URLs  
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS twitter_url text;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS youtube_url text;

-- Comments
COMMENT ON COLUMN site_settings.show_wishlist IS 'Whether to show wishlist icon in navigation';
COMMENT ON COLUMN site_settings.twitter_url IS 'Twitter/X profile URL';
COMMENT ON COLUMN site_settings.youtube_url IS 'YouTube channel URL';
