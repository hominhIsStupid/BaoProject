const { db } = require('../config/database');

class NotificationRepository {
  async create(notificationData) {
    const { id, user_id, title, message, type } = notificationData;
    
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO notifications (id, user_id, title, message, type, isRead)
         VALUES (?, ?, ?, ?, ?, 0)`,
        [id, user_id, title, message, type || 'system'],
        function(err) {
          if (err) reject(err);
          else resolve({ id, user_id, title, message, type: type || 'system', isRead: 0 });
        }
      );
    });
  }

  async findByUser(userId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM notifications WHERE user_id = ? ORDER BY createdAt DESC`,
        [userId],
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
        `SELECT * FROM notifications WHERE id = ?`,
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  async markAsRead(id, userId) {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE notifications SET isRead = 1 WHERE id = ? AND user_id = ?`,
        [id, userId],
        function(err) {
          if (err) reject(err);
          else resolve({ id, isRead: 1 });
        }
      );
    });
  }

  async markAllAsRead(userId) {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE notifications SET isRead = 1 WHERE user_id = ?`,
        [userId],
        function(err) {
          if (err) reject(err);
          else resolve({ success: true });
        }
      );
    });
  }
}

module.exports = new NotificationRepository();
