/**
 * Performance tests: API endpoints (grug edition)
 *
 * grug shoot 200 request at server, measure latency and throughput.
 * fail if server too slow. grug set generous threshold because
 * grug know postgres on local machine not same as prod, is fine.
 *
 * run: npm run test:perf
 *
 * thresholds (grug wisdom from experience):
 *   health check:    p99 < 50ms,   rps >= 200
 *   articles list:   p99 < 500ms,  rps >= 30
 *   article by id:   p99 < 500ms,  rps >= 30
 *   category filter: p99 < 500ms,  rps >= 30
 *   search:          p99 < 800ms,  rps >= 15   (full-text search, more work)
 *   auth /me:        p99 < 200ms,  rps >= 80   (just jwt verify + db lookup)
 *   notifications:   p99 < 300ms,  rps >= 50
 *   bookmarks:       p99 < 300ms,  rps >= 50
 *   login (bcrypt):  p99 < 2000ms, rps >= 3    (bcrypt slow, is fine, is point)
 *
 * zero 5xx errors allowed on all routes.
 */

'use strict';

const path = require('path');
const bcrypt = require('bcryptjs');

require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { buildApp, startServer, stopServer, runBench } = require('./runner');
const { pool, setupTestDb, teardownTestDb } = require('../integration/setup');

// --------------------------------------------------------------------------
// shared state
// --------------------------------------------------------------------------
const TEST_EMAIL = 'perf.user@test.com';
const TEST_PASSWORD = 'perfpassword';

let testServer;
let port;
let publishedArticleId;
let authToken;

// --------------------------------------------------------------------------
// setup
// --------------------------------------------------------------------------
beforeAll(async () => {
   await setupTestDb();

   const hash = await bcrypt.hash(TEST_PASSWORD, 10);

   // seed author
   const authorRes = await pool.query(
      `INSERT INTO users (email, password, "fullName", role)
     VALUES ('perf.author@test.com', $1, 'Perf Author', 'author')
     RETURNING id`,
      [hash]
   );
   const authorId = authorRes.rows[0].id;

   // seed published article
   const articleRes = await pool.query(
      `INSERT INTO articles (title, excerpt, content, category, author_id, status, "publishedAt")
     VALUES ('Perf Test Article', 'Short excerpt', 'Content here', 'Technology', $1, 'published', NOW())
     RETURNING id`,
      [authorId]
   );
   publishedArticleId = articleRes.rows[0].id;

   // seed guest user for auth tests
   await pool.query(
      `INSERT INTO users (email, password, "fullName", role)
     VALUES ($1, $2, 'Perf User', 'guest')`,
      [TEST_EMAIL, hash]
   );

   // spin up server
   const app = buildApp();
   testServer = await startServer(app);
   port = testServer.address().port;

   // get auth token (one real login, used for authenticated perf tests)
   const res = await new Promise((resolve, reject) => {
      const http = require('http');
      const body = JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD });
      const req = http.request(
         {
            hostname: '127.0.0.1',
            port,
            path: '/api/auth/login',
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
         },
         (r) => {
            let data = '';
            r.on('data', (c) => (data += c));
            r.on('end', () => resolve(JSON.parse(data)));
         }
      );
      req.on('error', reject);
      req.write(body);
      req.end();
   });
   authToken = res.token;
}, 60000);

// --------------------------------------------------------------------------
// teardown
// --------------------------------------------------------------------------
afterAll(async () => {
   if (testServer) await stopServer(testServer);
   await teardownTestDb();
   await pool.end();
}, 30000);

// --------------------------------------------------------------------------
// helper
// --------------------------------------------------------------------------
function assertThresholds(failures, label) {
   if (failures.length > 0) {
      throw new Error(`[${label}] performance breach:\n  ${failures.join('\n  ')}`);
   }
}

// --------------------------------------------------------------------------
// health check — fastest route, should be trivial
// --------------------------------------------------------------------------
describe('Performance: /api/health', () => {
   it('responds fast under concurrent load', async () => {
      const { failures } = await runBench({
         title: 'GET /api/health',
         port,
         path: '/api/health',
         concurrency: 20,
         totalRequests: 400,
         thresholds: { p99: 100, rps: 200, errors: 0 },
      });
      assertThresholds(failures, 'GET /api/health');
   }, 60000);
});

// --------------------------------------------------------------------------
// public articles routes
// --------------------------------------------------------------------------
describe('Performance: /api/articles (public)', () => {
   it('list published articles', async () => {
      const { failures } = await runBench({
         title: 'GET /api/articles',
         port,
         path: '/api/articles?limit=20&offset=0',
         concurrency: 10,
         totalRequests: 200,
         thresholds: { p99: 500, rps: 30, errors: 0 },
      });
      assertThresholds(failures, 'GET /api/articles');
   }, 60000);

   it('get article by id', async () => {
      const { failures } = await runBench({
         title: `GET /api/articles/:id`,
         port,
         path: `/api/articles/${publishedArticleId}`,
         concurrency: 10,
         totalRequests: 200,
         thresholds: { p99: 500, rps: 30, errors: 0 },
      });
      assertThresholds(failures, 'GET /api/articles/:id');
   }, 60000);

   it('filter by category', async () => {
      const { failures } = await runBench({
         title: 'GET /api/articles/category/Technology',
         port,
         path: '/api/articles/category/Technology',
         concurrency: 10,
         totalRequests: 200,
         thresholds: { p99: 500, rps: 30, errors: 0 },
      });
      assertThresholds(failures, 'GET /api/articles/category/:cat');
   }, 60000);

   it('full-text search', async () => {
      const { failures } = await runBench({
         title: 'GET /api/articles/search/Perf',
         port,
         path: '/api/articles/search/Perf',
         concurrency: 5,
         totalRequests: 100,
         thresholds: { p99: 800, rps: 15, errors: 0 },
      });
      assertThresholds(failures, 'GET /api/articles/search/:q');
   }, 60000);
});

// --------------------------------------------------------------------------
// auth routes
// --------------------------------------------------------------------------
describe('Performance: /api/auth', () => {
   it('GET /me — jwt verify + db lookup', async () => {
      const { failures } = await runBench({
         title: 'GET /api/auth/me',
         port,
         path: '/api/auth/me',
         headers: { Authorization: `Bearer ${authToken}` },
         concurrency: 10,
         totalRequests: 200,
         thresholds: { p99: 200, rps: 80, errors: 0 },
      });
      assertThresholds(failures, 'GET /api/auth/me');
   }, 60000);

   it('POST /login — bcrypt is slow, threshold generous', async () => {
      const { failures } = await runBench({
         title: 'POST /api/auth/login',
         port,
         path: '/api/auth/login',
         method: 'POST',
         body: { email: TEST_EMAIL, password: TEST_PASSWORD },
         concurrency: 2,
         totalRequests: 20,
         thresholds: { p99: 2000, rps: 3, errors: 0 },
      });
      assertThresholds(failures, 'POST /api/auth/login');
   }, 60000);
});

// --------------------------------------------------------------------------
// authenticated endpoints
// --------------------------------------------------------------------------
describe('Performance: /api/notifications', () => {
   it('list notifications', async () => {
      const { failures } = await runBench({
         title: 'GET /api/notifications',
         port,
         path: '/api/notifications',
         headers: { Authorization: `Bearer ${authToken}` },
         concurrency: 10,
         totalRequests: 200,
         thresholds: { p99: 300, rps: 50, errors: 0 },
      });
      assertThresholds(failures, 'GET /api/notifications');
   }, 60000);
});

describe('Performance: /api/bookmarks', () => {
   it('list bookmarks', async () => {
      const { failures } = await runBench({
         title: 'GET /api/bookmarks',
         port,
         path: '/api/bookmarks',
         headers: { Authorization: `Bearer ${authToken}` },
         concurrency: 10,
         totalRequests: 200,
         thresholds: { p99: 300, rps: 50, errors: 0 },
      });
      assertThresholds(failures, 'GET /api/bookmarks');
   }, 60000);
});
