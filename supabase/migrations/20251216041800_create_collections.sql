-- Fix collections table - add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add is_visible if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='collections' AND column_name='is_visible') THEN
        ALTER TABLE public.collections ADD COLUMN is_visible BOOLEAN DEFAULT true;
    END IF;

    -- Add sort_order if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='collections' AND column_name='sort_order') THEN
        ALTER TABLE public.collections ADD COLUMN sort_order INTEGER DEFAULT 0;
    END IF;

    -- Add created_at if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='collections' AND column_name='created_at') THEN
        ALTER TABLE public.collections ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;

    -- Add updated_at if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='collections' AND column_name='updated_at') THEN
        ALTER TABLE public.collections ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Create collection_products junction table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.collection_products (
    collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    PRIMARY KEY (collection_id, product_id)
);

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Collections are viewable by everyone" ON public.collections;
DROP POLICY IF EXISTS "Admins can manage collections" ON public.collections;
DROP POLICY IF EXISTS "Authenticated users can manage collections" ON public.collections;
DROP POLICY IF EXISTS "Collection products are viewable by everyone" ON public.collection_products;
DROP POLICY IF EXISTS "Admins can manage collection products" ON public.collection_products;
DROP POLICY IF EXISTS "Authenticated users can manage collection products" ON public.collection_products;

-- Enable RLS (if not already enabled)
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_products ENABLE ROW LEVEL SECURITY;

-- Create policies with admin-only access
CREATE POLICY "Collections are viewable by everyone"
    ON public.collections FOR SELECT
    USING (is_visible = true);

CREATE POLICY "Admins can manage collections"
    ON public.collections FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Collection products are viewable by everyone"
    ON public.collection_products FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.collections
            WHERE collections.id = collection_id
            AND collections.is_visible = true
        )
    );

CREATE POLICY "Admins can manage collection products"
    ON public.collection_products FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_collections_slug ON public.collections(slug);
CREATE INDEX IF NOT EXISTS idx_collections_visible ON public.collections(is_visible);
CREATE INDEX IF NOT EXISTS idx_collections_sort_order ON public.collections(sort_order);
CREATE INDEX IF NOT EXISTS idx_collection_products_collection ON public.collection_products(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_products_product ON public.collection_products(product_id);

-- Create the trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_collections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at trigger
DROP TRIGGER IF EXISTS collections_updated_at ON public.collections;
CREATE TRIGGER collections_updated_at
    BEFORE UPDATE ON public.collections
    FOR EACH ROW
    EXECUTE FUNCTION update_collections_updated_at();
