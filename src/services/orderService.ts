import { supabase } from '@/integrations/supabase/client';
import type { Database, Json } from '@/integrations/supabase/types';
import { notificationService } from './notificationService';
import { facebookPixelService } from './tracking';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderInsert = Database['public']['Tables']['orders']['Insert'];
type OrderStatus = Database['public']['Enums']['order_status'];
type ServiceType = Database['public']['Enums']['service_type'];
type BillingType = Database['public']['Enums']['billing_type'];

export interface CreateOrderParams {
  serviceId: string;
  packageId: string;
  serviceType: ServiceType;
  billingType: BillingType;
  subtotal: number;
  discount?: number;
  tax?: number;
  total: number;
  couponCode?: string;
  notes?: string;
  meta?: Record<string, unknown>;
}

export interface OrderWithDetails extends Order {
  service?: {
    name_en: string;
    name_bn: string;
  };
  package?: {
    name_en: string;
    name_bn: string;
  };
}

class OrderService {
  async createOrder(params: CreateOrderParams, userId: string, userEmail?: string): Promise<{ data: Order | null; error: Error | null }> {
    try {
      // Generate order number
      const { data: orderNumber } = await supabase.rpc('generate_order_number');

      const orderData: OrderInsert = {
        order_number: orderNumber || `ORD-${Date.now()}`,
        user_id: userId,
        service_id: params.serviceId,
        package_id: params.packageId,
        service_type: params.serviceType,
        billing_type: params.billingType,
        subtotal: params.subtotal,
        discount: params.discount || 0,
        tax: params.tax || 0,
        total: params.total,
        coupon_code: params.couponCode,
        notes: params.notes,
        status: 'pending',
      };

      const { data: order, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (error) throw error;

      // Insert order meta if provided
      if (params.meta && Object.keys(params.meta).length > 0) {
        const metaEntries = Object.entries(params.meta).map(([key, value]) => ({
          order_id: order.id,
          meta_key: key,
          meta_value: value as Json,
        }));

        await supabase.from('order_meta').insert(metaEntries);
      }

      // Create invoice for the order
      await this.createInvoiceForOrder(order);

      // Track InitiateCheckout event
      try {
        await facebookPixelService.trackInitiateCheckout(
          [order.id],
          order.total,
          'BDT'
        );
      } catch (trackError) {
        console.error('Facebook tracking error:', trackError);
      }

      // Trigger notification for order created
      if (userEmail) {
        await notificationService.triggerEvent('ORDER_CREATED', userId, userEmail, {
          order_number: order.order_number,
          total: order.total,
          customer_name: userEmail,
        });
      }

      return { data: order, error: null };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  }

  async createInvoiceForOrder(order: Order): Promise<void> {
    const { data: invoiceNumber } = await supabase.rpc('generate_invoice_number');

    await supabase.from('invoices').insert({
      invoice_number: invoiceNumber || `INV-${Date.now()}`,
      order_id: order.id,
      user_id: order.user_id,
      subtotal: order.subtotal,
      discount: order.discount,
      tax: order.tax,
      total: order.total,
      status: 'unpaid',
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
  }

  async getOrders(userId: string, isAdmin: boolean = false): Promise<OrderWithDetails[]> {
    let query = supabase
      .from('orders')
      .select(`
        *,
        service:services(name_en, name_bn),
        package:service_packages(name_en, name_bn)
      `)
      .order('created_at', { ascending: false });

    if (!isAdmin) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as OrderWithDetails[];
  }

  async getOrderById(orderId: string): Promise<OrderWithDetails | null> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        service:services(name_en, name_bn),
        package:service_packages(name_en, name_bn)
      `)
      .eq('id', orderId)
      .single();

    if (error) throw error;
    return data as OrderWithDetails;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<{ error: Error | null }> {
    try {
      const updateData: Partial<Order> = { status };

      if (status === 'paid') {
        updateData.paid_at = new Date().toISOString();
      } else if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;

      // Update invoice status if order is paid
      if (status === 'paid') {
        await supabase
          .from('invoices')
          .update({ status: 'paid', paid_at: new Date().toISOString() })
          .eq('order_id', orderId);

        // Track Purchase event
        try {
          const order = await this.getOrderById(orderId);
          if (order) {
            await facebookPixelService.trackPurchase(
              order.service?.name_en || 'Service',
              orderId,
              order.total,
              'BDT'
            );
          }
        } catch (trackError) {
          console.error('Facebook tracking error:', trackError);
        }
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }

  async getOrderMeta(orderId: string): Promise<Record<string, unknown>> {
    const { data, error } = await supabase
      .from('order_meta')
      .select('meta_key, meta_value')
      .eq('order_id', orderId);

    if (error) throw error;

    return (data || []).reduce((acc, item) => {
      acc[item.meta_key] = item.meta_value;
      return acc;
    }, {} as Record<string, unknown>);
  }
}

export const orderService = new OrderService();
