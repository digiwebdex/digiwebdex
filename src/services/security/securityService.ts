/**
 * Security Service
 * Comprehensive security utilities for rate limiting, input validation,
 * XSS/CSRF protection, and secure headers
 */

import { supabase } from '@/integrations/supabase/client';

// Rate limiting configuration
interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix: string;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

// In-memory rate limit store (for client-side, edge functions use Redis/KV)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Client-side rate limiting
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig = { windowMs: 60000, maxRequests: 10, keyPrefix: 'rl' }
): RateLimitResult {
  const fullKey = `${config.keyPrefix}:${key}`;
  const now = Date.now();
  const entry = rateLimitStore.get(fullKey);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(fullKey, { count: 1, resetTime: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1, resetTime: now + config.windowMs };
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }

  entry.count++;
  return { allowed: true, remaining: config.maxRequests - entry.count, resetTime: entry.resetTime };
}

/**
 * Input sanitization - Remove XSS vectors
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    // Remove script tags
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove event handlers
    .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
    // Remove javascript: urls
    .replace(/javascript:/gi, '')
    // Remove data: urls that could contain scripts
    .replace(/data:\s*text\/html/gi, '')
    // Escape HTML entities
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Validate and sanitize HTML content (for rich text)
 */
export function sanitizeHtml(html: string): string {
  if (typeof html !== 'string') return '';
  
  // Whitelist of allowed tags
  const allowedTags = ['p', 'br', 'b', 'i', 'u', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre'];
  const allowedAttributes = ['href', 'title', 'class'];
  
  // Remove all tags except allowed ones
  let sanitized = html;
  
  // Remove script tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove style tags and their content
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Remove event handlers from all tags
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Remove javascript: and data: URLs
  sanitized = sanitized.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"');
  sanitized = sanitized.replace(/href\s*=\s*["']data:[^"']*["']/gi, 'href="#"');
  
  return sanitized;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 255;
}

/**
 * Validate phone number (Bangladesh format)
 */
export function isValidBangladeshPhone(phone: string): boolean {
  // Bangladesh phone: +880 or 0 followed by 10 digits
  const phoneRegex = /^(\+880|0)?1[3-9]\d{8}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Generate CSRF token
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate CSRF token
 */
export function validateCsrfToken(token: string, storedToken: string): boolean {
  if (!token || !storedToken) return false;
  if (token.length !== storedToken.length) return false;
  
  // Constant-time comparison to prevent timing attacks
  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ storedToken.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Get secure headers for responses
 */
export function getSecureHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.gpteng.co",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.lovable.dev",
      "frame-ancestors 'none'",
    ].join('; '),
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  };
}

/**
 * Validate password strength for security
 */
export function validateSecurityPasswordStrength(password: string): {
  valid: boolean;
  score: number;
  issues: string[];
} {
  const issues: string[] = [];
  let score = 0;

  if (password.length >= 12) score += 2;
  else if (password.length >= 8) score += 1;
  else issues.push('Password must be at least 8 characters');

  if (/[A-Z]/.test(password)) score += 1;
  else issues.push('Must contain uppercase letters');

  if (/[a-z]/.test(password)) score += 1;
  else issues.push('Must contain lowercase letters');

  if (/[0-9]/.test(password)) score += 1;
  else issues.push('Must contain numbers');

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  else issues.push('Must contain special characters');

  // Check for common passwords
  const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
  if (commonPasswords.some(p => password.toLowerCase().includes(p))) {
    issues.push('Password is too common');
    score = Math.max(0, score - 2);
  }

  return {
    valid: score >= 4 && issues.length === 0,
    score,
    issues,
  };
}

/**
 * Hash sensitive data for logging (don't log actual values)
 */
export async function hashForLogging(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
}

/**
 * Validate request origin
 */
export function validateOrigin(origin: string | null, allowedOrigins: string[]): boolean {
  if (!origin) return false;
  return allowedOrigins.some(allowed => {
    if (allowed === '*') return true;
    if (allowed.startsWith('*.')) {
      const domain = allowed.slice(2);
      return origin.endsWith(domain) || origin === `https://${domain}`;
    }
    return origin === allowed;
  });
}

// Security constants
export const SECURITY_CONFIG = {
  rateLimits: {
    login: { windowMs: 900000, maxRequests: 5, keyPrefix: 'login' }, // 5 per 15 min
    register: { windowMs: 3600000, maxRequests: 3, keyPrefix: 'register' }, // 3 per hour
    passwordReset: { windowMs: 3600000, maxRequests: 3, keyPrefix: 'pwreset' }, // 3 per hour
    api: { windowMs: 60000, maxRequests: 100, keyPrefix: 'api' }, // 100 per minute
    payment: { windowMs: 60000, maxRequests: 10, keyPrefix: 'payment' }, // 10 per minute
  },
  allowedOrigins: [
    'https://digiwebdex.com',
    'https://www.digiwebdex.com',
    'https://digiwebdex.lovable.app',
    '*.lovable.app',
  ],
  sessionTimeout: 3600000, // 1 hour
  maxLoginAttempts: 5,
  lockoutDuration: 900000, // 15 minutes
};
