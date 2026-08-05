const { pool } = require('../config/database');

async function fixBookmarks() {
   try {
      console.log('Forcefully adding folder_name column...');
      await pool.query(`ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS folder_name TEXT DEFAULT 'Mặc định';`);
      console.log('Column added successfully!');
   } catch (error) {
      console.error('Error adding column:', error);
   } finally {
      process.exit(0);
   }
}

fixBookmarks();
