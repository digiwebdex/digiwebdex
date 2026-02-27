import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// DigiWebDex Contact Info
const ADMIN_EMAIL = 'digiwebdex@gmail.com';
const ADMIN_PHONE = '8801674533303';
const WHATSAPP_NUMBER = '8801674533303';

// BulkSMSBD API Configuration
const SMS_API_URL = 'http://bulksmsbd.net/api/smsapi';

interface ContactNotificationRequest {
  type: 'contact_form' | 'order_created' | 'payment_received' | 'payment_approved' | 'payment_completed';
  // Contact form fields
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  // Order fields
  orderNumber?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  packageName?: string;
  amount?: number;
  advancePayment?: number;
  totalPaid?: number;
  paymentMethod?: string;
  invoiceUrl?: string;
  invoiceNumber?: string;
  userId?: string;
}

// Phone number validation and normalization
function normalizePhone(phone: string): string {
  let normalized = phone.replace(/[^0-9]/g, '');
  if (normalized.startsWith('0')) {
    normalized = '88' + normalized;
  } else if (!normalized.startsWith('880')) {
    normalized = '880' + normalized;
  }
  return normalized;
}

function isValidBDPhone(phone: string): boolean {
  const normalized = normalizePhone(phone);
  return /^8801[3-9]\d{8}$/.test(normalized);
}

// Send SMS using BulkSMSBD API
async function sendSMS(phone: string, message: string): Promise<{ success: boolean; response?: unknown; error?: string }> {
  const apiKey = Deno.env.get('SMS_API_KEY');
  const senderId = Deno.env.get('SMS_SENDER_ID');
  
  if (!apiKey || !senderId) {
    console.warn('SMS API credentials not configured, skipping SMS');
    return { success: false, error: 'SMS not configured' };
  }
  
  const normalized = normalizePhone(phone);
  if (!isValidBDPhone(phone)) {
    console.warn('Invalid phone number for SMS:', phone);
    return { success: false, error: 'Invalid phone number' };
  }
  
  const encodedMessage = encodeURIComponent(message);
  const url = `${SMS_API_URL}?api_key=${encodeURIComponent(apiKey)}&type=text&number=${normalized}&senderid=${encodeURIComponent(senderId)}&message=${encodedMessage}`;
  
  try {
    console.log('Sending SMS to:', normalized);
    const response = await fetch(url, { method: 'GET' });
    const responseText = await response.text();
    console.log('SMS API response:', responseText);
    
    let responseData: unknown;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { raw: responseText };
    }
    
    const isSuccess = response.ok || 
      (typeof responseData === 'object' && responseData !== null && 
       'response_code' in responseData && (responseData as Record<string, unknown>).response_code === 202);
    
    return { success: isSuccess, response: responseData };
  } catch (error) {
    console.error('SMS API error:', error);
    return { success: false, error: (error as Error).message };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const data: ContactNotificationRequest = await req.json();
    console.log('Notification request received:', data);

    const notifications: Array<{
      recipient: string;
      notification_type: string;
      subject: string;
      body: string;
      status: string;
      sent_at?: string;
      error_message?: string;
      metadata: Record<string, unknown>;
    }> = [];

    const smsPromises: Promise<void>[] = [];

    if (data.type === 'contact_form') {
      // Admin email notification
      const adminEmailBody = `
New Contact Form Submission

Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone || 'Not provided'}
Subject: ${data.subject}

Message:
${data.message}

---
DigiWebDex Contact System
      `.trim();

      notifications.push({
        recipient: ADMIN_EMAIL,
        notification_type: 'email',
        subject: `[Contact] ${data.subject} - ${data.name}`,
        body: adminEmailBody,
        status: 'pending',
        metadata: { type: 'contact_admin_email', contactEmail: data.email }
      });

      // Admin SMS notification
      const adminSmsBody = `নতুন Contact: ${data.name} - ${data.subject?.substring(0, 30)}... Reply: ${data.email}`;
      smsPromises.push(
        sendSMS(ADMIN_PHONE, adminSmsBody).then(result => {
          notifications.push({
            recipient: ADMIN_PHONE,
            notification_type: 'sms',
            subject: 'New Contact',
            body: adminSmsBody,
            status: result.success ? 'sent' : 'failed',
            sent_at: result.success ? new Date().toISOString() : undefined,
            error_message: result.error,
            metadata: { type: 'contact_admin_sms', api_response: result.response }
          });
        })
      );

      // WhatsApp notification
      const whatsappBody = `🔔 *New Contact Form*\n\n👤 *Name:* ${data.name}\n📧 *Email:* ${data.email}\n📱 *Phone:* ${data.phone || 'N/A'}\n📝 *Subject:* ${data.subject}\n\n💬 *Message:*\n${data.message}`;
      notifications.push({
        recipient: WHATSAPP_NUMBER,
        notification_type: 'whatsapp',
        subject: 'New Contact',
        body: whatsappBody,
        status: 'pending',
        metadata: { type: 'contact_admin_whatsapp' }
      });

    } else if (data.type === 'order_created') {
      // Customer SMS
      if (data.customerPhone && isValidBDPhone(data.customerPhone)) {
        const customerSms = `DigiWebDex: আপনার অর্ডার ${data.orderNumber} গ্রহণ হয়েছে। প্যাকেজ: ${data.packageName}। শীঘ্রই যোগাযোগ করা হবে। ধন্যবাদ!`;
        smsPromises.push(
          sendSMS(data.customerPhone, customerSms).then(result => {
            notifications.push({
              recipient: normalizePhone(data.customerPhone!),
              notification_type: 'sms',
              subject: 'Order Confirmation',
              body: customerSms,
              status: result.success ? 'sent' : 'failed',
              sent_at: result.success ? new Date().toISOString() : undefined,
              error_message: result.error,
              metadata: { type: 'order_customer_sms', orderNumber: data.orderNumber, api_response: result.response }
            });
          })
        );
      }

      // Admin SMS for new order
      const adminOrderSms = `নতুন অর্ডার ${data.orderNumber}: ${data.customerName} - ${data.packageName} - ৳${data.amount}`;
      smsPromises.push(
        sendSMS(ADMIN_PHONE, adminOrderSms).then(result => {
          notifications.push({
            recipient: ADMIN_PHONE,
            notification_type: 'sms',
            subject: 'New Order',
            body: adminOrderSms,
            status: result.success ? 'sent' : 'failed',
            sent_at: result.success ? new Date().toISOString() : undefined,
            error_message: result.error,
            metadata: { type: 'order_admin_sms', orderNumber: data.orderNumber, api_response: result.response }
          });
        })
      );

      // Customer email
      if (data.customerEmail) {
        const customerEmailBody = `
প্রিয় ${data.customerName},

আপনার অর্ডার সফলভাবে গ্রহণ করা হয়েছে!

অর্ডার নম্বর: ${data.orderNumber}
প্যাকেজ: ${data.packageName}
মূল্য: ৳${data.amount}
পেমেন্ট মেথড: ${data.paymentMethod}

আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।

ধন্যবাদ,
DigiWebDex Team
+880 1674 533303
        `.trim();

        notifications.push({
          recipient: data.customerEmail,
          notification_type: 'email',
          subject: `আপনার অর্ডার নিশ্চিত হয়েছে - ${data.orderNumber}`,
          body: customerEmailBody,
          status: 'pending',
          metadata: { type: 'order_customer_email', orderNumber: data.orderNumber }
        });
      }

      // Customer WhatsApp
      if (data.customerPhone) {
        const customerWhatsapp = `✅ *অর্ডার নিশ্চিত হয়েছে!*\n\n📦 *অর্ডার:* ${data.orderNumber}\n📋 *প্যাকেজ:* ${data.packageName}\n💰 *মূল্য:* ৳${data.amount}\n\nআমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।\n\n🏢 *DigiWebDex*\n📞 +880 1674 533303`;
        notifications.push({
          recipient: normalizePhone(data.customerPhone),
          notification_type: 'whatsapp',
          subject: 'Order Confirmation',
          body: customerWhatsapp,
          status: 'pending',
          metadata: { type: 'order_customer_whatsapp', orderNumber: data.orderNumber }
        });
      }

      // Admin email for new order
      const adminOrderEmail = `
🛒 New Order Received!

Order: ${data.orderNumber}
Customer: ${data.customerName}
Email: ${data.customerEmail}
Phone: ${data.customerPhone}
Package: ${data.packageName}
Amount: ৳${data.amount}
Payment: ${data.paymentMethod}

---
DigiWebDex Order System
      `.trim();

      notifications.push({
        recipient: ADMIN_EMAIL,
        notification_type: 'email',
        subject: `[ORDER] ${data.orderNumber} - ${data.packageName} - ৳${data.amount}`,
        body: adminOrderEmail,
        status: 'pending',
        metadata: { type: 'order_admin_email', orderNumber: data.orderNumber }
      });

      // Admin WhatsApp for order
      notifications.push({
        recipient: WHATSAPP_NUMBER,
        notification_type: 'whatsapp',
        subject: 'New Order',
        body: `🛒 *নতুন অর্ডার!*\n\n📦 *Order:* ${data.orderNumber}\n👤 *Customer:* ${data.customerName}\n📧 *Email:* ${data.customerEmail}\n📱 *Phone:* ${data.customerPhone}\n📋 *Package:* ${data.packageName}\n💰 *Amount:* ৳${data.amount}\n💳 *Payment:* ${data.paymentMethod}`,
        status: 'pending',
        metadata: { type: 'order_admin_whatsapp', orderNumber: data.orderNumber }
      });

    } else if (data.type === 'payment_received') {
      // Admin SMS for payment screenshot
      const paymentSms = `পেমেন্ট প্রমাণ! Order: ${data.orderNumber}, Amount: ৳${data.amount}। এখনই ভেরিফাই করুন।`;
      smsPromises.push(
        sendSMS(ADMIN_PHONE, paymentSms).then(result => {
          notifications.push({
            recipient: ADMIN_PHONE,
            notification_type: 'sms',
            subject: 'Payment Received',
            body: paymentSms,
            status: result.success ? 'sent' : 'failed',
            sent_at: result.success ? new Date().toISOString() : undefined,
            error_message: result.error,
            metadata: { type: 'payment_admin_sms', orderNumber: data.orderNumber, api_response: result.response }
          });
        })
      );

      // Admin email
      const paymentAlertEmail = `
💳 Payment Screenshot Received!

Order: ${data.orderNumber}
Customer: ${data.customerName}
Phone: ${data.customerPhone}
Amount: ৳${data.amount}
Method: ${data.paymentMethod}

Please verify the payment in admin panel.

---
DigiWebDex Payment System
      `.trim();

      notifications.push({
        recipient: ADMIN_EMAIL,
        notification_type: 'email',
        subject: `[PAYMENT] Verification Required - ${data.orderNumber}`,
        body: paymentAlertEmail,
        status: 'pending',
        metadata: { type: 'payment_admin_email', orderNumber: data.orderNumber }
      });

      // Admin WhatsApp
      notifications.push({
        recipient: WHATSAPP_NUMBER,
        notification_type: 'whatsapp',
        subject: 'Payment Received',
        body: `💳 *পেমেন্ট স্ক্রিনশট পাওয়া গেছে!*\n\n📦 *Order:* ${data.orderNumber}\n👤 *Customer:* ${data.customerName}\n📱 *Phone:* ${data.customerPhone}\n💰 *Amount:* ৳${data.amount}\n💳 *Method:* ${data.paymentMethod}\n\n⚠️ *দয়া করে এখনই ভেরিফাই করুন!*`,
        status: 'pending',
        metadata: { type: 'payment_admin_whatsapp', orderNumber: data.orderNumber }
      });

      // Customer WhatsApp confirmation
      if (data.customerPhone) {
        notifications.push({
          recipient: normalizePhone(data.customerPhone),
          notification_type: 'whatsapp',
          subject: 'Payment Received',
          body: `✅ *পেমেন্ট প্রমাণ পাওয়া গেছে!*\n\nআপনার পেমেন্ট স্ক্রিনশট সফলভাবে জমা হয়েছে।\n\n📦 *Order:* ${data.orderNumber}\n💰 *Amount:* ৳${data.amount}\n\nআমরা শীঘ্রই ভেরিফাই করে আপনাকে জানাব।\n\n🏢 *DigiWebDex*`,
          status: 'pending',
          metadata: { type: 'payment_customer_whatsapp', orderNumber: data.orderNumber }
        });
      }

    } else if (data.type === 'payment_approved') {
      // Customer SMS for payment approval
      if (data.customerPhone && isValidBDPhone(data.customerPhone)) {
        const approvalSms = `DigiWebDex: আপনার পেমেন্ট ভেরিফাই হয়েছে! Order: ${data.orderNumber}। আমরা কাজ শুরু করছি। ধন্যবাদ!`;
        smsPromises.push(
          sendSMS(data.customerPhone, approvalSms).then(result => {
            notifications.push({
              recipient: normalizePhone(data.customerPhone!),
              notification_type: 'sms',
              subject: 'Payment Approved',
              body: approvalSms,
              status: result.success ? 'sent' : 'failed',
              sent_at: result.success ? new Date().toISOString() : undefined,
              error_message: result.error,
              metadata: { type: 'payment_approved_customer_sms', orderNumber: data.orderNumber, api_response: result.response }
            });
          })
        );
      }

      // Customer WhatsApp
      if (data.customerPhone) {
        notifications.push({
          recipient: normalizePhone(data.customerPhone),
          notification_type: 'whatsapp',
          subject: 'Payment Approved',
          body: `🎉 *পেমেন্ট ভেরিফাই হয়েছে!*\n\n📦 *Order:* ${data.orderNumber}\n💰 *Amount:* ৳${data.amount}\n\n✅ আপনার পেমেন্ট সফলভাবে ভেরিফাই হয়েছে। আমরা আপনার কাজ শুরু করছি!\n\n🏢 *DigiWebDex*\n📞 +880 1674 533303`,
          status: 'pending',
          metadata: { type: 'payment_approved_customer_whatsapp', orderNumber: data.orderNumber }
        });
      }

      // Customer email
      if (data.customerEmail) {
        const approvalEmailBody = `
প্রিয় ${data.customerName},

🎉 আপনার পেমেন্ট সফলভাবে ভেরিফাই হয়েছে!

অর্ডার নম্বর: ${data.orderNumber}
প্যাকেজ: ${data.packageName}
মূল্য: ৳${data.amount}

আমরা আপনার প্রজেক্টে কাজ শুরু করছি। যেকোনো আপডেটের জন্য আমরা আপনার সাথে যোগাযোগ করব।

ধন্যবাদ,
DigiWebDex Team
+880 1674 533303
        `.trim();

        notifications.push({
          recipient: data.customerEmail,
          notification_type: 'email',
          subject: `✅ পেমেন্ট ভেরিফাই হয়েছে - ${data.orderNumber}`,
          body: approvalEmailBody,
          status: 'pending',
          metadata: { type: 'payment_approved_customer_email', orderNumber: data.orderNumber }
        });
      }
    } else if (data.type === 'payment_completed') {
      // Fetch customer email from auth if userId provided and no email given
      let customerEmail = data.customerEmail || '';
      if (!customerEmail && data.userId) {
        try {
          const { data: userData } = await supabase.auth.admin.getUserById(data.userId);
          if (userData?.user?.email) {
            customerEmail = userData.user.email;
          }
        } catch (e) {
          console.error('Error fetching user email:', e);
        }
      }
      data.customerEmail = customerEmail;

      const invoiceLink = data.invoiceUrl || 'https://digiwebdex.lovable.app/bn/dashboard/invoices';

      // Customer SMS - payment complete with invoice link
      if (data.customerPhone && isValidBDPhone(data.customerPhone)) {
        const completeSms = `DigiWebDex: আপনার সম্পূর্ণ পেমেন্ট ৳${data.amount} গৃহীত হয়েছে! অর্ডার: ${data.orderNumber}। ইনভয়েস: ${invoiceLink} ধন্যবাদ!`;
        smsPromises.push(
          sendSMS(data.customerPhone, completeSms).then(result => {
            notifications.push({
              recipient: normalizePhone(data.customerPhone!),
              notification_type: 'sms',
              subject: 'Payment Complete',
              body: completeSms,
              status: result.success ? 'sent' : 'failed',
              sent_at: result.success ? new Date().toISOString() : undefined,
              error_message: result.error,
              metadata: { type: 'payment_complete_customer_sms', orderNumber: data.orderNumber, api_response: result.response }
            });
          })
        );
      }

      // Customer Email - full payment confirmation with invoice
      if (data.customerEmail) {
        const completeEmailBody = `
প্রিয় ${data.customerName},

🎉 আপনার সম্পূর্ণ পেমেন্ট সফলভাবে গৃহীত হয়েছে!

━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 অর্ডার নম্বর: ${data.orderNumber}
${data.invoiceNumber ? `📄 ইনভয়েস নম্বর: ${data.invoiceNumber}` : ''}
📋 প্যাকেজ: ${data.packageName || 'N/A'}
💰 মোট মূল্য: ৳${data.amount}
✅ পরিশোধিত: ৳${data.totalPaid || data.amount}
━━━━━━━━━━━━━━━━━━━━━━━━━━

📄 আপনার ইনভয়েস দেখুন: ${invoiceLink}

আমরা আপনার প্রজেক্টে কাজ শুরু করেছি। যেকোনো আপডেটের জন্য আমরা আপনার সাথে যোগাযোগ করব।

ধন্যবাদ,
DigiWebDex Team
📞 +880 1674 533303
🌐 digiwebdex.com
        `.trim();

        notifications.push({
          recipient: data.customerEmail,
          notification_type: 'email',
          subject: `✅ পেমেন্ট সম্পন্ন - ইনভয়েস ${data.invoiceNumber || data.orderNumber}`,
          body: completeEmailBody,
          status: 'pending',
          metadata: { type: 'payment_complete_customer_email', orderNumber: data.orderNumber, invoiceUrl: invoiceLink }
        });
      }

      // Customer WhatsApp
      if (data.customerPhone) {
        notifications.push({
          recipient: normalizePhone(data.customerPhone),
          notification_type: 'whatsapp',
          subject: 'Payment Complete',
          body: `🎉 *সম্পূর্ণ পেমেন্ট গৃহীত!*\n\n📦 *অর্ডার:* ${data.orderNumber}\n${data.invoiceNumber ? `📄 *ইনভয়েস:* ${data.invoiceNumber}\n` : ''}💰 *মোট:* ৳${data.amount}\n✅ *পরিশোধিত:* ৳${data.totalPaid || data.amount}\n\n📄 *ইনভয়েস লিংক:* ${invoiceLink}\n\n🏢 *DigiWebDex*\n📞 +880 1674 533303`,
          status: 'pending',
          metadata: { type: 'payment_complete_customer_whatsapp', orderNumber: data.orderNumber }
        });
      }

      // Admin notification
      const adminCompleteSms = `✅ সম্পূর্ণ পেমেন্ট! Order: ${data.orderNumber}, ৳${data.amount} - ${data.customerName}`;
      smsPromises.push(
        sendSMS(ADMIN_PHONE, adminCompleteSms).then(result => {
          notifications.push({
            recipient: ADMIN_PHONE,
            notification_type: 'sms',
            subject: 'Payment Complete',
            body: adminCompleteSms,
            status: result.success ? 'sent' : 'failed',
            sent_at: result.success ? new Date().toISOString() : undefined,
            error_message: result.error,
            metadata: { type: 'payment_complete_admin_sms', orderNumber: data.orderNumber, api_response: result.response }
          });
        })
      );
    }

    // Wait for all SMS to be sent
    await Promise.allSettled(smsPromises);

    // Save all notifications to database
    if (notifications.length > 0) {
      const { error: insertError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (insertError) {
        console.error('Error saving notifications:', insertError);
      } else {
        console.log(`${notifications.length} notifications saved successfully`);
      }
    }

    const sentSmsCount = notifications.filter(n => n.notification_type === 'sms' && n.status === 'sent').length;
    const totalSmsCount = notifications.filter(n => n.notification_type === 'sms').length;

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${notifications.length} notifications processed, ${sentSmsCount}/${totalSmsCount} SMS sent`,
        notifications: notifications.length,
        smsSent: sentSmsCount
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error) {
    console.error('Notification error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
});
