/**
 * Facebook Pixel Service
 * Handles client-side tracking with consent management and deduplication
 */

import { supabase } from '@/integrations/supabase/client';
import { systemSettingsService } from '@/services/settings';

// Types for Facebook Pixel events
export type FBStandardEvent = 
  | 'PageView'
  | 'ViewContent'
  | 'Lead'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'Purchase'
  | 'Search'
  | 'Contact'
  | 'CompleteRegistration';

export interface FBEventParams {
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  content_type?: string;
  value?: number;
  currency?: string;
  search_string?: string;
  status?: string;
  [key: string]: unknown;
}

export interface FBUserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  country?: string;
  externalId?: string;
}

// Generate unique event ID for deduplication
export function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

// SHA256 hash for Advanced Matching (client-side version)
async function hashValue(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Normalize phone number (E.164 format)
function normalizePhone(phone: string): string {
  // Remove all non-digits
  let normalized = phone.replace(/[^0-9]/g, '');
  
  // Handle Bangladesh format
  if (normalized.startsWith('0')) {
    normalized = '880' + normalized.substring(1);
  } else if (!normalized.startsWith('880')) {
    normalized = '880' + normalized;
  }
  
  return normalized;
}

// Normalize email
function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

class FacebookPixelService {
  private pixelId: string | null = null;
  private initialized: boolean = false;
  private consentGiven: boolean = false;
  private pendingEvents: Array<{ event: FBStandardEvent; params?: FBEventParams; eventId: string }> = [];
  
  // Cookie name for consent
  private readonly CONSENT_COOKIE = 'fb_tracking_consent';
  private readonly FBP_COOKIE = '_fbp';
  private readonly FBC_COOKIE = '_fbc';

  constructor() {
    // Check for existing consent on initialization
    this.checkExistingConsent();
  }

  private checkExistingConsent(): void {
    const consent = this.getCookie(this.CONSENT_COOKIE);
    if (consent === 'granted') {
      this.consentGiven = true;
    }
  }

  private getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  }

  private setCookie(name: string, value: string, days: number = 365): void {
    if (typeof document === 'undefined') return;
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Get Pixel ID from settings
      const pixelId = await systemSettingsService.getSetting<string>('fb_pixel_id');
      
      if (!pixelId || pixelId === '""' || pixelId === '') {
        console.log('Facebook Pixel ID not configured');
        return;
      }

      this.pixelId = pixelId.replace(/^"|"$/g, ''); // Remove quotes if present

      if (!this.pixelId) {
        console.log('Facebook Pixel ID is empty');
        return;
      }

      // Load Facebook Pixel script
      this.loadPixelScript();
      this.initialized = true;

      // Fire any pending events
      if (this.consentGiven) {
        this.processPendingEvents();
      }

    } catch (error) {
      console.error('Error initializing Facebook Pixel:', error);
    }
  }

  private loadPixelScript(): void {
    if (typeof window === 'undefined' || !this.pixelId) return;

    // Avoid duplicate script loading
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    if (win.fbq) return;

    // Facebook Pixel base code
    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    
    // Initialize fbq before script loads
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const n: any = function(...args: unknown[]) {
      if (n.callMethod) {
        n.callMethod.apply(n, args);
      } else {
        n.queue.push(args);
      }
    };
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    
    win.fbq = n;
    win._fbq = n;

    document.head.appendChild(script);

    // Initialize pixel
    (window as unknown as { fbq: (action: string, id: string) => void }).fbq('init', this.pixelId);
  }

  // Grant consent and process pending events
  grantConsent(): void {
    this.consentGiven = true;
    this.setCookie(this.CONSENT_COOKIE, 'granted');
    
    if (this.initialized) {
      this.processPendingEvents();
    }
  }

  // Deny consent
  denyConsent(): void {
    this.consentGiven = false;
    this.setCookie(this.CONSENT_COOKIE, 'denied');
    this.pendingEvents = [];
  }

  hasConsent(): boolean {
    return this.consentGiven;
  }

  private processPendingEvents(): void {
    for (const { event, params, eventId } of this.pendingEvents) {
      this.fireEvent(event, params, eventId);
    }
    this.pendingEvents = [];
  }

  private fireEvent(event: FBStandardEvent, params?: FBEventParams, eventId?: string): void {
    if (typeof window === 'undefined') return;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    if (!win.fbq) return;

    const eventIdToUse = eventId || generateEventId();

    win.fbq('track', event, params, { eventID: eventIdToUse });
  }

  // Track standard events with consent check
  async track(event: FBStandardEvent, params?: FBEventParams, userData?: FBUserData): Promise<string> {
    const eventId = generateEventId();

    if (!this.consentGiven) {
      // Queue event for later
      this.pendingEvents.push({ event, params, eventId });
      return eventId;
    }

    if (!this.initialized) {
      await this.initialize();
    }

    // Fire client-side event
    this.fireEvent(event, params, eventId);

    // Also send to CAPI for server-side tracking
    this.sendToCapiAsync(event, eventId, params, userData);

    return eventId;
  }

  // Send to server-side CAPI (async, non-blocking)
  private async sendToCapiAsync(
    event: FBStandardEvent, 
    eventId: string, 
    params?: FBEventParams, 
    userData?: FBUserData
  ): Promise<void> {
    try {
      // Check if CAPI is enabled
      const capiEnabled = await systemSettingsService.getSetting<boolean>('fb_capi_enabled');
      if (!capiEnabled) return;

      // Get first-party cookies for better matching
      const fbp = this.getCookie(this.FBP_COOKIE);
      const fbc = this.getCookie(this.FBC_COOKIE);

      await supabase.functions.invoke('fb-capi', {
        body: {
          event_name: event,
          event_id: eventId,
          event_source_url: window.location.href,
          user_data: userData ? {
            email: userData.email,
            phone: userData.phone,
            first_name: userData.firstName,
            last_name: userData.lastName,
            city: userData.city,
            country: userData.country,
            external_id: userData.externalId,
            fbp,
            fbc,
          } : { fbp, fbc },
          custom_data: params,
        },
      });
    } catch (error) {
      console.error('Error sending to CAPI:', error);
    }
  }

  // Convenience methods for standard events
  async trackPageView(): Promise<string> {
    return this.track('PageView');
  }

  async trackViewContent(
    contentName: string, 
    contentId?: string, 
    value?: number, 
    currency: string = 'BDT'
  ): Promise<string> {
    return this.track('ViewContent', {
      content_name: contentName,
      content_ids: contentId ? [contentId] : undefined,
      value,
      currency,
    });
  }

  async trackLead(userData?: FBUserData, contentName?: string): Promise<string> {
    return this.track('Lead', { content_name: contentName }, userData);
  }

  async trackAddToCart(
    contentName: string,
    contentId: string,
    value: number,
    currency: string = 'BDT'
  ): Promise<string> {
    return this.track('AddToCart', {
      content_name: contentName,
      content_ids: [contentId],
      content_type: 'product',
      value,
      currency,
    });
  }

  async trackInitiateCheckout(
    contentIds: string[],
    value: number,
    currency: string = 'BDT'
  ): Promise<string> {
    return this.track('InitiateCheckout', {
      content_ids: contentIds,
      value,
      currency,
    });
  }

  async trackPurchase(
    contentName: string,
    contentId: string,
    value: number,
    currency: string = 'BDT',
    userData?: FBUserData
  ): Promise<string> {
    return this.track('Purchase', {
      content_name: contentName,
      content_ids: [contentId],
      content_type: 'product',
      value,
      currency,
    }, userData);
  }

  async trackSearch(searchString: string): Promise<string> {
    return this.track('Search', { search_string: searchString });
  }

  async trackContact(userData?: FBUserData): Promise<string> {
    return this.track('Contact', {}, userData);
  }

  async trackCompleteRegistration(userData?: FBUserData): Promise<string> {
    return this.track('CompleteRegistration', {}, userData);
  }

  // Get hashed user data for Advanced Matching
  async getHashedUserData(userData: FBUserData): Promise<Record<string, string>> {
    const hashed: Record<string, string> = {};

    if (userData.email) {
      hashed.em = await hashValue(normalizeEmail(userData.email));
    }
    if (userData.phone) {
      hashed.ph = await hashValue(normalizePhone(userData.phone));
    }
    if (userData.firstName) {
      hashed.fn = await hashValue(userData.firstName);
    }
    if (userData.lastName) {
      hashed.ln = await hashValue(userData.lastName);
    }
    if (userData.city) {
      hashed.ct = await hashValue(userData.city);
    }
    if (userData.country) {
      hashed.country = await hashValue(userData.country);
    }
    if (userData.externalId) {
      hashed.external_id = await hashValue(userData.externalId);
    }

    return hashed;
  }
}

export const facebookPixelService = new FacebookPixelService();
