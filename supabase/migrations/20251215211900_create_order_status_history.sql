-- Migration: Create order_status_history table for audit trail
-- This tracks all order status changes with timestamps and who made the change

-- Create the order_status_history table
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  note TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for fast lookups by order
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id 
  ON order_status_history(order_id);

-- Create index for timeline queries
CREATE INDEX IF NOT EXISTS idx_order_status_history_created_at 
  ON order_status_history(created_at DESC);

-- Enable Row Level Security
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view history for their own orders
CREATE POLICY "Users view own order history" ON order_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_status_history.order_id 
      AND (orders.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

-- Policy: System/Admins can insert history records
CREATE POLICY "Insert order history" ON order_status_history
  FOR INSERT WITH CHECK (true);

-- Policy: No one can update or delete history (immutable audit trail)
-- (No UPDATE or DELETE policies = denied by default with RLS enabled)
