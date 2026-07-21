/**
 * Integration tests: Comments API (/api/comments)
 *
 * Covers: post comment, get by article, moderate status, delete
 */

const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool, buildApp, setupTestDb, teardownTestDb, closePool } = require('./setup');

let app;
let guestToken;
let editorToken;
let publishedArticleId;
let commentId;

function makeToken(payload) {
   return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
}

async function seedData() {
   const hash = await bcrypt.hash('password', 10);

   // Author
   const authorRes = await pool.query(
      `INSERT INTO users (email, password, "fullName", role)
     VALUES ('cmt.author@test.com', $1, 'Cmt Author', 'author')
     RETURNING id`,
      [hash]
   );
   const authorId = authorRes.rows[0].id;

   // Guest commenter
   const guestRes = await pool.query(
      `INSERT INTO users (email, password, "fullName", role)
     VALUES ('cmt.guest@test.com', $1, 'Guest User', 'guest')
     RETURNING id`,
      [hash]
   );
   guestToken = makeToken({ id: guestRes.rows[0].id, email: 'cmt.guest@test.com', role: 'guest' });

   // Editor
   const editorRes = await pool.query(
      `INSERT INTO users (email, password, "fullName", role)
     VALUES ('cmt.editor@test.com', $1, 'Editor User', 'editor')
     RETURNING id`,
      [hash]
   );
   editorToken = makeToken({
      id: editorRes.rows[0].id,
      email: 'cmt.editor@test.com',
      role: 'editor',
   });

   // Published article
   const articleRes = await pool.query(
      `INSERT INTO articles (title, content, category, author_id, status, "publishedAt")
     VALUES ('Comment Test Article', 'Body', 'Tech', $1, 'published', NOW())
     RETURNING id`,
      [authorId]
   );
   publishedArticleId = articleRes.rows[0].id;
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
// POST /api/comments/:articleId
// ---------------------------------------------------------------------------
describe('POST /api/comments/:articleId', () => {
   it('201 – creates a comment on a published article', async () => {
      const res = await request(app)
         .post(`/api/comments/${publishedArticleId}`)
         .set('Authorization', `Bearer ${guestToken}`)
         .send({ content: 'Great article!' });

      expect(res.status).toBe(201);
      expect(res.body.comment.content).toBe('Great article!');
      commentId = res.body.comment.id;
   });

   it('400 – missing content', async () => {
      const res = await request(app)
         .post(`/api/comments/${publishedArticleId}`)
         .set('Authorization', `Bearer ${guestToken}`)
         .send({});
      expect(res.status).toBe(400);
   });

   it('401 – unauthenticated request', async () => {
      const res = await request(app).post(`/api/comments/${publishedArticleId}`).send({ content: 'Hello' });
      expect(res.status).toBe(401);
   });

   it('404 – non-existent article', async () => {
      const res = await request(app)
         .post('/api/comments/00000000-0000-0000-0000-000000000000')
         .set('Authorization', `Bearer ${guestToken}`)
         .send({ content: 'Hello' });
      expect(res.status).toBe(404);
   });
});

// ---------------------------------------------------------------------------
// GET /api/comments/:articleId
// ---------------------------------------------------------------------------
describe('GET /api/comments/:articleId', () => {
   it('200 – returns approved comments for article (public)', async () => {
      const res = await request(app).get(`/api/comments/${publishedArticleId}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
   });
});

// ---------------------------------------------------------------------------
// PUT /api/comments/:commentId/status  (editor/admin only)
// ---------------------------------------------------------------------------
describe('PUT /api/comments/:commentId/status', () => {
   it('200 – editor can update comment status', async () => {
      const res = await request(app)
         .put(`/api/comments/${commentId}/status`)
         .set('Authorization', `Bearer ${editorToken}`)
         .send({ status: 'approved' });
      expect(res.status).toBe(200);
      expect(res.body.comment.status).toBe('approved');
   });

   it('400 – invalid status value', async () => {
      const res = await request(app)
         .put(`/api/comments/${commentId}/status`)
         .set('Authorization', `Bearer ${editorToken}`)
         .send({ status: 'invalid_status' });
      expect(res.status).toBe(400);
   });

   it('403 – guest cannot moderate comments', async () => {
      const res = await request(app)
         .put(`/api/comments/${commentId}/status`)
         .set('Authorization', `Bearer ${guestToken}`)
         .send({ status: 'rejected' });
      expect(res.status).toBe(403);
   });
});

// ---------------------------------------------------------------------------
// DELETE /api/comments/:commentId
// ---------------------------------------------------------------------------
describe('DELETE /api/comments/:commentId', () => {
   it('403 – different user cannot delete comment', async () => {
      const hash = await bcrypt.hash('x', 10);
      const otherRes = await pool.query(
         `INSERT INTO users (email, password, "fullName", role)
       VALUES ('other.user@test.com', $1, 'Other', 'guest')
       RETURNING id`,
         [hash]
      );
      const otherToken = makeToken({
         id: otherRes.rows[0].id,
         email: 'other.user@test.com',
         role: 'guest',
      });

      const res = await request(app).delete(`/api/comments/${commentId}`).set('Authorization', `Bearer ${otherToken}`);
      expect(res.status).toBe(403);
   });

   it('200 – editor can delete any comment', async () => {
      const res = await request(app).delete(`/api/comments/${commentId}`).set('Authorization', `Bearer ${editorToken}`);
      expect(res.status).toBe(200);
   });
});
