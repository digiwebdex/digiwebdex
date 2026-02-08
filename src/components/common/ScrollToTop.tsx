import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component resets scroll position to top when navigating between pages.
 * This ensures users always start at the top of a new page.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Only scroll to top on pathname change (not hash changes)
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default ScrollToTop;
