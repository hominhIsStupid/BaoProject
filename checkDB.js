const { pool } = require('./src/backend/config/database');

async function checkDB() {
  try {
    const res = await pool.query('SELECT title, LENGTH(content) as clen FROM research_articles LIMIT 5');
    console.log(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

checkDB();
