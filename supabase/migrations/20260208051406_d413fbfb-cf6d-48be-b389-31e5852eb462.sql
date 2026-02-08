-- Create table for tracking event logs
CREATE TABLE public.tracking_event_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    event_name TEXT NOT NULL,
    event_id TEXT NOT NULL,
    source TEXT NOT NULL CHECK (source IN ('pixel', 'capi', 'both')),
    user_data JSONB,
    custom_data JSONB,
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
    error_message TEXT,
    response_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_tracking_event_logs_event_id ON public.tracking_event_logs(event_id);
CREATE INDEX idx_tracking_event_logs_event_name ON public.tracking_event_logs(event_name);
CREATE INDEX idx_tracking_event_logs_created_at ON public.tracking_event_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.tracking_event_logs ENABLE ROW LEVEL SECURITY;

-- Admin only access
CREATE POLICY "Admins can view tracking logs"
ON public.tracking_event_logs
FOR SELECT
USING (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "System can insert tracking logs"
ON public.tracking_event_logs
FOR INSERT
WITH CHECK (true);

-- Add Facebook tracking settings to system_settings (using proper JSON format)
INSERT INTO public.system_settings (key, value, category) VALUES
('fb_pixel_id', '""', 'tracking'),
('fb_access_token', '""', 'tracking'),
('fb_capi_enabled', 'false', 'tracking'),
('fb_test_event_code', '""', 'tracking'),
('cookie_consent_enabled', 'true', 'privacy'),
('cookie_consent_text_en', '"We use cookies to improve your experience and for analytics. By continuing, you consent to our use of cookies."', 'privacy'),
('cookie_consent_text_bn', '"আমরা আপনার অভিজ্ঞতা উন্নত করতে এবং বিশ্লেষণের জন্য কুকি ব্যবহার করি। চালিয়ে যাওয়ার মাধ্যমে, আপনি আমাদের কুকি ব্যবহারে সম্মতি দিচ্ছেন।"', 'privacy')
ON CONFLICT (key) DO NOTHING;