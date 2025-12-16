-- Migration: Create site_settings table for shop configuration
-- This table stores all shop configuration including branding, contact, social media, and settings

-- Create the table
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Store Identity
  store_name TEXT NOT NULL DEFAULT 'My Store',
  site_title TEXT NOT NULL DEFAULT 'My Store - E-commerce',
  store_address TEXT,
  business_hours TEXT DEFAULT 'Sat-Thu: 10AM-8PM',
  currency_symbol TEXT DEFAULT '৳',
  seo_description TEXT,
  announcement_message TEXT,
  
  -- Contact Information
  shop_email TEXT,
  phone_number TEXT,
  whatsapp_number TEXT,
  
  -- Social Media
  facebook_url TEXT,
  instagram_url TEXT,
  youtube_url TEXT,
  tiktok_url TEXT,
  
  -- Media (Supabase Storage URLs)
  logo_url TEXT,
  favicon_url TEXT,
  
  -- Shop Settings (Boolean toggles)
  maintain_stock BOOLEAN DEFAULT true,
  show_sold_count BOOLEAN DEFAULT true,
  allow_image_downloads BOOLEAN DEFAULT true,
  show_email_field BOOLEAN DEFAULT false,
  enable_promo_codes BOOLEAN DEFAULT true,
  
  -- Other Settings
  vat_percentage NUMERIC(5,2) DEFAULT 0,
  theme_color TEXT DEFAULT '#6366f1',
  default_language TEXT DEFAULT 'en',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Public can read settings (needed for storefront)
CREATE POLICY "Public read site_settings"
  ON site_settings FOR SELECT
  USING (true);

-- Policy: Only admins can modify settings
CREATE POLICY "Admin modify site_settings"
  ON site_settings FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Insert initial settings row
INSERT INTO site_settings (store_name, site_title, seo_description) 
VALUES (
  'BrandLaunch Studio',
  'BrandLaunch Studio - E-commerce Platform',
  'Your go-to destination for premium fashion and lifestyle products in Bangladesh'
);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to auto-update updated_at
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
