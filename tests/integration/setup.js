/**
 * Integration Test Setup
 *
 * Provides helpers to:
 *  - build a lean Express app (no server.listen) for supertest
 *  - run pending DB migrations
 *  - clean up test data between suites
 *  - close the pg pool after all tests
 *
 * Uses .env at the project root. Set TEST_DATABASE_URL to point
 * at a dedicated test database so real data is never wiped.
 */

const path = require('path');

// Load env before anything else reads process.env
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// If a dedicated test DB URL is provided, use it
if (process.env.TEST_DATABASE_URL) {
   process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
}

const fs = require('fs');
const express = require('express');
const cors = require('cors');

// Resolve the project root so we can build absolute paths
const ROOT = path.join(__dirname, '../..');

// Require backend modules with absolute paths (works with jest module resolution)
const { pool } = require(path.join(ROOT, 'src/backend/config/database'));

/**
 * Build a fresh Express app without calling app.listen().
 * Supertest will call it directly.
 */
function buildApp() {
   const app = express();
   app.use(cors());
   app.use(express.json({ limit: '10mb' }));
   app.use(express.urlencoded({ extended: true, limit: '10mb' }));

   app.use('/api/auth', require(path.join(ROOT, 'src/backend/routes/auth')));
   app.use('/api/articles', require(path.join(ROOT, 'src/backend/routes/articles-public')));
   app.use('/api/author/articles', require(path.join(ROOT, 'src/backend/routes/articles-author')));
   app.use('/api/editor/articles', require(path.join(ROOT, 'src/backend/routes/articles-editor')));
   app.use('/api/admin', require(path.join(ROOT, 'src/backend/routes/admin')));
   app.use('/api/comments', require(path.join(ROOT, 'src/backend/routes/comments')));
   app.use('/api/bookmarks', require(path.join(ROOT, 'src/backend/routes/bookmarks')));
   app.use('/api/notifications', require(path.join(ROOT, 'src/backend/routes/notifications')));
   app.use('/api/recommendations', require(path.join(ROOT, 'src/backend/routes/recommendations')));

   app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

   // Generic error handler
   // eslint-disable-next-line no-unused-vars
   app.use((err, _req, res, _next) => {
      res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
   });

   return app;
}

/**
 * Run pending migrations against the (test) database.
 */
async function setupTestDb() {
   const migrationsDir = path.join(ROOT, 'src/backend/database/migrations');
   const client = await pool.connect();

   try {
      await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        "appliedAt" TIMESTAMPTZ DEFAULT NOW()
      )
    `);

      const { rows } = await client.query('SELECT name FROM migrations ORDER BY id');
      const applied = new Set(rows.map((r) => r.name));

      const files = fs
         .readdirSync(migrationsDir)
         .filter((f) => f.endsWith('.sql'))
         .sort();

      for (const file of files) {
         if (applied.has(file)) continue;
         const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
         await client.query('BEGIN');
         try {
            await client.query(sql);
            await client.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
            await client.query('COMMIT');
         } catch (err) {
            await client.query('ROLLBACK');
            throw new Error(`Migration ${file} failed: ${err.message}`);
         }
      }
   } finally {
      client.release();
   }
}

/**
 * Truncate all test data in reverse FK order.
 * Call in afterAll() of each test suite.
 */
async function teardownTestDb() {
   const client = await pool.connect();
   try {
      await client.query(`
      TRUNCATE TABLE
        system_logs, notifications, bookmarks, comments,
        article_tags, tags, articles, editor_stats, users,
        categories
      RESTART IDENTITY CASCADE
    `);
   } finally {
      client.release();
   }
}

/**
 * End the pg connection pool.
 * Call once in the last afterAll().
 */
async function closePool() {
   await pool.end();
}

module.exports = { pool, buildApp, setupTestDb, teardownTestDb, closePool };
