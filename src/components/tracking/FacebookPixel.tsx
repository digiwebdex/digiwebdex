import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { facebookPixelService } from '@/services/tracking';

/**
 * Facebook Pixel Component
 * Initializes pixel and tracks page views on route changes
 */
export function FacebookPixel() {
  const location = useLocation();

  useEffect(() => {
    // Initialize pixel on mount
    facebookPixelService.initialize();
  }, []);

  useEffect(() => {
    // Track page view on route change (only if consent given)
    if (facebookPixelService.hasConsent()) {
      facebookPixelService.trackPageView();
    }
  }, [location.pathname]);

  return null;
}
