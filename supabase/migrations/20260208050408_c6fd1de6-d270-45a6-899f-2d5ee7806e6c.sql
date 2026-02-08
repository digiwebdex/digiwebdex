-- =========================================================
-- 1. System Settings Module (Key-Value Store)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  category TEXT NOT NULL DEFAULT 'general',
  description TEXT,
  is_sensitive BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage system settings"
  ON public.system_settings FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff can view non-sensitive settings"
  ON public.system_settings FOR SELECT
  USING (is_admin_or_staff(auth.uid()) AND is_sensitive = false);

-- Insert default settings
INSERT INTO public.system_settings (key, value, category, description) VALUES
  -- SMS Configuration
  ('sms_api_url', '"https://bulksmsbd.net/api/smsapi"', 'notifications', 'SMS API endpoint URL'),
  ('sms_api_key', '""', 'notifications', 'SMS API key (sensitive)'),
  ('sms_sender_id', '"DigiWebDex"', 'notifications', 'SMS sender ID'),
  
  -- WhatsApp Configuration
  ('whatsapp_api_url', '""', 'notifications', 'WhatsApp API endpoint'),
  ('whatsapp_api_token', '""', 'notifications', 'WhatsApp API token (sensitive)'),
  ('whatsapp_phone_id', '""', 'notifications', 'WhatsApp Phone ID'),
  
  -- Email SMTP Configuration
  ('smtp_host', '"smtp.gmail.com"', 'notifications', 'SMTP server host'),
  ('smtp_port', '587', 'notifications', 'SMTP server port'),
  ('smtp_user', '""', 'notifications', 'SMTP username'),
  ('smtp_password', '""', 'notifications', 'SMTP password (sensitive)'),
  ('smtp_from_email', '"noreply@digiwebdex.com"', 'notifications', 'From email address'),
  ('smtp_from_name', '"DigiWebDex"', 'notifications', 'From name'),
  
  -- Payment Configuration
  ('bkash_number', '"01XXXXXXXXX"', 'payment', 'bKash payment number'),
  ('nagad_number', '"01XXXXXXXXX"', 'payment', 'Nagad payment number'),
  ('rocket_number', '"01XXXXXXXXX"', 'payment', 'Rocket payment number'),
  ('bank_name', '"Dutch Bangla Bank"', 'payment', 'Bank name'),
  ('bank_account_name', '"DigiWebDex"', 'payment', 'Bank account name'),
  ('bank_account_number', '""', 'payment', 'Bank account number'),
  ('bank_branch', '""', 'payment', 'Bank branch'),
  ('bank_routing_number', '""', 'payment', 'Bank routing number'),
  
  -- Contact Information
  ('company_name', '"DigiWebDex"', 'general', 'Company name'),
  ('company_email', '"info@digiwebdex.com"', 'general', 'Company email'),
  ('company_phone', '"+8801XXXXXXXXX"', 'general', 'Company phone'),
  ('company_address', '"Dhaka, Bangladesh"', 'general', 'Company address'),
  ('company_logo_url', '""', 'general', 'Company logo URL'),
  
  -- Business Settings
  ('default_currency', '"BDT"', 'business', 'Default currency code'),
  ('grace_period_days', '7', 'business', 'Payment grace period in days'),
  ('reminder_interval_days', '3', 'business', 'Reminder interval in days'),
  ('default_commission_rate', '10', 'business', 'Default affiliate commission rate (%)'),
  ('default_reseller_margin', '15', 'business', 'Default reseller margin (%)'),
  ('default_milestone_percentages', '{"initial": 30, "mid": 40, "final": 30}', 'business', 'Default milestone split percentages'),
  
  -- Automation Settings
  ('auto_reminder_enabled', 'true', 'automation', 'Enable automatic reminders'),
  ('subscription_auto_renew', 'true', 'automation', 'Enable subscription auto-renewal'),
  ('auto_suspend_enabled', 'true', 'automation', 'Enable automatic suspension on non-payment'),
  ('auto_suspend_days', '14', 'automation', 'Days before auto-suspension'),
  ('proposal_reminder_enabled', 'true', 'automation', 'Enable proposal reminder'),
  ('proposal_reminder_days', '3', 'automation', 'Days before proposal reminder'),
  ('milestone_reminder_days', '2', 'automation', 'Days before milestone due reminder'),
  
  -- Security Settings
  ('rate_limit_enabled', 'true', 'security', 'Enable API rate limiting'),
  ('rate_limit_requests', '100', 'security', 'Max requests per minute'),
  ('ip_restriction_enabled', 'false', 'security', 'Enable IP restriction for admin'),
  ('allowed_admin_ips', '[]', 'security', 'Allowed IP addresses for admin access'),
  ('two_factor_required', 'false', 'security', 'Require 2FA for admin users'),
  
  -- Discount Settings
  ('discount_system_enabled', 'true', 'pricing', 'Enable discount/coupon system'),
  ('max_discount_percentage', '50', 'pricing', 'Maximum allowed discount percentage')
ON CONFLICT (key) DO NOTHING;

-- Update sensitive flags
UPDATE public.system_settings SET is_sensitive = true 
WHERE key IN ('sms_api_key', 'whatsapp_api_token', 'smtp_password', 'bank_account_number');

-- =========================================================
-- 2. Homepage Sections (CMS)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.homepage_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT NOT NULL UNIQUE,
  title_en TEXT,
  title_bn TEXT,
  subtitle_en TEXT,
  subtitle_bn TEXT,
  content_en TEXT,
  content_bn TEXT,
  image_url TEXT,
  cta_text_en TEXT,
  cta_text_bn TEXT,
  cta_link TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage homepage sections"
  ON public.homepage_sections FOR ALL
  USING (is_admin_or_staff(auth.uid()));

CREATE POLICY "Anyone can view active homepage sections"
  ON public.homepage_sections FOR SELECT
  USING (is_active = true);

-- Insert default sections
INSERT INTO public.homepage_sections (section_key, title_en, title_bn, subtitle_en, subtitle_bn, sort_order) VALUES
  ('hero', 'Build Your Digital Presence', 'আপনার ডিজিটাল উপস্থিতি তৈরি করুন', 'Professional web solutions for your business', 'আপনার ব্যবসার জন্য পেশাদার ওয়েব সমাধান', 1),
  ('services', 'Our Services', 'আমাদের সেবাসমূহ', 'Comprehensive digital solutions', 'সম্পূর্ণ ডিজিটাল সমাধান', 2),
  ('features', 'Why Choose Us', 'কেন আমাদের বেছে নিবেন', 'What makes us different', 'আমাদের বিশেষত্ব', 3),
  ('portfolio', 'Our Work', 'আমাদের কাজ', 'Projects we are proud of', 'আমাদের গর্বের প্রজেক্ট', 4),
  ('testimonials', 'Client Testimonials', 'ক্লায়েন্ট প্রশংসাপত্র', 'What our clients say', 'আমাদের ক্লায়েন্টদের মতামত', 5),
  ('pricing', 'Pricing', 'মূল্য', 'Transparent pricing for all services', 'সব সেবার স্বচ্ছ মূল্য', 6),
  ('cta', 'Get Started Today', 'আজই শুরু করুন', 'Transform your business with us', 'আমাদের সাথে আপনার ব্যবসা রূপান্তর করুন', 7),
  ('faq', 'Frequently Asked Questions', 'সচরাচর জিজ্ঞাসিত প্রশ্ন', 'Find answers to common questions', 'সাধারণ প্রশ্নের উত্তর পান', 8),
  ('offer_banner', 'Special Offer', 'বিশেষ অফার', 'Limited time discount', 'সীমিত সময়ের জন্য ছাড়', 9)
ON CONFLICT (section_key) DO NOTHING;

-- =========================================================
-- 3. Proposal Templates
-- =========================================================
CREATE TABLE IF NOT EXISTS public.proposal_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  header_text_en TEXT,
  header_text_bn TEXT,
  footer_text_en TEXT,
  footer_text_bn TEXT,
  terms_conditions_en TEXT,
  terms_conditions_bn TEXT,
  payment_instructions_en TEXT,
  payment_instructions_bn TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#2563eb',
  secondary_color TEXT DEFAULT '#1e40af',
  accent_color TEXT DEFAULT '#3b82f6',
  show_company_details BOOLEAN DEFAULT true,
  show_bank_details BOOLEAN DEFAULT true,
  show_mobile_payment BOOLEAN DEFAULT true,
  custom_css TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.proposal_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage proposal templates"
  ON public.proposal_templates FOR ALL
  USING (is_admin_or_staff(auth.uid()));

CREATE POLICY "Anyone can view proposal templates"
  ON public.proposal_templates FOR SELECT
  USING (true);

-- Insert default template
INSERT INTO public.proposal_templates (name, is_default, header_text_en, header_text_bn, footer_text_en, footer_text_bn, terms_conditions_en, terms_conditions_bn, payment_instructions_en, payment_instructions_bn) VALUES
  ('Default Template', true, 
   'Thank you for considering DigiWebDex for your project.',
   'আপনার প্রজেক্টের জন্য DigiWebDex বিবেচনা করার জন্য ধন্যবাদ।',
   'We look forward to working with you.',
   'আপনার সাথে কাজ করার জন্য অপেক্ষায় রইলাম।',
   '1. 50% advance payment required to start.\n2. Remaining 50% upon project completion.\n3. Revisions limited to project scope.\n4. Timeline starts after advance payment.',
   '১. শুরুতে ৫০% অগ্রিম পেমেন্ট প্রয়োজন।\n২. প্রজেক্ট সম্পন্ন হলে বাকি ৫০%।\n৩. সংশোধন প্রজেক্ট স্কোপের মধ্যে সীমাবদ্ধ।\n৪. অগ্রিম পেমেন্টের পর টাইমলাইন শুরু।',
   'Please make payment via bKash/Nagad or bank transfer.',
   'অনুগ্রহ করে বিকাশ/নগদ অথবা ব্যাংক ট্রান্সফারের মাধ্যমে পেমেন্ট করুন।');

-- =========================================================
-- 4. Custom Fields for Leads & Projects
-- =========================================================
CREATE TYPE public.custom_field_type AS ENUM ('text', 'number', 'date', 'select', 'multiselect', 'checkbox', 'textarea', 'email', 'phone', 'url');

CREATE TABLE IF NOT EXISTS public.custom_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('lead', 'project', 'order', 'client')),
  field_key TEXT NOT NULL,
  field_label_en TEXT NOT NULL,
  field_label_bn TEXT,
  field_type custom_field_type NOT NULL DEFAULT 'text',
  options JSONB DEFAULT '[]'::jsonb,
  default_value TEXT,
  is_required BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  validation_rules JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(entity_type, field_key)
);

ALTER TABLE public.custom_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage custom fields"
  ON public.custom_fields FOR ALL
  USING (is_admin_or_staff(auth.uid()));

CREATE POLICY "Anyone can view active custom fields"
  ON public.custom_fields FOR SELECT
  USING (is_active = true);

-- =========================================================
-- 5. Custom Field Values
-- =========================================================
CREATE TABLE IF NOT EXISTS public.custom_field_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id UUID REFERENCES public.custom_fields(id) ON DELETE CASCADE NOT NULL,
  entity_id UUID NOT NULL,
  entity_type TEXT NOT NULL,
  value JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(field_id, entity_id)
);

ALTER TABLE public.custom_field_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage custom field values"
  ON public.custom_field_values FOR ALL
  USING (is_admin_or_staff(auth.uid()));

CREATE POLICY "Users can view own entity field values"
  ON public.custom_field_values FOR SELECT
  USING (true);

-- =========================================================
-- 6. Enhance notification_templates with event_name
-- =========================================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_templates' AND column_name = 'event_name') THEN
    ALTER TABLE public.notification_templates ADD COLUMN event_name TEXT;
  END IF;
END $$;

-- Update existing templates with event names
UPDATE public.notification_templates SET event_name = slug WHERE event_name IS NULL;

-- =========================================================
-- 7. Add automation_logs for tracking
-- =========================================================
CREATE TABLE IF NOT EXISTS public.automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  status TEXT NOT NULL DEFAULT 'success',
  details JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view automation logs"
  ON public.automation_logs FOR SELECT
  USING (is_admin_or_staff(auth.uid()));

CREATE POLICY "System can insert automation logs"
  ON public.automation_logs FOR INSERT
  WITH CHECK (true);

-- =========================================================
-- 8. Add updated_at triggers
-- =========================================================
CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_homepage_sections_updated_at
  BEFORE UPDATE ON public.homepage_sections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_proposal_templates_updated_at
  BEFORE UPDATE ON public.proposal_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_custom_fields_updated_at
  BEFORE UPDATE ON public.custom_fields
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_custom_field_values_updated_at
  BEFORE UPDATE ON public.custom_field_values
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();