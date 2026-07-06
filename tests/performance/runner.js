/**
 * Performance test runner (grug edition) — no external load library
 *
 * grug shoot many parallel http request at server using plain node http.
 * measure latency, throughput, error count. fail if over threshold.
 *
 * no autocannon, no k6, no angry esm demon.
 */

'use strict';

const path = require('path');
const http = require('http');
const https = require('https');
const express = require('express');
const cors = require('cors');

require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const ROOT = path.join(__dirname, '../..');

// --------------------------------------------------------------------------
// build slim express app
// --------------------------------------------------------------------------
function buildApp() {
   const app = express();
   app.use(cors());
   app.use(express.json({ limit: '10mb' }));
   app.use(express.urlencoded({ extended: true, limit: '10mb' }));

   app.use('/api/auth', require(path.join(ROOT, 'src/backend/routes/auth')));
   app.use('/api/articles', require(path.join(ROOT, 'src/backend/routes/articles-public')));
   app.use('/api/comments', require(path.join(ROOT, 'src/backend/routes/comments')));
   app.use('/api/bookmarks', require(path.join(ROOT, 'src/backend/routes/bookmarks')));
   app.use('/api/notifications', require(path.join(ROOT, 'src/backend/routes/notifications')));
   app.use('/api/recommendations', require(path.join(ROOT, 'src/backend/routes/recommendations')));

   app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

   app.use((err, _req, res, _next) => {
      res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
   });

   return app;
}

// --------------------------------------------------------------------------
// start / stop helpers
// --------------------------------------------------------------------------
function startServer(app) {
   return new Promise((resolve, reject) => {
      const server = http.createServer(app);
      server.listen(0, '127.0.0.1', (err) => {
         if (err) return reject(err);
         resolve(server);
      });
   });
}

function stopServer(server) {
   return new Promise((resolve) => server.close(resolve));
}

// --------------------------------------------------------------------------
// fire a single http request, return { statusCode, durationMs }
// --------------------------------------------------------------------------
function fireRequest({ hostname, port, path: urlPath, method = 'GET', headers = {}, body }) {
   return new Promise((resolve) => {
      const start = Date.now();
      const payload = body ? JSON.stringify(body) : undefined;

      const options = {
         hostname,
         port,
         path: urlPath,
         method,
         headers: {
            'Content-Type': 'application/json',
            'Content-Length': payload ? Buffer.byteLength(payload) : 0,
            ...headers,
         },
      };

      const req = http.request(options, (res) => {
         res.resume(); // drain body so socket is freed
         res.on('end', () => {
            resolve({ statusCode: res.statusCode, durationMs: Date.now() - start });
         });
      });

      req.on('error', () => {
         resolve({ statusCode: 0, durationMs: Date.now() - start, error: true });
      });

      if (payload) req.write(payload);
      req.end();
   });
}

// --------------------------------------------------------------------------
// run benchmark: fire `totalRequests` requests with `concurrency` in flight
// --------------------------------------------------------------------------
async function runBench({
   title,
   port,
   path: urlPath,
   method = 'GET',
   headers = {},
   body,
   concurrency = 10,
   totalRequests = 200,
   thresholds = {}, // { p99: ms, rps: min, errors: max }
}) {
   const results = [];
   let inflight = 0;
   let sent = 0;
   const startAll = Date.now();

   await new Promise((resolve) => {
      function next() {
         while (inflight < concurrency && sent < totalRequests) {
            inflight++;
            sent++;
            fireRequest({ hostname: '127.0.0.1', port, path: urlPath, method, headers, body }).then((r) => {
               results.push(r);
               inflight--;
               if (results.length === totalRequests) return resolve();
               next();
            });
         }
      }
      next();
   });

   const totalMs = Date.now() - startAll;
   const durations = results.map((r) => r.durationMs).sort((a, b) => a - b);
   const errors = results.filter((r) => r.error || r.statusCode === 0 || r.statusCode >= 500).length;
   const p50 = durations[Math.floor(durations.length * 0.5)];
   const p99 = durations[Math.floor(durations.length * 0.99)];
   const rps = Math.round((totalRequests / totalMs) * 1000);

   console.log(`\n--- ${title} ---`);
   console.log(`  total requests : ${totalRequests}`);
   console.log(`  concurrency    : ${concurrency}`);
   console.log(`  total time     : ${totalMs}ms`);
   console.log(`  requests/sec   : ${rps}`);
   console.log(`  latency p50    : ${p50}ms`);
   console.log(`  latency p99    : ${p99}ms`);
   console.log(`  errors (5xx/net): ${errors}`);

   const failures = [];
   if (thresholds.p99 !== undefined && p99 > thresholds.p99) {
      failures.push(`p99 latency ${p99}ms exceeds threshold ${thresholds.p99}ms`);
   }
   if (thresholds.rps !== undefined && rps < thresholds.rps) {
      failures.push(`throughput ${rps} req/s below threshold ${thresholds.rps} req/s`);
   }
   if (thresholds.errors !== undefined && errors > thresholds.errors) {
      failures.push(`errors ${errors} exceeds threshold ${thresholds.errors}`);
   }

   return { p50, p99, rps, errors, failures };
}

module.exports = { buildApp, startServer, stopServer, runBench };
