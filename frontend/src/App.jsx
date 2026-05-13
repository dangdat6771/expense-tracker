import { useEffect, useState } from 'react'
import api from './api'
import LoginPage from './components/LoginPage'
import RegisterPage from './components/RegisterPage'

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
  }

  if (isCheckingSession) {
    return (
      <main className="grid min-h-svh place-items-center bg-slate-50 px-6">
        <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-bold text-emerald-600">SmartSpend</p>
          <h1 className="mt-3 text-2xl font-extrabold text-slate-950">
            Đang kiểm tra đăng nhập
          </h1>
        </section>
      </main>
    )
  }

  if (!user) {
    if (authPage === 'register') {
      return (
        <RegisterPage
          onSwitchToLogin={() => setAuthPage('login')}
        />
      )
    }

    return (
      <LoginPage
        onLogin={setUser}
        onSwitchToRegister={() => setAuthPage('register')}
      />
    )
  }

  return (
    <main className="grid min-h-svh place-items-center bg-slate-50 px-6">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-bold text-emerald-600">SmartSpend</p>
        <h1 className="mt-3 text-3xl font-extrabold text-slate-950">
          Chào mừng, {user.name}
        </h1>
        <p className="mt-2 text-slate-500">{user.email}</p>
        <button
          className="mt-8 h-12 w-full rounded-xl bg-slate-950 px-5 font-bold text-white hover:bg-slate-800"
          onClick={handleLogout}
          type="button"
        >
          Đăng xuất
        </button>
      </section>
    </main>
  )
}

export default App
