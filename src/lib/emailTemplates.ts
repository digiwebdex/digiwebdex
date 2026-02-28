const brandColor = '#2563eb';
const footerText = `© ${new Date().getFullYear()} DigiWebDex. All rights reserved.`;
const footerContact = '📞 +880 1674-533303 | 📧 info@digiwebdex.com';

const logoUrl = 'https://digiwebdex.com/images/email-logo.png';

function baseLayout(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="font-family:Arial,sans-serif;background:#f3f4f6;margin:0;padding:32px 16px;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">
        <div style="background:#ffffff;padding:24px;text-align:center;border-bottom:2px solid ${brandColor};">
          <img src="${logoUrl}" alt="DigiWebDex" style="height:48px;width:auto;" />
        </div>
        <div style="padding:28px 24px;">
          ${content}
        </div>
        <div style="border-top:1px solid #e5e7eb;padding:16px 24px;text-align:center;">
          <p style="color:#9ca3af;font-size:12px;margin:0 0 4px;">${footerText}</p>
          <p style="color:#9ca3af;font-size:12px;margin:0;">${footerContact}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function btnStyle(): string {
  return `display:inline-block;background:${brandColor};color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:14px;`;
}

// ─── Invoice ───
export interface InvoiceEmailData {
  name: string;
  invoice: string;
  amount: number | string;
  link?: string;
}

export function invoiceTemplate(data: InvoiceEmailData): string {
  return baseLayout(`
    <h2 style="color:#111827;margin:0 0 16px;">ইনভয়েস তৈরি হয়েছে</h2>
    <p style="color:#374151;">প্রিয় ${data.name},</p>
    <p style="color:#374151;">আপনার ইনভয়েস তৈরি করা হয়েছে।</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr>
        <td style="padding:8px 0;color:#6b7280;">ইনভয়েস নম্বর</td>
        <td style="padding:8px 0;color:#111827;font-weight:bold;text-align:right;">${data.invoice}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#6b7280;">মোট পরিমাণ</td>
        <td style="padding:8px 0;color:#111827;font-weight:bold;text-align:right;">৳${data.amount}</td>
      </tr>
    </table>
    ${data.link ? `<div style="text-align:center;margin:24px 0;"><a href="${data.link}" style="${btnStyle()}">ইনভয়েস দেখুন</a></div>` : ''}
    <p style="color:#374151;">DigiWebDex বেছে নেওয়ার জন্য ধন্যবাদ।</p>
  `);
}

// ─── Payment ───
export interface PaymentEmailData {
  name: string;
  amount: number | string;
  method?: string;
  transactionId?: string;
}

export function paymentTemplate(data: PaymentEmailData): string {
  return baseLayout(`
    <h2 style="color:#111827;margin:0 0 16px;">পেমেন্ট সফল হয়েছে ✅</h2>
    <p style="color:#374151;">প্রিয় ${data.name},</p>
    <p style="color:#374151;">আপনার পেমেন্ট সফলভাবে গৃহীত হয়েছে।</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr>
        <td style="padding:8px 0;color:#6b7280;">পরিমাণ</td>
        <td style="padding:8px 0;color:#059669;font-weight:bold;text-align:right;">৳${data.amount}</td>
      </tr>
      ${data.method ? `<tr><td style="padding:8px 0;color:#6b7280;">পদ্ধতি</td><td style="padding:8px 0;color:#111827;text-align:right;">${data.method}</td></tr>` : ''}
      ${data.transactionId ? `<tr><td style="padding:8px 0;color:#6b7280;">ট্রানজেকশন</td><td style="padding:8px 0;color:#111827;text-align:right;">${data.transactionId}</td></tr>` : ''}
    </table>
    <p style="color:#374151;">ধন্যবাদ।</p>
  `);
}

// ─── Renewal Reminder ───
export interface RenewalEmailData {
  name: string;
  service: string;
  domain?: string;
  date: string;
  daysRemaining: number;
  amount?: number | string;
}

export function renewalTemplate(data: RenewalEmailData): string {
  const urgencyColor = data.daysRemaining <= 3 ? '#dc2626' : data.daysRemaining <= 7 ? '#f59e0b' : '#2563eb';
  return baseLayout(`
    <h2 style="color:#111827;margin:0 0 16px;">🔔 রিনিউয়াল রিমাইন্ডার</h2>
    <p style="color:#374151;">প্রিয় ${data.name},</p>
    <p style="color:#374151;">আপনার সার্ভিস শীঘ্রই মেয়াদ উত্তীর্ণ হচ্ছে।</p>
    <div style="background:#f9fafb;border-radius:6px;padding:16px;margin:16px 0;border-left:4px solid ${urgencyColor};">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:6px 0;color:#6b7280;">সার্ভিস</td>
          <td style="padding:6px 0;color:#111827;font-weight:bold;text-align:right;">${data.service}</td>
        </tr>
        ${data.domain ? `<tr><td style="padding:6px 0;color:#6b7280;">ডোমেইন</td><td style="padding:6px 0;color:#111827;text-align:right;">${data.domain}</td></tr>` : ''}
        <tr>
          <td style="padding:6px 0;color:#6b7280;">মেয়াদ শেষ</td>
          <td style="padding:6px 0;color:#111827;text-align:right;">${data.date}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#6b7280;">বাকি</td>
          <td style="padding:6px 0;color:${urgencyColor};font-weight:bold;text-align:right;">${data.daysRemaining} দিন</td>
        </tr>
        ${data.amount ? `<tr><td style="padding:6px 0;color:#6b7280;">রিনিউয়াল ফি</td><td style="padding:6px 0;color:#111827;font-weight:bold;text-align:right;">৳${data.amount}</td></tr>` : ''}
      </table>
    </div>
    <p style="color:#374151;">মেয়াদ শেষ হওয়ার আগেই রিনিউ করুন।</p>
    <div style="text-align:center;margin:24px 0;">
      <a href="https://digiwebdex.com" style="${btnStyle()}">রিনিউ করুন</a>
    </div>
  `);
}

// ─── Order Confirmation ───
export interface OrderEmailData {
  name: string;
  orderNumber: string;
  items: Array<{ name: string; price: number | string }>;
  total: number | string;
}

export function orderTemplate(data: OrderEmailData): string {
  const itemRows = data.items.map(item => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#374151;">${item.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#111827;text-align:right;">৳${item.price}</td>
    </tr>
  `).join('');

  return baseLayout(`
    <h2 style="color:#111827;margin:0 0 16px;">অর্ডার নিশ্চিত হয়েছে ✅</h2>
    <p style="color:#374151;">প্রিয় ${data.name},</p>
    <p style="color:#374151;">আপনার অর্ডার সফলভাবে গৃহীত হয়েছে।</p>
    <p style="color:#6b7280;margin-bottom:16px;">অর্ডার নম্বর: <strong style="color:#111827;">${data.orderNumber}</strong></p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr style="background:#f3f4f6;">
        <th style="padding:8px 12px;text-align:left;color:#6b7280;font-size:13px;">আইটেম</th>
        <th style="padding:8px 12px;text-align:right;color:#6b7280;font-size:13px;">মূল্য</th>
      </tr>
      ${itemRows}
      <tr>
        <td style="padding:10px 12px;font-weight:bold;color:#111827;">মোট</td>
        <td style="padding:10px 12px;font-weight:bold;color:${brandColor};text-align:right;">৳${data.total}</td>
      </tr>
    </table>
    <p style="color:#374151;">আমরা শীঘ্রই আপনার সাথে যোগাযোগ করবো।</p>
  `);
}

// ─── Welcome ───
export interface WelcomeEmailData {
  name: string;
}

export function welcomeTemplate(data: WelcomeEmailData): string {
  return baseLayout(`
    <h2 style="color:#111827;margin:0 0 16px;">স্বাগতম! 🎉</h2>
    <p style="color:#374151;">প্রিয় ${data.name},</p>
    <p style="color:#374151;">DigiWebDex-এ আপনাকে স্বাগতম! আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে।</p>
    <p style="color:#374151;">আমাদের ড্যাশবোর্ড থেকে আপনার সকল সার্ভিস ম্যানেজ করতে পারবেন।</p>
    <div style="text-align:center;margin:24px 0;">
      <a href="https://digiwebdex.com" style="${btnStyle()}">ড্যাশবোর্ডে যান</a>
    </div>
    <p style="color:#374151;">কোনো সাহায্য প্রয়োজন হলে আমাদের সাথে যোগাযোগ করুন।</p>
  `);
}

// ─── Suspension Notice ───
export interface SuspensionEmailData {
  name: string;
  service: string;
  domain?: string;
  reason: string;
}

export function suspensionTemplate(data: SuspensionEmailData): string {
  return baseLayout(`
    <h2 style="color:#dc2626;margin:0 0 16px;">⚠️ সার্ভিস সাসপেন্ড নোটিশ</h2>
    <p style="color:#374151;">প্রিয় ${data.name},</p>
    <p style="color:#374151;">আপনার নিম্নলিখিত সার্ভিসটি সাসপেন্ড করা হয়েছে:</p>
    <div style="background:#fef2f2;border-radius:6px;padding:16px;margin:16px 0;border-left:4px solid #dc2626;">
      <p style="margin:4px 0;color:#374151;"><strong>সার্ভিস:</strong> ${data.service}</p>
      ${data.domain ? `<p style="margin:4px 0;color:#374151;"><strong>ডোমেইন:</strong> ${data.domain}</p>` : ''}
      <p style="margin:4px 0;color:#374151;"><strong>কারণ:</strong> ${data.reason}</p>
    </div>
    <p style="color:#374151;">সার্ভিস পুনরায় সক্রিয় করতে পেমেন্ট সম্পন্ন করুন।</p>
    <div style="text-align:center;margin:24px 0;">
      <a href="https://digiwebdex.com" style="${btnStyle()}">পেমেন্ট করুন</a>
    </div>
  `);
}
