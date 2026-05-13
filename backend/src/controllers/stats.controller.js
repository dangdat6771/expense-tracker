const pool = require("../db");

/**
 * GET /stats
 * Returns statistics with optional filters by category, type, and month
 * Query params: month (YYYY-MM), category_id, type (income/expense)
 */
async function getStats(req, res, next) {
  try {
    const userId = req.user.userId;
    const { month, category_id, type } = req.query;

    // Build filter conditions
    let transactionFilters = "t.user_id = $1";
    let params = [userId];
    let paramIndex = 2;

    if (month) {
      const [year, monthNum] = month.split("-");
      transactionFilters += ` AND EXTRACT(YEAR FROM t.created_at) = $${paramIndex} AND EXTRACT(MONTH FROM t.created_at) = $${paramIndex + 1}`;
      params.push(year, monthNum);
      paramIndex += 2;
    }

    if (category_id) {
      transactionFilters += ` AND t.category_id = $${paramIndex}`;
      params.push(category_id);
      paramIndex += 1;
    }

    if (type && (type === "income" || type === "expense")) {
      transactionFilters += ` AND t.type = $${paramIndex}`;
      params.push(type);
      paramIndex += 1;
    }

    // Get summary statistics
    const statsQuery = `
      SELECT
        COALESCE(SUM(CASE WHEN t.type = 'income'  THEN t.amount ELSE 0 END), 0) AS total_income,
        COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS total_expense,
        COUNT(*) AS total_transactions
      FROM transactions t
      WHERE ${transactionFilters}
    `;

    const statsResult = await pool.query(statsQuery, params);
    const { total_income, total_expense, total_transactions } =
      statsResult.rows[0];
    const balance = parseFloat(total_income) - parseFloat(total_expense);

    // Get expenses by category
    const categoryQuery = `
      SELECT 
        c.id,
        c.name,
        c.color,
        c.icon,
        COALESCE(SUM(t.amount), 0) AS amount,
        COUNT(t.id) AS count
      FROM categories c
      LEFT JOIN transactions t ON c.id = t.category_id AND ${transactionFilters}
      WHERE c.user_id = $1 AND c.type = 'expense'
      GROUP BY c.id, c.name, c.color, c.icon
      ORDER BY amount DESC
    `;

    const categoryResult = await pool.query(categoryQuery, params);

    // Get income by category
    const incomeQuery = `
      SELECT 
        c.id,
        c.name,
        c.color,
        c.icon,
        COALESCE(SUM(t.amount), 0) AS amount,
        COUNT(t.id) AS count
      FROM categories c
      LEFT JOIN transactions t ON c.id = t.category_id AND ${transactionFilters}
      WHERE c.user_id = $1 AND c.type = 'income'
      GROUP BY c.id, c.name, c.color, c.icon
      ORDER BY amount DESC
    `;

    const incomeResult = await pool.query(incomeQuery, params);

    // Get monthly trends (last 12 months)
    const trendsQuery = `
      SELECT 
        EXTRACT(YEAR FROM t.created_at)::integer AS year,
        EXTRACT(MONTH FROM t.created_at)::integer AS month,
        TO_CHAR(t.created_at, 'Mon') AS month_name,
        COALESCE(SUM(CASE WHEN t.type = 'income'  THEN t.amount ELSE 0 END), 0) AS income,
        COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS expense
      FROM transactions t
      WHERE t.user_id = $1
      GROUP BY EXTRACT(YEAR FROM t.created_at), EXTRACT(MONTH FROM t.created_at), TO_CHAR(t.created_at, 'Mon')
      ORDER BY year DESC, month DESC
      LIMIT 12
    `;

    const trendsResult = await pool.query(trendsQuery, [userId]);

    // Get daily transactions (last 7 days for quick view)
    const dailyQuery = `
      SELECT 
        t.created_at,
        COALESCE(SUM(CASE WHEN t.type = 'income'  THEN t.amount ELSE 0 END), 0) AS income,
        COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS expense
      FROM transactions t
      WHERE t.user_id = $1 AND t.created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY t.created_at
      ORDER BY t.created_at DESC
    `;

    const dailyResult = await pool.query(dailyQuery, [userId]);

    return res.json({
      summary: {
        total_income: parseFloat(total_income),
        total_expense: parseFloat(total_expense),
        balance: parseFloat(balance),
        total_transactions: parseInt(total_transactions),
      },
      expenses_by_category: categoryResult.rows.map((row) => ({
        ...row,
        amount: parseFloat(row.amount),
      })),
      income_by_category: incomeResult.rows.map((row) => ({
        ...row,
        amount: parseFloat(row.amount),
      })),
      monthly_trends: trendsResult.rows.map((row) => ({
        ...row,
        income: parseFloat(row.income),
        expense: parseFloat(row.expense),
      })),
      daily_summary: dailyResult.rows.map((row) => ({
        ...row,
        income: parseFloat(row.income),
        expense: parseFloat(row.expense),
      })),
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getStats };
