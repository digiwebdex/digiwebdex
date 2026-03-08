const express = require('express');
const { pool, queryOne } = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
  const start = Date.now();
  try {
    await pool.query('SELECT 1');
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      responseTimeMs: Date.now() - start,
    });
  } catch (err) {
    res.status(503).json({ status: 'unhealthy', error: err.message });
  }
});

module.exports = router;
