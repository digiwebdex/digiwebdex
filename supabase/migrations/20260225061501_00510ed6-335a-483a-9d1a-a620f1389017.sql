
-- Create chatbot_conversations table for logging AI chatbot messages
CREATE TABLE public.chatbot_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL DEFAULT 'messenger',
  sender_id TEXT NOT NULL,
  message_in TEXT NOT NULL,
  message_out TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chatbot_conversations ENABLE ROW LEVEL SECURITY;

-- Admin/staff only read access
CREATE POLICY "Admin and staff can view chatbot conversations"
  ON public.chatbot_conversations
  FOR SELECT
  USING (public.is_admin_or_staff(auth.uid()));

-- Allow service role inserts (edge function uses service role key)
-- No INSERT policy needed for anon/authenticated since edge function uses service_role_key

-- Index for fast lookups by sender
CREATE INDEX idx_chatbot_conversations_sender ON public.chatbot_conversations (sender_id, created_at DESC);
