const { pool } = require('./src/backend/config/database');

async function cleanDB() {
  try {
    await pool.query('DELETE FROM research_articles');
    console.log('Cleared research_articles table successfully!');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

cleanDB();
