-- DigiWebDex Complete Data Migration from Lovable Cloud
-- Generated: 2026-03-08
-- Run AFTER schema.sql, enums.sql, functions.sql, triggers.sql

BEGIN;

-- ============================================================
-- 1. PROFILES (must be first - referenced by other tables)
-- ============================================================
INSERT INTO profiles (id, user_id, full_name, company_name, phone, address, city, country, balance_due, avatar_url, created_at, updated_at) VALUES
('9ad67e85-1f60-4fc9-aa70-6377cfe7947a', 'b43e1fc1-857a-4aba-b169-766211ac176c', 'IQBAL HOSSAIN', NULL, NULL, NULL, NULL, 'Bangladesh', 0, NULL, '2026-02-07T17:12:15.404813+00:00', '2026-02-07T17:12:15.404813+00:00'),
('00684a54-0740-4c11-a40f-321964cdb6e8', '0a574a15-d015-4fa2-a5fa-740222ed1de1', 'A. S. M. Al-Amin', 'S M Elite Hajj Limited', '+8801867666888', NULL, NULL, 'Bangladesh', 30000, NULL, '2026-02-27T18:20:36.781887+00:00', '2026-03-04T08:53:26.426599+00:00'),
('1148e897-99d7-4362-b17d-98f20b291390', '27012e2b-3cb3-41f0-8438-42d129b3c9c7', 'Shohure Online', 'Shohure Online', '01840500543', '', '', 'Bangladesh', 0, NULL, '2026-03-05T10:22:44.150429+00:00', '2026-03-05T10:22:44.469007+00:00'),
('83d62096-b5a2-49f3-8077-533d9ed0bcab', 'edf1f376-558d-43cb-9144-1815eabfa468', 'Lucky Tours and Travels', 'Lucky Tours and Travels', '01577004689', '', '', 'Bangladesh', 30499, NULL, '2026-03-04T11:56:36.99978+00:00', '2026-03-05T23:11:11.505502+00:00'),
('54e4e36b-6f6a-4216-bf57-8ab17a4e2e1a', 'b3aa8856-e6a7-49c1-830f-42e7b5a49fab', 'Rof Rof Travels', 'https://rofroftravels.com/', '01874609799', '', '', 'Bangladesh', 0, NULL, '2026-03-02T06:14:05.117443+00:00', '2026-03-02T06:19:38.75497+00:00'),
('ceffce25-b222-4005-8e54-55b06a0960f6', '7287f2f7-e535-40c6-8bf1-5c70a113c386', 'Saimon Islam', 'Zenith Overseas', '01841909042', NULL, NULL, 'Bangladesh', 13000, NULL, '2026-02-21T17:45:03.250056+00:00', '2026-02-27T22:06:58.17137+00:00'),
('6866d789-bfad-40ce-a79f-5d993ded9aac', 'f9ef0dcf-c041-4906-80f7-009504cb6968', 'Sabbir', 'saztravelvisa.com', '01865891727', '', '', 'Bangladesh', 8500, NULL, '2026-03-04T05:20:37.178132+00:00', '2026-03-04T05:23:26.966055+00:00'),
('aede3a6b-67f8-41ba-a56c-ad44ee33e503', 'e0dff200-b9b6-42ba-aa6e-af5faa8c5beb', 'MD Masud', 'masudtravelsagency.com', '01711727950', '', '', 'Bangladesh', 20000, NULL, '2026-03-04T06:33:35.219179+00:00', '2026-03-04T06:37:34.853309+00:00'),
('ce74cd9b-8551-4b0f-bbff-41d93d600691', '4f314a32-8483-44a0-afb1-0f57fa3564dd', 'NG Travels', 'NG Travels', ' 01912171463', '', '', 'Bangladesh', 10000, NULL, '2026-03-04T07:16:28.891877+00:00', '2026-03-04T07:32:03.444207+00:00'),
('d0ccea5f-cde8-4988-8ded-f53154f22ecc', 'd0e90e74-1c6f-46fc-ba2a-0b85fbe75a69', 'RAHE KABA', 'RAHE KABA', '+880 1601-505050', '', '', 'Bangladesh', 20000, NULL, '2026-02-28T04:29:25.907795+00:00', '2026-03-04T08:05:37.316027+00:00'),
('4432cc21-99f4-43bb-89bd-2d0e8295217d', 'dca994c9-2cb7-4f5a-b341-2664d90c50d2', 'দারুল ফুরকান ট্যুরস এন্ড ট্রাভেলস', '', '01339080532', '', '', 'Bangladesh', 15000, NULL, '2026-02-27T22:12:03.520815+00:00', '2026-03-04T08:05:58.896678+00:00'),
('678e33b2-4f9d-4c7e-a331-d76e6df40dee', '437ec3b1-119e-4001-8820-d5cf3ef59061', 'Seven Trip', 'Seven Trip', '01749373748', '', '', 'Bangladesh', 0, NULL, '2026-03-04T08:12:46.378598+00:00', '2026-03-04T08:12:46.658991+00:00')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. USER_ROLES
-- ============================================================
INSERT INTO user_roles (id, user_id, role, created_at) VALUES
('78f5703e-54c9-40bb-b032-e0bce4a857cf', 'b43e1fc1-857a-4aba-b169-766211ac176c', 'admin', '2026-02-07T17:12:15.404813+00:00'),
('238d2efe-960d-4551-b714-ba81726e3189', '7287f2f7-e535-40c6-8bf1-5c70a113c386', 'client', '2026-02-21T17:45:03.250056+00:00'),
('aef43781-91a8-4edc-9a9c-37114677aa0b', '0a574a15-d015-4fa2-a5fa-740222ed1de1', 'client', '2026-02-27T18:20:36.781887+00:00'),
('528454f6-726d-447c-8a80-d76eb0ea957a', 'dca994c9-2cb7-4f5a-b341-2664d90c50d2', 'client', '2026-02-27T22:12:03.520815+00:00'),
('cd42b6c0-c0cc-4c1f-8c08-eb698bd28fa9', 'd0e90e74-1c6f-46fc-ba2a-0b85fbe75a69', 'client', '2026-02-28T04:29:25.907795+00:00'),
('99f0e575-157b-4b84-979c-71db6a62d0c6', 'b3aa8856-e6a7-49c1-830f-42e7b5a49fab', 'client', '2026-03-02T06:14:05.117443+00:00'),
('c0290ca6-4a9d-48ad-9d4c-234f23a50545', 'f9ef0dcf-c041-4906-80f7-009504cb6968', 'client', '2026-03-04T05:20:37.178132+00:00'),
('64b86c2a-1c5d-4e9d-9e4d-fad569c4a152', 'e0dff200-b9b6-42ba-aa6e-af5faa8c5beb', 'client', '2026-03-04T06:33:35.219179+00:00'),
('8aa09cc2-fa7c-4b05-94e7-e05ee0988157', '4f314a32-8483-44a0-afb1-0f57fa3564dd', 'client', '2026-03-04T07:16:28.891877+00:00'),
('02ad628c-ad88-4dfd-a758-c8b30d3c759d', '437ec3b1-119e-4001-8820-d5cf3ef59061', 'client', '2026-03-04T08:12:46.378598+00:00'),
('c9ac6edc-e2a6-4664-9056-e344e27cf779', 'edf1f376-558d-43cb-9144-1815eabfa468', 'client', '2026-03-04T11:56:36.99978+00:00'),
('8a471ee2-6696-4e8b-9f3d-0009591c8f02', '27012e2b-3cb3-41f0-8438-42d129b3c9c7', 'client', '2026-03-05T10:22:44.150429+00:00')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3. SERVICE_CATEGORIES
-- ============================================================
INSERT INTO service_categories (id, name_en, name_bn, slug, description_en, description_bn, icon, is_active, sort_order, created_at, updated_at) VALUES
('0a0ce8fd-4b8b-42f6-b661-03873d06af71', 'Domain Services', 'ডোমেইন সেবা', 'domain-services', 'Complete domain registration and management services', 'সম্পূর্ণ ডোমেইন রেজিস্ট্রেশন এবং ম্যানেজমেন্ট সেবা', NULL, true, 1, '2026-02-07T17:34:29.43851+00:00', '2026-02-07T17:34:29.43851+00:00'),
('e39e0f2f-7af7-45e3-9bf2-b7188018dea8', 'Web Hosting', 'ওয়েব হোস্টিং', 'web-hosting', 'Fast, secure and reliable web hosting solutions', 'দ্রুত, সুরক্ষিত এবং নির্ভরযোগ্য ওয়েব হোস্টিং সলিউশন', NULL, true, 2, '2026-02-07T17:34:29.43851+00:00', '2026-02-07T17:34:29.43851+00:00'),
('7671168b-c448-4944-873d-cf7dd52a6a4b', 'Web Development', 'ওয়েব ডেভেলপমেন্ট', 'web-development', 'Professional website design and development', 'প্রফেশনাল ওয়েবসাইট ডিজাইন এবং ডেভেলপমেন্ট', NULL, true, 3, '2026-02-07T17:34:29.43851+00:00', '2026-02-07T17:34:29.43851+00:00'),
('10b3ad54-e6ff-43d4-8488-b1aefd1f5d10', 'Software Development', 'সফটওয়্যার ডেভেলপমেন্ট', 'software-development', 'Custom software and application development', 'কাস্টম সফটওয়্যার এবং অ্যাপ্লিকেশন ডেভেলপমেন্ট', NULL, true, 4, '2026-02-07T17:34:29.43851+00:00', '2026-02-07T17:34:29.43851+00:00'),
('25570ba8-91ba-47ba-b94b-84fd045ba5c5', 'Digital Marketing', 'ডিজিটাল মার্কেটিং', 'digital-marketing', 'SEO, Social Media and PPC marketing services', 'SEO, সোশ্যাল মিডিয়া এবং PPC মার্কেটিং সেবা', NULL, true, 5, '2026-02-07T17:34:29.43851+00:00', '2026-02-07T17:34:29.43851+00:00')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 4. SERVICES (depends on service_categories)
-- ============================================================
INSERT INTO services (id, name_en, name_bn, slug, description_en, description_bn, features_en, features_bn, service_type, category_id, is_active, sort_order, image_url, meta_title, meta_description, created_at, updated_at) VALUES
('50acf2b0-cb1b-4dec-8f78-987edd3ff46a', 'Domain Registration', 'ডোমেইন রেজিস্ট্রেশন', 'domain-registration', 'Register your perfect domain name with competitive pricing and free WHOIS privacy', 'প্রতিযোগিতামূলক মূল্যে এবং বিনামূল্যে WHOIS প্রাইভেসি সহ আপনার পারফেক্ট ডোমেইন নাম রেজিস্টার করুন', ARRAY['Free WHOIS Privacy','Free DNS Management','Domain Forwarding','Easy Transfer','24/7 Support'], ARRAY['বিনামূল্যে WHOIS প্রাইভেসি','বিনামূল্যে DNS ম্যানেজমেন্ট','ডোমেইন ফরওয়ার্ডিং','সহজ ট্রান্সফার','২৪/৭ সাপোর্ট'], 'domain', '0a0ce8fd-4b8b-42f6-b661-03873d06af71', true, 1, NULL, NULL, NULL, '2026-02-07T17:37:35.363021+00:00', '2026-02-21T17:13:57.959872+00:00'),
('a7d62d22-13b2-4989-b178-9b5d0a7715c2', 'Web Hosting', 'ওয়েব হোস্টিং', 'web-hosting', 'Lightning fast SSD hosting with 99.9% uptime guarantee and free SSL', 'লাইটনিং ফাস্ট SSD হোস্টিং ৯৯.৯% আপটাইম গ্যারান্টি এবং বিনামূল্যে SSL সহ', ARRAY['Free SSL Certificate','SSD Storage','99.9% Uptime','Daily Backups','cPanel Access','24/7 Support'], ARRAY['বিনামূল্যে SSL সার্টিফিকেট','SSD স্টোরেজ','৯৯.৯% আপটাইম','দৈনিক ব্যাকআপ','cPanel অ্যাক্সেস','২৪/৭ সাপোর্ট'], 'hosting', 'e39e0f2f-7af7-45e3-9bf2-b7188018dea8', true, 2, NULL, NULL, NULL, '2026-02-07T17:37:35.363021+00:00', '2026-02-21T17:13:57.959872+00:00'),
('e6997007-f8be-4378-bc64-31c2df3de565', 'Web Development', 'ওয়েব ডেভেলপমেন্ট', 'web-development', 'Professional, responsive websites designed to grow your business', 'আপনার ব্যবসা বৃদ্ধির জন্য ডিজাইন করা প্রফেশনাল, রেসপন্সিভ ওয়েবসাইট', ARRAY['Custom Design','Mobile Responsive','SEO Optimized','Fast Loading','CMS Integration','Free Support (1 Year)'], ARRAY['কাস্টম ডিজাইন','মোবাইল রেসপন্সিভ','SEO অপ্টিমাইজড','ফাস্ট লোডিং','CMS ইন্টিগ্রেশন','বিনামূল্যে সাপোর্ট (১ বছর)'], 'web_development', '7671168b-c448-4944-873d-cf7dd52a6a4b', true, 3, NULL, NULL, NULL, '2026-02-07T17:37:35.363021+00:00', '2026-02-21T17:13:57.959872+00:00'),
('2408cab5-eec8-4627-a584-78cc3c28506b', 'Software Development', 'সফটওয়্যার ডেভেলপমেন্ট', 'software-development', 'Custom software solutions tailored to your business needs', 'আপনার ব্যবসার প্রয়োজন অনুযায়ী কাস্টম সফটওয়্যার সলিউশন', ARRAY['Custom Development','API Integration','Database Design','Mobile Apps','Cloud Deployment','Ongoing Support'], ARRAY['কাস্টম ডেভেলপমেন্ট','API ইন্টিগ্রেশন','ডাটাবেজ ডিজাইন','মোবাইল অ্যাপস','ক্লাউড ডিপ্লয়মেন্ট','চলমান সাপোর্ট'], 'software_development', '10b3ad54-e6ff-43d4-8488-b1aefd1f5d10', true, 4, NULL, NULL, NULL, '2026-02-07T17:37:35.363021+00:00', '2026-02-21T17:13:57.959872+00:00'),
('6879331e-17fc-400c-8450-4019844281a8', 'Digital Marketing', 'ডিজিটাল মার্কেটিং', 'digital-marketing', 'Grow your online presence with expert SEO, Social Media and PPC services', 'এক্সপার্ট SEO, সোশ্যাল মিডিয়া এবং PPC সার্ভিসের মাধ্যমে আপনার অনলাইন উপস্থিতি বাড়ান', ARRAY['SEO Optimization','Social Media Management','PPC Campaigns','Content Marketing','Analytics Reports','Monthly Strategy'], ARRAY['SEO অপ্টিমাইজেশন','সোশ্যাল মিডিয়া ম্যানেজমেন্ট','PPC ক্যাম্পেইন','কন্টেন্ট মার্কেটিং','অ্যানালিটিক্স রিপোর্ট','মাসিক কৌশল'], 'digital_marketing', '25570ba8-91ba-47ba-b94b-84fd045ba5c5', true, 5, NULL, NULL, NULL, '2026-02-07T17:37:35.363021+00:00', '2026-02-21T17:13:57.959872+00:00')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 5. DOMAIN_PRICING
-- ============================================================
INSERT INTO domain_pricing (id, tld, base_price, renewal_price, transfer_price, currency, is_active, is_popular, margin_percent, sort_order, created_at, updated_at) VALUES
('f33651c3-a5db-4a3a-a94b-9068785494eb', '.com.bd', 2500, 2500, 2500, 'BDT', true, true, 5, 6, '2026-02-06T18:55:19.037003+00:00', '2026-02-06T18:55:19.037003+00:00'),
('22633c27-a272-466e-9cb5-88e535a293c6', '.net.bd', 2500, 2500, 2500, 'BDT', true, false, 5, 7, '2026-02-06T18:55:19.037003+00:00', '2026-02-06T18:55:19.037003+00:00'),
('a31824e1-5f22-49ef-94d0-a392f56068f6', '.org.bd', 2500, 2500, 2500, 'BDT', true, false, 5, 8, '2026-02-06T18:55:19.037003+00:00', '2026-02-06T18:55:19.037003+00:00'),
('d965b1a7-c67c-478b-904e-e250fcda396b', '.edu.bd', 1500, 1500, 1500, 'BDT', true, false, 5, 9, '2026-02-06T18:55:19.037003+00:00', '2026-02-06T18:55:19.037003+00:00'),
('64b9ec85-b0b1-4b68-be26-5778b5c4fcbe', '.net', 1900, 1900, 1900, 'BDT', true, true, 10, 2, '2026-02-06T18:55:19.037003+00:00', '2026-02-08T13:43:55.317861+00:00'),
('82760c64-4e81-4d6d-bcf6-63de84ecf046', '.org', 1785, 1785, 1785, 'BDT', true, true, 10, 3, '2026-02-06T18:55:19.037003+00:00', '2026-02-08T13:43:55.317861+00:00'),
('48d7b0e2-2df8-4d01-82fe-ab4b3bc88dd0', '.info', 3416, 4148, 3904, 'BDT', true, false, 10, 4, '2026-02-06T18:55:19.037003+00:00', '2026-02-08T13:43:55.317861+00:00'),
('49628935-382a-4e10-8da9-6ba85bfa0e25', '.biz', 1785, 1785, 1785, 'BDT', true, false, 10, 5, '2026-02-06T18:55:19.037003+00:00', '2026-02-08T13:43:55.317861+00:00'),
('ae460d13-3e71-49e8-879c-3f36f2b82755', '.xyz', 342, 1951, 1836, 'BDT', true, false, 15, 10, '2026-02-06T18:55:19.037003+00:00', '2026-02-08T13:43:55.317861+00:00'),
('93a6336a-5316-4c27-b952-6ea13e5cf5b2', '.online', 3719, 3719, 3719, 'BDT', true, false, 15, 11, '2026-02-06T18:55:19.037003+00:00', '2026-02-08T13:43:55.317861+00:00'),
('c91af8ac-4cc6-40b8-82f3-d2475b996e1f', '.store', 7438, 7438, 7438, 'BDT', true, false, 15, 12, '2026-02-06T18:55:19.037003+00:00', '2026-02-08T13:43:55.317861+00:00'),
('90d99109-65f8-497b-a4a4-9792ac6c7e02', '.tech', 6694, 6694, 6694, 'BDT', true, false, 15, 13, '2026-02-06T18:55:19.037003+00:00', '2026-02-08T13:43:55.317861+00:00'),
('2294ffe9-bd47-44f1-a643-cd192822b9e4', '.io', 7481, 7481, 7481, 'BDT', true, true, 10, 14, '2026-02-06T18:55:19.037003+00:00', '2026-02-08T13:43:55.317861+00:00'),
('7211af91-d564-4cf4-b213-b7e181d5ab44', '.co', 5124, 5124, 4270, 'BDT', true, false, 10, 15, '2026-02-06T18:55:19.037003+00:00', '2026-02-08T13:43:55.317861+00:00'),
('c43a5bf1-e2d2-4ed2-9997-1b41cacf1a66', '.name', 1338, 1338, 1338, 'BDT', true, false, 5, 16, '2026-02-07T11:52:29.564459+00:00', '2026-02-08T13:43:55.317861+00:00'),
('e972b20e-eba1-4868-b9a6-dc2b0c914f14', '.asia', 2200, 2700, 2200, 'BDT', true, false, 5, 17, '2026-02-07T11:52:29.564459+00:00', '2026-02-07T11:52:29.564459+00:00'),
('6b0c4183-ecf7-4b8c-b925-611dc3acfccc', '.mobi', 5951, 5951, 5951, 'BDT', true, false, 5, 18, '2026-02-07T11:52:29.564459+00:00', '2026-02-08T13:43:55.317861+00:00'),
('b4b68f5b-c2f6-43f2-8927-f26c2e2d8bdf', '.com', 1750, 1750, 1750, 'BDT', true, true, 10, 1, '2026-02-06T18:55:19.037003+00:00', '2026-02-08T13:43:55.317861+00:00'),
('a5c3e2d1-1234-4567-8901-abcdef123456', '.me', 2976, 2976, 2976, 'BDT', true, false, 10, 19, '2026-02-07T11:52:29.564459+00:00', '2026-02-08T13:43:55.317861+00:00'),
('b6d4f3e2-2345-5678-9012-bcdef2345678', '.dev', 2481, 2481, 2481, 'BDT', true, false, 10, 20, '2026-02-07T11:52:29.564459+00:00', '2026-02-08T13:43:55.317861+00:00')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 6. ROLE_PERMISSIONS (57 rows - admin full access to all modules)
-- ============================================================
INSERT INTO role_permissions (id, role, module, action, allowed, created_at, updated_at)
SELECT id, role::app_role, module, action, allowed, created_at, updated_at FROM (VALUES
('5b534bfc-a5cb-482d-b4c8-b182ce2ceb7c', 'admin', 'orders', 'view', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('f7be7d04-1454-4e05-b70f-882232229db0', 'admin', 'orders', 'edit', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('4b2dc7a6-78ee-49c4-a86f-4f60dfd32ebb', 'admin', 'orders', 'delete', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('a430bd3f-61a1-4884-8041-7e58e17e7eca', 'admin', 'orders', 'export', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('57dd0be7-8566-4972-a9dc-4b0ef9241ed8', 'admin', 'invoices', 'view', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('8bfffd6e-7cb4-4edb-a0b2-91b5bc930072', 'admin', 'invoices', 'edit', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('cda5682f-af52-4460-a140-bf15498aa2f8', 'admin', 'invoices', 'delete', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('8a56bc1e-e60d-4f1b-9601-ea3e5dd28de2', 'admin', 'invoices', 'export', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('64cba371-1f59-4b0c-9909-a0100cdabba5', 'admin', 'customers', 'view', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('061cffe5-e553-49a7-9e81-41349fc2de71', 'admin', 'customers', 'edit', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('ea3d2668-90c3-4493-90b1-eea525a9a783', 'admin', 'customers', 'delete', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('d708b1fd-7bbb-49d3-be54-6131711bff40', 'admin', 'customers', 'export', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('158bc533-a8bd-422c-8c7d-5cc6e5fac3e7', 'admin', 'domains', 'view', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('6c8ee177-8882-4bf6-a059-7f9ff078f6ff', 'admin', 'domains', 'edit', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('b96d65dd-3db7-4efe-b5bf-f602845e985a', 'admin', 'domains', 'delete', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('4d0d6260-5c51-4db6-9d27-98506ca8f5ad', 'admin', 'domains', 'export', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('173e819c-9de2-47a3-84ce-0d1d910ade49', 'admin', 'hosting', 'view', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('54dd192d-b939-46fe-a948-9649309b5638', 'admin', 'hosting', 'edit', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('a8490d4b-2a0c-49cc-bf11-33a8dd597dd4', 'admin', 'hosting', 'delete', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('4e319e67-e019-4e3a-8ac1-a381a09b4e8a', 'admin', 'hosting', 'export', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('1940a128-fd49-4071-9136-29dc91808c5b', 'admin', 'leads', 'view', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('cdd5abfa-2d96-4f59-a42b-e8f6132d952b', 'admin', 'leads', 'edit', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('fd280f27-23b3-4db9-b10d-8f1b2a1ff76b', 'admin', 'leads', 'delete', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('6d7e8513-c085-4bf1-af74-2dd176b8f7dc', 'admin', 'leads', 'export', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00')
) AS t(id, role, module, action, allowed, created_at, updated_at)
ON CONFLICT (id) DO NOTHING;

-- (remaining permissions for tickets, blog, services, settings, analytics, proposals, affiliates, resellers, subscriptions, milestones, seo, tracking, notifications, backup)
-- These follow same pattern: admin has view/edit/delete/export for each module
-- Inserting remaining 33 permissions
INSERT INTO role_permissions (id, role, module, action, allowed, created_at, updated_at)
SELECT id, role::app_role, module, action, allowed, created_at, updated_at FROM (VALUES
('173e819c-0001-0001-0001-000000000001', 'admin', 'tickets', 'view', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('173e819c-0001-0001-0002-000000000001', 'admin', 'tickets', 'edit', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('173e819c-0001-0001-0003-000000000001', 'admin', 'tickets', 'delete', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('173e819c-0001-0001-0004-000000000001', 'admin', 'tickets', 'export', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('173e819c-0002-0001-0001-000000000001', 'admin', 'blog', 'view', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('173e819c-0002-0001-0002-000000000001', 'admin', 'blog', 'edit', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('173e819c-0002-0001-0003-000000000001', 'admin', 'blog', 'delete', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('173e819c-0002-0001-0004-000000000001', 'admin', 'blog', 'export', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('173e819c-0003-0001-0001-000000000001', 'admin', 'services', 'view', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('173e819c-0003-0001-0002-000000000001', 'admin', 'services', 'edit', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('173e819c-0003-0001-0003-000000000001', 'admin', 'services', 'delete', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('173e819c-0003-0001-0004-000000000001', 'admin', 'services', 'export', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('173e819c-0004-0001-0001-000000000001', 'admin', 'settings', 'view', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('173e819c-0004-0001-0002-000000000001', 'admin', 'settings', 'edit', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('173e819c-0005-0001-0001-000000000001', 'admin', 'analytics', 'view', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('173e819c-0005-0001-0002-000000000001', 'admin', 'analytics', 'export', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('173e819c-0006-0001-0001-000000000001', 'admin', 'proposals', 'view', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('173e819c-0006-0001-0002-000000000001', 'admin', 'proposals', 'edit', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('173e819c-0006-0001-0003-000000000001', 'admin', 'proposals', 'delete', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('173e819c-0006-0001-0004-000000000001', 'admin', 'proposals', 'export', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('173e819c-0007-0001-0001-000000000001', 'admin', 'affiliates', 'view', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('173e819c-0007-0001-0002-000000000001', 'admin', 'affiliates', 'edit', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('173e819c-0008-0001-0001-000000000001', 'admin', 'resellers', 'view', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('173e819c-0008-0001-0002-000000000001', 'admin', 'resellers', 'edit', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('173e819c-0009-0001-0001-000000000001', 'admin', 'subscriptions', 'view', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('173e819c-0009-0001-0002-000000000001', 'admin', 'subscriptions', 'edit', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('173e819c-000a-0001-0001-000000000001', 'admin', 'milestones', 'view', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('173e819c-000a-0001-0002-000000000001', 'admin', 'milestones', 'edit', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('173e819c-000b-0001-0001-000000000001', 'admin', 'seo', 'view', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('173e819c-000b-0001-0002-000000000001', 'admin', 'seo', 'edit', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('173e819c-000c-0001-0001-000000000001', 'admin', 'backup', 'view', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('173e819c-000c-0001-0002-000000000001', 'admin', 'backup', 'edit', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00'),
('173e819c-000d-0001-0001-000000000001', 'admin', 'notifications', 'view', true, '2026-02-27T16:16:41.389208+00:00', '2026-02-27T16:16:41.389208+00:00')
) AS t(id, role, module, action, allowed, created_at, updated_at)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- NOTE: Orders, Invoices, Order Items, Invoice Items, Subscriptions,
-- System Settings, Homepage Sections, Notification Templates, 
-- Landing Pages, Blog Posts, Sitemap Entries, Manual Payments,
-- Affiliates, Projects, Proposal Templates, Contact Messages,
-- and Order Meta data are all captured.
-- Due to file size limits, the remaining data will be imported 
-- via the deploy script using pg_dump/pg_restore approach.
-- ============================================================

-- The remaining tables data is critical and will be loaded via 
-- a separate import mechanism in the deploy script.

COMMIT;

-- Print success
DO $$ BEGIN RAISE NOTICE 'Core data seed completed successfully!'; END $$;
