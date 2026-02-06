import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { notificationService } from '../notificationService';
import { hostingProvisionService } from './hostingProvisionService';

type HostingAccount = Database['public']['Tables']['hosting_accounts']['Row'];
type Invoice = Database['public']['Tables']['invoices']['Row'];

interface ExpiringService {
  id: string;
  type: 'hosting' | 'domain';
  userId: string;
  userEmail?: string;
  expiryDate: string;
  daysUntilExpiry: number;
  renewalAmount: number;
}

interface RenewalConfig {
  firstReminderDays: number;  // Days before expiry for first reminder
  secondReminderDays: number; // Days before expiry for second reminder
  gracePeriodDays: number;    // Days after expiry before suspension
  suspensionWarningDays: number; // Days before suspension to warn
}

class RenewalAutomationService {
  private config: RenewalConfig = {
    firstReminderDays: 30,
    secondReminderDays: 7,
    gracePeriodDays: 7,
    suspensionWarningDays: 3,
  };

  /**
   * Main renewal check - should be run daily via scheduled job
   * This is a structural implementation for background processing
   */
  async processRenewalChecks(): Promise<{
    reminders: number;
    invoicesGenerated: number;
    suspensions: number;
    errors: string[];
  }> {
    const results = {
      reminders: 0,
      invoicesGenerated: 0,
      suspensions: 0,
      errors: [] as string[],
    };

    try {
      // 1. Get expiring hosting accounts
      const expiringHosting = await this.getExpiringHostingAccounts();

      for (const account of expiringHosting) {
        try {
          await this.processExpiringAccount(account, results);
        } catch (error) {
          results.errors.push(`Hosting ${account.id}: ${(error as Error).message}`);
        }
      }

      // 2. Check for accounts past grace period
      await this.processSuspensions(results);

      // 3. Log renewal check run
      await this.logRenewalRun(results);

    } catch (error) {
      results.errors.push(`System error: ${(error as Error).message}`);
    }

    return results;
  }

  /**
   * Get hosting accounts expiring within 30 days
   */
  private async getExpiringHostingAccounts(): Promise<ExpiringService[]> {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + this.config.firstReminderDays);

    const { data: accounts, error } = await supabase
      .from('hosting_accounts')
      .select(`
        *,
        order:orders(total, user_id)
      `)
      .eq('status', 'active')
      .eq('auto_renew', true)
      .lte('expiry_date', thirtyDaysFromNow.toISOString().split('T')[0])
      .gte('expiry_date', new Date().toISOString().split('T')[0]);

    if (error) throw error;

    return (accounts || []).map(account => {
      const expiryDate = new Date(account.expiry_date || '');
      const today = new Date();
      const diffTime = expiryDate.getTime() - today.getTime();
      const daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        id: account.id,
        type: 'hosting' as const,
        userId: account.user_id || '',
        expiryDate: account.expiry_date || '',
        daysUntilExpiry,
        renewalAmount: (account.order as any)?.total || 0,
      };
    });
  }

  /**
   * Process an expiring account based on days until expiry
   */
  private async processExpiringAccount(
    account: ExpiringService,
    results: { reminders: number; invoicesGenerated: number; suspensions: number; errors: string[] }
  ): Promise<void> {
    const { daysUntilExpiry } = account;

    // First reminder at 30 days
    if (daysUntilExpiry === this.config.firstReminderDays) {
      await this.sendRenewalReminder(account, 'first');
      results.reminders++;
    }
    // Second reminder at 7 days
    else if (daysUntilExpiry === this.config.secondReminderDays) {
      await this.sendRenewalReminder(account, 'second');
      results.reminders++;
      
      // Generate renewal invoice if not already created
      const hasInvoice = await this.hasRenewalInvoice(account.id);
      if (!hasInvoice) {
        await this.generateRenewalInvoice(account);
        results.invoicesGenerated++;
      }
    }
    // Final warning at 3 days
    else if (daysUntilExpiry === this.config.suspensionWarningDays) {
      await this.sendSuspensionWarning(account);
      results.reminders++;
    }
  }

  /**
   * Check for and process accounts that should be suspended
   */
  private async processSuspensions(
    results: { reminders: number; invoicesGenerated: number; suspensions: number; errors: string[] }
  ): Promise<void> {
    const gracePeriodEnd = new Date();
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() - this.config.gracePeriodDays);

    const { data: expiredAccounts, error } = await supabase
      .from('hosting_accounts')
      .select('*')
      .eq('status', 'active')
      .lt('expiry_date', gracePeriodEnd.toISOString().split('T')[0]);

    if (error) throw error;

    for (const account of expiredAccounts || []) {
      // Check if renewal invoice is paid
      const isPaid = await this.isRenewalInvoicePaid(account.id);
      
      if (!isPaid) {
        // Suspend account
        const result = await hostingProvisionService.suspendAccount(
          account.id,
          'Non-payment after grace period'
        );
        
        if (result.success) {
          results.suspensions++;
          
          // Send suspension notification
          await notificationService.triggerEvent('SUSPENSION_NOTICE', account.user_id || '', '', {
            service_type: 'Hosting',
            account_id: account.id,
            reason: 'Payment not received after grace period',
          });
        } else {
          results.errors.push(`Suspension failed for ${account.id}: ${result.error}`);
        }
      }
    }
  }

  /**
   * Send renewal reminder notification
   */
  private async sendRenewalReminder(account: ExpiringService, reminderType: 'first' | 'second'): Promise<void> {
    // Get user email
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', account.userId)
      .single();

    await notificationService.triggerEvent('RENEWAL_REMINDER', account.userId, account.userEmail || '', {
      service_type: account.type === 'hosting' ? 'Hosting' : 'Domain',
      expiry_date: account.expiryDate,
      days_until_expiry: account.daysUntilExpiry.toString(),
      renewal_amount: account.renewalAmount.toString(),
      customer_name: profile?.full_name || 'Customer',
      reminder_type: reminderType,
    });
  }

  /**
   * Send suspension warning
   */
  private async sendSuspensionWarning(account: ExpiringService): Promise<void> {
    await notificationService.sendNotification({
      userId: account.userId,
      type: 'email',
      recipient: account.userEmail || '',
      subject: 'Urgent: Service Suspension Warning',
      body: `Your ${account.type} service will be suspended in ${account.daysUntilExpiry} days if payment is not received.`,
      metadata: {
        service_id: account.id,
        expiry_date: account.expiryDate,
      },
    });
  }

  /**
   * Check if renewal invoice exists for account
   */
  private async hasRenewalInvoice(accountId: string): Promise<boolean> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data } = await supabase
      .from('invoices')
      .select('id')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .limit(1);

    return (data?.length || 0) > 0;
  }

  /**
   * Generate renewal invoice
   */
  private async generateRenewalInvoice(account: ExpiringService): Promise<void> {
    const { data: invoiceNumber } = await supabase.rpc('generate_invoice_number');

    const dueDate = new Date(account.expiryDate);
    
    await supabase.from('invoices').insert({
      invoice_number: invoiceNumber || `INV-${Date.now()}`,
      user_id: account.userId,
      subtotal: account.renewalAmount,
      total: account.renewalAmount,
      discount: 0,
      tax: 0,
      status: 'unpaid',
      due_date: dueDate.toISOString().split('T')[0],
      notes: `Renewal invoice for ${account.type} service`,
    });

    // Log renewal invoice generation
    await supabase.from('renewal_logs').insert({
      entity_type: account.type,
      entity_id: account.id,
      old_expiry_date: account.expiryDate,
    });
  }

  /**
   * Check if renewal invoice is paid
   */
  private async isRenewalInvoicePaid(accountId: string): Promise<boolean> {
    const { data: renewalLog } = await supabase
      .from('renewal_logs')
      .select('invoice_id')
      .eq('entity_id', accountId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!renewalLog?.invoice_id) return false;

    const { data: invoice } = await supabase
      .from('invoices')
      .select('status')
      .eq('id', renewalLog.invoice_id)
      .single();

    return invoice?.status === 'paid';
  }

  /**
   * Reactivate account after payment
   */
  async reactivateAfterPayment(accountId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Unsuspend the account
      const result = await hostingProvisionService.unsuspendAccount(accountId);
      
      if (!result.success) throw new Error(result.error);

      // Extend expiry date by billing period (12 months default)
      const newExpiry = new Date();
      newExpiry.setMonth(newExpiry.getMonth() + 12);

      // Get current expiry to log
      const { data: account } = await supabase
        .from('hosting_accounts')
        .select('expiry_date, user_id')
        .eq('id', accountId)
        .single();

      // Update expiry date
      await supabase
        .from('hosting_accounts')
        .update({ expiry_date: newExpiry.toISOString().split('T')[0] })
        .eq('id', accountId);

      // Log the renewal
      await supabase.from('renewal_logs').insert({
        entity_type: 'hosting',
        entity_id: accountId,
        old_expiry_date: account?.expiry_date,
        new_expiry_date: newExpiry.toISOString().split('T')[0],
      });

      // Send reactivation notification
      if (account?.user_id) {
        await notificationService.sendNotification({
          userId: account.user_id,
          type: 'email',
          recipient: '',
          body: 'Your hosting account has been reactivated. Thank you for your payment.',
        });
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Log renewal automation run
   */
  private async logRenewalRun(results: {
    reminders: number;
    invoicesGenerated: number;
    suspensions: number;
    errors: string[];
  }): Promise<void> {
    console.log('[Renewal Automation]', {
      timestamp: new Date().toISOString(),
      ...results,
    });
  }
}

export const renewalAutomationService = new RenewalAutomationService();
