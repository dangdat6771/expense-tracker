/**
 * Unit tests for frontend api.js module.
 * localStorage / sessionStorage are provided by jsdom.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock axios.create to return a controllable instance
const mockInterceptorsUse = vi.fn();
const mockAxiosInstance = {
  defaults: { baseURL: "http://localhost:3000/api" },
  interceptors: { request: { use: mockInterceptorsUse } },
  get: vi.fn(),
  post: vi.fn(),
};

vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => mockAxiosInstance),
  },
}));

import axios from "axios";

describe("api.js – axios instance", () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    sessionStorage.clear();
  });

  it("should create an axios instance with the correct baseURL", async () => {
    await import("../api.js");
    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: expect.stringContaining("localhost"),
      })
    );
  });

  it("should register a request interceptor", async () => {
    await import("../api.js");
    expect(mockInterceptorsUse).toHaveBeenCalled();
  });

  it("interceptor should attach Bearer token from localStorage when present", () => {
    localStorage.setItem("token", "my-jwt-token");
    const interceptorFn = mockInterceptorsUse.mock.calls[0]?.[0];
    if (interceptorFn) {
      const config = { headers: {} };
      const result = interceptorFn(config);
      expect(result.headers.Authorization).toBe("Bearer my-jwt-token");
    }
  });

  it("interceptor should not attach Authorization when no token exists", () => {
    const interceptorFn = mockInterceptorsUse.mock.calls[0]?.[0];
    if (interceptorFn) {
      const config = { headers: {} };
      const result = interceptorFn(config);
      expect(result.headers.Authorization).toBeUndefined();
    }
  });
});
