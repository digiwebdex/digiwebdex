const express = require('express');
const { query, queryOne, queryAll } = require('../db');

const router = express.Router();

// POST /api/contact - Public
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    const result = await query(
      `INSERT INTO contact_messages (name, email, phone, subject, message, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, email, phone, subject, message, req.headers['x-forwarded-for'] || req.ip, req.headers['user-agent']]
    );

    // Notify admin via WebSocket
    req.app.get('broadcast')('new_contact', { id: result.rows[0].id, name, email, subject });

    // Send notification
    try {
      const fetch = (await import('node-fetch')).default;
      await fetch(`${process.env.API_URL || 'http://localhost:3001'}/api/notifications/contact-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'contact_form', name, email, phone, subject, message }),
      });
    } catch (err) {
      console.error('Contact notification error:', err);
    }

    res.status(201).json({ success: true, message: 'Thank you for contacting us!' });
  } catch (err) {
    console.error('Contact submit error:', err);
    res.status(500).json({ error: 'Failed to submit contact form' });
  }
});

// POST /api/contact/consultation - Booking
router.post('/consultation', async (req, res) => {
  try {
    const { name, phone, email, service_interest, preferred_date, preferred_time, message } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    const result = await query(
      `INSERT INTO consultation_bookings (name, phone, email, service_interest, preferred_date, preferred_time, message)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, phone, email, service_interest, preferred_date, preferred_time, message]
    );

    req.app.get('broadcast')('new_consultation', { id: result.rows[0].id, name, phone });

    res.status(201).json({ success: true, message: 'Consultation booked successfully!' });
  } catch (err) {
    console.error('Consultation booking error:', err);
    res.status(500).json({ error: 'Failed to book consultation' });
  }
});

module.exports = router;
