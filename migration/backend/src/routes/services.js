const express = require('express');
const { query, queryOne, queryAll } = require('../db');

const router = express.Router();

// GET /api/services - Public
router.get('/', async (req, res) => {
  try {
    const { type, active_only = 'true' } = req.query;
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (active_only === 'true') {
      whereClause += ' AND is_active = true';
    }
    if (type) {
      params.push(type);
      whereClause += ` AND service_type = $${params.length}`;
    }

    const services = await queryAll(
      `SELECT * FROM services ${whereClause} ORDER BY sort_order, name_en`,
      params
    );
    res.json({ services });
  } catch (err) {
    console.error('List services error:', err);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// GET /api/services/:slug
router.get('/:slug', async (req, res) => {
  try {
    const service = await queryOne('SELECT * FROM services WHERE slug = $1', [req.params.slug]);
    if (!service) return res.status(404).json({ error: 'Service not found' });

    const packages = await queryAll(
      'SELECT * FROM service_packages WHERE service_id = $1 AND is_active = true ORDER BY sort_order, price',
      [service.id]
    );
    service.packages = packages;

    res.json({ service });
  } catch (err) {
    console.error('Get service error:', err);
    res.status(500).json({ error: 'Failed to fetch service' });
  }
});

// GET /api/services/packages/:id
router.get('/packages/:id', async (req, res) => {
  try {
    const pkg = await queryOne('SELECT * FROM service_packages WHERE id = $1', [req.params.id]);
    if (!pkg) return res.status(404).json({ error: 'Package not found' });
    res.json({ package: pkg });
  } catch (err) {
    console.error('Get package error:', err);
    res.status(500).json({ error: 'Failed to fetch package' });
  }
});

module.exports = router;
