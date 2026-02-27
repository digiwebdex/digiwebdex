
-- Create a trigger function to auto-generate invoice when a new order is created
CREATE OR REPLACE FUNCTION public.auto_generate_invoice()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    new_invoice_number TEXT;
BEGIN
    -- Generate invoice number
    new_invoice_number := public.generate_invoice_number();
    
    -- Create invoice for the new order
    INSERT INTO public.invoices (
        invoice_number,
        order_id,
        user_id,
        subtotal,
        discount,
        tax,
        total,
        status,
        due_date,
        currency
    ) VALUES (
        new_invoice_number,
        NEW.id,
        NEW.user_id,
        NEW.total,
        0,
        0,
        NEW.total,
        'unpaid',
        (CURRENT_DATE + INTERVAL '7 days')::date,
        'BDT'
    );
    
    RETURN NEW;
END;
$function$;

-- Create the trigger on orders table
CREATE TRIGGER trigger_auto_generate_invoice
    AFTER INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_generate_invoice();
