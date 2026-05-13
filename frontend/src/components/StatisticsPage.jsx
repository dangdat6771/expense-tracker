import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { toast } from "sonner";
import api from "../api";

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
    </div>
  );
}

function EmptyState({ message = "No data available", icon = "📊" }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 p-12">
      <div className="text-4xl mb-3">{icon}</div>
      <p className="text-slate-500 text-center">{message}</p>
    </div>
  );
}

function FilterIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path d="M3 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v3l-7 9v5l-2 1v-6l-7-9V4Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path d="M3 3v18h18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M7 16v-4M12 16v-7M17 16v-3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

export default function StatisticsPage() {
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    month: new Date().toISOString().slice(0, 7),
    category_id: "",
    type: "",
  });

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await api.get("/categories");
        setCategories(response.data.categories || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories");
      }
    }
    fetchCategories();
  }, []);

  // Fetch stats whenever filters change
  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.month) params.append("month", filters.month);
        if (filters.category_id) params.append("category_id", filters.category_id);
        if (filters.type) params.append("type", filters.type);

        const response = await api.get(`/stats?${params.toString()}`);
        setStats(response.data);
        toast.success("Statistics loaded");
      } catch (error) {
        console.error("Error fetching stats:", error);
        toast.error("Failed to load statistics");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [filters]);

  function handleFilterChange(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function clearFilters() {
    setFilters({
      month: new Date().toISOString().slice(0, 7),
      category_id: "",
      type: "",
    });
    toast.info("Filters cleared");
  }

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">📊 Statistics</h1>
        <LoadingSpinner />
      </div>
    );
  }

  const COLORS = [
    "#6366f1",
    "#8b5cf6",
    "#ec4899",
    "#f43f5e",
    "#f97316",
    "#eab308",
    "#84cc16",
    "#22c55e",
    "#10b981",
    "#14b8a6",
    "#06b6d4",
    "#0ea5e9",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">📊 Statistics</h1>
          <p className="mt-2 text-slate-600">
            Track your income and expenses with detailed analytics
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <FilterIcon />
          <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Month Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Month
            </label>
            <input
              type="month"
              value={filters.month}
              onChange={(e) => handleFilterChange("month", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Category
            </label>
            <select
              value={filters.category_id}
              onChange={(e) => handleFilterChange("category_id", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange("type", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
        </div>

        <button
          onClick={clearFilters}
          className="mt-4 px-4 py-2 text-sm font-medium text-slate-700 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          Clear Filters
        </button>
      </div>

      {/* Summary Cards */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Total Income */}
          <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Income</p>
                <p className="mt-2 text-3xl font-bold text-emerald-600">
                  ${stats.summary.total_income.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="text-4xl">📈</div>
            </div>
          </div>

          {/* Total Expense */}
          <div className="rounded-xl border border-red-200 bg-gradient-to-br from-red-50 to-pink-50 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Expense</p>
                <p className="mt-2 text-3xl font-bold text-red-600">
                  ${stats.summary.total_expense.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="text-4xl">📉</div>
            </div>
          </div>

          {/* Balance */}
          <div
            className={`rounded-xl border-2 p-6 shadow-sm ${
              stats.summary.balance >= 0
                ? "border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50"
                : "border-orange-200 bg-gradient-to-br from-orange-50 to-red-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Balance</p>
                <p
                  className={`mt-2 text-3xl font-bold ${
                    stats.summary.balance >= 0
                      ? "text-blue-600"
                      : "text-orange-600"
                  }`}
                >
                  ${stats.summary.balance.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="text-4xl">{stats.summary.balance >= 0 ? "💰" : "⚠️"}</div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="space-y-6">
        {/* Monthly Trends */}
        {stats && stats.monthly_trends && stats.monthly_trends.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <ChartIcon />
              <h2 className="text-lg font-semibold text-slate-900">Monthly Trends</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.monthly_trends.reverse()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month_name"
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) =>
                    `$${value.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}`
                  }
                />
                <Legend />
                <Bar dataKey="income" fill="#10b981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="expense" fill="#ef4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Expenses by Category */}
        {stats && stats.expenses_by_category.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <ChartIcon />
                <h2 className="text-lg font-semibold text-slate-900">Expenses by Category</h2>
              </div>
              {stats.expenses_by_category.some((c) => c.amount > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.expenses_by_category}
                      dataKey="amount"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {stats.expenses_by_category.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color || COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) =>
                        `$${value.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}`
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState message="No expense data available" icon="💸" />
              )}
              {/* Category List */}
              <div className="mt-4 space-y-2">
                {stats.expenses_by_category.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="text-lg">{cat.icon}</span>
                      <span className="text-slate-700">{cat.name}</span>
                    </span>
                    <span className="font-medium text-slate-900">
                      ${cat.amount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Income by Category */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <ChartIcon />
                <h2 className="text-lg font-semibold text-slate-900">Income by Category</h2>
              </div>
              {stats.income_by_category.length > 0 &&
              stats.income_by_category.some((c) => c.amount > 0) ? (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stats.income_by_category}
                        dataKey="amount"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {stats.income_by_category.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color || COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) =>
                          `$${value.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}`
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Category List */}
                  <div className="mt-4 space-y-2">
                    {stats.income_by_category.map((cat) => (
                      <div key={cat.id} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <span className="text-lg">{cat.icon}</span>
                          <span className="text-slate-700">{cat.name}</span>
                        </span>
                        <span className="font-medium text-slate-900">
                          ${cat.amount.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <EmptyState message="No income data available" icon="💵" />
              )}
            </div>
          </div>
        )}

        {/* Daily Summary Chart */}
        {stats && stats.daily_summary && stats.daily_summary.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <ChartIcon />
              <h2 className="text-lg font-semibold text-slate-900">Last 7 Days</h2>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={stats.daily_summary.reverse()}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) =>
                    `$${value.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}`
                  }
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#ef4444"
                  fillOpacity={1}
                  fill="url(#colorExpense)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* No Data State */}
      {stats && stats.summary.total_transactions === 0 && (
        <EmptyState
          message="No transactions found. Start adding income and expenses to see statistics."
          icon="📝"
        />
      )}
    </div>
  );
}
