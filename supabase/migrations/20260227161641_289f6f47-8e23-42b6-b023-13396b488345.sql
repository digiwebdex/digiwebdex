
-- Create role_permissions table for granular permission control
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role public.app_role NOT NULL,
  module text NOT NULL,
  action text NOT NULL,
  allowed boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (role, module, action)
);

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage role permissions"
  ON public.role_permissions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff can view role permissions"
  ON public.role_permissions FOR SELECT
  USING (public.is_admin_or_staff(auth.uid()));

-- Create has_permission function
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _module text, _action text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role = rp.role
    WHERE ur.user_id = _user_id
      AND rp.module = _module
      AND rp.action = _action
      AND rp.allowed = true
  )
$$;

-- Data integrity: prevent order deletion if paid invoices exist
CREATE OR REPLACE FUNCTION public.check_order_delete_integrity()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.invoices
    WHERE order_id = OLD.id AND status = 'paid'
  ) THEN
    RAISE EXCEPTION 'Cannot delete order with paid invoices. Cancel or refund invoices first.';
  END IF;
  DELETE FROM public.invoices WHERE order_id = OLD.id AND status != 'paid';
  RETURN OLD;
END;
$$;

CREATE TRIGGER trigger_check_order_delete
  BEFORE DELETE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.check_order_delete_integrity();

-- Insert default permissions
INSERT INTO public.role_permissions (role, module, action) VALUES
  ('admin', 'orders', 'view'), ('admin', 'orders', 'edit'), ('admin', 'orders', 'delete'), ('admin', 'orders', 'export'),
  ('admin', 'invoices', 'view'), ('admin', 'invoices', 'edit'), ('admin', 'invoices', 'delete'), ('admin', 'invoices', 'export'),
  ('admin', 'customers', 'view'), ('admin', 'customers', 'edit'), ('admin', 'customers', 'delete'), ('admin', 'customers', 'export'),
  ('admin', 'domains', 'view'), ('admin', 'domains', 'edit'), ('admin', 'domains', 'delete'), ('admin', 'domains', 'export'),
  ('admin', 'hosting', 'view'), ('admin', 'hosting', 'edit'), ('admin', 'hosting', 'delete'), ('admin', 'hosting', 'export'),
  ('admin', 'leads', 'view'), ('admin', 'leads', 'edit'), ('admin', 'leads', 'delete'), ('admin', 'leads', 'export'),
  ('admin', 'payments', 'view'), ('admin', 'payments', 'edit'), ('admin', 'payments', 'export'),
  ('admin', 'subscriptions', 'view'), ('admin', 'subscriptions', 'edit'), ('admin', 'subscriptions', 'export'),
  ('admin', 'settings', 'view'), ('admin', 'settings', 'edit'),
  ('admin', 'users', 'view'), ('admin', 'users', 'edit'), ('admin', 'users', 'delete'),
  ('admin', 'audit', 'view'), ('admin', 'audit', 'export'),
  ('admin', 'financial', 'view'),
  ('staff', 'orders', 'view'), ('staff', 'orders', 'edit'),
  ('staff', 'invoices', 'view'), ('staff', 'invoices', 'edit'),
  ('staff', 'customers', 'view'), ('staff', 'customers', 'edit'),
  ('staff', 'domains', 'view'), ('staff', 'domains', 'edit'),
  ('staff', 'hosting', 'view'), ('staff', 'hosting', 'edit'),
  ('staff', 'leads', 'view'), ('staff', 'leads', 'edit'),
  ('staff', 'payments', 'view'),
  ('staff', 'subscriptions', 'view'),
  ('support', 'orders', 'view'),
  ('support', 'invoices', 'view'),
  ('support', 'customers', 'view'),
  ('support', 'leads', 'view'), ('support', 'leads', 'edit')
ON CONFLICT (role, module, action) DO NOTHING;
