-- Add callback button setting to system_settings
INSERT INTO public.system_settings (key, value, category, description, is_sensitive, updated_at)
VALUES (
  'callback_button_enabled',
  'true',
  'general',
  'Enable/disable the floating callback request button on the website',
  false,
  now()
) ON CONFLICT (key) DO NOTHING;