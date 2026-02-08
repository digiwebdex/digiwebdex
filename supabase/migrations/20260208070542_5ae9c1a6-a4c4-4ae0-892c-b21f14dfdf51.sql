-- Insert missing Facebook tracking settings
INSERT INTO system_settings (key, value, category, description, is_sensitive) VALUES
  ('fb_pixel_id', '""', 'tracking', 'Facebook Pixel ID for conversion tracking', false),
  ('fb_access_token', '""', 'tracking', 'Facebook Conversions API access token', true),
  ('fb_capi_enabled', 'false', 'tracking', 'Enable Facebook Conversions API (server-side)', false),
  ('fb_test_event_code', '""', 'tracking', 'Facebook test event code for debugging', false),
  ('cookie_consent_enabled', 'true', 'tracking', 'Show cookie consent banner', false),
  ('cookie_consent_text_en', '"We use cookies to improve your experience and for analytics. By continuing, you consent to our use of cookies."', 'tracking', 'Cookie consent text in English', false),
  ('cookie_consent_text_bn', '"আমরা আপনার অভিজ্ঞতা উন্নত করতে এবং বিশ্লেষণের জন্য কুকি ব্যবহার করি। চালিয়ে যাওয়ার মাধ্যমে, আপনি আমাদের কুকি ব্যবহারে সম্মতি দিচ্ছেন।"', 'tracking', 'Cookie consent text in Bangla', false)
ON CONFLICT (key) DO NOTHING;

-- Insert missing notification settings
INSERT INTO system_settings (key, value, category, description, is_sensitive) VALUES
  ('sms_api_key', '""', 'notifications', 'SMS API key for BulkSMSBD', true),
  ('smtp_password', '""', 'notifications', 'SMTP password for email sending', true),
  ('whatsapp_api_token', '""', 'notifications', 'WhatsApp Business API token', true),
  ('admin_notification_email', '"digiwebdex@gmail.com"', 'notifications', 'Admin notification email', false),
  ('admin_notification_phone', '"+8801674533303"', 'notifications', 'Admin notification phone', false)
ON CONFLICT (key) DO NOTHING;

-- Insert missing security settings
INSERT INTO system_settings (key, value, category, description, is_sensitive) VALUES
  ('rate_limit_enabled', 'true', 'security', 'Enable rate limiting', false),
  ('rate_limit_max_requests', '100', 'security', 'Max requests per window', false),
  ('rate_limit_window_seconds', '60', 'security', 'Rate limit window in seconds', false),
  ('audit_log_enabled', 'true', 'security', 'Enable audit logging', false),
  ('duplicate_submission_check', 'true', 'security', 'Prevent duplicate form submissions', false)
ON CONFLICT (key) DO NOTHING;

-- Insert bank account number if missing
INSERT INTO system_settings (key, value, category, description, is_sensitive) VALUES
  ('bank_account_number', '"2706101077904"', 'payment', 'Bank account number', false)
ON CONFLICT (key) DO NOTHING;

-- Fix permissive RLS policies on tracking_event_logs - make INSERT more restrictive
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "System can insert tracking logs" ON tracking_event_logs;

-- Create a new policy that allows inserts only from authenticated users or service role
CREATE POLICY "Authenticated can insert tracking logs" ON tracking_event_logs
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Ensure contact_messages has proper INSERT policy for unauthenticated users
DROP POLICY IF EXISTS "Anyone can insert contact messages" ON contact_messages;
CREATE POLICY "Anyone can insert contact messages" ON contact_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Fix lead insertion policy
DROP POLICY IF EXISTS "Anyone can insert leads" ON leads;
CREATE POLICY "Anyone can insert leads" ON leads
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Fix domain_search_logs insertion policy  
DROP POLICY IF EXISTS "Anyone can insert search logs" ON domain_search_logs;
CREATE POLICY "Anyone can insert search logs" ON domain_search_logs
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);