import request from 'supertest';
import { app } from '../src/index';
import prisma from '../src/lib/prisma';

describe('auth', () => {
  const testEmail = 'irgajudi@gmail.com';
  let token = "";

  const register = {
    first_name: 'Test',
    last_name: 'User',
    email: testEmail,
    password: 'StrongPassword123',
    status_role: 'organiser'
  };

  afterEach(async () => {

  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: testEmail }
    });
    await prisma.$disconnect();
  });

  it('should register a user successfully', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send(register);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toMatch("Register Berhasil");

    const userInDb = await prisma.user.findUnique({
      where: { email: testEmail },
    });

    expect(userInDb).not.toBeNull();
    expect(userInDb?.email).toBe(testEmail);
  });

  const login = {
    email: testEmail,
    password: 'StrongPassword123'
  }
  it('should login that registered user', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send(login);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toMatch("Login Berhasil");
    expect(response?.body.user.email).toBe(testEmail);
    expect(response.headers['set-cookie']).toBeDefined();
    expect(response.headers['set-cookie'][0]).toContain('access_token=');
    
    const cookie = response.headers['set-cookie'];
    const rawCookie = Array.isArray(cookie) ? cookie.find(c => c.startsWith('access_token=')) : cookie;
    token = rawCookie?.split(';')[0].split('=')[1];
    expect(token).toBeDefined();
  });

  it('should fail with wrong password', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: testEmail,
        password: 'WrongPassword123',
      });

    expect(response.status).toBe(500);
  });

  it('should fail with wrong email', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: testEmail + ".com",
        password: 'StrongPassword123',
      });

    expect(response.status).toBe(500);

  });

  it('try relogin with token', async () => {
    const res = await request(app)
    .post('/auth/relogin')
    .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'ReLogin Berhasil');
    expect(res.body).toHaveProperty('user');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should fail if no token is provided', async () => {
    const res = await request(app).post('/auth/relogin');
    expect(res.status).toBe(500);
  });

  it('should fail if token is invalid', async () => {
    const res = await request(app)
      .post('/auth/relogin')
      .set('Authorization', 'Bearer INVALIDTOKEN');
    expect(res.status).toBe(500);
  });

});
