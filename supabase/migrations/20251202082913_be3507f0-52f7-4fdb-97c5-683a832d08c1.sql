-- Create products table for fashion catalog
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  images TEXT[] NOT NULL DEFAULT '{}',
  category TEXT NOT NULL,
  sizes TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  stock INTEGER NOT NULL DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view products (public access)
CREATE POLICY "Anyone can view products" 
ON public.products 
FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample luxury fashion products
INSERT INTO public.products (name, description, price, images, category, sizes, colors, stock, featured) VALUES
('Cashmere Oversized Coat', 'Handcrafted Italian cashmere in a timeless silhouette. Dropped shoulders and minimal detailing create an effortless, elegant presence.', 1299.00, ARRAY['https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800'], 'Outerwear', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Charcoal', 'Camel', 'Navy'], 45, true),
('Silk Slip Dress', 'Pure silk charmeuse with delicate bias-cut construction. Minimalist straps and cowl neckline embody refined luxury.', 489.00, ARRAY['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800'], 'Dresses', ARRAY['XS', 'S', 'M', 'L'], ARRAY['Ivory', 'Black', 'Sage'], 60, true),
('Merino Turtleneck', 'Extra-fine merino wool in a classic silhouette. Seamless construction and ribbed details for timeless sophistication.', 245.00, ARRAY['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800'], 'Knitwear', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Cream', 'Charcoal', 'Camel'], 80, false),
('Tailored Trousers', 'High-waisted Italian wool gabardine with pressed creases. Elegant drape and timeless cut for effortless refinement.', 395.00, ARRAY['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800'], 'Bottoms', ARRAY['24', '25', '26', '27', '28', '29', '30'], ARRAY['Black', 'Navy', 'Stone'], 55, true),
('Leather Tote', 'Vegetable-tanned Italian leather with minimal hardware. Spacious interior and reinforced handles for everyday luxury.', 695.00, ARRAY['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800'], 'Accessories', ARRAY['One Size'], ARRAY['Tan', 'Black', 'Burgundy'], 35, false),
('Cotton Poplin Shirt', 'Crisp Egyptian cotton with mother-of-pearl buttons. Classic collar and refined tailoring for understated elegance.', 225.00, ARRAY['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800'], 'Tops', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['White', 'Ecru', 'Charcoal'], 70, false);