-- Fix RLS policy to allow viewing orders without user_id (guest orders)
-- The current policy only allows viewing orders where user_id matches auth.uid() or user is admin
-- But if user_id is NULL, we still need admins to be able to view them

-- Drop and recreate with better policy that explicitly handles NULL user_id
-- Actually, the existing policy should work, let's add one for order_items where order has null user_id

-- Allow admins to view order_items for guest orders (orders with null user_id)
CREATE POLICY "Admins can view guest order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id IS NULL
    )
    AND public.has_role(auth.uid(), 'admin')
  );
