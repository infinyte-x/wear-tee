-- Add shipment tracking columns to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS tracking_number TEXT,
ADD COLUMN IF NOT EXISTS carrier TEXT,
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ;

-- Create index for tracking number lookups
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON public.orders(tracking_number) WHERE tracking_number IS NOT NULL;

-- Create index for shipped orders
CREATE INDEX IF NOT EXISTS idx_orders_shipped_at ON public.orders(shipped_at) WHERE shipped_at IS NOT NULL;

COMMENT ON COLUMN public.orders.tracking_number IS 'Shipping carrier tracking number';
COMMENT ON COLUMN public.orders.carrier IS 'Shipping carrier name (USPS, FedEx, UPS, etc.)';
COMMENT ON COLUMN public.orders.shipped_at IS 'Timestamp when order was shipped';
