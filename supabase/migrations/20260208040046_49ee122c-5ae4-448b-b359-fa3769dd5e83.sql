-- Create lead status enum
CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'converted', 'lost');

-- Create leads table
CREATE TABLE public.leads (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    service_interest VARCHAR(255),
    source VARCHAR(100) DEFAULT 'website',
    status lead_status NOT NULL DEFAULT 'new',
    notes TEXT,
    assigned_to UUID,
    converted_order_id UUID REFERENCES public.orders(id),
    first_contact_at TIMESTAMP WITH TIME ZONE,
    last_follow_up_at TIMESTAMP WITH TIME ZONE,
    follow_up_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lead activity logs table
CREATE TABLE public.lead_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    performed_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_phone ON public.leads(phone);
CREATE INDEX idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX idx_lead_logs_lead_id ON public.lead_logs(lead_id);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for leads
CREATE POLICY "Admins can manage leads" ON public.leads
    FOR ALL USING (is_admin_or_staff(auth.uid()));

CREATE POLICY "Anyone can create leads" ON public.leads
    FOR INSERT WITH CHECK (true);

-- RLS policies for lead_logs
CREATE POLICY "Admins can manage lead logs" ON public.lead_logs
    FOR ALL USING (is_admin_or_staff(auth.uid()));

CREATE POLICY "System can insert lead logs" ON public.lead_logs
    FOR INSERT WITH CHECK (true);

-- Create updated_at trigger
CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();