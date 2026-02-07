import { supabase } from '@/integrations/supabase/client';
import { notificationService } from './notificationService';

export type ManualPaymentMethod = 'bkash_personal' | 'bank_transfer' | 'cash';
export type ManualPaymentStatus = 'pending' | 'approved' | 'rejected';

export interface ManualPayment {
  id: string;
  order_id: string | null;
  invoice_id: string | null;
  user_id: string;
  method: ManualPaymentMethod;
  transaction_id: string;
  sender_number: string | null;
  amount: number;
  screenshot_url: string | null;
  notes: string | null;
  status: ManualPaymentStatus;
  rejection_reason: string | null;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentInstructions {
  bkash_personal: {
    number: string;
    accountType: string;
    instructions: string[];
  };
  bank_transfer: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    accountType: string;
    branch: string;
    routingNumber: string;
    instructions: string[];
  };
  cash: {
    address: string;
    phone: string;
    instructions: string[];
  };
}

export interface SubmitManualPaymentParams {
  orderId?: string;
  invoiceId?: string;
  method: ManualPaymentMethod;
  transactionId: string;
  senderNumber?: string;
  amount: number;
  notes?: string;
}

class ManualPaymentService {
  // Payment instructions - can be configured by admin later
  private paymentInstructions: PaymentInstructions = {
    bkash_personal: {
      number: '01XXXXXXXXX',
      accountType: 'Personal',
      instructions: [
        'Open bKash app and go to "Send Money"',
        'Enter the number above',
        'Enter the exact amount',
        'Add your Order ID in reference',
        'Complete the transaction',
        'Note down the Transaction ID',
        'Take a screenshot of the confirmation',
      ],
    },
    bank_transfer: {
      bankName: 'Pubali Bank Ltd.',
      accountName: 'Md. Iqbal Hossain',
      accountNumber: '2706101077904',
      accountType: 'Saving Account',
      branch: 'Asad Avenue Branch',
      routingNumber: '175260162',
      instructions: [
        'Transfer the exact amount to the account above',
        'Use your Order ID as reference/narration',
        'Keep the transaction receipt',
        'Take a screenshot or photo of the receipt',
        'Submit the details below for verification',
      ],
    },
    cash: {
      address: 'House No. 49, Shekhertek, Mohammadpur, Dhaka-1207, Bangladesh',
      phone: '+8801674533303',
      instructions: [
        'Visit our office during business hours (10 AM - 6 PM)',
        'Bring the exact amount in cash',
        'Mention your Order ID to our staff',
        'Collect your payment receipt',
        'Submit the receipt details below for confirmation',
      ],
    },
  };

  getPaymentInstructions(): PaymentInstructions {
    return this.paymentInstructions;
  }

  async uploadScreenshot(file: File, userId: string): Promise<{ url: string | null; error: Error | null }> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get the URL (private bucket, so we use signed URLs for admins)
      const { data } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName);

      return { url: data.publicUrl, error: null };
    } catch (err) {
      return { url: null, error: err as Error };
    }
  }

  async submitPayment(
    params: SubmitManualPaymentParams,
    userId: string,
    userEmail?: string,
    screenshotFile?: File
  ): Promise<{ data: ManualPayment | null; error: Error | null }> {
    try {
      let screenshotUrl: string | null = null;

      // Upload screenshot if provided
      if (screenshotFile) {
        const { url, error } = await this.uploadScreenshot(screenshotFile, userId);
        if (error) throw error;
        screenshotUrl = url;
      }

      const { data, error } = await supabase
        .from('manual_payments')
        .insert({
          order_id: params.orderId || null,
          invoice_id: params.invoiceId || null,
          user_id: userId,
          method: params.method,
          transaction_id: params.transactionId,
          sender_number: params.senderNumber || null,
          amount: params.amount,
          screenshot_url: screenshotUrl,
          notes: params.notes || null,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      // Trigger payment submitted notification
      if (userEmail) {
        await notificationService.triggerEvent('PAYMENT_SUCCESS', userId, userEmail, {
          amount: params.amount,
          transaction_id: params.transactionId,
          order_number: params.orderId || 'N/A',
        });
      }

      return { data: data as ManualPayment, error: null };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  }

  async getUserPayments(userId: string): Promise<ManualPayment[]> {
    const { data, error } = await supabase
      .from('manual_payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as ManualPayment[];
  }

  async getPaymentById(paymentId: string): Promise<ManualPayment | null> {
    const { data, error } = await supabase
      .from('manual_payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (error) throw error;
    return data as ManualPayment;
  }

  // Admin functions
  async getAllPendingPayments(): Promise<ManualPayment[]> {
    const { data, error } = await supabase
      .from('manual_payments')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as ManualPayment[];
  }

  async getAllPayments(status?: ManualPaymentStatus): Promise<ManualPayment[]> {
    let query = supabase
      .from('manual_payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as ManualPayment[];
  }

  async approvePayment(paymentId: string, adminId: string, userEmail?: string): Promise<{ error: Error | null }> {
    try {
      // Get payment details
      const payment = await this.getPaymentById(paymentId);
      if (!payment) throw new Error('Payment not found');

      // Update payment status
      const { error: updateError } = await supabase
        .from('manual_payments')
        .update({
          status: 'approved',
          verified_by: adminId,
          verified_at: new Date().toISOString(),
        })
        .eq('id', paymentId);

      if (updateError) throw updateError;

      const now = new Date().toISOString();
      let orderNumber = '';

      // Update order status if linked
      if (payment.order_id) {
        const { data: order } = await supabase
          .from('orders')
          .update({ 
            status: 'paid', 
            paid_at: now 
          })
          .eq('id', payment.order_id)
          .select('order_number')
          .single();
        
        if (order) orderNumber = order.order_number;
      }

      // Update invoice status if linked
      if (payment.invoice_id) {
        await supabase
          .from('invoices')
          .update({ 
            status: 'paid', 
            paid_at: now 
          })
          .eq('id', payment.invoice_id);
      }

      // Trigger payment success notification
      if (userEmail) {
        await notificationService.triggerEvent('PAYMENT_SUCCESS', payment.user_id, userEmail, {
          order_number: orderNumber,
          amount: payment.amount,
          transaction_id: payment.transaction_id,
        });
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }

  async rejectPayment(
    paymentId: string, 
    adminId: string, 
    reason: string
  ): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('manual_payments')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          verified_by: adminId,
          verified_at: new Date().toISOString(),
        })
        .eq('id', paymentId);

      if (error) throw error;
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }

  async getSignedScreenshotUrl(path: string): Promise<string | null> {
    // Extract the file path from the public URL
    const bucketPath = path.split('/payment-proofs/')[1];
    if (!bucketPath) return path;

    const { data, error } = await supabase.storage
      .from('payment-proofs')
      .createSignedUrl(bucketPath, 3600); // 1 hour expiry

    if (error) return null;
    return data.signedUrl;
  }
}

export const manualPaymentService = new ManualPaymentService();
