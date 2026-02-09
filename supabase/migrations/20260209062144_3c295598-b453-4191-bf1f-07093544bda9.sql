-- Add order button settings to system_settings
INSERT INTO public.system_settings (key, value, category, description, is_sensitive, updated_at)
VALUES 
  ('header_order_button_enabled', 'true', 'general', 'Enable/disable the Order button in the header', false, now()),
  ('floating_order_button_enabled', 'true', 'general', 'Enable/disable the floating Order Now button (desktop + mobile bar)', false, now())
ON CONFLICT (key) DO NOTHING;