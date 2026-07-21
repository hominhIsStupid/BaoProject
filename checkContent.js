const { pool } = require('./src/backend/config/database');

async function checkContent() {
  try {
    const res = await pool.query('SELECT title, content FROM research_articles LIMIT 1');
    console.log("TITLE:", res.rows[0].title);
    console.log("CONTENT:\n", res.rows[0].content);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

checkContent();
