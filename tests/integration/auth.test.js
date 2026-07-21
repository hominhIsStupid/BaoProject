/**
 * Integration tests: Auth API (/api/auth)
 *
 * Covers: register, login, GET /me, PUT /me, change-password
 */

const request = require('supertest');
const { buildApp, setupTestDb, teardownTestDb, closePool } = require('./setup');

let app;

beforeAll(async () => {
   await setupTestDb();
   app = buildApp();
});

afterAll(async () => {
   await teardownTestDb();
   await closePool();
});

// ---------------------------------------------------------------------------
// POST /api/auth/register
// ---------------------------------------------------------------------------
describe('POST /api/auth/register', () => {
   const validUser = {
      email: 'newuser@test.com',
      password: 'password123',
      fullName: 'New User',
   };

   it('201 – creates a new user and returns a token', async () => {
      const res = await request(app).post('/api/auth/register').send(validUser);

      expect(res.status).toBe(201);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(validUser.email);
      expect(res.body.user.role).toBe('guest');
   });

   it('409 – returns conflict when email already exists', async () => {
      const res = await request(app).post('/api/auth/register').send(validUser);
      expect(res.status).toBe(409);
      expect(res.body.message).toMatch(/already registered/i);
   });

   it('400 – missing required fields', async () => {
      const res = await request(app).post('/api/auth/register').send({ email: 'incomplete@test.com' });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/missing required/i);
   });
});

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------
describe('POST /api/auth/login', () => {
   const creds = { email: 'newuser@test.com', password: 'password123' };

   it('200 – returns token on valid credentials', async () => {
      const res = await request(app).post('/api/auth/login').send(creds);
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(creds.email);
   });

   it('401 – wrong password', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: creds.email, password: 'wrongpass' });
      expect(res.status).toBe(401);
   });

   it('401 – non-existent user', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: 'nobody@test.com', password: 'x' });
      expect(res.status).toBe(401);
   });

   it('400 – missing credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: creds.email });
      expect(res.status).toBe(400);
   });
});

// ---------------------------------------------------------------------------
// GET /api/auth/me
// ---------------------------------------------------------------------------
describe('GET /api/auth/me', () => {
   let token;

   beforeAll(async () => {
      const res = await request(app)
         .post('/api/auth/login')
         .send({ email: 'newuser@test.com', password: 'password123' });
      token = res.body.token;
   });

   it('200 – returns current user when authenticated', async () => {
      const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.email).toBe('newuser@test.com');
   });

   it('401 – rejects request without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
   });

   it('401 – rejects request with invalid token', async () => {
      const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer invalid.token.here');
      expect(res.status).toBe(401);
   });
});

// ---------------------------------------------------------------------------
// PUT /api/auth/me
// ---------------------------------------------------------------------------
describe('PUT /api/auth/me', () => {
   let token;

   beforeAll(async () => {
      const res = await request(app)
         .post('/api/auth/login')
         .send({ email: 'newuser@test.com', password: 'password123' });
      token = res.body.token;
   });

   it('200 – updates profile fields', async () => {
      const res = await request(app)
         .put('/api/auth/me')
         .set('Authorization', `Bearer ${token}`)
         .send({ fullName: 'Updated Name', bio: 'My bio' });
      expect(res.status).toBe(200);
      expect(res.body.user.fullName).toBe('Updated Name');
   });
});

// ---------------------------------------------------------------------------
// PUT /api/auth/change-password
// ---------------------------------------------------------------------------
describe('PUT /api/auth/change-password', () => {
   let token;

   beforeAll(async () => {
      // Register a fresh user for password tests
      await request(app).post('/api/auth/register').send({
         email: 'pwchange@test.com',
         password: 'oldpassword',
         fullName: 'PW Tester',
      });
      const res = await request(app)
         .post('/api/auth/login')
         .send({ email: 'pwchange@test.com', password: 'oldpassword' });
      token = res.body.token;
   });

   it('400 – wrong current password', async () => {
      const res = await request(app)
         .put('/api/auth/change-password')
         .set('Authorization', `Bearer ${token}`)
         .send({ currentPassword: 'wrongpassword', newPassword: 'newpass123' });
      expect(res.status).toBe(400);
   });

   it('200 – changes password successfully', async () => {
      const res = await request(app)
         .put('/api/auth/change-password')
         .set('Authorization', `Bearer ${token}`)
         .send({ currentPassword: 'oldpassword', newPassword: 'newpass123' });
      expect(res.status).toBe(200);

      // Verify new password works
      const loginRes = await request(app)
         .post('/api/auth/login')
         .send({ email: 'pwchange@test.com', password: 'newpass123' });
      expect(loginRes.status).toBe(200);
   });
});
