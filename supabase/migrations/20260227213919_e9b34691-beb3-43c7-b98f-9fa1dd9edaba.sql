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
        (CASE
            WHEN due <= 0 THEN 'paid'::public.invoice_status
            WHEN adv > 0 THEN 'partial'::public.invoice_status
            ELSE 'unpaid'::public.invoice_status
        END),
        (CURRENT_DATE + INTERVAL '7 days')::date,
        'BDT'
    );

    RETURN NEW;
END;
$function$;