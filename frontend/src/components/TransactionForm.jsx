import { useState, useEffect } from 'react'
import api from '../api'

export default function TransactionForm({ onSuccess, editTx = null, onCancelEdit, hideTitle = false }) {
  const [amount, setAmount] = useState(editTx ? editTx.amount : '')
  const [type, setType] = useState(editTx ? editTx.type : 'expense')
  const [categoryId, setCategoryId] = useState(editTx ? editTx.category_id : '')
  const [date, setDate] = useState(editTx ? new Date(editTx.transaction_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0])
  const [note, setNote] = useState(editTx ? editTx.note : '')

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await api.get('/categories')
        setCategories(res.data.categories || res.data) // fallback depending on response format
      } catch (err) {
        console.error('Failed to load categories', err)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    if (editTx) {
      setAmount(editTx.amount)
      setType(editTx.type)
      setCategoryId(editTx.category_id)
      setDate(new Date(editTx.transaction_date).toISOString().split('T')[0])
      setNote(editTx.note || '')
    }
  }, [editTx])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!categoryId) {
      setError('Vui lòng chọn danh mục')
      setLoading(false)
      return
    }

    try {
      const payload = {
        amount: Number(amount),
        type,
        category_id: categoryId,
        transaction_date: date,
        note
      }

      if (editTx) {
        await api.put(`/transactions/${editTx.id}`, payload)
      } else {
        await api.post('/transactions', payload)
      }

      setAmount('')
      setNote('')
      if (!editTx) {
        // keep type, category, date for quick next entry
      }

      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!hideTitle && (
        <h2 className="text-lg font-bold text-slate-900 mb-4">{editTx ? 'Sửa giao dịch' : 'Thêm giao dịch'}</h2>
      )}
      
      {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Loại</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          >
            <option value="expense">Khoản chi</option>
            <option value="income">Khoản thu</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Danh mục</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            required
          >
            <option value="" disabled>Chọn danh mục</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Số tiền</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            placeholder="0"
            required
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Ngày</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            required
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          placeholder="Ghi chú thêm..."
          rows={2}
        />
      </div>

      <div className="mt-6 flex gap-3">
        {editTx && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="flex-1 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Hủy
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Đang lưu...' : (editTx ? 'Lưu thay đổi' : 'Thêm giao dịch')}
        </button>
      </div>
    </form>
  )
}
