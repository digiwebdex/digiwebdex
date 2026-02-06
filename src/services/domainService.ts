import { supabase } from '@/integrations/supabase/client';

// Types
export interface DomainPricing {
  id: string;
  tld: string;
  base_price: number;
  renewal_price: number;
  transfer_price: number;
  margin_percent: number;
  currency: string;
  is_active: boolean;
  is_popular: boolean;
  sort_order: number;
}

export interface DomainSearchResult {
  domain: string;
  tld: string;
  isAvailable: boolean;
  price: number;
  renewalPrice: number;
  currency: string;
  isPremium?: boolean;
}

export interface DomainSearchLog {
  domain_name: string;
  tld: string;
  is_available: boolean;
  price_shown: number;
  search_source?: string;
}

// Registrar API structure (inactive for now - ready for future integration)
interface RegistrarConfig {
  name: string;
  apiUrl: string;
  apiKey?: string;
  isActive: boolean;
}

const registrarConfigs: Record<string, RegistrarConfig> = {
  resellerclub: {
    name: 'ResellerClub',
    apiUrl: 'https://httpapi.com/api',
    isActive: false,
  },
  namecheap: {
    name: 'Namecheap',
    apiUrl: 'https://api.namecheap.com/xml.response',
    isActive: false,
  },
  btcl: {
    name: 'BTCL (.bd domains)',
    apiUrl: 'https://btcl.net.bd/api',
    isActive: false,
  },
};

class DomainService {
  private pricingCache: Map<string, DomainPricing> = new Map();
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Parse domain input to extract name and TLD
   */
  parseDomain(input: string): { name: string; tld: string } {
    const cleaned = input.toLowerCase().trim().replace(/^www\./, '');
    
    // Check for multi-part TLDs first (e.g., .com.bd)
    const multiPartTlds = ['.com.bd', '.net.bd', '.org.bd', '.edu.bd', '.gov.bd', '.ac.bd'];
    for (const tld of multiPartTlds) {
      if (cleaned.endsWith(tld)) {
        return {
          name: cleaned.replace(tld, ''),
          tld,
        };
      }
    }

    // Standard TLD extraction
    const parts = cleaned.split('.');
    if (parts.length >= 2) {
      const tld = '.' + parts.pop();
      return {
        name: parts.join('.'),
        tld,
      };
    }

    // No TLD provided, default to .com
    return {
      name: cleaned,
      tld: '.com',
    };
  }

  /**
   * Validate domain name format
   */
  validateDomainName(name: string): { valid: boolean; error?: string } {
    if (!name || name.length < 2) {
      return { valid: false, error: 'Domain name must be at least 2 characters' };
    }
    if (name.length > 63) {
      return { valid: false, error: 'Domain name must be less than 63 characters' };
    }
    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i.test(name)) {
      return { valid: false, error: 'Domain name can only contain letters, numbers, and hyphens' };
    }
    if (name.includes('--')) {
      return { valid: false, error: 'Domain name cannot contain consecutive hyphens' };
    }
    return { valid: true };
  }

  /**
   * Fetch and cache TLD pricing
   */
  async getPricing(): Promise<DomainPricing[]> {
    const now = Date.now();
    
    if (this.pricingCache.size > 0 && now < this.cacheExpiry) {
      return Array.from(this.pricingCache.values());
    }

    const { data, error } = await supabase
      .from('domain_pricing')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) {
      console.error('Error fetching domain pricing:', error);
      throw error;
    }

    // Update cache
    this.pricingCache.clear();
    (data || []).forEach(pricing => {
      this.pricingCache.set(pricing.tld, pricing as DomainPricing);
    });
    this.cacheExpiry = now + this.CACHE_DURATION;

    return data as DomainPricing[];
  }

  /**
   * Get pricing for a specific TLD
   */
  async getTldPricing(tld: string): Promise<DomainPricing | null> {
    await this.getPricing(); // Ensure cache is populated
    return this.pricingCache.get(tld) || null;
  }

  /**
   * Calculate final price with margin
   */
  calculatePrice(basePrice: number, marginPercent: number): number {
    return Math.ceil(basePrice * (1 + marginPercent / 100));
  }

  /**
   * Check domain availability (MOCK for now - ready for API integration)
   */
  async checkAvailability(domainName: string, tld: string): Promise<boolean> {
    // MOCK: Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

    // MOCK: Random availability with some bias
    // Premium/common words are usually taken
    const commonWords = ['shop', 'store', 'tech', 'web', 'app', 'online', 'best', 'top', 'pro'];
    const isCommonWord = commonWords.some(word => domainName.includes(word));
    
    // 70% chance unavailable for common words, 30% for others
    const unavailableChance = isCommonWord ? 0.7 : 0.3;
    return Math.random() > unavailableChance;
  }

  /**
   * Check if domain is premium (MOCK)
   */
  isPremiumDomain(domainName: string): boolean {
    // MOCK: Short domains or dictionary words might be premium
    return domainName.length <= 3;
  }

  /**
   * Search for domain availability with pricing
   */
  async searchDomain(
    input: string,
    userId?: string
  ): Promise<{ primary: DomainSearchResult; alternatives: DomainSearchResult[] }> {
    const { name, tld } = this.parseDomain(input);
    
    const validation = this.validateDomainName(name);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Get all pricing
    const allPricing = await this.getPricing();
    
    // Get primary TLD pricing
    const primaryPricing = this.pricingCache.get(tld);
    if (!primaryPricing) {
      throw new Error(`TLD ${tld} is not available`);
    }

    // Check primary domain
    const isAvailable = await this.checkAvailability(name, tld);
    const isPremium = this.isPremiumDomain(name);
    const basePrice = isPremium ? primaryPricing.base_price * 5 : primaryPricing.base_price;

    const primary: DomainSearchResult = {
      domain: `${name}${tld}`,
      tld,
      isAvailable,
      price: this.calculatePrice(basePrice, primaryPricing.margin_percent),
      renewalPrice: this.calculatePrice(primaryPricing.renewal_price, primaryPricing.margin_percent),
      currency: primaryPricing.currency,
      isPremium,
    };

    // Get alternatives (popular TLDs excluding the searched one)
    const alternativeTlds = allPricing
      .filter(p => p.tld !== tld && (p.is_popular || Math.random() > 0.5))
      .slice(0, 5);

    const alternatives: DomainSearchResult[] = await Promise.all(
      alternativeTlds.map(async pricing => {
        const available = await this.checkAvailability(name, pricing.tld);
        const altIsPremium = this.isPremiumDomain(name);
        const altBasePrice = altIsPremium ? pricing.base_price * 5 : pricing.base_price;

        return {
          domain: `${name}${pricing.tld}`,
          tld: pricing.tld,
          isAvailable: available,
          price: this.calculatePrice(altBasePrice, pricing.margin_percent),
          renewalPrice: this.calculatePrice(pricing.renewal_price, pricing.margin_percent),
          currency: pricing.currency,
          isPremium: altIsPremium,
        };
      })
    );

    // Log search
    await this.logSearch({
      domain_name: name,
      tld,
      is_available: isAvailable,
      price_shown: primary.price,
      search_source: 'web',
    }, userId);

    return { primary, alternatives };
  }

  /**
   * Log domain search for analytics
   */
  async logSearch(log: DomainSearchLog, userId?: string): Promise<void> {
    try {
      await supabase.from('domain_search_logs').insert({
        ...log,
        user_id: userId || null,
      });
    } catch (error) {
      console.error('Error logging domain search:', error);
      // Don't throw - logging should not break the search
    }
  }

  /**
   * Get popular TLDs for display
   */
  async getPopularTlds(): Promise<DomainPricing[]> {
    const pricing = await this.getPricing();
    return pricing.filter(p => p.is_popular);
  }

  /**
   * Get all available TLDs
   */
  async getAllTlds(): Promise<DomainPricing[]> {
    return this.getPricing();
  }

  /**
   * Prepare domain order data
   */
  prepareDomainOrder(result: DomainSearchResult, years: number = 1): {
    serviceType: 'domain';
    billingType: 'recurring';
    subtotal: number;
    total: number;
    meta: Record<string, unknown>;
  } {
    const subtotal = result.price + (result.renewalPrice * (years - 1));
    
    return {
      serviceType: 'domain',
      billingType: 'recurring',
      subtotal,
      total: subtotal,
      meta: {
        domain_name: result.domain,
        tld: result.tld,
        registration_years: years,
        is_premium: result.isPremium,
        first_year_price: result.price,
        renewal_price: result.renewalPrice,
      },
    };
  }

  // ============================================
  // REGISTRAR API INTEGRATION (FUTURE)
  // ============================================

  /**
   * Check if registrar API is active
   */
  isRegistrarActive(registrar: keyof typeof registrarConfigs): boolean {
    return registrarConfigs[registrar]?.isActive || false;
  }

  /**
   * Get registrar config (for admin)
   */
  getRegistrarConfig(registrar: keyof typeof registrarConfigs): RegistrarConfig | null {
    return registrarConfigs[registrar] || null;
  }

  /**
   * FUTURE: Real availability check via registrar API
   */
  async checkAvailabilityViaApi(
    domainName: string,
    tld: string,
    registrar: string
  ): Promise<{ available: boolean; premium?: boolean; premiumPrice?: number }> {
    const config = registrarConfigs[registrar as keyof typeof registrarConfigs];
    
    if (!config || !config.isActive) {
      throw new Error(`Registrar ${registrar} is not configured or active`);
    }

    // TODO: Implement actual API calls when registrar is configured
    // This would call the edge function to make secure API requests
    throw new Error('Registrar API integration not yet implemented');
  }

  /**
   * FUTURE: Register domain via registrar API
   */
  async registerDomain(
    domainName: string,
    tld: string,
    years: number,
    registrantInfo: Record<string, unknown>
  ): Promise<{ success: boolean; orderId?: string; error?: string }> {
    // TODO: Implement domain registration via edge function
    throw new Error('Domain registration API not yet implemented');
  }
}

export const domainService = new DomainService();
