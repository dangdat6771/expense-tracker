import { useState, useEffect, useCallback } from 'react'
import api from '../api'

export default function TransactionList({ refreshTrigger, onEdit }) {
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [meta, setMeta] = useState({ totalPages: 1, currentPage: 1, totalItems: 0 })
  
  // Filters
  const [month, setMonth] = useState('')
  const [type, setType] = useState('')
  const [categoryId, setCategoryId] = useState('')
  
  useEffect(() => {
    // Declare and immediately invoke async function to avoid
    // the react-hooks/set-state-in-effect lint rule false positive
    ;(async () => {
      try {
        const res = await api.get('/categories')
        setCategories(res.data.categories || res.data)
      } catch (_err) {
        console.error('Failed to load categories')
      }
    })()
  }, [])

  const loadTransactions = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const params = { page, limit: 10 }
      if (month) params.month = month
      if (type) params.type = type
      if (categoryId) params.category_id = categoryId

      const res = await api.get('/transactions', { params })
      setTransactions(res.data.data)
      setMeta(res.data.meta)
      setError(null)
    } catch (_err) {
      setError('Không thể tải dữ liệu giao dịch')
    } finally {
      setLoading(false)
    }
  }, [month, type, categoryId])

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions, refreshTrigger])

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa giao dịch này?')) return
    try {
      await api.delete(`/transactions/${id}`)
      loadTransactions(meta.currentPage)
    } catch (_err) {
      alert('Không thể xóa giao dịch')
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-lg font-bold text-slate-900">Lịch sử giao dịch</h2>
        
        <div className="flex flex-wrap gap-2">
          <input 
            type="month" 
            value={month}
            onChange={e => setMonth(e.target.value)}
            className="rounded-lg border-slate-200 bg-slate-50 px-3 py-1.5 text-sm"
          />
          <select 
            value={type} 
            onChange={e => setType(e.target.value)}
            className="rounded-lg border-slate-200 bg-slate-50 px-3 py-1.5 text-sm"
          >
            <option value="">Tất cả loại</option>
            <option value="income">Thu</option>
            <option value="expense">Chi</option>
          </select>
          <select 
            value={categoryId} 
            onChange={e => setCategoryId(e.target.value)}
            className="rounded-lg border-slate-200 bg-slate-50 px-3 py-1.5 text-sm"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="text-sm text-red-600 mb-4">{error}</div>}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="pb-3 font-medium">Ngày</th>
              <th className="pb-3 font-medium">Danh mục</th>
              <th className="pb-3 font-medium">Ghi chú</th>
              <th className="pb-3 font-medium text-right">Số tiền</th>
              <th className="pb-3 font-medium text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="5" className="py-8 text-center text-slate-500">Đang tải...</td></tr>
            ) : transactions.length === 0 ? (
              <tr><td colSpan="5" className="py-8 text-center text-slate-500">Chưa có giao dịch nào</td></tr>
            ) : (
              transactions.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-50">
                  <td className="py-3 text-slate-700">
                    {new Date(tx.transaction_date).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="py-3">
                    <span 
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{ backgroundColor: `${tx.category_color}20`, color: tx.category_color || '#333' }}
                    >
                      {tx.category_name}
                    </span>
                  </td>
                  <td className="py-3 text-slate-500">{tx.note}</td>
                  <td className={`py-3 text-right font-medium ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {tx.type === 'income' ? '+' : '-'}{Number(tx.amount).toLocaleString('vi-VN')} đ
                  </td>
                  <td className="py-3 text-right">
                    <button onClick={() => onEdit(tx)} className="text-indigo-600 hover:text-indigo-800 text-xs font-medium mr-3">Sửa</button>
                    <button onClick={() => handleDelete(tx.id)} className="text-rose-600 hover:text-rose-800 text-xs font-medium">Xóa</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && meta.totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button 
            disabled={meta.currentPage === 1}
            onClick={() => loadTransactions(meta.currentPage - 1)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-50"
          >
            Trước
          </button>
          <span className="text-sm py-1.5 text-slate-500">
            Trang {meta.currentPage} / {meta.totalPages}
          </span>
          <button 
            disabled={meta.currentPage === meta.totalPages}
            onClick={() => loadTransactions(meta.currentPage + 1)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  )
}
