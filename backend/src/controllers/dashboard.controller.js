const pool = require("../db");

// GET /dashboard
async function getDashboard(req, res, next) {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT
         COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) AS total_income,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense
       FROM transactions
       WHERE user_id = $1`,
      [userId]
    );

    const { total_income, total_expense } = result.rows[0];
    const balance = parseFloat(total_income) - parseFloat(total_expense);

    return res.json({
      balance,
      totalIncome: parseFloat(total_income),
      totalExpense: parseFloat(total_expense),
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getDashboard };
