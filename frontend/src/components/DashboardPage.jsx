import { useEffect, useState, useCallback } from 'react'
import { dashboardApi } from '../services'

function ArrowUpIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path d="M12 19V5m-7 7 7-7 7 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  )
}
function ArrowDownIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path d="M12 5v14m7-7-7 7-7-7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  )
}
function WalletIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path d="M4.75 7.75A2.75 2.75 0 0 1 7.5 5h9.25A2.25 2.25 0 0 1 19 7.25v1.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M5 8.75h13.25A1.75 1.75 0 0 1 20 10.5v6.25A2.25 2.25 0 0 1 17.75 19H6.25A2.25 2.25 0 0 1 4 16.75v-7A1 1 0 0 1 5 8.75Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M16.25 13.25h3.5v2.5h-3.5a1.25 1.25 0 1 1 0-2.5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  )
}
function RefreshIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 4.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 0 1-15.357-2m15.357 2H15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  )
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await dashboardApi.get()
      setData(response.data)
    } catch {
      setError('Không thể tải dữ liệu. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const balance = data?.balance ?? 0
  const totalIncome = data?.totalIncome ?? 0
  const totalExpense = data?.totalExpense ?? 0
  const spendPct = totalIncome > 0 ? Math.min((totalExpense / totalIncome) * 100, 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Tổng quan</h2>
          <p className="mt-0.5 text-sm text-slate-500">Xem tổng quan tài chính của bạn</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 transition"
        >
          <RefreshIcon />
          Làm mới
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Balance */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 p-6 text-white shadow-lg">
          <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/5" />
          <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/5" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-slate-300">
              <WalletIcon />
              <span className="text-sm font-semibold">Số dư</span>
            </div>
            {loading ? (
              <div className="mt-4 h-8 w-40 animate-pulse rounded-lg bg-white/20" />
            ) : (
              <p className={`mt-4 text-2xl font-extrabold ${balance >= 0 ? 'text-white' : 'text-red-300'}`}>
                {formatCurrency(balance)}
              </p>
            )}
            <p className="mt-1 text-xs text-slate-400">Thu nhập − Chi tiêu</p>
          </div>
        </div>

        {/* Total Income */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-50 p-6 shadow-sm">
          <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-emerald-100/60" />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-emerald-700">Tổng thu</span>
              <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                <ArrowUpIcon />
              </span>
            </div>
            {loading ? (
              <div className="mt-4 h-8 w-36 animate-pulse rounded-lg bg-emerald-200" />
            ) : (
              <p className="mt-4 text-2xl font-extrabold text-emerald-700">
                {formatCurrency(totalIncome)}
              </p>
            )}
            <p className="mt-1 text-xs text-emerald-600/70">Tất cả giao dịch thu nhập</p>
          </div>
        </div>

        {/* Total Expense */}
        <div className="relative overflow-hidden rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 to-red-50 p-6 shadow-sm">
          <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-rose-100/60" />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-rose-700">Tổng chi</span>
              <span className="grid h-8 w-8 place-items-center rounded-full bg-rose-100 text-rose-600">
                <ArrowDownIcon />
              </span>
            </div>
            {loading ? (
              <div className="mt-4 h-8 w-36 animate-pulse rounded-lg bg-rose-200" />
            ) : (
              <p className="mt-4 text-2xl font-extrabold text-rose-700">
                {formatCurrency(totalExpense)}
              </p>
            )}
            <p className="mt-1 text-xs text-rose-600/70">Tất cả giao dịch chi tiêu</p>
          </div>
        </div>
      </div>

      {/* Spending progress */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-slate-800">Tỷ lệ chi tiêu / thu nhập</p>
          {!loading && (
            <span className={`text-sm font-bold ${spendPct >= 90 ? 'text-rose-600' : spendPct >= 70 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {spendPct.toFixed(1)}%
            </span>
          )}
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
          {loading ? (
            <div className="h-full w-1/2 animate-pulse rounded-full bg-slate-200" />
          ) : (
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                spendPct >= 90 ? 'bg-rose-500' : spendPct >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${spendPct}%` }}
            />
          )}
        </div>

        <div className="mt-3 flex justify-between text-xs font-medium text-slate-500">
          <span>Chi tiêu: {loading ? '…' : formatCurrency(totalExpense)}</span>
          <span>Thu nhập: {loading ? '…' : formatCurrency(totalIncome)}</span>
        </div>
      </div>
    </div>
  )
}
