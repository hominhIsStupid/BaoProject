const { db } = require('../config/database');

class CommentRepository {
  async create(commentData) {
    const { id, article_id, user_id, content } = commentData;
    
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO comments (id, article_id, user_id, content, status)
         VALUES (?, ?, ?, ?, 'pending')`,
        [id, article_id, user_id, content],
        function(err) {
          if (err) reject(err);
          else resolve({ id, article_id, user_id, content, status: 'pending' });
        }
      );
    });
  }

  async findByArticle(articleId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT c.*, u.fullName as userName, u.avatar as userAvatar 
         FROM comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.article_id = ? AND c.status = 'approved'
         ORDER BY c.createdAt DESC`,
        [articleId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  async findById(id) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM comments WHERE id = ?`,
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  async updateStatus(id, status) {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE comments SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
        [status, id],
        function(err) {
          if (err) reject(err);
          else resolve({ id, status });
        }
      );
    });
  }

  async delete(id) {
    return new Promise((resolve, reject) => {
      db.run(
        `DELETE FROM comments WHERE id = ?`,
        [id],
        function(err) {
          if (err) reject(err);
          else resolve({ success: true });
        }
      );
    });
  }
}

module.exports = new CommentRepository();
