INSERT INTO storage.buckets (id, name, public) VALUES ('invoices', 'invoices', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Admins can manage invoice files" ON storage.objects FOR ALL USING (bucket_id = 'invoices' AND public.is_admin_or_staff(auth.uid()));
CREATE POLICY "Users can view own invoice files" ON storage.objects FOR SELECT USING (bucket_id = 'invoices');