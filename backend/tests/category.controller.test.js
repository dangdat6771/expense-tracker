/**
 * Unit tests for category.controller.js
 * DB pool is fully mocked — no real Postgres needed.
 */
jest.mock("../src/db", () => ({ query: jest.fn() }));
const pool = require("../src/db");

const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../src/controllers/category.controller");

function buildRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

const FAKE_CATEGORY = {
  id: 1,
  name: "Food",
  type: "expense",
  color: "#6366f1",
  icon: "🍔",
  created_at: new Date(),
};

// ── getCategories ─────────────────────────────────────────────────────────────
describe("getCategories", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should return list of categories for the authenticated user", async () => {
    pool.query.mockResolvedValueOnce({ rows: [FAKE_CATEGORY] });

    const req = { user: { userId: 1 } };
    const res = buildRes();

    await getCategories(req, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith({ categories: [FAKE_CATEGORY] });
  });

  it("should call next(error) when DB throws", async () => {
    pool.query.mockRejectedValueOnce(new Error("DB error"));

    const req = { user: { userId: 1 } };
    const res = buildRes();
    const next = jest.fn();

    await getCategories(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

// ── createCategory ────────────────────────────────────────────────────────────
describe("createCategory", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should return 400 when name is empty", async () => {
    const req = { user: { userId: 1 }, body: { name: "", type: "expense" } };
    const res = buildRes();

    await createCategory(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Category name is required" });
  });

  it("should return 400 when type is invalid", async () => {
    const req = { user: { userId: 1 }, body: { name: "Food", type: "other" } };
    const res = buildRes();

    await createCategory(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Type must be 'income' or 'expense'" });
  });

  it("should return 409 when category already exists", async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1 }] });

    const req = { user: { userId: 1 }, body: { name: "Food", type: "expense" } };
    const res = buildRes();

    await createCategory(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ message: "Category already exists" });
  });

  it("should return 201 on successful creation", async () => {
    pool.query
      .mockResolvedValueOnce({ rowCount: 0, rows: [] }) // duplicate check
      .mockResolvedValueOnce({ rowCount: 1, rows: [FAKE_CATEGORY] }); // insert

    const req = { user: { userId: 1 }, body: { name: "Food", type: "expense" } };
    const res = buildRes();

    await createCategory(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(201);
    const jsonArg = res.json.mock.calls[0][0];
    expect(jsonArg).toHaveProperty("message", "Category created successfully");
    expect(jsonArg.category).toMatchObject({ name: "Food" });
  });
});

// ── updateCategory ────────────────────────────────────────────────────────────
describe("updateCategory", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should return 400 for non-numeric category id", async () => {
    const req = { user: { userId: 1 }, params: { id: "abc" }, body: { name: "Food", type: "expense" } };
    const res = buildRes();

    await updateCategory(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid category id" });
  });

  it("should return 400 when name is missing", async () => {
    const req = { user: { userId: 1 }, params: { id: "1" }, body: { name: "", type: "expense" } };
    const res = buildRes();

    await updateCategory(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should return 404 when category not found for user", async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

    const req = {
      user: { userId: 1 },
      params: { id: "99" },
      body: { name: "Food", type: "expense" },
    };
    const res = buildRes();

    await updateCategory(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Category not found" });
  });

  it("should return updated category on success", async () => {
    pool.query
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1 }] }) // exists check
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ ...FAKE_CATEGORY, name: "Groceries" }] }); // update

    const req = {
      user: { userId: 1 },
      params: { id: "1" },
      body: { name: "Groceries", type: "expense" },
    };
    const res = buildRes();

    await updateCategory(req, res, jest.fn());

    const jsonArg = res.json.mock.calls[0][0];
    expect(jsonArg).toHaveProperty("message", "Category updated successfully");
    expect(jsonArg.category.name).toBe("Groceries");
  });
});

// ── deleteCategory ────────────────────────────────────────────────────────────
describe("deleteCategory", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should return 400 for non-numeric id", async () => {
    const req = { user: { userId: 1 }, params: { id: "abc" } };
    const res = buildRes();

    await deleteCategory(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should return 404 when category not found", async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

    const req = { user: { userId: 1 }, params: { id: "99" } };
    const res = buildRes();

    await deleteCategory(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("should return success message on deletion", async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1 }] });

    const req = { user: { userId: 1 }, params: { id: "1" } };
    const res = buildRes();

    await deleteCategory(req, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith({ message: "Category deleted successfully" });
  });
});
