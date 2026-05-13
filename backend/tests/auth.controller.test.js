/**
 * Unit tests for auth.controller.js
 * All DB calls are mocked via jest.mock so no real database is needed.
 */
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ── Mock the DB pool ─────────────────────────────────────────────────────────
jest.mock("../src/db", () => ({ query: jest.fn() }));
const pool = require("../src/db");

// ── Re-import controller after mocks are in place ───────────────────────────
const { register, login, getMe } = require("../src/controllers/auth.controller");

// ── Helpers ──────────────────────────────────────────────────────────────────
function buildRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

// ── register ─────────────────────────────────────────────────────────────────
describe("register", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test_secret";
  });

  it("should return 400 when required fields are missing", async () => {
    const req = { body: { name: "", email: "", password: "" } };
    const res = buildRes();
    const next = jest.fn();

    await register(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Name, email and password are required",
    });
  });

  it("should return 400 when email format is invalid", async () => {
    const req = { body: { name: "Alice", email: "not-an-email", password: "secret123" } };
    const res = buildRes();
    const next = jest.fn();

    await register(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Email is invalid" });
  });

  it("should return 400 when password is shorter than 6 chars", async () => {
    const req = { body: { name: "Alice", email: "alice@example.com", password: "abc" } };
    const res = buildRes();
    const next = jest.fn();

    await register(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Password must be at least 6 characters",
    });
  });

  it("should return 409 when email already exists", async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 99 }] });

    const req = { body: { name: "Alice", email: "alice@example.com", password: "password123" } };
    const res = buildRes();
    const next = jest.fn();

    await register(req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ message: "Email is already registered" });
  });

  it("should return 201 with token on successful registration", async () => {
    // email-existence check → not found
    pool.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });
    // INSERT → new user
    const fakeUser = { id: 1, name: "Alice", email: "alice@example.com", created_at: new Date() };
    pool.query.mockResolvedValueOnce({ rowCount: 1, rows: [fakeUser] });

    const req = { body: { name: "Alice", email: "alice@example.com", password: "password123" } };
    const res = buildRes();
    const next = jest.fn();

    await register(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    const jsonArg = res.json.mock.calls[0][0];
    expect(jsonArg).toHaveProperty("message", "Register successfully");
    expect(jsonArg).toHaveProperty("token");
    expect(jsonArg.user).toMatchObject({ id: 1, name: "Alice", email: "alice@example.com" });
  });

  it("should call next(error) when DB throws", async () => {
    pool.query.mockRejectedValueOnce(new Error("DB error"));

    const req = { body: { name: "Alice", email: "alice@example.com", password: "password123" } };
    const res = buildRes();
    const next = jest.fn();

    await register(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

// ── login ────────────────────────────────────────────────────────────────────
describe("login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test_secret";
  });

  it("should return 400 when fields are missing", async () => {
    const req = { body: { email: "", password: "" } };
    const res = buildRes();
    await login(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should return 400 when email format is invalid", async () => {
    const req = { body: { email: "bad-email", password: "secret123" } };
    const res = buildRes();
    await login(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Email is invalid" });
  });

  it("should return 401 when user does not exist", async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

    const req = { body: { email: "nobody@example.com", password: "password123" } };
    const res = buildRes();
    await login(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Email or password is incorrect" });
  });

  it("should return 401 when password is wrong", async () => {
    const hashedPw = await bcrypt.hash("correct-password", 10);
    pool.query.mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ id: 1, name: "Alice", email: "alice@example.com", password: hashedPw, created_at: new Date() }],
    });

    const req = { body: { email: "alice@example.com", password: "wrong-password" } };
    const res = buildRes();
    await login(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Email or password is incorrect" });
  });

  it("should return 200 with token on successful login", async () => {
    const plainPassword = "correct-password";
    const hashedPw = await bcrypt.hash(plainPassword, 10);
    pool.query.mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ id: 1, name: "Alice", email: "alice@example.com", password: hashedPw, created_at: new Date() }],
    });

    const req = { body: { email: "alice@example.com", password: plainPassword } };
    const res = buildRes();
    await login(req, res, jest.fn());

    expect(res.status).not.toHaveBeenCalledWith(401);
    const jsonArg = res.json.mock.calls[0][0];
    expect(jsonArg).toHaveProperty("message", "Login successfully");
    expect(jsonArg).toHaveProperty("token");
  });
});

// ── getMe ────────────────────────────────────────────────────────────────────
describe("getMe", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should return 404 when user does not exist in DB", async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

    const req = { user: { userId: 999 } };
    const res = buildRes();
    await getMe(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should return user data when found", async () => {
    const fakeUser = { id: 1, name: "Alice", email: "alice@example.com", created_at: new Date() };
    pool.query.mockResolvedValueOnce({ rowCount: 1, rows: [fakeUser] });

    const req = { user: { userId: 1 } };
    const res = buildRes();
    await getMe(req, res, jest.fn());

    const jsonArg = res.json.mock.calls[0][0];
    expect(jsonArg.user).toMatchObject({ id: 1, name: "Alice", email: "alice@example.com" });
  });
});
