const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server');

describe('MediKing Core API Tests (Phase 1)', () => {
  let adminToken;
  let pharmacistToken;

  beforeAll(async () => {
    // Wait for DB connection
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mediking');
    }
    // Clean up test records
    await mongoose.model('Patient').deleteMany({ phone: '9849998811' });
    await mongoose.model('MedicineMaster').deleteMany({ mdCode: 99001 });
  });

  afterAll(async () => {
    // Clean up test records
    await mongoose.model('Patient').deleteMany({ phone: '9849998811' });
    await mongoose.model('MedicineMaster').deleteMany({ mdCode: 99001 });
    await mongoose.connection.close();
  });

  test('GET /api/health should return UP status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('UP');
    expect(res.body.system).toContain('MediKing');
  });

  test('POST /api/auth/login should authenticate super_admin and return token', async () => {
    const res = await request(app).post('/api/auth/login').send({
      usernameOrEmail: 'admin@mediking.com',
      password: 'admin123',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('super_admin');
    adminToken = res.body.token;
  });

  test('POST /api/auth/login should authenticate pharmacist', async () => {
    const res = await request(app).post('/api/auth/login').send({
      usernameOrEmail: 'pharmacist@mediking.com',
      password: 'pharma123',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('pharmacist');
    pharmacistToken = res.body.token;
  });

  test('POST /api/auth/login with wrong password should fail', async () => {
    const res = await request(app).post('/api/auth/login').send({
      usernameOrEmail: 'admin@mediking.com',
      password: 'wrongpassword',
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/auth/me should return current user with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe('admin@mediking.com');
  });

  test('GET /api/dashboard should return real database metrics for authenticated user', async () => {
    const res = await request(app)
      .get('/api/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.summary).toBeDefined();
    expect(res.body.data.summary.totalPatients).toBeGreaterThan(0);
    expect(res.body.data.summary.opdSummary.total).toBeGreaterThan(0);
    expect(res.body.data.summary.pharmacy.todayRevenue).toBeGreaterThan(0);
    expect(res.body.data.activeOpdQueue.length).toBeGreaterThan(0);
  });

  test('GET /api/dashboard without token should return 401 Unauthorized', async () => {
    const res = await request(app).get('/api/dashboard');
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/branches should list branches', async () => {
    const res = await request(app)
      .get('/api/branches')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  test('POST /api/patients should register a new patient and generate MRN', async () => {
    const newPatientData = {
      fullName: 'Suresh Kumar Adhikari',
      age: 42,
      gender: 'Male',
      phone: '9849998811',
      address: { street: 'Koteshwor', city: 'Kathmandu' },
      bloodGroup: 'O+',
      allergies: ['Dust'],
    };

    const res = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newPatientData);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.mrn).toMatch(/^MK-2026-\d{5}$/);
    expect(res.body.data.fullName).toBe('Suresh Kumar Adhikari');
  });

  test('POST /api/patients with duplicate phone and name should return 409 warning', async () => {
    const duplicateData = {
      fullName: 'Suresh Kumar Adhikari',
      age: 42,
      gender: 'Male',
      phone: '9849998811',
    };

    const res = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(duplicateData);

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Duplicate Patient Warning');
  });

  test('GET /api/products should return standard medicines list', async () => {
    const res = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(20);
    const pantop = res.body.data.find((p) => p.mdCode === 10519);
    expect(pantop).toBeDefined();
    expect(pantop.brandName).toBe('PANTOP-40MG');
  });

  test('POST /api/products should create a new product', async () => {
    const newProduct = {
      mdCode: 99001,
      brandName: 'TEST-MEDICINE-500MG',
      companyCode: 999,
      companyName: 'TEST PHARMACEUTICALS',
      genericName: 'TEST GENERIC 500MG',
      unit: 'TAB',
      packing: '10X10',
      sPrice: 15.0,
      mrp: 18.0,
      vat: 'N',
      status: 'Active',
    };

    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newProduct);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.brandName).toBe('TEST-MEDICINE-500MG');
  });

  test('PUT /api/products/:id should update product details', async () => {
    const product = await mongoose.model('MedicineMaster').findOne({ mdCode: 99001 });
    const res = await request(app)
      .put(`/api/products/${product._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ sPrice: 20.0, mrp: 25.0 });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.sPrice).toBe(20.0);
  });

  test('PATCH /api/products/:id/toggle-status should toggle active/inactive', async () => {
    const product = await mongoose.model('MedicineMaster').findOne({ mdCode: 99001 });
    const res = await request(app)
      .patch(`/api/products/${product._id}/toggle-status`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('Inactive');
  });

  test('GET /api/companies should return list of pharmaceutical companies', async () => {
    const res = await request(app)
      .get('/api/companies')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(10);
  });

  test('GET /api/purchases should return purchase records', async () => {
    const res = await request(app)
      .get('/api/purchases')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
  });

  test('GET /api/purchases/next-mrn should return next sequential MRN', async () => {
    const res = await request(app)
      .get('/api/purchases/next-mrn')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.nextMrn).toMatch(/^FAPU\d{7}$/);
  });
});
