const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const articleRepository = require('../Repositories/articleRepository');
const categoryRepository = require('../Repositories/categoryRepository');
const userRepository = require('../Repositories/userRepository');
const { authMiddleware, roleMiddleware } = require('../Middleware/auth');
const { db } = require('../config/database');

// ADMIN ROUTES

// ===== ARTICLE MANAGEMENT =====

// Get all articles with all statuses
router.get('/articles/all', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const articles = await articleRepository.findAll(limit, offset);
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch articles', error: error.message });
  }
});

// Publish article
router.post('/articles/:id/publish', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const article = await articleRepository.findById(req.params.id);
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    if (article.status !== 'approved') {
      return res.status(400).json({ message: 'Only approved articles can be published' });
    }

    await articleRepository.updateStatus(req.params.id, 'published');
    
    // Log action
    db.run(
      `INSERT INTO system_logs (id, action, user_id, description)
       VALUES (?, ?, ?, ?)`,
      [uuidv4(), 'ARTICLE_PUBLISHED', req.user.id, `Published article: ${article.title}`]
    );

    res.json({ message: 'Article published successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Publish failed', error: error.message });
  }
});

// Delete article
router.delete('/articles/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const article = await articleRepository.findById(req.params.id);
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    await articleRepository.delete(req.params.id);
    
    db.run(
      `INSERT INTO system_logs (id, action, user_id, description)
       VALUES (?, ?, ?, ?)`,
      [uuidv4(), 'ARTICLE_DELETED', req.user.id, `Deleted article: ${article.title}`]
    );

    res.json({ message: 'Article deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Deletion failed', error: error.message });
  }
});

// ===== CATEGORY MANAGEMENT =====

// Create category
router.post('/categories', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { name, slug, description, color, icon } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ message: 'Name and slug required' });
    }

    const categoryId = uuidv4();
    const category = await categoryRepository.create({
      id: categoryId,
      name,
      slug,
      description,
      color,
      icon
    });

    db.run(
      `INSERT INTO system_logs (id, action, user_id, description)
       VALUES (?, ?, ?, ?)`,
      [uuidv4(), 'CATEGORY_CREATED', req.user.id, `Created category: ${name}`]
    );

    res.status(201).json({ message: 'Category created', category });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create category', error: error.message });
  }
});

// Get all categories
router.get('/categories', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const categories = await categoryRepository.findAll();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch categories', error: error.message });
  }
});

// Update category
router.put('/categories/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const category = await categoryRepository.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const updatedCategory = await categoryRepository.update(req.params.id, req.body);
    res.json({ message: 'Category updated', category: updatedCategory });
  } catch (error) {
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
});

// Delete category
router.delete('/categories/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const category = await categoryRepository.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await categoryRepository.delete(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Deletion failed', error: error.message });
  }
});

// ===== USER MANAGEMENT =====

// Get all users
router.get('/users', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const users = await userRepository.findAll(limit, offset);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
});

// Get users by role
router.get('/users/role/:role', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const users = await userRepository.findByRole(req.params.role);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
});

// Update user role
router.put('/users/:id/role', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['author', 'editor', 'admin', 'guest'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await userRepository.updateRole(req.params.id, role);
    
    db.run(
      `INSERT INTO system_logs (id, action, user_id, description)
       VALUES (?, ?, ?, ?)`,
      [uuidv4(), 'USER_ROLE_CHANGED', req.user.id, `Changed user ${req.params.id} role to ${role}`]
    );

    res.json({ message: 'User role updated', user });
  } catch (error) {
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
});

// Suspend user
router.put('/users/:id/suspend', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const user = await userRepository.update(req.params.id, { status: 'suspended' });
    
    db.run(
      `INSERT INTO system_logs (id, action, user_id, description)
       VALUES (?, ?, ?, ?)`,
      [uuidv4(), 'USER_SUSPENDED', req.user.id, `Suspended user: ${req.params.id}`]
    );

    res.json({ message: 'User suspended', user });
  } catch (error) {
    res.status(500).json({ message: 'Suspension failed', error: error.message });
  }
});

// Activate user
router.put('/users/:id/activate', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const user = await userRepository.update(req.params.id, { status: 'active' });
    
    db.run(
      `INSERT INTO system_logs (id, action, user_id, description)
       VALUES (?, ?, ?, ?)`,
      [uuidv4(), 'USER_ACTIVATED', req.user.id, `Activated user: ${req.params.id}`]
    );

    res.json({ message: 'User activated', user });
  } catch (error) {
    res.status(500).json({ message: 'Activation failed', error: error.message });
  }
});

// ===== DASHBOARD STATISTICS =====

// Get dashboard statistics
router.get('/stats', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const dbGet = (query) => {
      return new Promise((resolve, reject) => {
        db.get(query, (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    };

    const [
      totalArticlesRow,
      publishedArticlesRow,
      pendingArticlesRow,
      totalUsersRow,
      totalAuthorsRow,
      totalEditorsRow
    ] = await Promise.all([
      dbGet(`SELECT COUNT(*) as count FROM articles`),
      dbGet(`SELECT COUNT(*) as count FROM articles WHERE status = 'published'`),
      dbGet(`SELECT COUNT(*) as count FROM articles WHERE status = 'pending'`),
      dbGet(`SELECT COUNT(*) as count FROM users`),
      dbGet(`SELECT COUNT(*) as count FROM users WHERE role = 'author'`),
      dbGet(`SELECT COUNT(*) as count FROM users WHERE role = 'editor'`)
    ]);

    const stats = {
      totalArticles: totalArticlesRow?.count || 0,
      publishedArticles: publishedArticlesRow?.count || 0,
      pendingArticles: pendingArticlesRow?.count || 0,
      totalUsers: totalUsersRow?.count || 0,
      totalAuthors: totalAuthorsRow?.count || 0,
      totalEditors: totalEditorsRow?.count || 0
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
  }
});

// Get system logs
router.get('/logs', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const logs = new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM system_logs ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
        [limit, offset],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    res.json(await logs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch logs', error: error.message });
  }
});

module.exports = router;
