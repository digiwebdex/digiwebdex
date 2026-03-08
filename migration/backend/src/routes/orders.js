const express = require('express');
const { query, queryOne, queryAll, queryPaginated } = require('../db');
const { authenticate, requireAdminOrStaff } = require('../middleware/auth');

const router = express.Router();

// GET /api/orders - List orders (with pagination)
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 50, status, user_id } = req.query;
    const isAdmin = ['admin', 'staff'].includes(req.user.role);
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (!isAdmin) {
      params.push(req.user.id);
      whereClause += ` AND o.user_id = $${params.length}`;
    } else if (user_id) {
      params.push(user_id);
      whereClause += ` AND o.user_id = $${params.length}`;
    }
    
    if (status) {
      params.push(status);
      whereClause += ` AND o.status = $${params.length}`;
    }

    const baseQuery = `
      SELECT o.*, p.full_name as customer_name, p.phone as customer_phone
      FROM orders o
      LEFT JOIN profiles p ON o.user_id = p.user_id
      ${whereClause}
      ORDER BY o.created_at DESC
    `;
    
    const result = await queryPaginated(baseQuery, params, parseInt(page), parseInt(limit));
    res.json(result);
  } catch (err) {
    console.error('List orders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await queryOne(
      `SELECT o.*, p.full_name as customer_name, p.phone as customer_phone, p.email as customer_email
       FROM orders o
       LEFT JOIN profiles p ON o.user_id = p.user_id
       WHERE o.id = $1`,
      [req.params.id]
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    const isAdmin = ['admin', 'staff'].includes(req.user.role);
    if (!isAdmin && order.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Get order items
    const items = await queryAll('SELECT * FROM order_items WHERE order_id = $1', [req.params.id]);
    order.items = items;

    res.json({ order });
  } catch (err) {
    console.error('Get order error:', err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// POST /api/orders
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      service_id, package_id, service_type, package_name, domain,
      subtotal, discount, tax, total, advance_payment, payment_method,
      notes, items, metadata
    } = req.body;

    // Generate order number
    const orderNumber = await queryOne("SELECT generate_order_number() as num");
    
    const result = await query(
      `INSERT INTO orders (
        order_number, user_id, service_id, package_id, service_type, package_name,
        domain, subtotal, discount, tax, total, advance_payment, payment_method,
        notes, metadata, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'pending')
      RETURNING *`,
      [
        orderNumber.num, req.user.id, service_id, package_id, service_type, package_name,
        domain, subtotal || 0, discount || 0, tax || 0, total || subtotal || 0,
        advance_payment || 0, payment_method, notes, metadata || {}
      ]
    );
    
    const order = result.rows[0];

    // Insert order items if provided
    if (items && items.length > 0) {
      for (const item of items) {
        await query(
          `INSERT INTO order_items (order_id, service_id, package_id, service_type, name, description, domain, quantity, unit_price, total, metadata)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [order.id, item.service_id, item.package_id, item.service_type, item.name, item.description, item.domain, item.quantity || 1, item.unit_price || 0, item.total || 0, item.metadata || {}]
        );
      }
    }

    // WebSocket broadcast
    req.app.get('broadcast')('order_created', { order_id: order.id, order_number: order.order_number });

    res.status(201).json({ success: true, order });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// PATCH /api/orders/:id
router.patch('/:id', authenticate, requireAdminOrStaff, async (req, res) => {
  try {
    const { status, admin_notes, metadata } = req.body;
    const updates = [];
    const values = [];
    let idx = 1;

    if (status) { updates.push(`status = $${idx++}`); values.push(status); }
    if (admin_notes !== undefined) { updates.push(`admin_notes = $${idx++}`); values.push(admin_notes); }
    if (metadata) { updates.push(`metadata = $${idx++}`); values.push(metadata); }
    updates.push(`updated_at = NOW()`);

    if (updates.length === 1) return res.status(400).json({ error: 'No updates provided' });

    values.push(req.params.id);
    const result = await query(
      `UPDATE orders SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });

    req.app.get('broadcast')('order_updated', { order_id: req.params.id, status });
    res.json({ success: true, order: result.rows[0] });
  } catch (err) {
    console.error('Update order error:', err);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// DELETE /api/orders/:id
router.delete('/:id', authenticate, requireAdminOrStaff, async (req, res) => {
  try {
    const result = await query('DELETE FROM orders WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    res.json({ success: true });
  } catch (err) {
    if (err.message.includes('paid invoices')) {
      return res.status(400).json({ error: err.message });
    }
    console.error('Delete order error:', err);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

module.exports = router;
