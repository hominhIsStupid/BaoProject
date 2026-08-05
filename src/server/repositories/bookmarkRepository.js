const { pool } = require('../config/database');

class BookmarkRepository {
   async create(userId, articleId, folderName = 'Mặc định') {
      const result = await pool.query(
         `INSERT INTO bookmarks (user_id, article_id, folder_name)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, article_id) DO NOTHING
       RETURNING *`,
         [userId, articleId, folderName]
      );
      return result.rows[0] || { userId, articleId, folder_name: folderName };
   }

   async findByUser(userId) {
      const result = await pool.query(
         `SELECT b.id as "bookmarkId", b."createdAt" as "bookmarkedAt", b.folder_name as "folderName",
              a.*, u."fullName" as "authorName"
       FROM bookmarks b
       JOIN articles a ON b.article_id = a.id
       JOIN users u ON a.author_id = u.id
       WHERE b.user_id = $1 AND a.status = 'published'
       ORDER BY b."createdAt" DESC`,
         [userId]
      );
      return result.rows;
   }

   async findByUserAndArticle(userId, articleId) {
      const result = await pool.query(`SELECT * FROM bookmarks WHERE user_id = $1 AND article_id = $2`, [
         userId,
         articleId,
      ]);
      return result.rows[0] || null;
   }

   async delete(userId, articleId) {
      await pool.query(`DELETE FROM bookmarks WHERE user_id = $1 AND article_id = $2`, [userId, articleId]);
      return { success: true };
   }

   async updateFolder(userId, articleId, folderName) {
      const result = await pool.query(
         `UPDATE bookmarks SET folder_name = $1 WHERE user_id = $2 AND article_id = $3 RETURNING *`,
         [folderName, userId, articleId]
      );
      return result.rows[0] || null;
   }
}

module.exports = new BookmarkRepository();
