import { supabase } from '@/integrations/supabase/client';
import type { Database, Json } from '@/integrations/supabase/types';

type Notification = Database['public']['Tables']['notifications']['Row'];
type NotificationType = Database['public']['Enums']['notification_type'];

export interface SendNotificationParams {
  userId: string;
  templateSlug?: string;
  type: NotificationType;
  recipient: string;
  subject?: string;
  body: string;
  metadata?: Record<string, string | number | boolean>;
}

class NotificationService {
  private triggerEvents = {
    ORDER_CREATED: 'order_created',
    INVOICE_GENERATED: 'invoice_generated',
    PAYMENT_SUCCESS: 'payment_success',
    SERVICE_ACTIVATED: 'service_activated',
    RENEWAL_REMINDER: 'renewal_reminder',
    SUSPENSION_NOTICE: 'suspension_notice',
  };

  async sendNotification(params: SendNotificationParams): Promise<{ data: Notification | null; error: Error | null }> {
    try {
      let finalBody = params.body;
      let finalSubject = params.subject;

      if (params.templateSlug) {
        const { data: template } = await supabase
          .from('notification_templates')
          .select('*')
          .eq('slug', params.templateSlug)
          .eq('is_active', true)
          .single();

        if (template) {
          finalBody = this.replaceVariables(template.body_en || params.body, params.metadata || {});
          finalSubject = this.replaceVariables(template.subject_en || params.subject || '', params.metadata || {});
        }
      }

      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          user_id: params.userId,
          notification_type: params.type,
          recipient: params.recipient,
          subject: finalSubject,
          body: finalBody,
          metadata: (params.metadata || {}) as Json,
          status: 'pending' as const,
        }])
        .select()
        .single();

      if (error) throw error;

      await this.processNotification(data);

      return { data, error: null };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  }

  private replaceVariables(template: string, variables: Record<string, string | number | boolean>): string {
    let result = template;
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    });
    return result;
  }

  private async processNotification(notification: Notification): Promise<void> {
    try {
      switch (notification.notification_type) {
        case 'email':
          await this.sendEmail(notification);
          break;
        case 'sms':
          await this.sendSMS(notification);
          break;
        case 'whatsapp':
          await this.sendWhatsApp(notification);
          break;
        case 'in_app':
          await this.markAsSent(notification.id);
          break;
      }
    } catch (err) {
      await this.markAsFailed(notification.id, (err as Error).message);
    }
  }

  private async sendEmail(notification: Notification): Promise<void> {
    console.log('Email notification:', { to: notification.recipient, subject: notification.subject });
    await this.markAsSent(notification.id);
  }

  private async sendSMS(notification: Notification): Promise<void> {
    try {
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          phone: notification.recipient,
          message: notification.body,
          type: 'customer',
          metadata: notification.metadata,
        },
      });

      if (error || !data?.success) {
        await this.markAsFailed(notification.id, data?.message || error?.message || 'SMS failed');
      } else {
        await this.markAsSent(notification.id);
      }
    } catch (err) {
      await this.markAsFailed(notification.id, (err as Error).message);
    }
  }

  private async sendWhatsApp(notification: Notification): Promise<void> {
    console.log('WhatsApp notification:', { to: notification.recipient, message: notification.body });
    // WhatsApp Business API integration - pending setup
    await this.markAsSent(notification.id);
  }

  private async markAsSent(notificationId: string): Promise<void> {
    await supabase
      .from('notifications')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', notificationId);
  }

  private async markAsFailed(notificationId: string, errorMessage: string): Promise<void> {
    await supabase
      .from('notifications')
      .update({ status: 'failed', error_message: errorMessage })
      .eq('id', notificationId);
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('notification_type', 'in_app')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data;
  }

  async triggerEvent(
    eventType: keyof typeof this.triggerEvents,
    userId: string,
    email: string,
    data: Record<string, string | number | boolean>
  ): Promise<void> {
    const templateSlug = this.triggerEvents[eventType];

    // Send email
    await this.sendNotification({
      userId,
      templateSlug,
      type: 'email',
      recipient: email,
      body: `Notification for ${eventType}`,
      metadata: data,
    });

    // In-app
    await this.sendNotification({
      userId,
      templateSlug,
      type: 'in_app',
      recipient: userId,
      body: `Notification for ${eventType}`,
      metadata: data,
    });
  }

  /**
   * Send multi-channel renewal alert (SMS + Email + WhatsApp)
   */
  async sendRenewalAlert(params: {
    userId: string;
    phone?: string;
    email?: string;
    customerName: string;
    serviceType: 'hosting' | 'domain';
    serviceName: string;
    expiryDate: string;
    daysRemaining: number;
    amount?: number;
  }): Promise<void> {
    const typeLabel = params.serviceType === 'hosting' ? 'হোস্টিং' : 'ডোমেইন';

    // SMS
    if (params.phone) {
      await this.sendNotification({
        userId: params.userId,
        type: 'sms',
        recipient: params.phone,
        subject: `${params.serviceType} Renewal`,
        body: `DigiWebDex: আপনার ${typeLabel} "${params.serviceName}" ${params.daysRemaining} দিন পর expire হবে। রিনিউ করুন: 01674533303`,
        metadata: { entity_type: params.serviceType, days: params.daysRemaining },
      });
    }

    // Email
    if (params.email) {
      await this.sendNotification({
        userId: params.userId,
        type: 'email',
        recipient: params.email,
        subject: `${params.serviceType} Renewal Reminder - ${params.serviceName}`,
        body: `প্রিয় ${params.customerName}, আপনার ${typeLabel} "${params.serviceName}" ${params.daysRemaining} দিন পর (${params.expiryDate}) expire হবে।`,
        metadata: { entity_type: params.serviceType, days: params.daysRemaining },
      });
    }

    // WhatsApp
    if (params.phone) {
      await this.sendNotification({
        userId: params.userId,
        type: 'whatsapp',
        recipient: params.phone,
        subject: `${params.serviceType} Renewal`,
        body: `🔔 *রিনিউয়াল রিমাইন্ডার*\n\n${params.serviceName} - ${params.daysRemaining} দিন বাকি`,
        metadata: { entity_type: params.serviceType, days: params.daysRemaining },
      });
    }
  }
}

export const notificationService = new NotificationService();
