/**
 * Payment Security Service
 * Webhook validation, idempotency, and fraud detection
 */

import { supabase } from '@/integrations/supabase/client';
import { logAuditEvent, logSuspiciousActivity } from './auditService';

// Idempotency key storage (in production, use Redis)
const idempotencyStore = new Map<string, { result: unknown; timestamp: number }>();

// Fraud detection thresholds
const FRAUD_THRESHOLDS = {
  maxPaymentsPerHour: 10,
  maxFailedPaymentsPerHour: 5,
  maxAmountPerDay: 500000, // BDT
  suspiciousAmountThreshold: 100000, // BDT
  duplicatePaymentWindowMs: 300000, // 5 minutes
};

/**
 * Generate HMAC signature for webhook validation
 */
export async function generateWebhookSignature(
  payload: string,
  secret: string
): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(payload);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Validate webhook signature
 */
export async function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const expectedSignature = await generateWebhookSignature(payload, secret);
  
  // Constant-time comparison
  if (signature.length !== expectedSignature.length) return false;
  
  let result = 0;
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * Generate idempotency key
 */
export function generateIdempotencyKey(
  userId: string,
  amount: number,
  orderId: string
): string {
  return `${userId}-${orderId}-${amount}-${Date.now()}`;
}

/**
 * Check idempotency (prevent duplicate transactions)
 */
export function checkIdempotency(key: string): {
  isDuplicate: boolean;
  previousResult?: unknown;
} {
  const entry = idempotencyStore.get(key);
  
  if (entry) {
    // Check if within the idempotency window (24 hours)
    if (Date.now() - entry.timestamp < 86400000) {
      return { isDuplicate: true, previousResult: entry.result };
    }
    // Expired, remove it
    idempotencyStore.delete(key);
  }
  
  return { isDuplicate: false };
}

/**
 * Store idempotency result
 */
export function storeIdempotencyResult(key: string, result: unknown): void {
  idempotencyStore.set(key, { result, timestamp: Date.now() });
  
  // Cleanup old entries periodically
  if (idempotencyStore.size > 10000) {
    const now = Date.now();
    for (const [k, v] of idempotencyStore.entries()) {
      if (now - v.timestamp > 86400000) {
        idempotencyStore.delete(k);
      }
    }
  }
}

/**
 * Check for potential fraud
 */
export async function checkFraudIndicators(
  userId: string,
  amount: number,
  paymentMethod: string
): Promise<{
  isSuspicious: boolean;
  reasons: string[];
  riskScore: number;
}> {
  const reasons: string[] = [];
  let riskScore = 0;

  const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
  const oneDayAgo = new Date(Date.now() - 86400000).toISOString();

  // Check payment frequency
  const { count: recentPayments } = await supabase
    .from('payments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', oneHourAgo);

  if ((recentPayments || 0) >= FRAUD_THRESHOLDS.maxPaymentsPerHour) {
    reasons.push('High payment frequency');
    riskScore += 30;
  }

  // Check failed payment count
  const { count: failedPayments } = await supabase
    .from('payments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'failed')
    .gte('created_at', oneHourAgo);

  if ((failedPayments || 0) >= FRAUD_THRESHOLDS.maxFailedPaymentsPerHour) {
    reasons.push('Multiple failed payments');
    riskScore += 40;
  }

  // Check daily amount limit
  const { data: dailyPayments } = await supabase
    .from('payments')
    .select('amount')
    .eq('user_id', userId)
    .eq('status', 'success')
    .gte('created_at', oneDayAgo);

  const dailyTotal = (dailyPayments || []).reduce((sum, p) => sum + Number(p.amount), 0) + amount;
  if (dailyTotal > FRAUD_THRESHOLDS.maxAmountPerDay) {
    reasons.push('Daily limit exceeded');
    riskScore += 25;
  }

  // Check for suspicious amount
  if (amount > FRAUD_THRESHOLDS.suspiciousAmountThreshold) {
    reasons.push('Large transaction amount');
    riskScore += 15;
  }

  // Check for duplicate payment (same amount within window)
  const { data: recentSameAmount } = await supabase
    .from('payments')
    .select('id')
    .eq('user_id', userId)
    .eq('amount', amount)
    .gte('created_at', new Date(Date.now() - FRAUD_THRESHOLDS.duplicatePaymentWindowMs).toISOString());

  if ((recentSameAmount || []).length > 0) {
    reasons.push('Potential duplicate payment');
    riskScore += 20;
  }

  const isSuspicious = riskScore >= 50;

  // Log suspicious activity
  if (isSuspicious) {
    await logSuspiciousActivity('payment_fraud_check', {
      userId,
      amount,
      paymentMethod,
      reasons,
      riskScore,
    });
  }

  return { isSuspicious, reasons, riskScore };
}

/**
 * Log payment event for fraud analysis
 */
export async function logPaymentEvent(
  eventType: 'initiated' | 'processing' | 'completed' | 'failed' | 'refunded',
  paymentId: string,
  details: Record<string, unknown>
): Promise<void> {
  await logAuditEvent({
    action: 'payment_submit',
    entityType: 'payment',
    entityId: paymentId,
    newValues: {
      eventType,
      ...details,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Validate payment request
 */
export function validatePaymentRequest(request: {
  amount: number;
  method: string;
  transactionId?: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate amount
  if (!request.amount || request.amount <= 0) {
    errors.push('Invalid payment amount');
  }
  if (request.amount > 1000000) {
    errors.push('Amount exceeds maximum limit');
  }

  // Validate method
  const validMethods = ['bkash', 'nagad', 'bank_transfer', 'sslcommerz'];
  if (!validMethods.includes(request.method)) {
    errors.push('Invalid payment method');
  }

  // Validate transaction ID if provided
  if (request.transactionId) {
    if (request.transactionId.length < 8 || request.transactionId.length > 50) {
      errors.push('Invalid transaction ID length');
    }
    if (!/^[a-zA-Z0-9-_]+$/.test(request.transactionId)) {
      errors.push('Transaction ID contains invalid characters');
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Mask sensitive payment data for logging
 */
export function maskPaymentData(data: Record<string, unknown>): Record<string, unknown> {
  const masked = { ...data };
  
  const sensitiveFields = ['card_number', 'cvv', 'pin', 'password', 'otp', 'account_number'];
  
  for (const field of sensitiveFields) {
    if (masked[field]) {
      const value = String(masked[field]);
      masked[field] = value.slice(0, 2) + '*'.repeat(value.length - 4) + value.slice(-2);
    }
  }
  
  return masked;
}
