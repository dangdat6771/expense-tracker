const express = require("express");
const {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
} = require("../controllers/transactions.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", authenticateToken, createTransaction);
router.get("/", authenticateToken, getTransactions);
router.put("/:id", authenticateToken, updateTransaction);
router.delete("/:id", authenticateToken, deleteTransaction);

module.exports = router;
