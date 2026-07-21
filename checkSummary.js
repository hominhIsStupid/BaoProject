const { pool } = require('./src/backend/config/database');

async function checkSummary() {
  try {
    const res = await pool.query('SELECT title, summary FROM research_articles LIMIT 5');
    console.log(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

checkSummary();
