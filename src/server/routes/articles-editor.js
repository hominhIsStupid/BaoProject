const express = require('express');
const router = express.Router();
const articleRepository = require('../repositories/articleRepository');
const userRepository = require('../repositories/userRepository');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { pool } = require('../config/database');
const notificationRepository = require('../repositories/notificationRepository');

// EDITOR ROUTES

// Get pending articles for review
router.get('/pending', authMiddleware, roleMiddleware(['editor']), async (req, res) => {
   try {
      const limit = parseInt(req.query.limit) || 20;
      const offset = parseInt(req.query.offset) || 0;
      const articles = await articleRepository.findByStatus('pending', limit, offset);
      res.json(articles);
   } catch (error) {
      res.status(500).json({ message: 'Failed to fetch pending articles', error: error.message });
   }
});

// Get approved articles
router.get('/approved', authMiddleware, roleMiddleware(['editor']), async (req, res) => {
   try {
      const limit = parseInt(req.query.limit) || 20;
      const offset = parseInt(req.query.offset) || 0;
      const articles = await articleRepository.findByStatus('approved', limit, offset);
      res.json(articles);
   } catch (error) {
      res.status(500).json({ message: 'Failed to fetch approved articles', error: error.message });
   }
});

// Get rejected articles
router.get('/rejected', authMiddleware, roleMiddleware(['editor']), async (req, res) => {
   try {
      const limit = parseInt(req.query.limit) || 20;
      const offset = parseInt(req.query.offset) || 0;
      const articles = await articleRepository.findByStatus('rejected', limit, offset);
      res.json(articles);
   } catch (error) {
      res.status(500).json({ message: 'Failed to fetch rejected articles', error: error.message });
   }
});

// Approve article
router.post('/:id/approve', authMiddleware, roleMiddleware(['editor']), async (req, res) => {
   try {
      const article = await articleRepository.findById(req.params.id);

      if (!article) {
         return res.status(404).json({ message: 'Article not found' });
      }

      if (article.status !== 'pending') {
         return res.status(400).json({ message: 'Only pending articles can be approved' });
      }

      const client = await pool.connect();
      try {
         await client.query('BEGIN');

         // 1. Cập nhật trạng thái bài viết và gán biên tập viên
         await client.query(`UPDATE articles SET status = 'approved', editor_id = $1, "updatedAt" = NOW() WHERE id = $2`, [req.user.id, req.params.id]);

         // 2. Tạo thông báo cho tác giả
         await client.query(
            `INSERT INTO notifications (user_id, title, message, type, "isRead") VALUES ($1, $2, $3, $4, FALSE)`,
            [article.author_id, 'Bài viết được phê duyệt', `Bài viết "${article.title}" của bạn đã được phê duyệt bởi biên tập viên.`, 'approval']
         );

         // 3. Cập nhật thống kê biên tập viên
         await client.query(
            `UPDATE editor_stats SET "articlesApproved" = "articlesApproved" + 1, "articlesReviewed" = "articlesReviewed" + 1 WHERE editor_id = $1`,
            [req.user.id]
         );
         
         // 4. Ghi log hệ thống
         await client.query(
            `INSERT INTO system_logs (action, level, user_id, description, metadata) VALUES ($1, $2, $3, $4, $5)`,
            ['APPROVE_ARTICLE', 'info', req.user.id, `Duyệt bài viết: ${article.title}`, JSON.stringify({ articleId: req.params.id })]
         );

         await client.query('COMMIT');
         res.json({ message: 'Article approved successfully' });
      } catch (error) {
         await client.query('ROLLBACK');
         throw error;
      } finally {
         client.release();
      }
   } catch (error) {
      res.status(500).json({ message: 'Approval failed', error: error.message });
   }
});

// Reject article
router.post('/:id/reject', authMiddleware, roleMiddleware(['editor']), async (req, res) => {
   try {
      const { reason } = req.body;
      const article = await articleRepository.findById(req.params.id);

      if (!article) {
         return res.status(404).json({ message: 'Article not found' });
      }

      if (article.status !== 'pending') {
         return res.status(400).json({ message: 'Only pending articles can be rejected' });
      }

      const client = await pool.connect();
      try {
         await client.query('BEGIN');

         // 1. Cập nhật trạng thái bài viết, lý do từ chối và gán biên tập viên
         await client.query(`UPDATE articles SET status = 'rejected', "rejectionReason" = $1, editor_id = $2, "updatedAt" = NOW() WHERE id = $3`, [reason, req.user.id, req.params.id]);

         // 2. Tạo thông báo cho tác giả
         await client.query(
            `INSERT INTO notifications (user_id, title, message, type, "isRead") VALUES ($1, $2, $3, $4, FALSE)`,
            [article.author_id, 'Bài viết bị từ chối', `Bài viết "${article.title}" của bạn đã bị từ chối. Lý do: ${reason || 'Không có lý do cụ thể.'}`, 'rejection']
         );

         // 3. Cập nhật thống kê biên tập viên
         await client.query(
            `UPDATE editor_stats SET "articlesRejected" = "articlesRejected" + 1, "articlesReviewed" = "articlesReviewed" + 1 WHERE editor_id = $1`,
            [req.user.id]
         );
         
         // 4. Ghi log hệ thống
         await client.query(
            `INSERT INTO system_logs (action, level, user_id, description, metadata) VALUES ($1, $2, $3, $4, $5)`,
            ['REJECT_ARTICLE', 'warn', req.user.id, `Từ chối bài viết: ${article.title}`, JSON.stringify({ articleId: req.params.id, reason })]
         );

         await client.query('COMMIT');
         res.json({ message: 'Article rejected', rejectionReason: reason });
      } catch (error) {
         await client.query('ROLLBACK');
         throw error;
      } finally {
         client.release();
      }
   } catch (error) {
      res.status(500).json({ message: 'Rejection failed', error: error.message });
   }
});

// Suggest edits
router.post('/:id/suggest-edit', authMiddleware, roleMiddleware(['editor']), async (req, res) => {
   try {
      const { suggestion } = req.body;
      const article = await articleRepository.findById(req.params.id);

      if (!article) {
         return res.status(404).json({ message: 'Article not found' });
      }

      // Store suggestion in a log/comment system
      try {
         await pool.query(
            `INSERT INTO comments (article_id, user_id, content, status)
         VALUES ($1, $2, $3, 'approved')`,
            [req.params.id, req.user.id, suggestion]
         );
         res.json({ message: 'Suggestion saved' });
      } catch (err) {
         res.status(500).json({ message: 'Failed to save suggestion' });
      }
   } catch (error) {
      res.status(500).json({ message: 'Failed to suggest edit', error: error.message });
   }
});

// Get editor stats
router.get('/stats/me', authMiddleware, roleMiddleware(['editor']), async (req, res) => {
   try {
      const stats = await pool.query(`SELECT * FROM editor_stats WHERE editor_id = $1`, [req.user.id]);
      res.json(stats.rows[0] || {});
   } catch (error) {
      res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
   }
});

module.exports = router;
