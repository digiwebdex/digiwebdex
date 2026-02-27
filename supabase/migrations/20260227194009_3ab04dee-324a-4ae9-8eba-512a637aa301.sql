
-- Add 'partial' to invoice_status enum
ALTER TYPE invoice_status ADD VALUE IF NOT EXISTS 'partial';

-- Add advance_paid and due_amount columns to invoices
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS advance_paid numeric DEFAULT 0;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS due_amount numeric DEFAULT 0;

-- Add balance_due to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS balance_due numeric DEFAULT 0;

-- Create invoice_items table
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  service_type text,
  package_name text,
  domain text,
  description text,
  price numeric NOT NULL DEFAULT 0,
  qty integer NOT NULL DEFAULT 1,
  total numeric NOT NULL DEFAULT 0,
  renewal_date date,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on invoice_items
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for invoice_items
CREATE POLICY "Admins can manage invoice items" ON public.invoice_items
  FOR ALL USING (is_admin_or_staff(auth.uid()));

CREATE POLICY "Users can view own invoice items" ON public.invoice_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

-- Create trigger to update customer balance when invoice changes
CREATE OR REPLACE FUNCTION public.update_customer_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Update balance_due for the customer
  UPDATE public.profiles
  SET balance_due = COALESCE((
    SELECT SUM(COALESCE(due_amount, 0))
    FROM public.invoices
    WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
    AND status NOT IN ('cancelled', 'refunded', 'paid')
  ), 0)
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE OR REPLACE TRIGGER update_balance_on_invoice_change
  AFTER INSERT OR UPDATE OR DELETE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_customer_balance();

-- Update auto_generate_invoice to include advance_paid and due_amount
CREATE OR REPLACE FUNCTION public.auto_generate_invoice()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    new_invoice_number TEXT;
    adv numeric;
    due numeric;
BEGIN
    new_invoice_number := public.generate_invoice_number();
    adv := COALESCE(NEW.advance_payment, 0);
    due := NEW.total - adv;
    
    INSERT INTO public.invoices (
        invoice_number, order_id, user_id,
        subtotal, discount, tax, total,
        advance_paid, due_amount,
        status, due_date, currency
    ) VALUES (
        new_invoice_number, NEW.id, NEW.user_id,
        NEW.subtotal, COALESCE(NEW.discount, 0), COALESCE(NEW.tax, 0), NEW.total,
        adv, due,
        CASE WHEN due <= 0 THEN 'paid' WHEN adv > 0 THEN 'partial' ELSE 'unpaid' END,
        (CURRENT_DATE + INTERVAL '7 days')::date,
        'BDT'
    );
    
    RETURN NEW;
END;
$function$;
