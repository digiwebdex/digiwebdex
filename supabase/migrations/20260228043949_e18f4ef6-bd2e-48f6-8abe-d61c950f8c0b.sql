
-- Add 'merged' to order_status enum
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'merged';

-- Add merged_invoice_id column to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS merged_invoice_id uuid REFERENCES public.invoices(id);
