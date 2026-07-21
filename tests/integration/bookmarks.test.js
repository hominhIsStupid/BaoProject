/**
 * Integration tests: Bookmarks API (/api/bookmarks)
 *
 * Covers: bookmark article, list bookmarks, remove bookmark
 */

const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool, buildApp, setupTestDb, teardownTestDb, closePool } = require('./setup');

let app;
let userToken;
let publishedArticleId;
let draftArticleId;

function makeToken(payload) {
   return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
}

async function seedData() {
   const hash = await bcrypt.hash('password', 10);

   const authorRes = await pool.query(
      `INSERT INTO users (email, password, "fullName", role)
     VALUES ('bm.author@test.com', $1, 'BM Author', 'author')
     RETURNING id`,
      [hash]
   );
   const authorId = authorRes.rows[0].id;

   const userRes = await pool.query(
      `INSERT INTO users (email, password, "fullName", role)
     VALUES ('bm.user@test.com', $1, 'BM User', 'guest')
     RETURNING id`,
      [hash]
   );
   userToken = makeToken({ id: userRes.rows[0].id, email: 'bm.user@test.com', role: 'guest' });

   const pubRes = await pool.query(
      `INSERT INTO articles (title, content, category, author_id, status, "publishedAt")
     VALUES ('Bookmarkable Article', 'Content', 'Tech', $1, 'published', NOW())
     RETURNING id`,
      [authorId]
   );
   publishedArticleId = pubRes.rows[0].id;

   const draftRes = await pool.query(
      `INSERT INTO articles (title, content, category, author_id, status)
     VALUES ('Draft Article BM', 'Content', 'Tech', $1, 'draft')
     RETURNING id`,
      [authorId]
   );
   draftArticleId = draftRes.rows[0].id;
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
// POST /api/bookmarks/:articleId
// ---------------------------------------------------------------------------
describe('POST /api/bookmarks/:articleId', () => {
   it('201 – bookmarks a published article', async () => {
      const res = await request(app)
         .post(`/api/bookmarks/${publishedArticleId}`)
         .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(201);
      expect(res.body.bookmark.article_id).toBe(publishedArticleId);
   });

   it('409 – cannot bookmark the same article twice', async () => {
      const res = await request(app)
         .post(`/api/bookmarks/${publishedArticleId}`)
         .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(409);
   });

   it('400 – cannot bookmark a draft article', async () => {
      const res = await request(app)
         .post(`/api/bookmarks/${draftArticleId}`)
         .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(400);
   });

   it('401 – requires authentication', async () => {
      const res = await request(app).post(`/api/bookmarks/${publishedArticleId}`);
      expect(res.status).toBe(401);
   });

   it('404 – non-existent article', async () => {
      const res = await request(app)
         .post('/api/bookmarks/00000000-0000-0000-0000-000000000000')
         .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(404);
   });
});

// ---------------------------------------------------------------------------
// GET /api/bookmarks
// ---------------------------------------------------------------------------
describe('GET /api/bookmarks', () => {
   it('200 – returns list of user bookmarks', async () => {
      const res = await request(app).get('/api/bookmarks').set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
   });

   it('401 – unauthenticated request is rejected', async () => {
      const res = await request(app).get('/api/bookmarks');
      expect(res.status).toBe(401);
   });
});

// ---------------------------------------------------------------------------
// DELETE /api/bookmarks/:articleId
// ---------------------------------------------------------------------------
describe('DELETE /api/bookmarks/:articleId', () => {
   it('200 – removes an existing bookmark', async () => {
      const res = await request(app)
         .delete(`/api/bookmarks/${publishedArticleId}`)
         .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
   });

   it('404 – removing a non-existent bookmark returns 404', async () => {
      const res = await request(app)
         .delete(`/api/bookmarks/${publishedArticleId}`)
         .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(404);
   });
});
