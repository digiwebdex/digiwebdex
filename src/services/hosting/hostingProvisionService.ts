import { supabase } from '@/integrations/supabase/client';
import type { Database, Json } from '@/integrations/supabase/types';
import { whmApiClient, type WHMApiOperation } from './whmApiClient';
import { generateSecurePassword, generateUsername, encryptCredentials } from './encryptionUtils';
import { notificationService } from '../notificationService';
import { orderService } from '../orderService';

type HostingAccount = Database['public']['Tables']['hosting_accounts']['Row'];
type HostingStatus = Database['public']['Enums']['hosting_status'];
type Server = Database['public']['Tables']['servers']['Row'];

export interface ProvisionHostingParams {
  orderId: string;
  userId: string;
  userEmail: string;
  domainName: string;
  packageName: string;
  serverId?: string;
  diskLimitMb?: number;
  bandwidthLimitMb?: number;
  emailLimit?: number;
  databaseLimit?: number;
}

export interface ProvisioningResult {
  success: boolean;
  accountId?: string;
  username?: string;
  cpanelUrl?: string;
  error?: string;
  operation?: WHMApiOperation;
}

class HostingProvisionService {
  /**
   * Main provisioning entry point
   * Creates hosting account record and queues WHM API operation
   */
  async provisionHosting(params: ProvisionHostingParams): Promise<ProvisioningResult> {
    try {
      // 1. Select optimal server
      const server = await this.selectOptimalServer(params.serverId);
      if (!server) {
        return { success: false, error: 'No available servers for provisioning' };
      }

      // 2. Generate credentials
      const username = generateUsername(params.domainName);
      const password = generateSecurePassword(16);
      const encryptedPassword = await encryptCredentials(password);

      // 3. Create hosting account record in pending status
      const { data: account, error: createError } = await supabase
        .from('hosting_accounts')
        .insert({
          user_id: params.userId,
          order_id: params.orderId,
          server_id: server.id,
          username,
          package_name: params.packageName,
          credentials_encrypted: encryptedPassword,
          cpanel_url: `https://${server.hostname}:2083`,
          status: 'pending' as HostingStatus,
          disk_limit_mb: params.diskLimitMb || 1000,
          bandwidth_limit_mb: params.bandwidthLimitMb || 10000,
          email_limit: params.emailLimit || 10,
          database_limit: params.databaseLimit || 5,
          auto_renew: true,
          expiry_date: this.calculateExpiryDate(12), // 12 months default
        })
        .select()
        .single();

      if (createError) throw createError;

      // 4. Queue WHM API operation (mock for now)
      const operation = await whmApiClient.createAccount({
        username,
        domain: params.domainName,
        password,
        email: params.userEmail,
        plan: params.packageName,
        quota: params.diskLimitMb,
        maxEmailAccounts: params.emailLimit,
        maxDatabases: params.databaseLimit,
      });

      // Store operation in account for tracking
      operation.serverId = server.id;
      operation.accountId = account.id;

      // 5. Simulate successful provisioning (in production, this would be done by background worker)
      await this.onProvisioningSuccess(account.id, params.orderId, params.userId, params.userEmail, {
        username,
        password, // Only sent in notification, not stored in plain text
        cpanelUrl: account.cpanel_url || '',
        domain: params.domainName,
      });

      // 6. Increment server account count
      try {
        await supabase
          .from('servers')
          .update({ current_accounts: (server.current_accounts || 0) + 1 })
          .eq('id', server.id);
      } catch (updateError) {
        console.warn('Failed to update server account count:', updateError);
      }

      return {
        success: true,
        accountId: account.id,
        username,
        cpanelUrl: account.cpanel_url || undefined,
        operation,
      };
    } catch (error) {
      console.error('Hosting provisioning error:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Select optimal server for hosting based on capacity
   */
  private async selectOptimalServer(preferredServerId?: string): Promise<Server | null> {
    if (preferredServerId) {
      const { data: server } = await supabase
        .from('servers')
        .select('*')
        .eq('id', preferredServerId)
        .eq('is_active', true)
        .single();

      if (server && (server.current_accounts || 0) < (server.max_accounts || 100)) {
        return server;
      }
    }

    // Find server with most available capacity
    const { data: servers } = await supabase
      .from('servers')
      .select('*')
      .eq('is_active', true)
      .order('current_accounts', { ascending: true });

    if (!servers || servers.length === 0) return null;

    // Return server with most capacity
    return servers.find(s => (s.current_accounts || 0) < (s.max_accounts || 100)) || null;
  }

  /**
   * Handle successful provisioning
   */
  private async onProvisioningSuccess(
    accountId: string,
    orderId: string,
    userId: string,
    userEmail: string,
    credentials: { username: string; password: string; cpanelUrl: string; domain: string }
  ): Promise<void> {
    // Update hosting account to active
    await supabase
      .from('hosting_accounts')
      .update({ status: 'active' as HostingStatus })
      .eq('id', accountId);

    // Update order status to active
    await orderService.updateOrderStatus(orderId, 'active');

    // Send welcome notification with credentials
    await notificationService.triggerEvent('SERVICE_ACTIVATED', userId, userEmail, {
      service_type: 'Hosting',
      domain: credentials.domain,
      username: credentials.username,
      password: credentials.password,
      cpanel_url: credentials.cpanelUrl,
    });
  }

  /**
   * Suspend hosting account
   */
  async suspendAccount(accountId: string, reason: string = 'Non-payment'): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: account, error: fetchError } = await supabase
        .from('hosting_accounts')
        .select('*, server:servers(*)')
        .eq('id', accountId)
        .single();

      if (fetchError || !account) throw new Error('Account not found');

      // Queue suspend operation
      await whmApiClient.suspendAccount(account.username || '', reason);

      // Update account status
      await supabase
        .from('hosting_accounts')
        .update({ 
          status: 'suspended' as HostingStatus,
          suspended_reason: reason,
        })
        .eq('id', accountId);

      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Unsuspend hosting account
   */
  async unsuspendAccount(accountId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: account, error: fetchError } = await supabase
        .from('hosting_accounts')
        .select('*')
        .eq('id', accountId)
        .single();

      if (fetchError || !account) throw new Error('Account not found');

      // Queue unsuspend operation
      await whmApiClient.unsuspendAccount(account.username || '');

      // Update account status
      await supabase
        .from('hosting_accounts')
        .update({ 
          status: 'active' as HostingStatus,
          suspended_reason: null,
        })
        .eq('id', accountId);

      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Terminate hosting account
   */
  async terminateAccount(accountId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: account, error: fetchError } = await supabase
        .from('hosting_accounts')
        .select('*, server:servers(*)')
        .eq('id', accountId)
        .single();

      if (fetchError || !account) throw new Error('Account not found');

      // Queue terminate operation
      await whmApiClient.terminateAccount(account.username || '');

      // Update account status
      await supabase
        .from('hosting_accounts')
        .update({ status: 'terminated' as HostingStatus })
        .eq('id', accountId);

      // Decrement server account count
      if (account.server_id) {
        const server = account.server as any;
        if (server) {
          await supabase
            .from('servers')
            .update({ current_accounts: Math.max(0, (server.current_accounts || 1) - 1) })
            .eq('id', account.server_id);
        }
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Get hosting accounts for user
   */
  async getUserHostingAccounts(userId: string): Promise<HostingAccount[]> {
    const { data, error } = await supabase
      .from('hosting_accounts')
      .select(`
        *,
        server:servers(name, hostname),
        domain:domains(domain_name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get all hosting accounts (admin)
   */
  async getAllHostingAccounts(): Promise<HostingAccount[]> {
    const { data, error } = await supabase
      .from('hosting_accounts')
      .select(`
        *,
        server:servers(name, hostname),
        domain:domains(domain_name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Calculate expiry date based on billing months
   */
  private calculateExpiryDate(months: number): string {
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return date.toISOString().split('T')[0];
  }
}

export const hostingProvisionService = new HostingProvisionService();
