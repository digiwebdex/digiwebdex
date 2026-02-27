CREATE OR REPLACE FUNCTION public.update_customer_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Update customer balance from only due-bearing invoice statuses
  UPDATE public.profiles
  SET balance_due = COALESCE((
    SELECT SUM(COALESCE(due_amount, 0))
    FROM public.invoices
    WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
      AND status IN ('unpaid', 'partial', 'overdue')
  ), 0)
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id);

  RETURN COALESCE(NEW, OLD);
END;
$function$;