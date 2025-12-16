-- Migration: Create logos storage bucket for shop branding assets
-- Stores logo and favicon files

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT DO NOTHING;

-- Note: storage.objects RLS is enabled by default in Supabase

-- Policy: Anyone can read logos (needed for public storefront)
CREATE POLICY "Public read logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'logos');

-- Policy: Admins can upload logos
CREATE POLICY "Admin upload logos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'logos' 
    AND public.has_role(auth.uid(), 'admin')
  );

-- Policy: Admins can update logos
CREATE POLICY "Admin update logos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'logos' 
    AND public.has_role(auth.uid(), 'admin')
  );

-- Policy: Admins can delete logos
CREATE POLICY "Admin delete logos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'logos' 
    AND public.has_role(auth.uid(), 'admin')
  );
