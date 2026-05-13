const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SALT_ROUNDS = 10;

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function buildUserResponse(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.created_at,
  };
}

function signToken(user) {
  const jwtSecret = process.env.JWT_SECRET || "expense_tracker_dev_secret";

  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    jwtSecret,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

async function register(req, res, next) {
  try {
    const name = String(req.body.name || "").trim();
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: "Email is invalid" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rowCount > 0) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const createdUser = await pool.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [name, email, hashedPassword]
    );

    const user = createdUser.rows[0];
    const token = signToken(user);

    return res.status(201).json({
      message: "Register successfully",
      user: buildUserResponse(user),
      token,
    });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: "Email is invalid" });
    }

    const userResult = await pool.query(
      "SELECT id, name, email, password, created_at FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rowCount === 0) {
      return res.status(401).json({ message: "Email or password is incorrect" });
    }

    const user = userResult.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Email or password is incorrect" });
    }

    const token = signToken(user);

    return res.json({
      message: "Login successfully",
      user: buildUserResponse(user),
      token,
    });
  } catch (error) {
    return next(error);
  }
}

async function getMe(req, res, next) {
  try {
    const userResult = await pool.query(
      "SELECT id, name, email, created_at FROM users WHERE id = $1",
      [req.user.userId]
    );

    if (userResult.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      user: buildUserResponse(userResult.rows[0]),
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getMe,
  login,
  register,
};
