const express = require('express');
const { query, queryOne, queryAll } = require('../db');
const nodemailer = require('nodemailer');

const router = express.Router();

// SMS helper (Bangladesh BulkSMSBD API)
async function sendSMS(phone, message) {
  const apiKey = process.env.SMS_API_KEY;
  const senderId = process.env.SMS_SENDER_ID;
  if (!apiKey || !senderId) return { success: false, error: 'SMS not configured' };

  let normalized = phone.replace(/[^0-9]/g, '');
  if (normalized.startsWith('0')) normalized = '88' + normalized;
  else if (!normalized.startsWith('880')) normalized = '880' + normalized;

  try {
    const url = `http://bulksmsbd.net/api/smsapi?api_key=${encodeURIComponent(apiKey)}&type=text&number=${normalized}&senderid=${encodeURIComponent(senderId)}&message=${encodeURIComponent(message)}`;
    const response = await fetch(url);
    const text = await response.text();
    return { success: response.ok, response: text };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Email transporter
const getEmailTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.resend.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER || 'resend',
      pass: process.env.SMTP_PASS || process.env.RESEND_API_KEY,
    },
  });
};

// POST /api/notifications/send-sms
router.post('/send-sms', async (req, res) => {
  try {
    const { phone, message, type, metadata } = req.body;
    if (!phone || !message) return res.status(400).json({ error: 'Phone and message required' });

    const result = await sendSMS(phone, message);

    // Log notification
    await query(
      `INSERT INTO notifications (recipient, notification_type, subject, body, status, metadata, sent_at)
       VALUES ($1, 'sms', $2, $3, $4, $5, $6)`,
      [phone, type || 'notification', message, result.success ? 'sent' : 'failed', metadata || {}, result.success ? new Date() : null]
    );

    res.json({ success: result.success, ...result });
  } catch (err) {
    console.error('Send SMS error:', err);
    res.status(500).json({ error: 'Failed to send SMS' });
  }
});

// POST /api/notifications/send-email
router.post('/send-email', async (req, res) => {
  try {
    const { to, subject, html, from_name } = req.body;
    if (!to || !subject || !html) return res.status(400).json({ error: 'to, subject, html required' });

    const transporter = getEmailTransporter();
    const senderName = from_name || 'DigiWebDex';
    const fromEmail = `${senderName} <noreply@digiwebdex.com>`;

    const info = await transporter.sendMail({
      from: fromEmail,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
    });

    // Log notification
    await query(
      `INSERT INTO notifications (recipient, notification_type, subject, body, status, sent_at)
       VALUES ($1, 'email', $2, $3, 'sent', NOW())`,
      [Array.isArray(to) ? to.join(', ') : to, subject, html]
    );

    res.json({ success: true, messageId: info.messageId });
  } catch (err) {
    console.error('Send email error:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// POST /api/notifications/contact-notification (replaces edge function)
router.post('/contact-notification', async (req, res) => {
  try {
    const data = req.body;
    const adminPhone = process.env.ADMIN_PHONE || '8801674533303';
    const adminEmail = process.env.ADMIN_EMAIL || 'digiwebdex@gmail.com';

    const results = [];

    if (data.type === 'contact_form') {
      // Send admin SMS
      const smsResult = await sendSMS(adminPhone, `নতুন Contact: ${data.name} - ${data.subject?.substring(0, 30)}... Reply: ${data.email}`);
      results.push({ type: 'admin_sms', ...smsResult });

      // Log notifications
      await query(
        `INSERT INTO notifications (recipient, notification_type, subject, body, status, sent_at, metadata)
         VALUES ($1, 'sms', 'New Contact', $2, $3, $4, $5)`,
        [adminPhone, `Contact from ${data.name}`, smsResult.success ? 'sent' : 'failed', smsResult.success ? new Date() : null, { type: 'contact_admin_sms' }]
      );
    }

    if (data.type === 'order_created') {
      // Customer SMS
      if (data.customerPhone) {
        const customerSms = `DigiWebDex: আপনার অর্ডার ${data.orderNumber} গ্রহণ হয়েছে। প্যাকেজ: ${data.packageName}। শীঘ্রই যোগাযোগ করা হবে।`;
        await sendSMS(data.customerPhone, customerSms);
      }

      // Admin SMS
      const adminSms = `নতুন অর্ডার ${data.orderNumber}: ${data.customerName} - ${data.packageName} - ৳${data.amount}`;
      await sendSMS(adminPhone, adminSms);
    }

    if (data.type === 'payment_received') {
      const sms = `পেমেন্ট প্রমাণ! Order: ${data.orderNumber}, Amount: ৳${data.amount}। এখনই ভেরিফাই করুন।`;
      await sendSMS(adminPhone, sms);
    }

    if (data.type === 'payment_approved' && data.customerPhone) {
      const sms = `DigiWebDex: আপনার পেমেন্ট ভেরিফাই হয়েছে! Order: ${data.orderNumber}। আমরা কাজ শুরু করছি।`;
      await sendSMS(data.customerPhone, sms);
    }

    res.json({ success: true, results });
  } catch (err) {
    console.error('Contact notification error:', err);
    res.status(500).json({ error: 'Notification failed' });
  }
});

// POST /api/notifications/lead-notification
router.post('/lead-notification', async (req, res) => {
  try {
    const { lead_id, name, phone, email, service_interest } = req.body;
    if (!name || !phone) return res.status(400).json({ error: 'Name and phone required' });

    const adminPhone = process.env.ADMIN_PHONE || '8801674533303';
    const hotline = process.env.HOTLINE || '01674533303';

    const serviceLabels = {
      'domain-hosting': 'ডোমেইন ও হোস্টিং',
      'web-development': 'ওয়েব ডেভেলপমেন্ট',
      'software': 'সফটওয়্যার',
      'digital-marketing': 'ডিজিটাল মার্কেটিং',
    };
    const serviceLabel = service_interest ? (serviceLabels[service_interest] || service_interest) : 'সার্ভিস';

    // Customer SMS
    const customerMessage = `ধন্যবাদ ${name}! Digiwebdex টিম খুব দ্রুত আপনার সাথে যোগাযোগ করবে। ${serviceLabel} সার্ভিসে আমাদের সাথে থাকুন। হটলাইন: ${hotline}`;
    await sendSMS(phone, customerMessage);

    // Admin SMS
    const adminMessage = `🔔 নতুন লিড! নাম: ${name}, ফোন: ${phone}, সার্ভিস: ${serviceLabel}. দ্রুত যোগাযোগ করুন!`;
    await sendSMS(adminPhone, adminMessage);

    res.json({ success: true, message: 'Notifications sent' });
  } catch (err) {
    console.error('Lead notification error:', err);
    res.status(500).json({ error: 'Notification failed' });
  }
});

module.exports = router;
