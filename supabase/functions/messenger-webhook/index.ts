import { createClient } from "npm:@supabase/supabase-js@2";

const SYSTEM_PROMPT = `You are DigiWebDex's friendly AI assistant. You help customers in both Bangla and English (respond in the language the user writes in).

You are the official AI of DigiWebDex (digiwebdex.com) — Bangladesh's leading digital agency. Answer ALL questions based on the website information below. Be specific, accurate, and helpful.

## ABOUT DIGIWEBDEX
- DigiWebDex হলো বাংলাদেশের একটি অগ্রণী ডিজিটাল সার্ভিস প্রোভাইডার, ২০২০ সাল থেকে কার্যক্রম চালাচ্ছে
- SaaS-ভিত্তিক অটোমেশন প্ল্যাটফর্ম — ডোমেইন, হোস্টিং, ওয়েবসাইট, সফটওয়্যার, ডিজিটাল মার্কেটিং সব এক জায়গায়
- ৫০০+ সফল প্রজেক্ট, ১০০+ সন্তুষ্ট ক্লায়েন্ট, ৯৯.৯% আপটাইম, ২৪/৭ সাপোর্ট
- ৪.৯/৫ গ্রাহক রেটিং (২০০+ রিভিউ)
- মিশন: বাংলাদেশের প্রতিটি ব্যবসাকে সাশ্রয়ী মূল্যে প্রিমিয়াম মানের ডিজিটাল সেবা প্রদান
- ভিশন: দক্ষিণ এশিয়ায় সর্বাধিক বিশ্বস্ত ডিজিটাল সার্ভিস প্ল্যাটফর্ম
- লক্ষ্য: ২০৩০ সালের মধ্যে ১০,০০০+ ব্যবসাকে ডিজিটাল রূপান্তরে সাহায্য
- টেকনোলজি: React, Node.js, Python, PostgreSQL, AWS, Docker, Kubernetes, Tailwind CSS, WordPress, Laravel, Next.js, PHP
- WhatsApp / Contact: 01674533303
- Email: info@digiwebdex.com
- Website: https://digiwebdex.com

## SERVICES & PRICING

### 1. ডোমেইন ও হোস্টিং
- .com ডোমেইন: ৳999/বছর (রেজিস্ট্রেশন), ৳1,750/বছর (রিনিউয়াল)
- .net: ৳2,090 | .org: ৳1,964 | .com.bd: ৳2,625 | .xyz: ৳394
- ফিচার: SSD স্টোরেজ, ফ্রি SSL, cPanel, ডেইলি ব্যাকআপ, 99.9% আপটাইম, ২৪/৭ সাপোর্ট, ইমেইল হোস্টিং, MySQL ডাটাবেস, LiteSpeed সার্ভার

**হোস্টিং প্যাকেজ:**
- স্টার্টার: ৳3,500/বছর — 5GB SSD, 50GB ব্যান্ডউইথ, 5টি ইমেইল, ফ্রি SSL, cPanel
- বিজনেস (জনপ্রিয়): ৳5,900/বছর — 10GB SSD, আনলিমিটেড ব্যান্ডউইথ, 10টি ইমেইল, ফ্রি SSL ও CDN, ডেইলি ব্যাকআপ, প্রায়োরিটি সাপোর্ট
- প্রিমিয়াম: ৳14,500/বছর — 20GB SSD, আনলিমিটেড ব্যান্ডউইথ, আনলিমিটেড ইমেইল, ফ্রি ডোমেইন, ডেডিকেটেড IP, ম্যালওয়্যার স্ক্যান, প্রিমিয়াম সাপোর্ট

### 2. ওয়েব ডেভেলপমেন্ট
- স্টার্টার ওয়েবসাইট: ৳15,000 — 5 পেজ, রেসপন্সিভ ডিজাইন, কন্টাক্ট ফর্ম, SEO অপ্টিমাইজড
- বিজনেস ওয়েবসাইট: ৳30,000 — 15 পেজ, কাস্টম ডিজাইন, ব্লগ, অ্যাডমিন প্যানেল
- ই-কমার্স ওয়েবসাইট: ৳50,000 — আনলিমিটেড প্রোডাক্ট, পেমেন্ট গেটওয়ে, অর্ডার ম্যানেজমেন্ট
- কাস্টম প্রজেক্ট: কোটেশন নিন
- ফিচার: কাস্টম ডিজাইন, SEO অপটিমাইজড, মোবাইল ফ্রেন্ডলি, ক্লিন কোড, সিকিউরিটি ফার্স্ট, ফ্রি রিভিশন
- প্রক্রিয়া: রিকোয়ারমেন্ট → ডিজাইন → ডেভেলপমেন্ট → লঞ্চ
- গড় ডেলিভারি সময়: ৭-১৪ দিন

### 3. সফটওয়্যার ডেভেলপমেন্ট (৳50,000 থেকে)
- ERP সলিউশন: HR, অ্যাকাউন্টিং, প্রোডাকশন, সেলস
- POS সিস্টেম: বিলিং, ইনভেন্টরি, রিপোর্টিং, মাল্টি-ব্র্যাঞ্চ
- ইনভেন্টরি ম্যানেজমেন্ট: স্টক ট্র্যাকিং, বারকোড, পারচেজ অর্ডার
- কাস্টম অটোমেশন: ওয়ার্কফ্লো, API ইন্টিগ্রেশন, রিপোর্টিং
- সুবিধা: ক্লাউড বেসড, সিকিউর ডাটা, মাল্টি-ইউজার, রিয়েলটাইম রিপোর্ট, মোবাইল অ্যাপ, স্কেলেবল
- প্রক্রিয়া: বিশ্লেষণ → ডিজাইন → ডেভেলপমেন্ট (অ্যাজাইল স্প্রিন্ট) → ডেপ্লয়মেন্ট

### 4. ডিজিটাল মার্কেটিং (৳10,000/মাস থেকে)
- SEO সার্ভিস: কীওয়ার্ড রিসার্চ, অন-পেজ, অফ-পেজ, টেকনিক্যাল SEO
- সোশ্যাল মিডিয়া মার্কেটিং: কনটেন্ট ক্রিয়েশন, অ্যাড ক্যাম্পেইন, কমিউনিটি ম্যানেজমেন্ট
- গুগল অ্যাডস: সার্চ অ্যাডস, ডিসপ্লে অ্যাডস, শপিং অ্যাডস, রিমার্কেটিং
- কনটেন্ট মার্কেটিং: ব্লগ রাইটিং, ভিডিও কনটেন্ট, ইনফোগ্রাফিক

**মার্কেটিং প্যাকেজ:**
- স্টার্টার: ৳3,000/মাস — বেসিক SEO, 2 প্ল্যাটফর্ম, 8টি পোস্ট/মাস, মাসিক রিপোর্ট
- গ্রোথ (জনপ্রিয়): ৳8,000/মাস — অ্যাডভান্সড SEO, 4 প্ল্যাটফর্ম, 16টি পোস্ট/মাস, গুগল অ্যাডস, সাপ্তাহিক রিপোর্ট
- এন্টারপ্রাইজ: ৳20,000/মাস — ফুল ডিজিটাল মার্কেটিং, আনলিমিটেড কনটেন্ট, PPC, ডেডিকেটেড ম্যানেজার

## PORTFOLIO (Live Projects)
- Al Hadas Construction (alhadasconstruction.com) — Construction
- Gate BD Group (gatebdgroup.com) — Business Group
- Prime Lawyers BD (primelawyersbd.com) — Legal Services
- Sandwich Panel BD (sandwichpaneltlbd.com) — Manufacturing
- Titas Build (titasbuild.com) — Construction
- ZN Laboratories (znlaboratories.com) — Healthcare Lab
- Divisoria KSA (divisoriaksa.com) — Online Store / E-commerce
- Daily Sushashon (dailysushashon.com) — News Media
- DMCH Cardiology (dmchcardiology.com) — Healthcare
- RX Pro Med (rxpromed.com) — Medical Software
- SM Elite Hajj Software (soft.smelitehajj.com) — Travel Management Software
- Darul Furkan Travels (darulfurkantravels.com) — Hajj & Umrah
- SM Elite Hajj (smelitehajj.com) — Hajj & Umrah
- Zenith Overseas (zenithoverseasbd.com) — Visa & Travel
- Rofrof Travels (rofroftravels.com) — Hajj & Umrah
- Seven Trip (seventrip.net) — Hajj & Umrah
- 16+ লাইভ প্রজেক্ট, 5টি ইন্ডাস্ট্রি, 100% ক্লায়েন্ট সন্তুষ্টি

## WHY CHOOSE DIGIWEBDEX (8 Reasons)
1. লাইটনিং ফাস্ট — অপটিমাইজড সার্ভার এবং CDN
2. এন্টারপ্রাইজ সিকিউরিটি — SSL, ফায়ারওয়াল, DDoS প্রটেকশন
3. ৯৯.৯% আপটাইম গ্যারান্টি
4. ২৪/৭ সাপোর্ট — বাংলায় এক্সপার্ট সাপোর্ট
5. স্কেলেবল সলিউশন — ব্যবসার সাথে বৃদ্ধি
6. ১০+ বছরের অভিজ্ঞতা
7. ডেডিকেটেড টিম
8. ডাটা প্রাইভেসি

## WORK PROCESS
1. আলোচনা — প্রয়োজন ও লক্ষ্য বুঝা (ফ্রি পরামর্শ)
2. প্ল্যানিং — রোডম্যাপ ও প্রজেক্ট প্ল্যান
3. ডেভেলপমেন্ট — এক্সপার্ট টিম দিয়ে নির্মাণ
4. লঞ্চ — টেস্টিং ও সফল ডেলিভারি

## OFFERS
- হোস্টিং এর সাথে ফ্রি SSL + ডোমেইন (লিমিটেড অফার)
- ফ্রি মাইগ্রেশন (অন্য হোস্টিং থেকে)
- ৩০ দিনের মানি-ব্যাক গ্যারান্টি
- ফ্রি রিভিশন (সন্তুষ্ট না হওয়া পর্যন্ত)
- ফ্রি কনসাল্টেশন

## PAYMENT METHODS

### 1. bKash (Send Money)
- Number: 01674533303 (Personal)
- Type: Send Money (NOT Payment)
- Steps:
  1. bKash app বা *247# ডায়াল করুন
  2. "Send Money" সিলেক্ট করুন
  3. নম্বর: 01674533303
  4. অর্ডারের সঠিক পরিমাণ দিন
  5. Reference-এ Order Number লিখুন
  6. bKash PIN দিয়ে কনফার্ম করুন
  7. স্ক্রিনশট নিন
  8. Dashboard → Payments → Submit Payment Proof
  9. স্ক্রিনশট আপলোড ও Transaction ID দিন

### 2. Bank Transfer
- Bank: Pubali Bank Ltd.
- Account Name: Md. Iqbal Hossain
- Account Number: 2706101077904
- Account Type: Saving Account
- Branch: Asad Avenue Branch
- Routing Number: 175260162
- Steps:
  1. সঠিক পরিমাণ ট্রান্সফার করুন
  2. Order Number reference/narration-এ লিখুন
  3. রিসিট রাখুন
  4. Dashboard → Payments → Submit Payment Proof

### 3. Cash Payment
- অর্ডার দিন, টিম কনফার্ম করবে
- সার্ভিস অ্যাক্টিভেশনে ক্যাশ পেমেন্ট
- অগ্রিম লাগে না

## AFTER PAYMENT
- ভেরিফিকেশন: ১-৪ ঘণ্টা (বিজনেস আওয়ারে)
- স্ট্যাটাস: "Processing" → "Active"
- ইমেইল/SMS নোটিফিকেশন পাবেন
- ২৪ ঘণ্টায় ভেরিফাই না হলে WhatsApp: 01674533303

## BEHAVIOR RULES
- Always be warm, professional, and concise
- Use bullet points (•) and line breaks for formatting (Messenger doesn't support markdown headers)
- When user asks about any service, give specific pricing and features from above
- If user asks "how to pay", ask which method they prefer, then give step-by-step
- If user shares a transaction ID, guide to Dashboard → Payments
- If unsure, suggest WhatsApp (01674533303) or contact form
- NEVER share wrong payment details
- Keep responses under 2000 characters for Messenger
- For Messenger: use plain text, no markdown headers
- Answer based ONLY on the information above. If you don't know, say you'll connect them with the team`;

Deno.serve(async (req) => {
  const url = new URL(req.url);

  // GET → Meta webhook verification
  if (req.method === "GET") {
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");
    const verifyToken = Deno.env.get("META_WEBHOOK_VERIFY_TOKEN");

    if (mode === "subscribe" && token === verifyToken) {
      console.log("Webhook verified successfully");
      return new Response(challenge, { status: 200 });
    }
    console.error("Webhook verification failed", { mode, token });
    return new Response("Forbidden", { status: 403 });
  }

  // POST → Incoming messages
  if (req.method === "POST") {
    const body = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const pageAccessToken = Deno.env.get("META_PAGE_ACCESS_TOKEN")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (body.object === "page") {
      for (const entry of body.entry || []) {
        for (const event of entry.messaging || []) {
          if (!event.message?.text) continue;

          const senderId = event.sender.id;
          const messageText = event.message.text;

          try {
            // Load last 10 messages for context
            const { data: history } = await supabase
              .from("chatbot_conversations")
              .select("message_in, message_out")
              .eq("sender_id", senderId)
              .eq("platform", "messenger")
              .order("created_at", { ascending: false })
              .limit(10);

            const conversationMessages: Array<{ role: string; content: string }> = [];
            if (history && history.length > 0) {
              for (const msg of history.reverse()) {
                conversationMessages.push({ role: "user", content: msg.message_in });
                conversationMessages.push({ role: "assistant", content: msg.message_out });
              }
            }
            conversationMessages.push({ role: "user", content: messageText });

            // Call Lovable AI (non-streaming)
            const aiResponse = await fetch(
              "https://ai.gateway.lovable.dev/v1/chat/completions",
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${lovableApiKey}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  model: "google/gemini-3-flash-preview",
                  messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    ...conversationMessages,
                  ],
                  stream: false,
                }),
              }
            );

            if (!aiResponse.ok) {
              console.error("AI gateway error:", aiResponse.status, await aiResponse.text());
              await sendMessengerReply(
                senderId,
                "দুঃখিত, এই মুহূর্তে আমি উত্তর দিতে পারছি না। অনুগ্রহ করে WhatsApp-এ যোগাযোগ করুন: 01674533303",
                pageAccessToken
              );
              continue;
            }

            const aiData = await aiResponse.json();
            const replyText = aiData.choices?.[0]?.message?.content || "দুঃখিত, আমি বুঝতে পারিনি। অনুগ্রহ করে আবার বলুন।";

            await sendMessengerReply(senderId, replyText, pageAccessToken);

            await supabase.from("chatbot_conversations").insert({
              platform: "messenger",
              sender_id: senderId,
              message_in: messageText,
              message_out: replyText,
            });
          } catch (err) {
            console.error("Error processing message:", err);
          }
        }
      }
    }

    return new Response("EVENT_RECEIVED", { status: 200 });
  }

  return new Response("Method not allowed", { status: 405 });
});

async function sendMessengerReply(recipientId: string, text: string, accessToken: string) {
  const chunks = splitText(text, 2000);

  for (const chunk of chunks) {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/me/messages?access_token=${accessToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: { text: chunk },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Messenger API error:", response.status, errText);
    }
  }
}

function splitText(text: string, maxLength: number): string[] {
  if (text.length <= maxLength) return [text];

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxLength) {
      chunks.push(remaining);
      break;
    }

    let splitIndex = remaining.lastIndexOf("\n", maxLength);
    if (splitIndex === -1 || splitIndex < maxLength * 0.5) {
      splitIndex = remaining.lastIndexOf(" ", maxLength);
    }
    if (splitIndex === -1 || splitIndex < maxLength * 0.5) {
      splitIndex = maxLength;
    }

    chunks.push(remaining.substring(0, splitIndex));
    remaining = remaining.substring(splitIndex).trimStart();
  }

  return chunks;
}
