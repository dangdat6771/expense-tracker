const express = require("express");
const { getStats } = require("../controllers/stats.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", authenticateToken, getStats);

module.exports = router;
