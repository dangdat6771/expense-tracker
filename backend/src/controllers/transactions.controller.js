const pool = require("../db");

async function createTransaction(req, res, next) {
  try {
    const userId = req.user.userId;
    const { category_id, type, amount, note, transaction_date } = req.body;

    if (!category_id || !type || !amount || !transaction_date) {
      return res.status(400).json({
        message: "category_id, type, amount, and transaction_date are required",
      });
    }

    if (type !== "income" && type !== "expense") {
      return res.status(400).json({ message: "type must be income or expense" });
    }

    // Verify category exists and belongs to user
    const categoryCheck = await pool.query(
      "SELECT id FROM categories WHERE id = $1 AND user_id = $2",
      [category_id, userId]
    );

    if (categoryCheck.rowCount === 0) {
      return res.status(400).json({ message: "Invalid category_id" });
    }

    const createdTx = await pool.query(
      `INSERT INTO transactions (user_id, category_id, type, amount, note, transaction_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, user_id, category_id, type, amount, note, transaction_date, created_at`,
      [userId, category_id, type, amount, note || "", transaction_date]
    );

    return res.status(201).json({
      message: "Transaction created successfully",
      transaction: createdTx.rows[0],
    });
  } catch (error) {
    return next(error);
  }
}

async function getTransactions(req, res, next) {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, month, category_id, type, sortBy = "transaction_date", sortOrder = "desc" } = req.query;

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const parsedLimit = parseInt(limit, 10);

    let queryParams = [userId];
    let whereClauses = ["user_id = $1"];
    let paramIndex = 2;

    if (month) {
      // Assuming month format is 'YYYY-MM'
      const [y, m] = month.split("-");
      whereClauses.push(`EXTRACT(YEAR FROM transaction_date) = $${paramIndex++} AND EXTRACT(MONTH FROM transaction_date) = $${paramIndex++}`);
      queryParams.push(y, m);
    }

    if (category_id) {
      whereClauses.push(`category_id = $${paramIndex++}`);
      queryParams.push(category_id);
    }

    if (type) {
      whereClauses.push(`type = $${paramIndex++}`);
      queryParams.push(type);
    }

    const whereString = whereClauses.join(" AND ");

    // Handle Sorting Safely
    const allowedSortBy = ["amount", "transaction_date", "created_at"];
    const safeSortBy = allowedSortBy.includes(sortBy) ? sortBy : "transaction_date";
    const safeSortOrder = sortOrder.toLowerCase() === "asc" ? "ASC" : "DESC";

    // Count Total
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM transactions WHERE ${whereString}`,
      queryParams
    );
    const totalItems = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalItems / parsedLimit);

    // Get Data
    const dataQuery = `
      SELECT t.id, t.user_id, t.category_id, c.name as category_name, c.color as category_color, 
             t.type, t.amount, t.note, t.transaction_date, t.created_at
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.${whereString.replace(/(\w+)\s*=/g, "t.$1 =").replace(/EXTRACT\(YEAR FROM transaction_date\)/g, "EXTRACT(YEAR FROM t.transaction_date)").replace(/EXTRACT\(MONTH FROM transaction_date\)/g, "EXTRACT(MONTH FROM t.transaction_date)")}
      ORDER BY t.${safeSortBy} ${safeSortOrder}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    
    // We need to fix the parameter indices for the data query. The replace above might be messy if not careful.
    // Let's rewrite the data query builder simpler.
    
    let dataWhereClauses = ["t.user_id = $1"];
    let dataQueryParams = [userId];
    let dIndex = 2;

    if (month) {
      const [y, m] = month.split("-");
      dataWhereClauses.push(`EXTRACT(YEAR FROM t.transaction_date) = $${dIndex++} AND EXTRACT(MONTH FROM t.transaction_date) = $${dIndex++}`);
      dataQueryParams.push(y, m);
    }

    if (category_id) {
      dataWhereClauses.push(`t.category_id = $${dIndex++}`);
      dataQueryParams.push(category_id);
    }

    if (type) {
      dataWhereClauses.push(`t.type = $${dIndex++}`);
      dataQueryParams.push(type);
    }

    const dataWhereString = dataWhereClauses.join(" AND ");
    dataQueryParams.push(parsedLimit, offset);

    const safeDataQuery = `
      SELECT t.id, t.user_id, t.category_id, c.name as category_name, c.color as category_color, 
             t.type, t.amount, t.note, t.transaction_date, t.created_at
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE ${dataWhereString}
      ORDER BY t.${safeSortBy} ${safeSortOrder}
      LIMIT $${dIndex++} OFFSET $${dIndex++}
    `;

    const txResult = await pool.query(safeDataQuery, dataQueryParams);

    return res.json({
      data: txResult.rows,
      meta: {
        totalItems,
        totalPages,
        currentPage: parseInt(page, 10),
        limit: parsedLimit,
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function updateTransaction(req, res, next) {
  try {
    const userId = req.user.userId;
    const txId = req.params.id;
    const { category_id, type, amount, note, transaction_date } = req.body;

    const existingTx = await pool.query(
      "SELECT id FROM transactions WHERE id = $1 AND user_id = $2",
      [txId, userId]
    );

    if (existingTx.rowCount === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (category_id) {
      const categoryCheck = await pool.query(
        "SELECT id FROM categories WHERE id = $1 AND user_id = $2",
        [category_id, userId]
      );
      if (categoryCheck.rowCount === 0) {
        return res.status(400).json({ message: "Invalid category_id" });
      }
    }

    let updates = [];
    let values = [];
    let vIndex = 1;

    if (category_id) {
      updates.push(`category_id = $${vIndex++}`);
      values.push(category_id);
    }
    if (type) {
      updates.push(`type = $${vIndex++}`);
      values.push(type);
    }
    if (amount) {
      updates.push(`amount = $${vIndex++}`);
      values.push(amount);
    }
    if (note !== undefined) {
      updates.push(`note = $${vIndex++}`);
      values.push(note);
    }
    if (transaction_date) {
      updates.push(`transaction_date = $${vIndex++}`);
      values.push(transaction_date);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    values.push(txId, userId);
    const updateQuery = `
      UPDATE transactions 
      SET ${updates.join(", ")} 
      WHERE id = $${vIndex++} AND user_id = $${vIndex++}
      RETURNING *
    `;

    const updatedTx = await pool.query(updateQuery, values);

    return res.json({
      message: "Transaction updated successfully",
      transaction: updatedTx.rows[0],
    });
  } catch (error) {
    return next(error);
  }
}

async function deleteTransaction(req, res, next) {
  try {
    const userId = req.user.userId;
    const txId = req.params.id;

    const result = await pool.query(
      "DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING id",
      [txId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    return res.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
};
