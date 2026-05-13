/**
 * Unit tests for services.js (categoryApi, dashboardApi)
 * The `api` axios instance is mocked.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the api module entirely
vi.mock("../api.js", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from "../api.js";
import { categoryApi, dashboardApi } from "../services.js";

describe("categoryApi", () => {
  beforeEach(() => vi.clearAllMocks());

  it("getAll should call GET /categories", () => {
    categoryApi.getAll();
    expect(api.get).toHaveBeenCalledWith("/categories");
  });

  it("create should call POST /categories with data", () => {
    const data = { name: "Food", type: "expense" };
    categoryApi.create(data);
    expect(api.post).toHaveBeenCalledWith("/categories", data);
  });

  it("update should call PUT /categories/:id with data", () => {
    const data = { name: "Groceries" };
    categoryApi.update(5, data);
    expect(api.put).toHaveBeenCalledWith("/categories/5", data);
  });

  it("remove should call DELETE /categories/:id", () => {
    categoryApi.remove(3);
    expect(api.delete).toHaveBeenCalledWith("/categories/3");
  });
});

describe("dashboardApi", () => {
  beforeEach(() => vi.clearAllMocks());

  it("get should call GET /dashboard", () => {
    dashboardApi.get();
    expect(api.get).toHaveBeenCalledWith("/dashboard");
  });
});
