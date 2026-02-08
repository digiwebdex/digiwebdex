import { supabase } from '@/integrations/supabase/client';
import { facebookPixelService } from '@/services/tracking';

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export const contactService = {
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

// DigiWebDex contact info constants
export const DIGIWEBDEX_CONTACT = {
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
