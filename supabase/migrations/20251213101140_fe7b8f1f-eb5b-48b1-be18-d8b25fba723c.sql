-- Add low stock threshold to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 10;

-- Create stock movements table for audit trail
CREATE TABLE public.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity_change INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  movement_type TEXT NOT NULL, -- 'in', 'out', 'adjustment', 'order', 'return'
  reason TEXT, -- 'purchase', 'damage', 'theft', 'correction', 'order_placed', 'order_cancelled', 'return'
  notes TEXT,
  reference_id UUID, -- can reference order_id or other entities
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stock_movements
CREATE POLICY "Admins can manage stock movements"
ON public.stock_movements
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all stock movements"
ON public.stock_movements
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_stock_movements_product_id ON public.stock_movements(product_id);
CREATE INDEX idx_stock_movements_created_at ON public.stock_movements(created_at DESC);
CREATE INDEX idx_stock_movements_type ON public.stock_movements(movement_type);

-- Function to record stock movement and update product stock
CREATE OR REPLACE FUNCTION public.adjust_stock(
  p_product_id UUID,
  p_quantity_change INTEGER,
  p_movement_type TEXT,
  p_reason TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL
)
RETURNS public.stock_movements
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_previous_stock INTEGER;
  v_new_stock INTEGER;
  v_movement public.stock_movements;
BEGIN
  -- Get current stock
  SELECT stock INTO v_previous_stock FROM products WHERE id = p_product_id FOR UPDATE;
  
  IF v_previous_stock IS NULL THEN
    RAISE EXCEPTION 'Product not found';
  END IF;
  
  -- Calculate new stock
  v_new_stock := v_previous_stock + p_quantity_change;
  
  -- Prevent negative stock
  IF v_new_stock < 0 THEN
    RAISE EXCEPTION 'Insufficient stock. Current: %, Requested change: %', v_previous_stock, p_quantity_change;
  END IF;
  
  -- Update product stock
  UPDATE products SET stock = v_new_stock, updated_at = now() WHERE id = p_product_id;
  
  -- Record movement
  INSERT INTO stock_movements (
    product_id, quantity_change, previous_stock, new_stock, 
    movement_type, reason, notes, reference_id, created_by
  ) VALUES (
    p_product_id, p_quantity_change, v_previous_stock, v_new_stock,
    p_movement_type, p_reason, p_notes, p_reference_id, auth.uid()
  ) RETURNING * INTO v_movement;
  
  RETURN v_movement;
END;
$$;