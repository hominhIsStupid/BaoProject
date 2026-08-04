const { pool } = require('../config/database');

class CommentRepository {
   async create(commentData) {
      const { article_id, user_id, content } = commentData;
      const result = await pool.query(
         `INSERT INTO comments (article_id, user_id, content, status)
       VALUES ($1, $2, $3, 'approved')
       RETURNING *`,
         [article_id, user_id, content]
      );
      return result.rows[0];
   }

   async findAll() {
      const result = await pool.query(
         `SELECT c.*, u."fullName" as "userName", u.email as "userEmail", a.title as "articleTitle"
       FROM comments c
       JOIN users u ON c.user_id = u.id
       JOIN articles a ON c.article_id = a.id
       ORDER BY c."createdAt" DESC`
      );
      return result.rows;
   }

   async findByArticle(articleId, userId = null) {
      const result = await pool.query(
         `SELECT c.*, u."fullName" as "userName", u.avatar as "userAvatar"
          ${userId ? ', (cl.user_id IS NOT NULL) as liked' : ', false as liked'}
       FROM comments c
       JOIN users u ON c.user_id = u.id
       ${userId ? `LEFT JOIN comment_likes cl ON c.id = cl.comment_id AND cl.user_id = $2` : ''}
       WHERE c.article_id = $1 AND c.status = 'approved'
       ORDER BY c."createdAt" DESC`,
         userId ? [articleId, userId] : [articleId]
      );
      return result.rows;
   }

   async likeComment(userId, commentId) {
      await pool.query(
         `INSERT INTO comment_likes (user_id, comment_id)
          VALUES ($1, $2)
          ON CONFLICT (user_id, comment_id) DO NOTHING`,
         [userId, commentId]
      );
      await pool.query(`UPDATE comments SET likes = COALESCE(likes, 0) + 1 WHERE id = $1`, [commentId]);
   }

   async unlikeComment(userId, commentId) {
      const result = await pool.query(
         `DELETE FROM comment_likes WHERE user_id = $1 AND comment_id = $2 RETURNING user_id`,
         [userId, commentId]
      );
      if (result.rows.length > 0) {
         await pool.query(`UPDATE comments SET likes = GREATEST(COALESCE(likes, 0) - 1, 0) WHERE id = $1`, [commentId]);
      }
   }

   async findById(id) {
      const result = await pool.query(`SELECT * FROM comments WHERE id = $1`, [id]);
      return result.rows[0] || null;
   }

   async updateStatus(id, status) {
      const result = await pool.query(
         `UPDATE comments SET status = $1, "updatedAt" = NOW()
       WHERE id = $2 RETURNING id, status`,
         [status, id]
      );
      return result.rows[0];
   }

   async delete(id) {
      await pool.query(`DELETE FROM comments WHERE id = $1`, [id]);
      return { success: true };
   }

   async findByUser(userId) {
      const result = await pool.query(
         `SELECT c.*, a.title as "articleTitle"
       FROM comments c
       JOIN articles a ON c.article_id = a.id
       WHERE c.user_id = $1
       ORDER BY c."createdAt" DESC`,
         [userId]
      );
      return result.rows;
   }
}

module.exports = new CommentRepository();
