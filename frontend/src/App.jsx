import { useEffect, useState } from 'react'
import api from './api'
import LoginPage from './components/LoginPage'
import RegisterPage from './components/RegisterPage'
import AppLayout from './components/AppLayout'
import DashboardPage from './components/DashboardPage'
import CategoriesPage from './components/CategoriesPage'

import TransactionsPage from './components/TransactionsPage'

function readStoredUser() {
  const savedUser = localStorage.getItem('user') || sessionStorage.getItem('user')
  return savedUser ? JSON.parse(savedUser) : null
}

function clearAuthStorage() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  sessionStorage.removeItem('token')
  sessionStorage.removeItem('user')
}

function App() {
  const [user, setUser] = useState(readStoredUser)
  const [authPage, setAuthPage] = useState('login')
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [page, setPage] = useState('dashboard')

  useEffect(() => {
    async function checkSession() {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')

      if (!token) {
        setIsCheckingSession(false)
        return
      }

      try {
        const response = await api.get('/auth/me')
        setUser(response.data.user)
      } catch {
        clearAuthStorage()
        setUser(null)
      } finally {
        setIsCheckingSession(false)
      }
    }

    checkSession()
  }, [])

  function handleLogout() {
    clearAuthStorage()
    setUser(null)
    setPage('dashboard')
  }

  if (isCheckingSession) {
    return (
      <main className="grid min-h-svh place-items-center bg-slate-50 px-6">
        <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-bold text-emerald-600">SmartSpend</p>
          <h1 className="mt-3 text-2xl font-extrabold text-slate-950">
            Đang kiểm tra đăng nhập...
          </h1>
          <div className="mx-auto mt-6 h-1.5 w-32 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full animate-pulse rounded-full bg-emerald-500" />
          </div>
        </section>
      </main>
    )
  }

  if (!user) {
    if (authPage === 'register') {
      return <RegisterPage onSwitchToLogin={() => setAuthPage('login')} />
    }

    return (
      <LoginPage
        onLogin={setUser}
        onSwitchToRegister={() => setAuthPage('register')}
      />
    )
  }

  function renderPage() {
    switch (page) {
      case 'dashboard':
        return <DashboardPage />
      case 'categories':
        return <CategoriesPage />
      case 'transactions':
        return <TransactionsPage />
      default:
        return <DashboardPage />
    }
  }

  return (
    <AppLayout
      user={user}
      page={page}
      onNavigate={setPage}
      onLogout={handleLogout}
    >
      {renderPage()}
    </AppLayout>
  )
}

export default App
