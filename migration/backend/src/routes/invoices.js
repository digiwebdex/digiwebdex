const express = require('express');
const { query, queryOne, queryAll, queryPaginated } = require('../db');
const { authenticate, requireAdminOrStaff } = require('../middleware/auth');

const router = express.Router();

// GET /api/invoices
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 50, status, user_id } = req.query;
    const isAdmin = ['admin', 'staff'].includes(req.user.role);
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (!isAdmin) {
      params.push(req.user.id);
      whereClause += ` AND i.user_id = $${params.length}`;
    } else if (user_id) {
      params.push(user_id);
      whereClause += ` AND i.user_id = $${params.length}`;
    }
    
    if (status) {
      params.push(status);
      whereClause += ` AND i.status = $${params.length}`;
    }

    const baseQuery = `
      SELECT i.*, p.full_name as customer_name, o.order_number
      FROM invoices i
      LEFT JOIN profiles p ON i.user_id = p.user_id
      LEFT JOIN orders o ON i.order_id = o.id
      ${whereClause}
      ORDER BY i.created_at DESC
    `;
    
    const result = await queryPaginated(baseQuery, params, parseInt(page), parseInt(limit));
    res.json(result);
  } catch (err) {
    console.error('List invoices error:', err);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// GET /api/invoices/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const invoice = await queryOne(
      `SELECT i.*, p.full_name as customer_name, p.phone, p.email, p.address, p.company_name,
              o.order_number
       FROM invoices i
       LEFT JOIN profiles p ON i.user_id = p.user_id
       LEFT JOIN orders o ON i.order_id = o.id
       WHERE i.id = $1`,
      [req.params.id]
    );
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    
    const isAdmin = ['admin', 'staff'].includes(req.user.role);
    if (!isAdmin && invoice.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Get invoice items
    const items = await queryAll('SELECT * FROM invoice_items WHERE invoice_id = $1', [req.params.id]);
    invoice.items = items;

    res.json({ invoice });
  } catch (err) {
    console.error('Get invoice error:', err);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

// PATCH /api/invoices/:id
router.patch('/:id', authenticate, requireAdminOrStaff, async (req, res) => {
  try {
    const { status, due_date, notes, advance_paid, due_amount } = req.body;
    const updates = [];
    const values = [];
    let idx = 1;

    if (status) { 
      updates.push(`status = $${idx++}`); 
      values.push(status);
      if (status === 'paid') {
        updates.push('paid_at = NOW()');
      }
    }
    if (due_date) { updates.push(`due_date = $${idx++}`); values.push(due_date); }
    if (notes !== undefined) { updates.push(`notes = $${idx++}`); values.push(notes); }
    if (advance_paid !== undefined) { updates.push(`advance_paid = $${idx++}`); values.push(advance_paid); }
    if (due_amount !== undefined) { updates.push(`due_amount = $${idx++}`); values.push(due_amount); }
    updates.push(`updated_at = NOW()`);

    if (updates.length === 1) return res.status(400).json({ error: 'No updates provided' });

    values.push(req.params.id);
    const result = await query(
      `UPDATE invoices SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Invoice not found' });

    res.json({ success: true, invoice: result.rows[0] });
  } catch (err) {
    console.error('Update invoice error:', err);
    res.status(500).json({ error: 'Failed to update invoice' });
  }
});

// POST /api/invoices/:id/items
router.post('/:id/items', authenticate, requireAdminOrStaff, async (req, res) => {
  try {
    const { description, service_type, package_name, domain, renewal_date, qty, price } = req.body;
    const total = (qty || 1) * (price || 0);

    const result = await query(
      `INSERT INTO invoice_items (invoice_id, description, service_type, package_name, domain, renewal_date, qty, price, total)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [req.params.id, description, service_type, package_name, domain, renewal_date, qty || 1, price || 0, total]
    );

    res.status(201).json({ success: true, item: result.rows[0] });
  } catch (err) {
    console.error('Add invoice item error:', err);
    res.status(500).json({ error: 'Failed to add invoice item' });
  }
});

module.exports = router;
