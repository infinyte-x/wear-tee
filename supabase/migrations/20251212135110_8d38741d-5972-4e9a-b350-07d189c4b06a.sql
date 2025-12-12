
-- 1. Shipping zones table
CREATE TABLE public.shipping_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_bn TEXT,
  base_rate NUMERIC NOT NULL DEFAULT 0,
  free_shipping_threshold NUMERIC,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Payment methods table
CREATE TABLE public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  instructions TEXT,
  account_number TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Bangladesh divisions table
CREATE TABLE public.bd_divisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_bn TEXT
);

-- 4. Bangladesh districts table
CREATE TABLE public.bd_districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  division_id UUID REFERENCES public.bd_divisions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_bn TEXT
);

-- 5. Update orders table with BD-specific columns
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS alt_phone TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS division TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS district TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS area TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_fee NUMERIC DEFAULT 0;

-- Enable RLS on new tables
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bd_divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bd_districts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shipping_zones
CREATE POLICY "Admins can manage shipping zones" ON public.shipping_zones
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can view active shipping zones" ON public.shipping_zones
  FOR SELECT USING (is_active = true);

-- RLS Policies for payment_methods
CREATE POLICY "Admins can manage payment methods" ON public.payment_methods
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can view active payment methods" ON public.payment_methods
  FOR SELECT USING (is_active = true);

-- RLS Policies for bd_divisions
CREATE POLICY "Anyone can view divisions" ON public.bd_divisions
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage divisions" ON public.bd_divisions
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for bd_districts
CREATE POLICY "Anyone can view districts" ON public.bd_districts
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage districts" ON public.bd_districts
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Insert default shipping zones
INSERT INTO public.shipping_zones (name, name_bn, base_rate, free_shipping_threshold, display_order) VALUES
  ('Inside Dhaka', 'ঢাকার ভেতরে', 60, 5000, 1),
  ('Outside Dhaka', 'ঢাকার বাইরে', 120, 7000, 2);

-- Insert default payment methods
INSERT INTO public.payment_methods (name, type, instructions, display_order) VALUES
  ('Cash on Delivery', 'cod', 'Pay when you receive your order', 1),
  ('bKash', 'mobile_wallet', 'Send payment to our bKash merchant number', 2),
  ('Nagad', 'mobile_wallet', 'Send payment to our Nagad merchant number', 3),
  ('Rocket', 'mobile_wallet', 'Send payment to our Rocket number', 4),
  ('Bank Transfer', 'bank', 'Transfer to our bank account', 5);

-- Insert Bangladesh divisions
INSERT INTO public.bd_divisions (name, name_bn) VALUES
  ('Dhaka', 'ঢাকা'),
  ('Chittagong', 'চট্টগ্রাম'),
  ('Rajshahi', 'রাজশাহী'),
  ('Khulna', 'খুলনা'),
  ('Barishal', 'বরিশাল'),
  ('Sylhet', 'সিলেট'),
  ('Rangpur', 'রংপুর'),
  ('Mymensingh', 'ময়মনসিংহ');

-- Insert major districts (Dhaka division example - you can add more)
INSERT INTO public.bd_districts (division_id, name, name_bn)
SELECT d.id, district.name, district.name_bn
FROM public.bd_divisions d,
(VALUES 
  ('Dhaka', 'ঢাকা', 'Dhaka'),
  ('Gazipur', 'গাজীপুর', 'Dhaka'),
  ('Narayanganj', 'নারায়ণগঞ্জ', 'Dhaka'),
  ('Tangail', 'টাঙ্গাইল', 'Dhaka'),
  ('Kishoreganj', 'কিশোরগঞ্জ', 'Dhaka'),
  ('Manikganj', 'মানিকগঞ্জ', 'Dhaka'),
  ('Munshiganj', 'মুন্সিগঞ্জ', 'Dhaka'),
  ('Narsingdi', 'নরসিংদী', 'Dhaka'),
  ('Faridpur', 'ফরিদপুর', 'Dhaka'),
  ('Gopalganj', 'গোপালগঞ্জ', 'Dhaka'),
  ('Madaripur', 'মাদারীপুর', 'Dhaka'),
  ('Rajbari', 'রাজবাড়ী', 'Dhaka'),
  ('Shariatpur', 'শরীয়তপুর', 'Dhaka'),
  ('Chittagong', 'চট্টগ্রাম', 'Chittagong'),
  ('Comilla', 'কুমিল্লা', 'Chittagong'),
  ('Cox''s Bazar', 'কক্সবাজার', 'Chittagong'),
  ('Feni', 'ফেনী', 'Chittagong'),
  ('Brahmanbaria', 'ব্রাহ্মণবাড়িয়া', 'Chittagong'),
  ('Noakhali', 'নোয়াখালী', 'Chittagong'),
  ('Lakshmipur', 'লক্ষ্মীপুর', 'Chittagong'),
  ('Sylhet', 'সিলেট', 'Sylhet'),
  ('Moulvibazar', 'মৌলভীবাজার', 'Sylhet'),
  ('Habiganj', 'হবিগঞ্জ', 'Sylhet'),
  ('Sunamganj', 'সুনামগঞ্জ', 'Sylhet'),
  ('Rajshahi', 'রাজশাহী', 'Rajshahi'),
  ('Bogra', 'বগুড়া', 'Rajshahi'),
  ('Pabna', 'পাবনা', 'Rajshahi'),
  ('Natore', 'নাটোর', 'Rajshahi'),
  ('Khulna', 'খুলনা', 'Khulna'),
  ('Jessore', 'যশোর', 'Khulna'),
  ('Satkhira', 'সাতক্ষীরা', 'Khulna'),
  ('Bagerhat', 'বাগেরহাট', 'Khulna'),
  ('Barishal', 'বরিশাল', 'Barishal'),
  ('Patuakhali', 'পটুয়াখালী', 'Barishal'),
  ('Bhola', 'ভোলা', 'Barishal'),
  ('Rangpur', 'রংপুর', 'Rangpur'),
  ('Dinajpur', 'দিনাজপুর', 'Rangpur'),
  ('Kurigram', 'কুড়িগ্রাম', 'Rangpur'),
  ('Mymensingh', 'ময়মনসিংহ', 'Mymensingh'),
  ('Jamalpur', 'জামালপুর', 'Mymensingh'),
  ('Netrokona', 'নেত্রকোণা', 'Mymensingh')
) AS district(name, name_bn, division_name)
WHERE d.name = district.division_name;

-- Trigger for updated_at on shipping_zones
CREATE TRIGGER update_shipping_zones_updated_at
  BEFORE UPDATE ON public.shipping_zones
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
