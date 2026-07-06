/**
 * Regression tests for security and authorization bypass
 *
 * Prevents non-admin users from accessing admin routes,
 * guest users from deleting comments they do not own, etc.
 */

const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool, buildApp, setupTestDb, teardownTestDb, closePool } = require('../integration/setup');

let app;
let guestToken;
let guestUserId;
let authorToken;
let editorToken;
let adminToken;
let publishedArticleId;
let draftArticleId;
let otherCommentId;

function makeToken(payload) {
   return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
}

async function seedData() {
   const hash = await bcrypt.hash('password123', 10);

   // Guest 1
   const guestRes = await pool.query(
      `INSERT INTO users (email, password, "fullName", role)
     VALUES ('reg.guest@test.com', $1, 'Reg Guest', 'guest')
     RETURNING id`,
      [hash]
   );
   guestUserId = guestRes.rows[0].id;
   guestToken = makeToken({ id: guestUserId, email: 'reg.guest@test.com', role: 'guest' });

   // Guest 2 (other guest)
   const otherGuestRes = await pool.query(
      `INSERT INTO users (email, password, "fullName", role)
     VALUES ('reg.otherguest@test.com', $1, 'Other Guest', 'guest')
     RETURNING id`,
      [hash]
   );
   const otherGuestId = otherGuestRes.rows[0].id;

   // Author
   const authorRes = await pool.query(
      `INSERT INTO users (email, password, "fullName", role)
     VALUES ('reg.author@test.com', $1, 'Reg Author', 'author')
     RETURNING id`,
      [hash]
   );
   const authorId = authorRes.rows[0].id;
   authorToken = makeToken({ id: authorId, email: 'reg.author@test.com', role: 'author' });

   // Editor
   const editorRes = await pool.query(
      `INSERT INTO users (email, password, "fullName", role)
     VALUES ('reg.editor@test.com', $1, 'Reg Editor', 'editor')
     RETURNING id`,
      [hash]
   );
   editorToken = makeToken({ id: editorRes.rows[0].id, email: 'reg.editor@test.com', role: 'editor' });

   // Admin
   const adminRes = await pool.query(
      `INSERT INTO users (email, password, "fullName", role)
     VALUES ('reg.admin@test.com', $1, 'Reg Admin', 'admin')
     RETURNING id`,
      [hash]
   );
   adminToken = makeToken({ id: adminRes.rows[0].id, email: 'reg.admin@test.com', role: 'admin' });

   // Articles
   const pubRes = await pool.query(
      `INSERT INTO articles (title, content, category, author_id, status, "publishedAt")
     VALUES ('Reg Published', 'Content', 'Technology', $1, 'published', NOW())
     RETURNING id`,
      [authorId]
   );
   publishedArticleId = pubRes.rows[0].id;

   const draftRes = await pool.query(
      `INSERT INTO articles (title, content, category, author_id, status)
     VALUES ('Reg Draft', 'Content', 'Technology', $1, 'draft')
     RETURNING id`,
      [authorId]
   );
   draftArticleId = draftRes.rows[0].id;

   // Comment by Guest 2 on published article
   const commentRes = await pool.query(
      `INSERT INTO comments (article_id, user_id, content, status)
     VALUES ($1, $2, 'Other Guest Comment', 'approved')
     RETURNING id`,
      [publishedArticleId, otherGuestId]
   );
   otherCommentId = commentRes.rows[0].id;
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

describe('Regression: Role Authorization Restrictions', () => {
   it('403 – guest cannot fetch admin stats', async () => {
      const res = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${guestToken}`);
      expect(res.status).toBe(403);
   });

   it('403 – author cannot fetch admin stats', async () => {
      const res = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${authorToken}`);
      expect(res.status).toBe(403);
   });

   it('403 – editor cannot fetch admin stats', async () => {
      const res = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${editorToken}`);
      expect(res.status).toBe(403);
   });

   it('200 – admin can fetch admin stats', async () => {
      const res = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('totalArticles');
   });
});

describe('Regression: Commenting constraints', () => {
   it('400 – cannot comment on draft article', async () => {
      const res = await request(app)
         .post(`/api/comments/${draftArticleId}`)
         .set('Authorization', `Bearer ${guestToken}`)
         .send({ content: 'Nice draft!' });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/cannot comment on unpublished/i);
   });
});

describe('Regression: Comment deletion constraints', () => {
   it('403 – guest user cannot delete comment owned by another user', async () => {
      const res = await request(app)
         .delete(`/api/comments/${otherCommentId}`)
         .set('Authorization', `Bearer ${guestToken}`);
      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/access denied/i);
   });

   it('200 – editor user can delete comment owned by another user', async () => {
      const res = await request(app)
         .delete(`/api/comments/${otherCommentId}`)
         .set('Authorization', `Bearer ${editorToken}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/comment deleted successfully/i);
   });
});
