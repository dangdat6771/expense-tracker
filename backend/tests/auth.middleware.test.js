const jwt = require("jsonwebtoken");
const { authenticateToken } = require("../src/middleware/auth.middleware");

const JWT_SECRET = "expense_tracker_dev_secret";

function buildMockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("authenticateToken middleware", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = JWT_SECRET;
  });

  it("should call next() with a valid Bearer token", () => {
    const payload = { userId: 1, email: "test@example.com" };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = buildMockRes();
    const next = jest.fn();

    authenticateToken(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toMatchObject({ userId: 1, email: "test@example.com" });
  });

  it("should return 401 when no Authorization header is present", () => {
    const req = { headers: {} };
    const res = buildMockRes();
    const next = jest.fn();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Access token is required" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 when Authorization header is not Bearer", () => {
    const req = { headers: { authorization: "Basic sometoken" } };
    const res = buildMockRes();
    const next = jest.fn();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Access token is required" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 when token is expired", () => {
    const payload = { userId: 1, email: "test@example.com" };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "-1s" });

    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = buildMockRes();
    const next = jest.fn();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Access token is invalid" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 when token is signed with wrong secret", () => {
    const payload = { userId: 1, email: "test@example.com" };
    const token = jwt.sign(payload, "wrong_secret", { expiresIn: "1h" });

    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = buildMockRes();
    const next = jest.fn();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Access token is invalid" });
    expect(next).not.toHaveBeenCalled();
  });
});
