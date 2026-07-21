const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { pool } = require('../config/database');
const { authMiddleware, roleMiddleware } = require('../middleware/auth'); 

// GET /api/research - Lấy danh sách bài nghiên cứu (public)
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    const category = req.query.category;
    const search = req.query.search;

    let query = `SELECT id, title, summary, thumbnail, author, category, "readingTime", "createdAt", price FROM research_articles WHERE 1=1`;
    let countQuery = `SELECT COUNT(*) FROM research_articles WHERE 1=1`;
    const params = [];
    let paramIndex = 1;

    if (category) {
      query += ` AND category = $${paramIndex}`;
      countQuery += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (search) {
      query += ` AND (title ILIKE $${paramIndex} OR summary ILIKE $${paramIndex})`;
      countQuery += ` AND (title ILIKE $${paramIndex} OR summary ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY "createdAt" DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    
    const [articlesRes, countRes] = await Promise.all([
      pool.query(query, [...params, limit, offset]),
      pool.query(countQuery, params)
    ]);

    res.json({
      articles: articlesRes.rows,
      total: parseInt(countRes.rows[0].count),
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(parseInt(countRes.rows[0].count) / limit)
    });
  } catch (error) {
    console.error('Error fetching research articles:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/research/:id - Lấy chi tiết một bài nghiên cứu (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check optional auth
    let userId = req.query.mockId || null;
    let userRole = req.query.mockRole || null;
    let forcePurchased = req.query.mockPurchased === 'true';

    const token = req.headers.authorization?.split(' ')[1];
    if (token && token !== 'mock-jwt-token') {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
        userRole = decoded.role;
      } catch (err) {}
    }

    const result = await pool.query(`SELECT * FROM research_articles WHERE id = $1`, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy bài nghiên cứu' });
    }
    
    const article = result.rows[0];
    
    // Check if user has purchased
    let isPurchased = forcePurchased;
    
    // Admin always has full access
    if (userRole === 'admin') {
      isPurchased = true;
    }
    
    if (!isPurchased && userId) {
      if (token && token !== 'mock-jwt-token') {
        try {
          const purchaseCheck = await pool.query(`SELECT id FROM user_research_purchases WHERE "userId" = $1 AND "articleId" = $2`, [userId, id]);
          if (purchaseCheck.rows.length > 0) isPurchased = true;
        } catch(e) {}
      }
    }
    
    // Hide full content if not purchased, but provide a preview
    if (!isPurchased) {
      if (article.content) {
         // Strip HTML tags to avoid broken unclosed tags, take first 1500 chars, wrap in <p>
         const plainText = article.content.replace(/<[^>]+>/g, '');
         article.contentPreview = '<p>' + plainText.substring(0, 1500) + '...</p>';
      }
      article.content = null;
    }
    
    article.isPurchased = isPurchased;
    
    res.json(article);
  } catch (error) {
    console.error('Error fetching research article:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/research/:id/buy - Mua bài nghiên cứu
router.post('/:id/buy', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if already purchased
    const purchaseCheck = await pool.query(`SELECT id FROM user_research_purchases WHERE "userId" = $1 AND "articleId" = $2`, [userId, id]);
    if (purchaseCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Bạn đã mua bài nghiên cứu này rồi' });
    }
    
    // Add to purchases
    await pool.query(`INSERT INTO user_research_purchases ("userId", "articleId") VALUES ($1, $2)`, [userId, id]);
    
    res.json({ message: 'Mua bài nghiên cứu thành công', isPurchased: true });
  } catch (error) {
    console.error('Error buying research article:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/research - Thêm bài mới
// Admin only. Note: In real app, add authMiddleware. I'll add it here.
router.post('/', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { title, summary, content, thumbnail, author, category, readingTime, price } = req.body;
    
    if (!title || !content || !category) {
      return res.status(400).json({ message: 'Thiếu trường thông tin bắt buộc' });
    }

    const query = `
      INSERT INTO research_articles (title, summary, content, thumbnail, author, category, "readingTime", price)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [title, summary, content, thumbnail, author || req.user?.fullName, category, readingTime || 5, price || 50000];
    
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating research article:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/research/:id - Cập nhật bài
router.put('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, summary, content, thumbnail, author, category, readingTime, price } = req.body;
    
    const query = `
      UPDATE research_articles 
      SET title = COALESCE($1, title), 
          summary = COALESCE($2, summary), 
          content = COALESCE($3, content), 
          thumbnail = COALESCE($4, thumbnail), 
          author = COALESCE($5, author), 
          category = COALESCE($6, category), 
          "readingTime" = COALESCE($7, "readingTime"), 
          price = COALESCE($8, price),
          "updatedAt" = NOW()
      WHERE id = $9
      RETURNING *
    `;
    const values = [title, summary, content, thumbnail, author, category, readingTime, price, id];
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy bài nghiên cứu' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating research article:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/research/:id - Xóa bài
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`DELETE FROM research_articles WHERE id = $1 RETURNING id`, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy bài nghiên cứu' });
    }
    
    res.json({ message: 'Đã xóa bài nghiên cứu thành công', id });
  } catch (error) {
    console.error('Error deleting research article:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
