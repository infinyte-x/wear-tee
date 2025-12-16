-- Add new customization settings to site_settings table

-- Announcement Bar Settings
ALTER TABLE public.site_settings 
    ADD COLUMN IF NOT EXISTS announcement_enabled BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS announcement_text TEXT,
    ADD COLUMN IF NOT EXISTS announcement_link TEXT,
    ADD COLUMN IF NOT EXISTS announcement_bg_color TEXT DEFAULT '#000000',
    ADD COLUMN IF NOT EXISTS announcement_text_color TEXT DEFAULT '#ffffff';

-- Typography Settings
ALTER TABLE public.site_settings 
    ADD COLUMN IF NOT EXISTS heading_font TEXT DEFAULT 'Syne',
    ADD COLUMN IF NOT EXISTS body_font TEXT DEFAULT 'Inter',
    ADD COLUMN IF NOT EXISTS font_size_base TEXT DEFAULT '16px';

-- Navigation Settings (JSONB for flexibility)
ALTER TABLE public.site_settings 
    ADD COLUMN IF NOT EXISTS navigation_items JSONB DEFAULT '[
        {"label": "Home", "href": "/", "order": 1},
        {"label": "Products", "href": "/products", "order": 2},
        {"label": "About", "href": "/about", "order": 3}
    ]'::jsonb,
    ADD COLUMN IF NOT EXISTS show_search BOOLEAN DEFAULT true,
    ADD COLUMN IF NOT EXISTS show_cart_count BOOLEAN DEFAULT true;

-- Advanced Settings
ALTER TABLE public.site_settings 
    ADD COLUMN IF NOT EXISTS custom_css TEXT,
    ADD COLUMN IF NOT EXISTS custom_js TEXT,
    ADD COLUMN IF NOT EXISTS default_meta_title TEXT,
    ADD COLUMN IF NOT EXISTS default_meta_description TEXT,
    ADD COLUMN IF NOT EXISTS analytics_id TEXT;

-- Color Scheme Settings
ALTER TABLE public.site_settings 
    ADD COLUMN IF NOT EXISTS background_color TEXT DEFAULT '#ffffff',
    ADD COLUMN IF NOT EXISTS foreground_color TEXT DEFAULT '#000000',
    ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#6366f1',
    ADD COLUMN IF NOT EXISTS color_scheme TEXT DEFAULT 'light'; -- 'light', 'dark', 'custom'

COMMENT ON COLUMN public.site_settings.announcement_enabled IS 'Enable/disable site-wide announcement banner';
COMMENT ON COLUMN public.site_settings.navigation_items IS 'Custom navigation menu items as JSON array';
COMMENT ON COLUMN public.site_settings.custom_css IS 'Custom CSS to inject into site head';
COMMENT ON COLUMN public.site_settings.custom_js IS 'Custom JavaScript to inject before closing body tag';
COMMENT ON COLUMN public.site_settings.color_scheme IS 'Color scheme preset: light, dark, or custom';
