
-- Create order_items table for multi-item order support
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  service_type TEXT,
  package_name TEXT,
  billing_type TEXT DEFAULT 'one_time',
  domain TEXT,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  qty INTEGER NOT NULL DEFAULT 1,
  total NUMERIC NOT NULL DEFAULT 0,
  renewal_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins can manage order items"
  ON public.order_items FOR ALL
  USING (is_admin_or_staff(auth.uid()));

CREATE POLICY "Users can view own order items"
  ON public.order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  ));

-- Index for performance
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
