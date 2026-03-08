const cron = require('node-cron');
const { pool, queryAll } = require('./db');

function start() {
  // Daily backup at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily backup...');
    try {
      const fetch = (await import('node-fetch')).default;
      await fetch(`${process.env.API_URL || 'http://localhost:3001'}/api/backup/run`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.CRON_SECRET}` }
      });
    } catch (err) { console.error('Backup cron error:', err); }
  });

  // Affiliate commission processing daily
  cron.schedule('0 1 * * *', async () => {
    console.log('Processing affiliate commissions...');
    try {
      const pending = await queryAll(
        `SELECT * FROM affiliate_commissions WHERE status = 'pending' AND grace_period_ends_at < NOW()`
      );
      for (const c of pending) {
        await pool.query(`UPDATE affiliate_commissions SET status = 'approved', approved_at = NOW() WHERE id = $1`, [c.id]);
        await pool.query(`UPDATE affiliates SET pending_earnings = pending_earnings - $1, withdrawable_earnings = withdrawable_earnings + $1 WHERE id = $2`, [c.commission_amount, c.affiliate_id]);
      }
      console.log(`Approved ${pending.length} commissions`);
    } catch (err) { console.error('Commission cron error:', err); }
  });

  // Renewal reminders daily
  cron.schedule('0 8 * * *', async () => {
    console.log('Checking renewals...');
    // Add renewal reminder logic here
  });

  console.log('Cron jobs started');
}

module.exports = { start };
