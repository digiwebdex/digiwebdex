const express = require('express');
const { query, queryOne, queryAll, queryPaginated } = require('../db');
const { authenticate, requireAdminOrStaff } = require('../middleware/auth');

const router = express.Router();

// GET /api/tickets
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 50, status, priority } = req.query;
    const isAdmin = ['admin', 'staff', 'support'].includes(req.user.role);
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (!isAdmin) {
      params.push(req.user.id);
      whereClause += ` AND t.user_id = $${params.length}`;
    }
    if (status) {
      params.push(status);
      whereClause += ` AND t.status = $${params.length}`;
    }
    if (priority) {
      params.push(priority);
      whereClause += ` AND t.priority = $${params.length}`;
    }

    const baseQuery = `
      SELECT t.*, p.full_name as customer_name
      FROM support_tickets t
      LEFT JOIN profiles p ON t.user_id = p.user_id
      ${whereClause}
      ORDER BY 
        CASE t.priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END,
        t.created_at DESC
    `;
    
    const result = await queryPaginated(baseQuery, params, parseInt(page), parseInt(limit));
    res.json(result);
  } catch (err) {
    console.error('List tickets error:', err);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// GET /api/tickets/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const ticket = await queryOne(
      `SELECT t.*, p.full_name as customer_name, p.phone, p.email
       FROM support_tickets t
       LEFT JOIN profiles p ON t.user_id = p.user_id
       WHERE t.id = $1`,
      [req.params.id]
    );
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    
    const isAdmin = ['admin', 'staff', 'support'].includes(req.user.role);
    if (!isAdmin && ticket.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Get messages (filter internal if not admin)
    let messagesQuery = 'SELECT tm.*, p.full_name as sender_name FROM ticket_messages tm LEFT JOIN profiles p ON tm.user_id = p.user_id WHERE tm.ticket_id = $1';
    if (!isAdmin) {
      messagesQuery += ' AND tm.is_internal = false';
    }
    messagesQuery += ' ORDER BY tm.created_at ASC';

    const messages = await queryAll(messagesQuery, [req.params.id]);
    ticket.messages = messages;

    res.json({ ticket });
  } catch (err) {
    console.error('Get ticket error:', err);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

// POST /api/tickets
router.post('/', authenticate, async (req, res) => {
  try {
    const { subject, category, priority, order_id, message } = req.body;

    if (!subject) return res.status(400).json({ error: 'Subject is required' });

    const result = await query(
      `INSERT INTO support_tickets (user_id, subject, category, priority, order_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.id, subject, category || 'general', priority || 'medium', order_id]
    );
    const ticket = result.rows[0];

    // Add initial message if provided
    if (message) {
      await query(
        `INSERT INTO ticket_messages (ticket_id, user_id, message) VALUES ($1, $2, $3)`,
        [ticket.id, req.user.id, message]
      );
    }

    req.app.get('broadcast')('new_ticket', { ticket_id: ticket.id, ticket_number: ticket.ticket_number });

    res.status(201).json({ success: true, ticket });
  } catch (err) {
    console.error('Create ticket error:', err);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// POST /api/tickets/:id/messages
router.post('/:id/messages', authenticate, async (req, res) => {
  try {
    const { message, is_internal } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const ticket = await queryOne('SELECT * FROM support_tickets WHERE id = $1', [req.params.id]);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    const isAdmin = ['admin', 'staff', 'support'].includes(req.user.role);
    if (!isAdmin && ticket.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const result = await query(
      `INSERT INTO ticket_messages (ticket_id, user_id, message, is_internal)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.params.id, req.user.id, message, isAdmin ? (is_internal || false) : false]
    );

    // Update first response time if admin/staff
    if (isAdmin && !ticket.first_response_at) {
      await query('UPDATE support_tickets SET first_response_at = NOW() WHERE id = $1', [req.params.id]);
    }

    req.app.get('broadcast')('ticket_message', { ticket_id: req.params.id });

    res.status(201).json({ success: true, message: result.rows[0] });
  } catch (err) {
    console.error('Add message error:', err);
    res.status(500).json({ error: 'Failed to add message' });
  }
});

// PATCH /api/tickets/:id
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const { status, priority, assigned_to } = req.body;
    const isAdmin = ['admin', 'staff', 'support'].includes(req.user.role);
    
    const ticket = await queryOne('SELECT * FROM support_tickets WHERE id = $1', [req.params.id]);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    // Non-admins can only close their own tickets
    if (!isAdmin) {
      if (ticket.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
      if (status && status !== 'closed') return res.status(403).json({ error: 'You can only close tickets' });
    }

    const updates = [];
    const values = [];
    let idx = 1;

    if (status) { 
      updates.push(`status = $${idx++}`); 
      values.push(status);
      if (status === 'resolved') updates.push('resolved_at = NOW()');
      if (status === 'closed') updates.push('closed_at = NOW()');
    }
    if (priority && isAdmin) { updates.push(`priority = $${idx++}`); values.push(priority); }
    if (assigned_to && isAdmin) { updates.push(`assigned_to = $${idx++}`); values.push(assigned_to); }
    updates.push(`updated_at = NOW()`);

    values.push(req.params.id);
    const result = await query(
      `UPDATE support_tickets SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );

    // Log the change
    await query(
      `INSERT INTO ticket_logs (ticket_id, action, new_value, performed_by) VALUES ($1, $2, $3, $4)`,
      [req.params.id, 'status_change', status, req.user.id]
    );

    res.json({ success: true, ticket: result.rows[0] });
  } catch (err) {
    console.error('Update ticket error:', err);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

module.exports = router;
