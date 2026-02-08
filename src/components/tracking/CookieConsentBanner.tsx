import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Cookie, X, Check } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { facebookPixelService } from '@/services/tracking';
import { systemSettingsService } from '@/services/settings';
import { cn } from '@/lib/utils';

interface CookieConsentBannerProps {
  className?: string;
}

export function CookieConsentBanner({ className }: CookieConsentBannerProps) {
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [consentText, setConsentText] = useState({
    en: 'We use cookies to improve your experience and for analytics. By continuing, you consent to our use of cookies.',
    bn: 'আমরা আপনার অভিজ্ঞতা উন্নত করতে এবং বিশ্লেষণের জন্য কুকি ব্যবহার করি। চালিয়ে যাওয়ার মাধ্যমে, আপনি আমাদের কুকি ব্যবহারে সম্মতি দিচ্ছেন।',
  });

  useEffect(() => {
    checkConsent();
    loadConsentText();
  }, []);

  const checkConsent = async () => {
    // Check if consent was already given
    const existingConsent = document.cookie
      .split('; ')
      .find(row => row.startsWith('fb_tracking_consent='));

    if (!existingConsent) {
      // Check if cookie consent is enabled in settings
      const enabled = await systemSettingsService.getSetting<boolean>('cookie_consent_enabled');
      if (enabled !== false) {
        setIsVisible(true);
      }
    }
  };

  const loadConsentText = async () => {
    try {
      const textEn = await systemSettingsService.getSetting<string>('cookie_consent_text_en');
      const textBn = await systemSettingsService.getSetting<string>('cookie_consent_text_bn');
      
      if (textEn || textBn) {
        setConsentText({
          en: (textEn?.replace(/^"|"$/g, '') || consentText.en),
          bn: (textBn?.replace(/^"|"$/g, '') || consentText.bn),
        });
      }
    } catch (error) {
      console.error('Error loading consent text:', error);
    }
  };

  const handleAccept = () => {
    facebookPixelService.grantConsent();
    setIsVisible(false);
  };

  const handleDecline = () => {
    facebookPixelService.denyConsent();
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className={cn(
      'fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up',
      className
    )}>
      <Card className="max-w-4xl mx-auto bg-card/95 backdrop-blur-sm border-primary/20 shadow-lg">
        <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Cookie className="h-6 w-6 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              {language === 'bn' ? consentText.bn : consentText.en}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDecline}
              className="gap-1.5"
            >
              <X className="h-4 w-4" />
              {language === 'bn' ? 'প্রত্যাখ্যান' : 'Decline'}
            </Button>
            <Button
              size="sm"
              onClick={handleAccept}
              className="gap-1.5 gradient-button"
            >
              <Check className="h-4 w-4" />
              {language === 'bn' ? 'সম্মতি দিন' : 'Accept'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
