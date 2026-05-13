const pool = require("../db");

// GET /categories
async function getCategories(req, res, next) {
  try {
    const userId = req.user.userId;
    const result = await pool.query(
      `SELECT id, name, type, color, icon, created_at
       FROM categories
       WHERE user_id = $1
       ORDER BY created_at ASC`,
      [userId]
    );
    return res.json({ categories: result.rows });
  } catch (error) {
    return next(error);
  }
}

// POST /categories
async function createCategory(req, res, next) {
  try {
    const userId = req.user.userId;
    const name = String(req.body.name || "").trim();
    const type = String(req.body.type || "").trim();
    const color = String(req.body.color || "#6366f1").trim();
    const icon = String(req.body.icon || "📁").trim();

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({ message: "Type must be 'income' or 'expense'" });
    }

    // Check duplicate name for same user & type
    const existing = await pool.query(
      "SELECT id FROM categories WHERE user_id = $1 AND name = $2 AND type = $3",
      [userId, name, type]
    );
    if (existing.rowCount > 0) {
      return res.status(409).json({ message: "Category already exists" });
    }

    const result = await pool.query(
      `INSERT INTO categories (user_id, name, type, color, icon)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, type, color, icon, created_at`,
      [userId, name, type, color, icon]
    );

    return res.status(201).json({
      message: "Category created successfully",
      category: result.rows[0],
    });
  } catch (error) {
    return next(error);
  }
}

// PUT /categories/:id
async function updateCategory(req, res, next) {
  try {
    const userId = req.user.userId;
    const categoryId = parseInt(req.params.id, 10);

    if (!categoryId || isNaN(categoryId)) {
      return res.status(400).json({ message: "Invalid category id" });
    }

    const name = String(req.body.name || "").trim();
    const type = String(req.body.type || "").trim();
    const color = String(req.body.color || "").trim();
    const icon = String(req.body.icon || "").trim();

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({ message: "Type must be 'income' or 'expense'" });
    }

    // Ensure category belongs to this user
    const existing = await pool.query(
      "SELECT id FROM categories WHERE id = $1 AND user_id = $2",
      [categoryId, userId]
    );
    if (existing.rowCount === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    const result = await pool.query(
      `UPDATE categories
       SET name = $1, type = $2, color = $3, icon = $4
       WHERE id = $5 AND user_id = $6
       RETURNING id, name, type, color, icon, created_at`,
      [name, type, color || "#6366f1", icon || "📁", categoryId, userId]
    );

    return res.json({
      message: "Category updated successfully",
      category: result.rows[0],
    });
  } catch (error) {
    return next(error);
  }
}

// DELETE /categories/:id
async function deleteCategory(req, res, next) {
  try {
    const userId = req.user.userId;
    const categoryId = parseInt(req.params.id, 10);

    if (!categoryId || isNaN(categoryId)) {
      return res.status(400).json({ message: "Invalid category id" });
    }

    const result = await pool.query(
      "DELETE FROM categories WHERE id = $1 AND user_id = $2 RETURNING id",
      [categoryId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.json({ message: "Category deleted successfully" });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
