import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export interface SystemSetting {
  id: string;
  key: string;
  value: Json;
  category: string;
  description: string | null;
  is_sensitive: boolean;
  updated_at: string;
}

export interface HomepageSection {
  id: string;
  section_key: string;
  title_en: string | null;
  title_bn: string | null;
  subtitle_en: string | null;
  subtitle_bn: string | null;
  content_en: string | null;
  content_bn: string | null;
  image_url: string | null;
  cta_text_en: string | null;
  cta_text_bn: string | null;
  cta_link: string | null;
  metadata: Json;
  sort_order: number;
  is_active: boolean;
}

export interface ProposalTemplate {
  id: string;
  name: string;
  is_default: boolean;
  header_text_en: string | null;
  header_text_bn: string | null;
  footer_text_en: string | null;
  footer_text_bn: string | null;
  terms_conditions_en: string | null;
  terms_conditions_bn: string | null;
  payment_instructions_en: string | null;
  payment_instructions_bn: string | null;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  show_company_details: boolean;
  show_bank_details: boolean;
  show_mobile_payment: boolean;
  custom_css: string | null;
}

export type CustomFieldType = 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'checkbox' | 'textarea' | 'email' | 'phone' | 'url';

export interface CustomField {
  id: string;
  entity_type: 'lead' | 'project' | 'order' | 'client';
  field_key: string;
  field_label_en: string;
  field_label_bn: string | null;
  field_type: CustomFieldType;
  options: Json;
  default_value: string | null;
  is_required: boolean;
  is_active: boolean;
  sort_order: number;
  validation_rules: Json;
}

class SystemSettingsService {
  private settingsCache: Map<string, unknown> = new Map();
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // =========================================================
  // System Settings CRUD
  // =========================================================

  async getAllSettings(): Promise<SystemSetting[]> {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .order('category', { ascending: true });

    if (error) throw error;
    return (data || []) as unknown as SystemSetting[];
  }

  async getSettingsByCategory(category: string): Promise<SystemSetting[]> {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .eq('category', category)
      .order('key', { ascending: true });

    if (error) throw error;
    return (data || []) as unknown as SystemSetting[];
  }

  async getSetting<T = unknown>(key: string): Promise<T | null> {
    // Check cache first
    if (this.settingsCache.has(key) && Date.now() < this.cacheExpiry) {
      return this.settingsCache.get(key) as T;
    }

    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', key)
      .single();

    if (error) {
      console.error(`Error fetching setting ${key}:`, error);
      return null;
    }

    const value = data?.value as T;
    this.settingsCache.set(key, value);
    this.cacheExpiry = Date.now() + this.CACHE_DURATION;
    
    return value;
  }

  async updateSetting(key: string, value: unknown): Promise<void> {
    const { error } = await supabase
      .from('system_settings')
      .update({ value: JSON.stringify(value) })
      .eq('key', key);

    if (error) throw error;
    
    // Update cache
    this.settingsCache.set(key, value);
  }

  async updateMultipleSettings(settings: Record<string, unknown>): Promise<void> {
    const updates = Object.entries(settings).map(([key, value]) => ({
      key,
      value: JSON.stringify(value),
    }));

    for (const update of updates) {
      const { error } = await supabase
        .from('system_settings')
        .update({ value: update.value })
        .eq('key', update.key);

      if (error) throw error;
      this.settingsCache.set(update.key, JSON.parse(update.value));
    }
  }

  clearCache(): void {
    this.settingsCache.clear();
    this.cacheExpiry = 0;
  }

  // =========================================================
  // Homepage Sections CRUD
  // =========================================================

  async getHomepageSections(): Promise<HomepageSection[]> {
    const { data, error } = await supabase
      .from('homepage_sections')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return (data || []) as unknown as HomepageSection[];
  }

  async getActiveHomepageSections(): Promise<HomepageSection[]> {
    const { data, error } = await supabase
      .from('homepage_sections')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return (data || []) as unknown as HomepageSection[];
  }

  async updateHomepageSection(id: string, updates: Partial<HomepageSection>): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await supabase
      .from('homepage_sections')
      .update(updates as any)
      .eq('id', id);

    if (error) throw error;
  }

  async createHomepageSection(section: Partial<HomepageSection>): Promise<HomepageSection> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await supabase
      .from('homepage_sections')
      .insert([section as any])
      .select()
      .single();

    if (error) throw error;
    return data as unknown as HomepageSection;
  }

  async deleteHomepageSection(id: string): Promise<void> {
    const { error } = await supabase
      .from('homepage_sections')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // =========================================================
  // Proposal Templates CRUD
  // =========================================================

  async getProposalTemplates(): Promise<ProposalTemplate[]> {
    const { data, error } = await supabase
      .from('proposal_templates')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return (data || []) as unknown as ProposalTemplate[];
  }

  async getDefaultProposalTemplate(): Promise<ProposalTemplate | null> {
    const { data, error } = await supabase
      .from('proposal_templates')
      .select('*')
      .eq('is_default', true)
      .single();

    if (error) return null;
    return data as unknown as ProposalTemplate;
  }

  async updateProposalTemplate(id: string, updates: Partial<ProposalTemplate>): Promise<void> {
    // If setting as default, unset other defaults first
    if (updates.is_default) {
      await supabase
        .from('proposal_templates')
        .update({ is_default: false })
        .neq('id', id);
    }

    const { error } = await supabase
      .from('proposal_templates')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  }

  async createProposalTemplate(template: Omit<ProposalTemplate, 'id'>): Promise<ProposalTemplate> {
    const { data, error } = await supabase
      .from('proposal_templates')
      .insert([template])
      .select()
      .single();

    if (error) throw error;
    return data as unknown as ProposalTemplate;
  }

  async deleteProposalTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('proposal_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // =========================================================
  // Custom Fields CRUD
  // =========================================================

  async getCustomFields(entityType?: string): Promise<CustomField[]> {
    let query = supabase
      .from('custom_fields')
      .select('*')
      .order('sort_order', { ascending: true });

    if (entityType) {
      query = query.eq('entity_type', entityType);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []) as unknown as CustomField[];
  }

  async getActiveCustomFields(entityType: string): Promise<CustomField[]> {
    const { data, error } = await supabase
      .from('custom_fields')
      .select('*')
      .eq('entity_type', entityType)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return (data || []) as unknown as CustomField[];
  }

  async createCustomField(field: Partial<CustomField> & { entity_type: string; field_key: string; field_label_en: string }): Promise<CustomField> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await supabase
      .from('custom_fields')
      .insert([field as any])
      .select()
      .single();

    if (error) throw error;
    return data as unknown as CustomField;
  }

  async updateCustomField(id: string, updates: Partial<CustomField>): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await supabase
      .from('custom_fields')
      .update(updates as any)
      .eq('id', id);

    if (error) throw error;
  }

  async deleteCustomField(id: string): Promise<void> {
    const { error } = await supabase
      .from('custom_fields')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // =========================================================
  // Custom Field Values CRUD
  // =========================================================

  async getCustomFieldValues(entityType: string, entityId: string): Promise<Record<string, unknown>> {
    const { data, error } = await supabase
      .from('custom_field_values')
      .select('field_id, value, custom_fields(field_key)')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId);

    if (error) throw error;

    const values: Record<string, unknown> = {};
    for (const item of data || []) {
      const fieldData = item as unknown as { field_id: string; value: unknown; custom_fields: { field_key: string } };
      if (fieldData.custom_fields?.field_key) {
        values[fieldData.custom_fields.field_key] = fieldData.value;
      }
    }
    return values;
  }

  async saveCustomFieldValues(entityType: string, entityId: string, values: Record<string, unknown>): Promise<void> {
    const fields = await this.getActiveCustomFields(entityType);
    const fieldMap = new Map(fields.map(f => [f.field_key, f.id]));

    for (const [key, value] of Object.entries(values)) {
      const fieldId = fieldMap.get(key);
      if (!fieldId) continue;

      const { error } = await supabase
        .from('custom_field_values')
        .upsert({
          field_id: fieldId,
          entity_id: entityId,
          entity_type: entityType,
          value: JSON.stringify(value),
        }, {
          onConflict: 'field_id,entity_id',
        });

      if (error) throw error;
    }
  }

  // =========================================================
  // Automation Logs
  // =========================================================

  async getAutomationLogs(limit = 100): Promise<unknown[]> {
    const { data, error } = await supabase
      .from('automation_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async logAutomation(
    automationType: string,
    entityType: string | null,
    entityId: string | null,
    status: 'success' | 'failed',
    details: Json = {},
    errorMessage?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('automation_logs')
      .insert([{
        automation_type: automationType,
        entity_type: entityType,
        entity_id: entityId,
        status,
        details,
        error_message: errorMessage,
      }]);

    if (error) console.error('Failed to log automation:', error);
  }

  // =========================================================
  // Helper methods for specific settings
  // =========================================================

  async getPaymentSettings(): Promise<{
    bkash: string;
    nagad: string;
    rocket: string;
    bankName: string;
    bankAccountName: string;
    bankAccountNumber: string;
    bankBranch: string;
    bankRouting: string;
  }> {
    const settings = await this.getSettingsByCategory('payment');
    const map = new Map(settings.map(s => [s.key, s.value]));

    return {
      bkash: (map.get('bkash_number') as string) || '',
      nagad: (map.get('nagad_number') as string) || '',
      rocket: (map.get('rocket_number') as string) || '',
      bankName: (map.get('bank_name') as string) || '',
      bankAccountName: (map.get('bank_account_name') as string) || '',
      bankAccountNumber: (map.get('bank_account_number') as string) || '',
      bankBranch: (map.get('bank_branch') as string) || '',
      bankRouting: (map.get('bank_routing_number') as string) || '',
    };
  }

  async getAutomationSettings(): Promise<{
    autoReminderEnabled: boolean;
    subscriptionAutoRenew: boolean;
    autoSuspendEnabled: boolean;
    autoSuspendDays: number;
    proposalReminderEnabled: boolean;
    proposalReminderDays: number;
    milestoneReminderDays: number;
  }> {
    const settings = await this.getSettingsByCategory('automation');
    const map = new Map(settings.map(s => [s.key, s.value]));

    return {
      autoReminderEnabled: map.get('auto_reminder_enabled') === true,
      subscriptionAutoRenew: map.get('subscription_auto_renew') === true,
      autoSuspendEnabled: map.get('auto_suspend_enabled') === true,
      autoSuspendDays: Number(map.get('auto_suspend_days')) || 14,
      proposalReminderEnabled: map.get('proposal_reminder_enabled') === true,
      proposalReminderDays: Number(map.get('proposal_reminder_days')) || 3,
      milestoneReminderDays: Number(map.get('milestone_reminder_days')) || 2,
    };
  }

  async getBusinessSettings(): Promise<{
    defaultCurrency: string;
    gracePeriodDays: number;
    reminderIntervalDays: number;
    defaultCommissionRate: number;
    defaultResellerMargin: number;
    milestonePercentages: { initial: number; mid: number; final: number };
  }> {
    const settings = await this.getSettingsByCategory('business');
    const map = new Map(settings.map(s => [s.key, s.value]));

    return {
      defaultCurrency: (map.get('default_currency') as string) || 'BDT',
      gracePeriodDays: Number(map.get('grace_period_days')) || 7,
      reminderIntervalDays: Number(map.get('reminder_interval_days')) || 3,
      defaultCommissionRate: Number(map.get('default_commission_rate')) || 10,
      defaultResellerMargin: Number(map.get('default_reseller_margin')) || 15,
      milestonePercentages: (map.get('default_milestone_percentages') as { initial: number; mid: number; final: number }) || { initial: 30, mid: 40, final: 30 },
    };
  }
}

export const systemSettingsService = new SystemSettingsService();
