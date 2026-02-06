/**
 * Encryption utilities for hosting credentials
 * Uses Web Crypto API for secure encryption/decryption
 * In production, encryption key should be stored in environment secrets
 */

// Base64 encoding/decoding utilities
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach(byte => binary += String.fromCharCode(byte));
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Generate a secure random password
 */
export function generateSecurePassword(length: number = 16): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);
  
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset[randomValues[i] % charset.length];
  }
  return password;
}

/**
 * Generate a cPanel-compatible username from domain
 * Max 8 characters, alphanumeric only
 */
export function generateUsername(domain: string): string {
  // Remove TLD and special characters
  const base = domain.split('.')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  
  // Take first 5 chars and add random suffix
  const prefix = base.substring(0, 5);
  const randomSuffix = Math.random().toString(36).substring(2, 5);
  
  return (prefix + randomSuffix).substring(0, 8);
}

/**
 * Simple obfuscation for password storage
 * NOTE: In production, use proper AES encryption with secure key management
 * This is a placeholder structure for the encryption flow
 */
export async function encryptCredentials(plaintext: string): Promise<string> {
  // In production, this would use AES-256-GCM with a proper key from secrets
  // For now, we use base64 encoding as a placeholder
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  
  // Add timestamp for uniqueness
  const timestamp = Date.now().toString();
  const combined = `${timestamp}:${plaintext}`;
  
  return btoa(combined);
}

/**
 * Decrypt credentials
 * Placeholder for proper decryption logic
 */
export async function decryptCredentials(encrypted: string): Promise<string> {
  try {
    const decoded = atob(encrypted);
    const parts = decoded.split(':');
    
    // Return everything after the timestamp
    return parts.slice(1).join(':');
  } catch {
    throw new Error('Failed to decrypt credentials');
  }
}

/**
 * Hash password for comparison (not for storage)
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return arrayBufferToBase64(hashBuffer);
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  score: number;
  issues: string[];
} {
  const issues: string[] = [];
  let score = 0;

  if (password.length >= 12) score += 2;
  else if (password.length >= 8) score += 1;
  else issues.push('Password should be at least 8 characters');

  if (/[A-Z]/.test(password)) score += 1;
  else issues.push('Should contain uppercase letters');

  if (/[a-z]/.test(password)) score += 1;
  else issues.push('Should contain lowercase letters');

  if (/[0-9]/.test(password)) score += 1;
  else issues.push('Should contain numbers');

  if (/[!@#$%^&*]/.test(password)) score += 1;
  else issues.push('Should contain special characters');

  return {
    valid: score >= 4 && issues.length === 0,
    score,
    issues,
  };
}
