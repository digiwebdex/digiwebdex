import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SmoothScrollOptions {
  offset?: number;
  behavior?: ScrollBehavior;
  highlightDuration?: number;
}

const HEADER_HEIGHT = 80; // Sticky header height in pixels
const DEFAULT_OPTIONS: SmoothScrollOptions = {
  offset: HEADER_HEIGHT,
  behavior: 'smooth',
  highlightDuration: 1500,
};

/**
 * Custom hook for handling smooth scroll navigation with header offset compensation.
 * Handles both same-page anchor links and cross-page navigation with hash.
 */
export function useSmoothScroll(options: SmoothScrollOptions = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { offset, behavior, highlightDuration } = { ...DEFAULT_OPTIONS, ...options };

  /**
   * Scrolls to an element by ID with offset compensation for sticky header
   */
  const scrollToElement = useCallback((elementId: string) => {
    // Remove # if present
    const cleanId = elementId.replace(/^#/, '');
    
    const element = document.getElementById(cleanId);
    if (!element) {
      console.warn(`Element with id "${cleanId}" not found`);
      return false;
    }

    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.scrollY - (offset || HEADER_HEIGHT);

    window.scrollTo({
      top: offsetPosition,
      behavior: behavior || 'smooth',
    });

    // Add highlight effect
    element.classList.add('scroll-target-highlight');
    setTimeout(() => {
      element.classList.remove('scroll-target-highlight');
    }, highlightDuration || 1500);

    // Update URL hash without causing scroll jump
    if (window.history.pushState) {
      window.history.pushState(null, '', `#${cleanId}`);
    }

    return true;
  }, [offset, behavior, highlightDuration]);

  /**
   * Handles anchor link clicks - determines if same-page or cross-page navigation
   */
  const handleAnchorClick = useCallback((
    e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
    href: string
  ) => {
    // If it's just a hash (same page anchor)
    if (href.startsWith('#')) {
      e.preventDefault();
      scrollToElement(href);
      return;
    }

    // If it's a full path with hash
    const [path, hash] = href.split('#');
    
    if (hash) {
      // Check if we're on the same page
      const currentPath = location.pathname;
      
      if (path === '' || path === currentPath || path === '.') {
        // Same page, just scroll
        e.preventDefault();
        scrollToElement(hash);
      } else {
        // Different page - navigate first, then scroll
        e.preventDefault();
        navigate(path);
        
        // Wait for navigation to complete, then scroll
        setTimeout(() => {
          scrollToElement(hash);
        }, 100);
      }
    }
  }, [navigate, location.pathname, scrollToElement]);

  /**
   * Navigate to a page and scroll to a section
   */
  const navigateToSection = useCallback((path: string, sectionId: string) => {
    const currentPath = location.pathname;
    
    if (path === currentPath || path === '') {
      // Same page, just scroll
      scrollToElement(sectionId);
    } else {
      // Different page
      navigate(path);
      setTimeout(() => {
        scrollToElement(sectionId);
      }, 100);
    }
  }, [navigate, location.pathname, scrollToElement]);

  return {
    scrollToElement,
    handleAnchorClick,
    navigateToSection,
    HEADER_HEIGHT,
  };
}

/**
 * Utility function for programmatic scrolling (can be used outside React components)
 */
export function scrollToSection(sectionId: string, offset: number = HEADER_HEIGHT) {
  const cleanId = sectionId.replace(/^#/, '');
  const element = document.getElementById(cleanId);
  
  if (!element) {
    console.warn(`Element with id "${cleanId}" not found`);
    return false;
  }

  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.scrollY - offset;

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth',
  });

  // Add highlight effect
  element.classList.add('scroll-target-highlight');
  setTimeout(() => {
    element.classList.remove('scroll-target-highlight');
  }, 1500);

  return true;
}

export default useSmoothScroll;
