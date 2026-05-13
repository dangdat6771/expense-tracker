const express = require("express");
const { getMe, login, register } = require("../controllers/auth.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/me", authenticateToken, getMe);
router.post("/login", login);
router.post("/register", register);

module.exports = router;
