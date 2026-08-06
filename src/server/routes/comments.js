const express = require('express');
const router = express.Router();
const commentRepository = require('../repositories/commentRepository');
const articleRepository = require('../repositories/articleRepository');
const notificationRepository = require('../repositories/notificationRepository');
const { authMiddleware, roleMiddleware, optionalAuth } = require('../middleware/auth');

// Report a comment (any authenticated user)
router.post('/:commentId/report', authMiddleware, async (req, res) => {
   try {
      const { commentId } = req.params;

      const comment = await commentRepository.findById(commentId);
      if (!comment) {
         return res.status(404).json({ message: 'Comment not found' });
      }

      const updatedComment = await commentRepository.updateStatus(commentId, 'reported');
      res.json({ message: 'Comment reported successfully', comment: updatedComment });
   } catch (error) {
      res.status(500).json({ message: 'Failed to report comment', error: error.message });
   }
});

// Retrieve all comments (editors & admins only)
router.get('/', authMiddleware, roleMiddleware(['editor', 'admin']), async (req, res) => {
   try {
      const comments = await commentRepository.findAll();
      res.json(comments);
   } catch (error) {
      res.status(500).json({ message: 'Failed to fetch comments', error: error.message });
   }
});

// Post a comment (authenticated users)
router.post('/:articleId', authMiddleware, async (req, res) => {
   try {
      const { content } = req.body;
      const { articleId } = req.params;

      if (!content) {
         return res.status(400).json({ message: 'Comment content required' });
      }

      const article = await articleRepository.findById(articleId);
      if (!article) {
         return res.status(404).json({ message: 'Article not found' });
      }

      if (article.status !== 'published' && article.status !== 'approved') {
         return res.status(400).json({ message: 'Cannot comment on unpublished articles' });
      }

      const comment = await commentRepository.create({
         article_id: articleId,
         user_id: req.user.id,
         content,
      });

      // Notify author of the article if commenter is different
      if (article.author_id !== req.user.id) {
         await notificationRepository.create({
            user_id: article.author_id,
            title: 'Bình luận mới',
            message: `Độc giả (${req.user.email}) đã bình luận về bài viết "${article.title}": "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
            type: 'comment',
            relatedId: article.id,
         });
      }

      res.status(201).json({
         message: 'Comment submitted successfully',
         comment,
      });
   } catch (error) {
      res.status(500).json({ message: 'Failed to submit comment', error: error.message });
   }
});

// Retrieve my comments (authenticated users)
router.get('/my-comments', authMiddleware, async (req, res) => {
   try {
      const userId = req.user.id;
      const comments = await commentRepository.findByUser(userId);
      res.json(comments);
   } catch (error) {
      res.status(500).json({ message: 'Failed to fetch comments', error: error.message });
   }
});

// Retrieve approved comments for an article (public)
router.get('/:articleId', optionalAuth, async (req, res) => {
   try {
      const { articleId } = req.params;
      const userId = req.user ? req.user.id : null;
      const comments = await commentRepository.findByArticle(articleId, userId);
      res.json(comments);
   } catch (error) {
      res.status(500).json({ message: 'Failed to fetch comments', error: error.message });
   }
});

// Like a comment (authenticated)
router.post('/:commentId/like', authMiddleware, async (req, res) => {
   try {
      await commentRepository.likeComment(req.user.id, req.params.commentId);
      res.json({ message: 'Comment liked' });
   } catch (error) {
      res.status(500).json({ message: 'Failed to like comment', error: error.message });
   }
});

// Unlike a comment (authenticated)
router.delete('/:commentId/like', authMiddleware, async (req, res) => {
   try {
      await commentRepository.unlikeComment(req.user.id, req.params.commentId);
      res.json({ message: 'Comment unliked' });
   } catch (error) {
      res.status(500).json({ message: 'Failed to unlike comment', error: error.message });
   }
});

// Moderate comment status: approve/reject (editors & admins only)
router.put('/:commentId/status', authMiddleware, roleMiddleware(['editor', 'admin']), async (req, res) => {
   try {
      const { status } = req.body;
      const { commentId } = req.params;

      if (!['approved', 'rejected', 'pending', 'reported'].includes(status)) {
         return res.status(400).json({ message: 'Invalid status' });
      }

      const comment = await commentRepository.findById(commentId);
      if (!comment) {
         return res.status(404).json({ message: 'Comment not found' });
      }

      const updatedComment = await commentRepository.updateStatus(commentId, status);
      res.json({ message: `Comment status updated to ${status}`, comment: updatedComment });
   } catch (error) {
      res.status(500).json({ message: 'Failed to update status', error: error.message });
   }
});

// Delete a comment (comment owner, or editors, or admins)
router.delete('/:commentId', authMiddleware, async (req, res) => {
   try {
      const { commentId } = req.params;
      const comment = await commentRepository.findById(commentId);

      if (!comment) {
         return res.status(404).json({ message: 'Comment not found' });
      }

      // Check if requester is owner, admin, or editor
      const isOwner = comment.user_id === req.user.id;
      const isStaff = ['admin', 'editor'].includes(req.user.role);

      if (!isOwner && !isStaff) {
         return res.status(403).json({ message: 'Access denied' });
      }

      await commentRepository.delete(commentId);
      res.json({ message: 'Comment deleted successfully' });
   } catch (error) {
      res.status(500).json({ message: 'Failed to delete comment', error: error.message });
   }
});

module.exports = router;
