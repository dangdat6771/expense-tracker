import { useState } from 'react'
import TransactionForm from './TransactionForm'
import TransactionList from './TransactionList'

function PlusIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
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

export default function TransactionsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [editingTx, setEditingTx] = useState(null)

  const openAdd = () => {
    setEditingTx(null)
    setShowForm(true)
  }

  const handleTransactionSuccess = () => {
    setRefreshTrigger(prev => prev + 1)
    setShowForm(false)
    setEditingTx(null)
  }

  const handleEdit = (tx) => {
    setEditingTx(tx)
    setShowForm(true)
  }

  const handleClose = () => {
    setShowForm(false)
    setEditingTx(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Giao dịch</h2>
          <p className="mt-0.5 text-sm text-slate-500">Quản lý và theo dõi thu chi của bạn</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-md hover:bg-emerald-700 active:scale-95 transition"
        >
          <PlusIcon />
          Thêm giao dịch
        </button>
      </div>

      {/* Transaction List */}
      <TransactionList
        refreshTrigger={refreshTrigger}
        onEdit={handleEdit}
      />

      {/* Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={handleClose}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-lg font-extrabold text-slate-900">
                {editingTx ? 'Sửa giao dịch' : 'Thêm giao dịch mới'}
              </h3>
              <button
                onClick={handleClose}
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <XIcon />
              </button>
            </div>

            {/* Form content */}
            <div className="p-6">
              <TransactionForm
                onSuccess={handleTransactionSuccess}
                editTx={editingTx}
                onCancelEdit={handleClose}
                hideTitle
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
