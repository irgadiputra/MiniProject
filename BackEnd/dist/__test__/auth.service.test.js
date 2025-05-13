"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = require("../src/index");
const prisma_1 = __importDefault(require("../src/lib/prisma"));
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
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield prisma_1.default.user.deleteMany({
            where: { email: testEmail }
        });
        yield prisma_1.default.$disconnect();
    }));
    it('should register a user successfully', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.app)
            .post('/auth/register')
            .send(register);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toMatch("Register Berhasil");
        const userInDb = yield prisma_1.default.user.findUnique({
            where: { email: testEmail },
        });
        expect(userInDb).not.toBeNull();
        expect(userInDb === null || userInDb === void 0 ? void 0 : userInDb.email).toBe(testEmail);
    }));
    const login = {
        email: testEmail,
        password: 'StrongPassword123'
    };
    it('should login that registered user', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.app)
            .post('/auth/login')
            .send(login);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toMatch("Login Berhasil");
        expect(response === null || response === void 0 ? void 0 : response.body.user.email).toBe(testEmail);
        expect(response.headers['set-cookie']).toBeDefined();
        expect(response.headers['set-cookie'][0]).toContain('access_token=');
        const cookie = response.headers['set-cookie'];
        const rawCookie = Array.isArray(cookie) ? cookie.find(c => c.startsWith('access_token=')) : cookie;
        token = rawCookie === null || rawCookie === void 0 ? void 0 : rawCookie.split(';')[0].split('=')[1];
        expect(token).toBeDefined();
    }));
    it('should fail with wrong password', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.app)
            .post('/auth/login')
            .send({
            email: testEmail,
            password: 'WrongPassword123',
        });
        expect(response.status).toBe(500);
    }));
    it('should fail with wrong email', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.app)
            .post('/auth/login')
            .send({
            email: testEmail + ".com",
            password: 'StrongPassword123',
        });
        expect(response.status).toBe(500);
    }));
    it('try relogin with token', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.app)
            .post('/auth/relogin')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message', 'ReLogin Berhasil');
        expect(res.body).toHaveProperty('user');
        expect(res.headers['set-cookie']).toBeDefined();
    }));
    it('should fail if no token is provided', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.app).post('/auth/relogin');
        expect(res.status).toBe(500);
    }));
    it('should fail if token is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.app)
            .post('/auth/relogin')
            .set('Authorization', 'Bearer INVALIDTOKEN');
        expect(res.status).toBe(500);
    }));
});
