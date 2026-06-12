const { db } = require('../config/database');

class BookmarkRepository {
  async create(id, userId, articleId) {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO bookmarks (id, user_id, article_id) VALUES (?, ?, ?)`,
        [id, userId, articleId],
        function(err) {
          if (err) reject(err);
          else resolve({ id, userId, articleId });
        }
      );
    });
  }

  async findByUser(userId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT b.id as bookmarkId, b.createdAt as bookmarkedAt, a.*, u.fullName as authorName
         FROM bookmarks b
         JOIN articles a ON b.article_id = a.id
         JOIN users u ON a.author_id = u.id
         WHERE b.user_id = ? AND a.status = 'published'
         ORDER BY b.createdAt DESC`,
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  async findByUserAndArticle(userId, articleId) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM bookmarks WHERE user_id = ? AND article_id = ?`,
        [userId, articleId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  async delete(userId, articleId) {
    return new Promise((resolve, reject) => {
      db.run(
        `DELETE FROM bookmarks WHERE user_id = ? AND article_id = ?`,
        [userId, articleId],
        function(err) {
          if (err) reject(err);
          else resolve({ success: true });
        }
      );
    });
  }
}

module.exports = new BookmarkRepository();
