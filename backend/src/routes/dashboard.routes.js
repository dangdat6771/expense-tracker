const express = require("express");
const { getDashboard } = require("../controllers/dashboard.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", authenticateToken, getDashboard);

module.exports = router;
