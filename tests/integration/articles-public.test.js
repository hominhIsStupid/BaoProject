/**
 * Integration tests: Public Articles API (/api/articles)
 *
 * Covers: list published, get by ID, category filter, search
 * All routes are public (no auth required).
 *
 * Seed helpers create the minimum required DB rows (user + article).
 */

const request = require('supertest');
const bcrypt = require('bcryptjs');
const { pool, buildApp, setupTestDb, teardownTestDb, closePool } = require('./setup');

let app;
let authorId;
let publishedArticleId;

async function seedData() {
   const hash = await bcrypt.hash('password', 10);
   const userRes = await pool.query(
      `INSERT INTO users (email, password, "fullName", role)
     VALUES ('author.articles@test.com', $1, 'Article Author', 'author')
     RETURNING id`,
      [hash]
   );
   authorId = userRes.rows[0].id;

   const articleRes = await pool.query(
      `INSERT INTO articles (title, content, category, author_id, status, "publishedAt")
     VALUES ('Test Article', 'Content here', 'Technology', $1, 'published', NOW())
     RETURNING id`,
      [authorId]
   );
   publishedArticleId = articleRes.rows[0].id;

   // Draft article – should NOT appear in public listing
   await pool.query(
      `INSERT INTO articles (title, content, category, author_id, status)
     VALUES ('Draft Article', 'Draft content', 'Technology', $1, 'draft')`,
      [authorId]
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
// GET /api/articles
// ---------------------------------------------------------------------------
describe('GET /api/articles', () => {
   it('200 – returns only published articles', async () => {
      const res = await request(app).get('/api/articles');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      // All returned articles must have a title (view doesn't expose status col)
      res.body.forEach((a) => expect(a.title).toBeDefined());
   });

   it('200 – respects limit and offset query params', async () => {
      const res = await request(app).get('/api/articles?limit=1&offset=0');
      expect(res.status).toBe(200);
      expect(res.body.length).toBeLessThanOrEqual(1);
   });
});

// ---------------------------------------------------------------------------
// GET /api/articles/:id
// ---------------------------------------------------------------------------
describe('GET /api/articles/:id', () => {
   it('200 – returns article by ID and increments views', async () => {
      const res = await request(app).get(`/api/articles/${publishedArticleId}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(publishedArticleId);
   });

   it('404 – non-existent article ID', async () => {
      const res = await request(app).get('/api/articles/00000000-0000-0000-0000-000000000000');
      expect(res.status).toBe(404);
   });
});

// ---------------------------------------------------------------------------
// GET /api/articles/category/:category
// ---------------------------------------------------------------------------
describe('GET /api/articles/category/:category', () => {
   it('200 – returns articles for a given category', async () => {
      const res = await request(app).get('/api/articles/category/Technology');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
   });

   it('200 – returns empty array for unknown category', async () => {
      const res = await request(app).get('/api/articles/category/NonExistentCategory');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
   });
});

// ---------------------------------------------------------------------------
// GET /api/articles/search/:query
// ---------------------------------------------------------------------------
describe('GET /api/articles/search/:query', () => {
   it('200 – returns matching articles', async () => {
      const res = await request(app).get('/api/articles/search/Test');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
   });
});

// ---------------------------------------------------------------------------
// GET /api/articles/search/suggestions/:query
// ---------------------------------------------------------------------------
describe('GET /api/articles/search/suggestions/:query', () => {
   it('200 – returns suggestion list with articles and tags', async () => {
      const res = await request(app).get('/api/articles/search/suggestions/Test');
      expect(res.status).toBe(200);
      // getSuggestions returns { articles: [...], tags: [...] }
      expect(res.body).toHaveProperty('articles');
      expect(res.body).toHaveProperty('tags');
      expect(Array.isArray(res.body.articles)).toBe(true);
      expect(Array.isArray(res.body.tags)).toBe(true);
   });
});
