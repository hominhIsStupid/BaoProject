/**
 * Integration tests: Notifications API (/api/notifications)
 *
 * Covers: list notifications, mark single as read, mark all as read
 */

const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool, buildApp, setupTestDb, teardownTestDb, closePool } = require('./setup');

let app;
let userToken;
let userId;
let notificationId;

function makeToken(payload) {
   return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
}

async function seedData() {
   const hash = await bcrypt.hash('password', 10);

   const userRes = await pool.query(
      `INSERT INTO users (email, password, "fullName", role)
     VALUES ('notif.user@test.com', $1, 'Notif User', 'guest')
     RETURNING id`,
      [hash]
   );
   userId = userRes.rows[0].id;
   userToken = makeToken({ id: userId, email: 'notif.user@test.com', role: 'guest' });

   // Seed a notification for this user
   const notifRes = await pool.query(
      `INSERT INTO notifications (user_id, title, message, type)
     VALUES ($1, 'Welcome', 'Welcome to Báo Rồng Vàng!', 'system')
     RETURNING id`,
      [userId]
   );
   notificationId = notifRes.rows[0].id;

   // Seed a second notification
   await pool.query(
      `INSERT INTO notifications (user_id, title, message, type)
     VALUES ($1, 'Update', 'System update notice.', 'system')`,
      [userId]
   );
}

beforeAll(async () => {
   await setupTestDb();
   app = buildApp();
   await seedData();
});

afterAll(async () => {
   await teardownTestDb();
   await closePool();
});

// ---------------------------------------------------------------------------
// GET /api/notifications
// ---------------------------------------------------------------------------
describe('GET /api/notifications', () => {
   it('200 – returns notifications for authenticated user', async () => {
      const res = await request(app).get('/api/notifications').set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
   });

   it('401 – unauthenticated request rejected', async () => {
      const res = await request(app).get('/api/notifications');
      expect(res.status).toBe(401);
   });
});

// ---------------------------------------------------------------------------
// PUT /api/notifications/:id/read
// ---------------------------------------------------------------------------
describe('PUT /api/notifications/:id/read', () => {
   it('200 – marks a notification as read', async () => {
      const res = await request(app)
         .put(`/api/notifications/${notificationId}/read`)
         .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.notification.isRead ?? res.body.notification['isRead']).toBe(true);
   });

   it('404 – non-existent notification', async () => {
      const res = await request(app)
         .put('/api/notifications/00000000-0000-0000-0000-000000000000/read')
         .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(404);
   });

   it('403 – another user cannot mark notification as read', async () => {
      const hash = await bcrypt.hash('x', 10);
      const otherRes = await pool.query(
         `INSERT INTO users (email, password, "fullName", role)
       VALUES ('other.notif@test.com', $1, 'Other', 'guest')
       RETURNING id`,
         [hash]
      );
      const otherToken = makeToken({
         id: otherRes.rows[0].id,
         email: 'other.notif@test.com',
         role: 'guest',
      });

      const res = await request(app)
         .put(`/api/notifications/${notificationId}/read`)
         .set('Authorization', `Bearer ${otherToken}`);
      expect(res.status).toBe(403);
   });
});

// ---------------------------------------------------------------------------
// PUT /api/notifications/read-all
// ---------------------------------------------------------------------------
describe('PUT /api/notifications/read-all', () => {
   it('200 – marks all notifications as read', async () => {
      const res = await request(app).put('/api/notifications/read-all').set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/read/i);
   });

   it('401 – unauthenticated request rejected', async () => {
      const res = await request(app).put('/api/notifications/read-all');
      expect(res.status).toBe(401);
   });
});
