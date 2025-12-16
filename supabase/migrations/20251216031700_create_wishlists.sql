-- Create wishlists table for user's favorite products
CREATE TABLE public.wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own wishlist items
CREATE POLICY "Users can view own wishlist" ON public.wishlists
    FOR SELECT USING (auth.uid() = user_id);

-- Users can add to their wishlist
CREATE POLICY "Users can add to wishlist" ON public.wishlists
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can remove from their wishlist
CREATE POLICY "Users can remove from wishlist" ON public.wishlists
    FOR DELETE USING (auth.uid() = user_id);

-- Admins can view all wishlists (for analytics)
CREATE POLICY "Admins can view all wishlists" ON public.wishlists
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes
CREATE INDEX idx_wishlists_user_id ON public.wishlists(user_id);
CREATE INDEX idx_wishlists_product_id ON public.wishlists(product_id);
CREATE INDEX idx_wishlists_created_at ON public.wishlists(created_at DESC);
