-- Create revenue_summary table for monthly aggregation
CREATE TABLE public.revenue_summary (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    month DATE NOT NULL,
    total_revenue NUMERIC NOT NULL DEFAULT 0,
    domain_revenue NUMERIC NOT NULL DEFAULT 0,
    hosting_revenue NUMERIC NOT NULL DEFAULT 0,
    web_development_revenue NUMERIC NOT NULL DEFAULT 0,
    software_development_revenue NUMERIC NOT NULL DEFAULT 0,
    digital_marketing_revenue NUMERIC NOT NULL DEFAULT 0,
    other_revenue NUMERIC NOT NULL DEFAULT 0,
    pending_invoices_count INTEGER NOT NULL DEFAULT 0,
    pending_invoices_amount NUMERIC NOT NULL DEFAULT 0,
    overdue_invoices_count INTEGER NOT NULL DEFAULT 0,
    overdue_invoices_amount NUMERIC NOT NULL DEFAULT 0,
    paid_invoices_count INTEGER NOT NULL DEFAULT 0,
    new_orders_count INTEGER NOT NULL DEFAULT 0,
    active_domains_count INTEGER NOT NULL DEFAULT 0,
    active_hosting_count INTEGER NOT NULL DEFAULT 0,
    suspended_hosting_count INTEGER NOT NULL DEFAULT 0,
    renewal_rate NUMERIC DEFAULT 0,
    mrr NUMERIC NOT NULL DEFAULT 0,
    arr NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT unique_month UNIQUE (month)
);

-- Enable RLS
ALTER TABLE public.revenue_summary ENABLE ROW LEVEL SECURITY;

-- Only admins can view and manage revenue summary
CREATE POLICY "Admins can view revenue summary"
ON public.revenue_summary
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage revenue summary"
ON public.revenue_summary
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_revenue_summary_updated_at
BEFORE UPDATE ON public.revenue_summary
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_revenue_summary_month ON public.revenue_summary(month DESC);