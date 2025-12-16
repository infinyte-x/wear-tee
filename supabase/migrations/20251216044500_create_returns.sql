-- Create ENUM for return status
CREATE TYPE return_status AS ENUM ('pending', 'approved', 'rejected', 'completed');

-- Create returns table
CREATE TABLE IF NOT EXISTS public.returns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES auth.users(id),
    reason TEXT NOT NULL,
    status return_status NOT NULL DEFAULT 'pending',
    refund_amount DECIMAL(10, 2),
    return_tracking TEXT,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;

-- Customers can view their own returns
CREATE POLICY "Users can view own returns"
    ON public.returns FOR SELECT
    USING (customer_id = auth.uid());

-- Customers can create returns
CREATE POLICY "Users can create returns"
    ON public.returns FOR INSERT
    WITH CHECK (customer_id = auth.uid());

-- Admins can manage all returns
CREATE POLICY "Admins can manage all returns"
    ON public.returns FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_returns_order ON public.returns(order_id);
CREATE INDEX IF NOT EXISTS idx_returns_customer ON public.returns(customer_id);
CREATE INDEX IF NOT EXISTS idx_returns_status ON public.returns(status);
CREATE INDEX IF NOT EXISTS idx_returns_created ON public.returns(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_returns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER returns_updated_at
    BEFORE UPDATE ON public.returns
    FOR EACH ROW
    EXECUTE FUNCTION update_returns_updated_at();

COMMENT ON TABLE public.returns IS 'Customer return requests for orders';
