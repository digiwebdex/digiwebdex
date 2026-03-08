const express = require('express');
const { query, queryOne, queryAll, queryPaginated } = require('../db');
const { authenticate, requireAdminOrStaff } = require('../middleware/auth');

const router = express.Router();

// GET /api/leads
router.get('/', authenticate, requireAdminOrStaff, async (req, res) => {
  try {
    const { page = 1, limit = 50, status } = req.query;
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (status) {
      params.push(status);
      whereClause += ` AND status = $${params.length}`;
    }

    const baseQuery = `SELECT * FROM leads ${whereClause} ORDER BY created_at DESC`;
    const result = await queryPaginated(baseQuery, params, parseInt(page), parseInt(limit));
    res.json(result);
  } catch (err) {
    console.error('List leads error:', err);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// POST /api/leads - Public (lead capture)
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, service_interest, message, source, utm_source, utm_medium, utm_campaign } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    // Normalize phone number
    let normalizedPhone = phone.replace(/[^0-9]/g, '');
    if (normalizedPhone.startsWith('0')) normalizedPhone = '88' + normalizedPhone;
    else if (!normalizedPhone.startsWith('880')) normalizedPhone = '880' + normalizedPhone;

    const result = await query(
      `INSERT INTO leads (name, phone, email, service_interest, message, source, utm_source, utm_medium, utm_campaign, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [name, normalizedPhone, email, service_interest, message, source || 'website', utm_source, utm_medium, utm_campaign,
       req.headers['x-forwarded-for'] || req.ip, req.headers['user-agent']]
    );

    const lead = result.rows[0];

    // WebSocket broadcast for admin notification
    req.app.get('broadcast')('new_lead', { lead_id: lead.id, name, phone: normalizedPhone, service_interest });

    // TODO: Send SMS/Email notifications via nodemailer

    res.status(201).json({ success: true, message: 'Thank you! We will contact you shortly.' });
  } catch (err) {
    console.error('Create lead error:', err);
    res.status(500).json({ error: 'Failed to submit lead' });
  }
});

// PATCH /api/leads/:id
router.patch('/:id', authenticate, requireAdminOrStaff, async (req, res) => {
  try {
    const { status, notes, assigned_to } = req.body;
    const updates = [];
    const values = [];
    let idx = 1;

    if (status) { updates.push(`status = $${idx++}`); values.push(status); }
    if (notes !== undefined) { updates.push(`notes = $${idx++}`); values.push(notes); }
    if (assigned_to) { updates.push(`assigned_to = $${idx++}`); values.push(assigned_to); }
    updates.push(`updated_at = NOW()`);

    if (updates.length === 1) return res.status(400).json({ error: 'No updates provided' });

    values.push(req.params.id);
    const result = await query(
      `UPDATE leads SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Lead not found' });

    // Log the action
    await query(
      `INSERT INTO lead_logs (lead_id, action, notes, performed_by) VALUES ($1, $2, $3, $4)`,
      [req.params.id, `Status changed to ${status}`, notes, req.user.id]
    );

    res.json({ success: true, lead: result.rows[0] });
  } catch (err) {
    console.error('Update lead error:', err);
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

module.exports = router;
