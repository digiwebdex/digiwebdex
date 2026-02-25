

# ফেসবুক মেসেঞ্জার AI চ্যাটবট — বাস্তবায়ন পরিকল্পনা

## ধাপসমূহ

### ১. Secrets সংগ্রহ
দুটি সিক্রেট প্রয়োজন:
- **META_PAGE_ACCESS_TOKEN** — Facebook Page Access Token (ব্যবহারকারী থেকে নিতে হবে)
- **META_WEBHOOK_VERIFY_TOKEN** — একটি verify token (আমরা তৈরি করে দেব, যেমন `digiwebdex_messenger_verify_2025`)

### ২. Edge Function তৈরি: `messenger-webhook`
ফাইল: `supabase/functions/messenger-webhook/index.ts`

- **GET** → Meta webhook verification (hub.mode, hub.verify_token, hub.challenge)
- **POST** → ইনকামিং মেসেজ প্রসেস:
  1. মেসেজ extract করা (sender PSID + text)
  2. DB থেকে শেষ ১০টি মেসেজ লোড (context)
  3. Lovable AI (Gemini 3 Flash) কল করা — বর্তমান `onboarding-chat` এর system prompt পুনরায় ব্যবহার
  4. Facebook Graph API (`POST /me/messages`) দিয়ে রিপ্লাই পাঠানো
  5. কনভার্সেশন DB তে সেভ করা
- Non-streaming AI call (invoke style) — মেসেঞ্জার API-তে সরাসরি টেক্সট পাঠাতে হয়

### ৩. Database Migration
টেবিল: `chatbot_conversations`
- `id` (uuid, PK)
- `platform` (text, default 'messenger')
- `sender_id` (text)
- `message_in` (text)
- `message_out` (text)
- `created_at` (timestamptz)

RLS: Admin-only read via `is_admin_or_staff()` function।

### ৪. Config.toml আপডেট
```toml
[functions.messenger-webhook]
verify_jwt = false
```
(স্বয়ংক্রিয়ভাবে পরিচালিত হয়)

### ৫. ব্যবহারকারীর পরবর্তী কাজ
Edge function deploy হওয়ার পর:
1. Webhook Callback URL সেট করবেন: `https://qszmmysnwjvywpsofbgs.supabase.co/functions/v1/messenger-webhook`
2. Verify Token দেবেন: `digiwebdex_messenger_verify_2025`
3. `messages` event সাবস্ক্রাইব করবেন

## প্রযুক্তিগত বিবরণ

```text
Facebook User sends message
    ↓
Meta Platform → POST to messenger-webhook
    ↓
Extract sender_id + message_text
    ↓
Query chatbot_conversations (last 10 by sender_id)
    ↓
Call Lovable AI Gateway (non-streaming, Gemini 3 Flash)
    ↓
POST https://graph.facebook.com/v21.0/me/messages
    ↓
INSERT into chatbot_conversations
    ↓
Return 200 OK to Meta
```

Edge function-এ Facebook-এর ২০ সেকেন্ড টাইমআউট মেনে চলার জন্য non-streaming AI কল ব্যবহার করা হবে। মেসেজ ২,০০০ ক্যারেক্টারের বেশি হলে ভেঙে পাঠানো হবে (Messenger API limit)।

System prompt: বর্তমান `onboarding-chat` edge function-এর সম্পূর্ণ prompt পুনরায় ব্যবহার করা হবে।

