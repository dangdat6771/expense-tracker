/**
 * Unit tests for transactions.controller.js
 * DB pool is fully mocked — no real Postgres needed.
 */
jest.mock("../src/db", () => ({ query: jest.fn() }));
const pool = require("../src/db");

const {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
} = require("../src/controllers/transactions.controller");

function buildRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

const FAKE_TX = {
  id: 1,
  user_id: 1,
  category_id: 2,
  type: "expense",
  amount: 150000,
  note: "Lunch",
  transaction_date: "2024-05-01",
  created_at: new Date(),
};

// ── createTransaction ─────────────────────────────────────────────────────────
describe("createTransaction", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should return 400 when required fields are missing", async () => {
    const req = { user: { userId: 1 }, body: {} };
    const res = buildRes();

    await createTransaction(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "category_id, type, amount, and transaction_date are required",
    });
  });

  it("should return 400 when type is not income or expense", async () => {
    const req = {
      user: { userId: 1 },
      body: { category_id: 1, type: "transfer", amount: 100, transaction_date: "2024-01-01" },
    };
    const res = buildRes();

    await createTransaction(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "type must be income or expense" });
  });

  it("should return 400 when category does not belong to user", async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 0, rows: [] }); // category check fails

    const req = {
      user: { userId: 1 },
      body: { category_id: 99, type: "expense", amount: 100, transaction_date: "2024-01-01" },
    };
    const res = buildRes();

    await createTransaction(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid category_id" });
  });

  it("should return 201 on successful creation", async () => {
    pool.query
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 2 }] }) // category exists
      .mockResolvedValueOnce({ rowCount: 1, rows: [FAKE_TX] }); // insert

    const req = {
      user: { userId: 1 },
      body: { category_id: 2, type: "expense", amount: 150000, note: "Lunch", transaction_date: "2024-05-01" },
    };
    const res = buildRes();

    await createTransaction(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(201);
    const jsonArg = res.json.mock.calls[0][0];
    expect(jsonArg).toHaveProperty("message", "Transaction created successfully");
    expect(jsonArg.transaction).toMatchObject({ id: 1, amount: 150000 });
  });

  it("should call next(error) when DB throws", async () => {
    pool.query.mockRejectedValueOnce(new Error("DB error"));

    const req = {
      user: { userId: 1 },
      body: { category_id: 2, type: "expense", amount: 100, transaction_date: "2024-01-01" },
    };
    const res = buildRes();
    const next = jest.fn();

    await createTransaction(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

// ── getTransactions ───────────────────────────────────────────────────────────
describe("getTransactions", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should return paginated list", async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ count: "2" }] }) // count
      .mockResolvedValueOnce({ rows: [FAKE_TX, { ...FAKE_TX, id: 2 }] }); // data

    const req = { user: { userId: 1 }, query: {} };
    const res = buildRes();

    await getTransactions(req, res, jest.fn());

    const jsonArg = res.json.mock.calls[0][0];
    expect(jsonArg).toHaveProperty("data");
    expect(jsonArg).toHaveProperty("meta");
    expect(jsonArg.meta.totalItems).toBe(2);
  });

  it("should handle month filter", async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ count: "1" }] })
      .mockResolvedValueOnce({ rows: [FAKE_TX] });

    const req = { user: { userId: 1 }, query: { month: "2024-05" } };
    const res = buildRes();

    await getTransactions(req, res, jest.fn());

    expect(res.json).toHaveBeenCalled();
    const jsonArg = res.json.mock.calls[0][0];
    expect(jsonArg.data).toHaveLength(1);
  });

  it("should call next(error) when DB throws", async () => {
    pool.query.mockRejectedValueOnce(new Error("DB error"));

    const req = { user: { userId: 1 }, query: {} };
    const res = buildRes();
    const next = jest.fn();

    await getTransactions(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

// ── updateTransaction ─────────────────────────────────────────────────────────
describe("updateTransaction", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should return 404 when transaction not found", async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

    const req = { user: { userId: 1 }, params: { id: "999" }, body: {} };
    const res = buildRes();

    await updateTransaction(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Transaction not found" });
  });

  it("should return 400 when no fields to update", async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1 }] }); // exists

    const req = { user: { userId: 1 }, params: { id: "1" }, body: {} };
    const res = buildRes();

    await updateTransaction(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "No fields to update" });
  });

  it("should return updated transaction on success", async () => {
    pool.query
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1 }] }) // exists check
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ ...FAKE_TX, amount: 200000 }] }); // update

    const req = {
      user: { userId: 1 },
      params: { id: "1" },
      body: { amount: 200000 },
    };
    const res = buildRes();

    await updateTransaction(req, res, jest.fn());

    const jsonArg = res.json.mock.calls[0][0];
    expect(jsonArg).toHaveProperty("message", "Transaction updated successfully");
    expect(jsonArg.transaction.amount).toBe(200000);
  });
});

// ── deleteTransaction ─────────────────────────────────────────────────────────
describe("deleteTransaction", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should return 404 when transaction not found", async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

    const req = { user: { userId: 1 }, params: { id: "999" } };
    const res = buildRes();

    await deleteTransaction(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Transaction not found" });
  });

  it("should return success on deletion", async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1 }] });

    const req = { user: { userId: 1 }, params: { id: "1" } };
    const res = buildRes();

    await deleteTransaction(req, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith({ message: "Transaction deleted successfully" });
  });
});
