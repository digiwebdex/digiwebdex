import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import { cn } from '@/lib/utils';

interface AnchorLinkProps extends Omit<LinkProps, 'onClick'> {
  to: string;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * A Link component that handles anchor navigation with smooth scrolling
 * and proper offset compensation for sticky headers.
 * 
 * Usage:
 * - <AnchorLink to="#pricing">Go to Pricing</AnchorLink>
 * - <AnchorLink to="/services/web-development#portfolio">View Portfolio</AnchorLink>
 */
export function AnchorLink({ 
  to, 
  children, 
  className, 
  onClick,
  ...props 
}: AnchorLinkProps) {
  const { handleAnchorClick } = useSmoothScroll();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Check if the link contains a hash
    if (to.includes('#')) {
      handleAnchorClick(e, to);
    }
    
    // Call custom onClick if provided
    onClick?.(e);
  };

  // If it's a pure anchor link (starts with #), use anchor tag
  if (to.startsWith('#')) {
    return (
      <a 
        href={to} 
        className={cn(className)}
        onClick={handleClick}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </a>
    );
  }

  // Otherwise use React Router Link
  return (
    <Link 
      to={to} 
      className={cn(className)}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
}

export default AnchorLink;

