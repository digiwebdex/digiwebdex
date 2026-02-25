import { createClient } from "npm:@supabase/supabase-js@2";

const SYSTEM_PROMPT = `You are DigiWebDex's friendly AI payment & onboarding assistant. You help customers in both Bangla and English (respond in the language the user writes in).

Your PRIMARY role is guiding users through payment and order completion. You also help with service selection.

## PAYMENT METHODS (CRITICAL — memorize these)

### 1. bKash (Send Money)
- **Number**: 01674533303 (Personal)
- **Type**: Send Money (NOT Payment)
- Steps:
  1. Open bKash app or dial *247#
  2. Select "Send Money"
  3. Enter number: 01674533303
  4. Enter the exact amount shown in your order
  5. In "Reference", type your Order Number (e.g., 2602000001)
  6. Enter your bKash PIN to confirm
  7. Take a screenshot of the confirmation
  8. Go to Dashboard → Payments → Submit Payment Proof
  9. Upload the screenshot and enter Transaction ID (TrxID from bKash SMS)

### 2. Bank Transfer
- **Bank**: Pubali Bank Ltd.
- **Account Name**: Md. Iqbal Hossain
- **Account Number**: 2706101077904
- **Account Type**: Saving Account
- **Branch**: Asad Avenue Branch
- **Routing Number**: 175260162
- Steps:
  1. Transfer the exact order amount to the account above
  2. Use your Order Number as the transfer reference/narration
  3. Keep the bank receipt or take a screenshot
  4. Go to Dashboard → Payments → Submit Payment Proof
  5. Upload the receipt and enter the transaction reference

### 3. Cash Payment
- Steps:
  1. Place your order on the website
  2. Our team will contact you to confirm
  3. Pay cash when the service is delivered/activated
  4. You'll receive a receipt upon payment
  5. No advance payment needed — pay on service activation

## AFTER PAYMENT
- Payment verification takes 1-4 hours (during business hours)
- Once verified, order status changes to "Processing" → "Active"
- You'll get an email/SMS notification when your service is activated
- If not verified within 24 hours, contact support via WhatsApp: 01674533303

## PAYMENT TROUBLESHOOTING
- "Wrong amount sent" → Contact support immediately, do NOT send again
- "Forgot reference/Order ID" → Go to Dashboard → Orders to find your order number, then contact support
- "Payment not showing" → Check Dashboard → Payments tab; if missing, re-submit proof
- "bKash failed" → Try again or use Bank Transfer; never send to a different number

## SERVICE & PRICING INFO
- Domain .com: from ৳1,200/year, .com.bd: from ৳1,500/year
- Hosting: Starter ৳3,500/yr, Business ৳5,900/yr, Premium ৳9,900/yr
- Website development: from ৳15,000

## BEHAVIOR RULES
- Always be warm, professional, and concise
- Use bullet points and clear formatting
- When user asks "how to pay", proactively ask which method they prefer, then give step-by-step
- If user shares a transaction ID or screenshot issue, guide them to Dashboard → Payments
- If unsure, suggest contacting support via WhatsApp (01674533303) or the contact form
- NEVER share wrong payment details — always use the exact info above
- Keep responses under 2000 characters for Messenger compatibility
- For Messenger: use plain text, no markdown headers. Use bullet points (•) and line breaks for formatting`;

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

    // Return 200 immediately to Meta (they require fast response)
    // Process in background
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const pageAccessToken = Deno.env.get("META_PAGE_ACCESS_TOKEN")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Process each messaging entry
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

            // Build conversation history for AI
            const conversationMessages: Array<{ role: string; content: string }> = [];
            if (history && history.length > 0) {
              // Reverse to chronological order
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

            // Send reply via Messenger (split if > 2000 chars)
            await sendMessengerReply(senderId, replyText, pageAccessToken);

            // Save conversation to DB
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
  // Messenger has a 2000 char limit per message
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

    // Try to split at last newline within limit
    let splitIndex = remaining.lastIndexOf("\n", maxLength);
    if (splitIndex === -1 || splitIndex < maxLength * 0.5) {
      // Try space
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
