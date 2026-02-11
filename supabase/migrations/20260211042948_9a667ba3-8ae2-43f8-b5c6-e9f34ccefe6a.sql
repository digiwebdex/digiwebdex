
-- Insert exit popup settings into system_settings
INSERT INTO public.system_settings (key, value, category, description, is_sensitive)
VALUES 
  ('exit_popup_enabled', 'true', 'general', 'Enable/disable the exit intent popup on the website', false),
  ('exit_popup_title_bn', '"যাবেন না!"', 'general', 'Exit popup title in Bengali', false),
  ('exit_popup_title_en', '"Wait!"', 'general', 'Exit popup title in English', false),
  ('exit_popup_subtitle_bn', '"ফ্রি কনসাল্টেশন নিন এবং ১০% ডিসকাউন্ট পান!"', 'general', 'Exit popup subtitle in Bengali', false),
  ('exit_popup_subtitle_en', '"Get free consultation + 10% discount!"', 'general', 'Exit popup subtitle in English', false),
  ('exit_popup_button_text_bn', '"ডিসকাউন্ট নিন"', 'general', 'Exit popup button text in Bengali', false),
  ('exit_popup_button_text_en', '"Get Discount"', 'general', 'Exit popup button text in English', false),
  ('exit_popup_delay_seconds', '10', 'general', 'Delay in seconds before exit popup can appear', false)
ON CONFLICT (key) DO NOTHING;
