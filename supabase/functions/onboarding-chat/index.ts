import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
- NEVER share wrong payment details — always use the exact info above`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service temporarily unavailable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("onboarding-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
