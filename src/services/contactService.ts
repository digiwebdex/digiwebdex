import { supabase } from '@/integrations/supabase/client';
import { facebookPixelService } from '@/services/tracking';
import { systemSettingsService } from '@/services/settings';

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

// Default contact info (fallback values)
const DEFAULT_CONTACT = {
  email: 'digiwebdex@gmail.com',
  phone: '+8801674533303',
  whatsapp: '8801674533303',
  address: {
    en: 'House No. 49 Shekhertek, Mohammadpur, Dhaka, Bangladesh',
    bn: 'বাড়ি নং ৪৯ শেখেরটেক, মোহাম্মদপুর, ঢাকা, বাংলাদেশ',
  },
  workingHours: {
    en: 'Sat - Thu: 10AM - 8PM',
    bn: 'শনি - বৃহঃ: সকাল ১০ - রাত ৮',
  },
};

// Cache for contact info
let cachedContact: typeof DEFAULT_CONTACT | null = null;
let cacheExpiry = 0;

export const contactService = {
  async getContactInfo() {
    const now = Date.now();
    if (cachedContact && now < cacheExpiry) {
      return cachedContact;
    }

    try {
      const [email, phone, address] = await Promise.all([
        systemSettingsService.getSetting<string>('company_email'),
        systemSettingsService.getSetting<string>('company_phone'),
        systemSettingsService.getSetting<string>('company_address'),
      ]);

      cachedContact = {
        email: (email?.replace(/^"|"$/g, '')) || DEFAULT_CONTACT.email,
        phone: (phone?.replace(/^"|"$/g, '')) || DEFAULT_CONTACT.phone,
        whatsapp: (phone?.replace(/^"|"$/g, '').replace(/[^0-9]/g, '')) || DEFAULT_CONTACT.whatsapp,
        address: {
          en: (address?.replace(/^"|"$/g, '')) || DEFAULT_CONTACT.address.en,
          bn: DEFAULT_CONTACT.address.bn,
        },
        workingHours: DEFAULT_CONTACT.workingHours,
      };
      cacheExpiry = now + 5 * 60 * 1000; // Cache for 5 minutes

      return cachedContact;
    } catch {
      return DEFAULT_CONTACT;
    }
  },

  async submitContactForm(data: ContactFormData): Promise<{ success: boolean; error?: string }> {
    try {
      // Save to database
      const { error: dbError } = await supabase
        .from('contact_messages')
        .insert({
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          subject: data.subject,
          message: data.message,
        });

      if (dbError) {
        console.error('Database error:', dbError);
        return { success: false, error: 'Failed to save message' };
      }

      // Send notifications
      try {
        await supabase.functions.invoke('contact-notification', {
          body: {
            type: 'contact_form',
            name: data.name,
            email: data.email,
            phone: data.phone,
            subject: data.subject,
            message: data.message,
          },
        });
      } catch (notifyError) {
        console.error('Notification error:', notifyError);
        // Don't fail the submission if notification fails
      }

      // Track Contact event with Facebook Pixel
      try {
        await facebookPixelService.trackContact({
          email: data.email,
          phone: data.phone,
          firstName: data.name.split(' ')[0],
        });
      } catch (trackError) {
        console.error('Facebook tracking error:', trackError);
      }

      return { success: true };
    } catch (error) {
      console.error('Contact form error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },
};

// Export for backward compatibility
export const DIGIWEBDEX_CONTACT = DEFAULT_CONTACT;
