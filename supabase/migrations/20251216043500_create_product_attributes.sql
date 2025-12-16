-- Create ENUM for attribute types
CREATE TYPE attribute_type AS ENUM ('select', 'multi_select', 'text', 'color');

-- Create product_attributes table
CREATE TABLE IF NOT EXISTS public.product_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    type attribute_type NOT NULL DEFAULT 'select',
    description TEXT,
    is_visible BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create attribute_values table
CREATE TABLE IF NOT EXISTS public.attribute_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attribute_id UUID NOT NULL REFERENCES public.product_attributes(id) ON DELETE CASCADE,
    value TEXT NOT NULL,
    slug TEXT NOT NULL,
    color_code TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(attribute_id, slug)
);

-- Create product_attribute_values junction table
CREATE TABLE IF NOT EXISTS public.product_attribute_values (
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    attribute_value_id UUID REFERENCES public.attribute_values(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, attribute_value_id)
);

-- Enable RLS
ALTER TABLE public.product_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attribute_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_attribute_values ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_attributes
CREATE POLICY "Product attributes are viewable by everyone"
    ON public.product_attributes FOR SELECT
    USING (is_visible = true);

CREATE POLICY "Admins can manage product attributes"
    ON public.product_attributes FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for attribute_values
CREATE POLICY "Attribute values are viewable by everyone"
    ON public.attribute_values FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.product_attributes
            WHERE product_attributes.id = attribute_id
            AND product_attributes.is_visible = true
        )
    );

CREATE POLICY "Admins can manage attribute values"
    ON public.attribute_values FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for product_attribute_values
CREATE POLICY "Product attribute values are viewable by everyone"
    ON public.product_attribute_values FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage product attribute values"
    ON public.product_attribute_values FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_product_attributes_slug ON public.product_attributes(slug);
CREATE INDEX IF NOT EXISTS idx_product_attributes_visible ON public.product_attributes(is_visible);
CREATE INDEX IF NOT EXISTS idx_product_attributes_sort_order ON public.product_attributes(sort_order);
CREATE INDEX IF NOT EXISTS idx_attribute_values_attribute ON public.attribute_values(attribute_id);
CREATE INDEX IF NOT EXISTS idx_attribute_values_slug ON public.attribute_values(attribute_id, slug);
CREATE INDEX IF NOT EXISTS idx_product_attribute_values_product ON public.product_attribute_values(product_id);
CREATE INDEX IF NOT EXISTS idx_product_attribute_values_value ON public.product_attribute_values(attribute_value_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_product_attributes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at trigger
CREATE TRIGGER product_attributes_updated_at
    BEFORE UPDATE ON public.product_attributes
    FOR EACH ROW
    EXECUTE FUNCTION update_product_attributes_updated_at();

COMMENT ON TABLE public.product_attributes IS 'Product attribute types (Size, Color, etc.)';
COMMENT ON TABLE public.attribute_values IS 'Predefined values for product attributes';
COMMENT ON TABLE public.product_attribute_values IS 'Links products to their attribute values';
