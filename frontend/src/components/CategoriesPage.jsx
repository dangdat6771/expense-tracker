import { useEffect, useState, useCallback } from 'react'
import { categoryApi } from '../services'

/* ── Icons ── */
function PlusIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  )
}
function PencilIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path d="M15.232 5.232a3 3 0 0 1 4.243 4.243L7.5 21.5H3v-4.5L15.232 5.232Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  )
}
function TrashIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  )
}
function XIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path d="M6 18 18 6M6 6l12 12" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  )
}

/* ── Constants ── */
const PRESET_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899',
  '#64748b', '#0ea5e9', '#a855f7', '#f43f5e',
]

const PRESET_ICONS = [
  '🏠', '🍔', '🚗', '✈️', '🛒', '💊',
  '🎮', '📚', '💰', '💼', '🎁', '🐾',
  '🏋️', '🎵', '☕', '🔧', '💡', '📱',
]

const EMPTY_FORM = { name: '', type: 'expense', color: '#6366f1', icon: '📁' }

/* ── Modal ── */
function CategoryModal({ mode, initial, onClose, onSave }) {
  const [form, setForm] = useState(initial || EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(key, val) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Tên danh mục không được để trống'); return }
    setSaving(true)
    setError('')
    try {
      await onSave(form)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-lg font-extrabold text-slate-900">
            {mode === 'add' ? 'Thêm danh mục' : 'Chỉnh sửa danh mục'}
          </h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition">
            <XIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <label className="grid gap-1.5">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600">Tên danh mục</span>
            <input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Ví dụ: Ăn uống"
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition"
            />
          </label>

          {/* Type */}
          <div className="grid gap-1.5">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600">Loại</span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { val: 'income', label: 'Thu nhập 💹', bg: 'bg-emerald-500 text-white', border: 'border-emerald-500' },
                { val: 'expense', label: 'Chi tiêu 💸', bg: 'bg-rose-500 text-white', border: 'border-rose-500' },
              ].map(({ val, label, bg, border }) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => set('type', val)}
                  className={`h-11 rounded-xl border-2 text-sm font-bold transition ${
                    form.type === val
                      ? `${bg} ${border}`
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Icon */}
          <div className="grid gap-1.5">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600">Icon</span>
            <div className="flex flex-wrap gap-2">
              {PRESET_ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => set('icon', ic)}
                  className={`grid h-9 w-9 place-items-center rounded-xl text-lg transition ${
                    form.icon === ic ? 'bg-indigo-100 ring-2 ring-indigo-400' : 'bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  {ic}
                </button>
              ))}
              {/* Custom icon input */}
              <input
                value={form.icon}
                onChange={(e) => set('icon', e.target.value)}
                maxLength={2}
                className="h-9 w-16 rounded-xl border border-slate-200 bg-slate-50 px-2 text-center text-lg outline-none focus:border-indigo-400"
                placeholder="✏️"
              />
            </div>
          </div>

          {/* Color */}
          <div className="grid gap-1.5">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600">Màu sắc</span>
            <div className="flex flex-wrap gap-2 items-center">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => set('color', c)}
                  style={{ background: c }}
                  className={`h-7 w-7 rounded-full transition ${form.color === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-110'}`}
                />
              ))}
              <input
                type="color"
                value={form.color}
                onChange={(e) => set('color', e.target.value)}
                className="h-7 w-7 cursor-pointer rounded-full border-0 bg-transparent p-0"
                title="Chọn màu tùy chỉnh"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <span
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-lg text-white shadow-sm"
              style={{ background: form.color }}
            >
              {form.icon}
            </span>
            <div>
              <p className="text-sm font-bold text-slate-800">{form.name || 'Tên danh mục'}</p>
              <p className="text-xs text-slate-500">{form.type === 'income' ? 'Thu nhập' : 'Chi tiêu'}</p>
            </div>
          </div>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 h-11 rounded-xl bg-emerald-600 text-sm font-extrabold text-white hover:bg-emerald-700 disabled:opacity-60 transition"
            >
              {saving ? 'Đang lưu…' : mode === 'add' ? 'Thêm danh mục' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Delete Confirm ── */
function DeleteConfirm({ category, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false)
  async function handleDelete() {
    setLoading(true)
    try { await onConfirm() } finally { setLoading(false) }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-extrabold text-slate-900">Xóa danh mục</h3>
        <p className="mt-2 text-sm text-slate-500">
          Bạn có chắc muốn xóa danh mục <strong className="text-slate-800">"{category.name}"</strong>?
          Hành động này không thể hoàn tác.
        </p>
        <div className="mt-5 flex gap-3">
          <button onClick={onClose} className="flex-1 h-11 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition">
            Hủy
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 h-11 rounded-xl bg-rose-600 text-sm font-extrabold text-white hover:bg-rose-700 disabled:opacity-60 transition"
          >
            {loading ? 'Đang xóa…' : 'Xóa'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Category Card ── */
function CategoryCard({ category, onEdit, onDelete }) {
  return (
    <div className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md hover:border-slate-200 transition-all">
      <span
        className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-2xl text-white shadow-sm"
        style={{ background: category.color }}
      >
        {category.icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-slate-900 truncate">{category.name}</p>
        <span
          className={`mt-0.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
            category.type === 'income'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-rose-100 text-rose-700'
          }`}
        >
          {category.type === 'income' ? '💹 Thu nhập' : '💸 Chi tiêu'}
        </span>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(category)}
          className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition"
          aria-label="Sửa"
        >
          <PencilIcon />
        </button>
        <button
          onClick={() => onDelete(category)}
          className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
          aria-label="Xóa"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  )
}

/* ── Main Page ── */
export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null) // null | { mode: 'add'|'edit', category?: obj }
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [tab, setTab] = useState('all') // 'all' | 'income' | 'expense'

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await categoryApi.getAll()
      setCategories(res.data.categories)
    } catch {
      setError('Không thể tải danh mục. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategories()
  }, [fetchCategories])

  async function handleSave(form) {
    if (modal.mode === 'add') {
      const res = await categoryApi.create(form)
      setCategories((prev) => [...prev, res.data.category])
    } else {
      const res = await categoryApi.update(modal.category.id, form)
      setCategories((prev) => prev.map((c) => c.id === modal.category.id ? res.data.category : c))
    }
  }

  async function handleDelete() {
    await categoryApi.remove(deleteTarget.id)
    setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  const filtered = categories.filter((c) => tab === 'all' || c.type === tab)
  const incomeCount = categories.filter((c) => c.type === 'income').length
  const expenseCount = categories.filter((c) => c.type === 'expense').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Danh mục</h2>
          <p className="mt-0.5 text-sm text-slate-500">Quản lý các danh mục thu chi của bạn</p>
        </div>
        <button
          onClick={() => setModal({ mode: 'add' })}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-md hover:bg-emerald-700 active:scale-95 transition"
        >
          <PlusIcon />
          Thêm danh mục
        </button>
      </div>

      {/* Summary chips */}
      <div className="flex items-center gap-2">
        <span className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold text-slate-600 shadow-sm">
          Tất cả: {categories.length}
        </span>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-700">
          Thu nhập: {incomeCount}
        </span>
        <span className="rounded-full border border-rose-200 bg-rose-50 px-4 py-1.5 text-xs font-bold text-rose-700">
          Chi tiêu: {expenseCount}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 w-fit gap-1">
        {[
          { key: 'all', label: 'Tất cả' },
          { key: 'income', label: '💹 Thu nhập' },
          { key: 'expense', label: '💸 Chi tiêu' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-lg px-4 py-1.5 text-sm font-bold transition ${
              tab === key
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Category grid */}
      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4">
              <div className="h-12 w-12 animate-pulse rounded-xl bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 animate-pulse rounded-full bg-slate-200" />
                <div className="h-3 w-20 animate-pulse rounded-full bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-16 text-center">
          <p className="text-4xl">🗂️</p>
          <p className="mt-3 font-semibold text-slate-600">
            {tab === 'all' ? 'Chưa có danh mục nào' : `Chưa có danh mục ${tab === 'income' ? 'thu nhập' : 'chi tiêu'} nào`}
          </p>
          <button
            onClick={() => setModal({ mode: 'add' })}
            className="mt-4 text-sm font-bold text-emerald-600 hover:underline"
          >
            + Thêm danh mục đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onEdit={(c) => setModal({ mode: 'edit', category: c })}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {modal && (
        <CategoryModal
          mode={modal.mode}
          initial={modal.category}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          category={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  )
}
