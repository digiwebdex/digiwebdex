-- Create enums for ticket system
CREATE TYPE public.ticket_category AS ENUM ('hosting', 'domain', 'software', 'billing', 'technical', 'other');
CREATE TYPE public.ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE public.ticket_status AS ENUM ('open', 'in_progress', 'waiting_customer', 'resolved', 'closed');

-- Create support_tickets table
CREATE TABLE public.support_tickets (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_number TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL,
    subject TEXT NOT NULL,
    description TEXT,
    category public.ticket_category NOT NULL DEFAULT 'other',
    priority public.ticket_priority NOT NULL DEFAULT 'medium',
    status public.ticket_status NOT NULL DEFAULT 'open',
    assigned_to UUID,
    related_order_id UUID REFERENCES public.orders(id),
    related_invoice_id UUID REFERENCES public.invoices(id),
    sla_due_at TIMESTAMP WITH TIME ZONE,
    first_response_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE,
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    satisfaction_feedback TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ticket_messages table
CREATE TABLE public.ticket_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL,
    message TEXT NOT NULL,
    is_internal_note BOOLEAN NOT NULL DEFAULT false,
    attachment_urls TEXT[],
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ticket_logs table for audit trail
CREATE TABLE public.ticket_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    performed_by UUID,
    old_value TEXT,
    new_value TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Generate ticket number function
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    new_number TEXT;
    year_prefix TEXT;
    next_seq INTEGER;
BEGIN
    year_prefix := 'TKT-' || TO_CHAR(NOW(), 'YYMM');
    SELECT COALESCE(MAX(SUBSTRING(ticket_number FROM 9)::INTEGER), 0) + 1
    INTO next_seq
    FROM public.support_tickets
    WHERE ticket_number LIKE year_prefix || '%';
    new_number := year_prefix || LPAD(next_seq::TEXT, 6, '0');
    RETURN new_number;
END;
$$;

-- Auto-generate ticket number trigger
CREATE OR REPLACE FUNCTION public.set_ticket_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    IF NEW.ticket_number IS NULL THEN
        NEW.ticket_number := public.generate_ticket_number();
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_ticket_number
    BEFORE INSERT ON public.support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION public.set_ticket_number();

-- Update timestamp trigger
CREATE TRIGGER update_support_tickets_updated_at
    BEFORE UPDATE ON public.support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Calculate SLA based on priority
CREATE OR REPLACE FUNCTION public.calculate_sla_due_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    IF NEW.sla_due_at IS NULL THEN
        CASE NEW.priority
            WHEN 'urgent' THEN NEW.sla_due_at := NOW() + INTERVAL '4 hours';
            WHEN 'high' THEN NEW.sla_due_at := NOW() + INTERVAL '8 hours';
            WHEN 'medium' THEN NEW.sla_due_at := NOW() + INTERVAL '24 hours';
            WHEN 'low' THEN NEW.sla_due_at := NOW() + INTERVAL '48 hours';
        END CASE;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_calculate_sla
    BEFORE INSERT ON public.support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION public.calculate_sla_due_at();

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for support_tickets
CREATE POLICY "Users can view their own tickets"
    ON public.support_tickets FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Users can create tickets"
    ON public.support_tickets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tickets"
    ON public.support_tickets FOR UPDATE
    USING (auth.uid() = user_id OR public.is_admin_or_staff(auth.uid()));

-- RLS Policies for ticket_messages
CREATE POLICY "Users can view messages on their tickets"
    ON public.ticket_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.support_tickets t
            WHERE t.id = ticket_id
            AND (t.user_id = auth.uid() OR public.is_admin_or_staff(auth.uid()))
        )
        AND (NOT is_internal_note OR public.is_admin_or_staff(auth.uid()))
    );

CREATE POLICY "Users can add messages to their tickets"
    ON public.ticket_messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.support_tickets t
            WHERE t.id = ticket_id
            AND (t.user_id = auth.uid() OR public.is_admin_or_staff(auth.uid()))
        )
    );

-- RLS Policies for ticket_logs
CREATE POLICY "Admin/Staff can view ticket logs"
    ON public.ticket_logs FOR SELECT
    USING (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "System can insert ticket logs"
    ON public.ticket_logs FOR INSERT
    WITH CHECK (true);

-- Create storage bucket for ticket attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('ticket-attachments', 'ticket-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for ticket attachments
CREATE POLICY "Users can upload ticket attachments"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'ticket-attachments' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view their ticket attachments"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'ticket-attachments' AND auth.role() = 'authenticated');

-- Create indexes for performance
CREATE INDEX idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_support_tickets_priority ON public.support_tickets(priority);
CREATE INDEX idx_support_tickets_assigned_to ON public.support_tickets(assigned_to);
CREATE INDEX idx_support_tickets_created_at ON public.support_tickets(created_at DESC);
CREATE INDEX idx_ticket_messages_ticket_id ON public.ticket_messages(ticket_id);
CREATE INDEX idx_ticket_messages_created_at ON public.ticket_messages(created_at);