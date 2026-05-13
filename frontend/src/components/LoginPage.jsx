import { useState } from 'react'
import api from '../api'

const initialForm = {
  email: '',
  password: '',
  remember: false,
}

function WalletIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M4.75 7.75A2.75 2.75 0 0 1 7.5 5h9.25A2.25 2.25 0 0 1 19 7.25v1.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M5 8.75h13.25A1.75 1.75 0 0 1 20 10.5v6.25A2.25 2.25 0 0 1 17.75 19H6.25A2.25 2.25 0 0 1 4 16.75v-7A1 1 0 0 1 5 8.75Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M16.25 13.25h3.5v2.5h-3.5a1.25 1.25 0 1 1 0-2.5Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M4.75 6.75h14.5v10.5H4.75V6.75Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="m5.25 7.25 6.75 5 6.75-5"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M7.75 10.25v-2a4.25 4.25 0 0 1 8.5 0v2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
      <path
        d="M6.25 10.25h11.5v8H6.25v-8Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

function EyeIcon({ isVisible }) {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M4 12s2.75-5 8-5 8 5 8 5-2.75 5-8 5-8-5-8-5Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M12 14.25A2.25 2.25 0 1 0 12 9.75a2.25 2.25 0 0 0 0 4.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      {!isVisible ? (
        <path
          d="m5 19 14-14"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.8"
        />
      ) : null}
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M5 12h14m-5-5 5 5-5 5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
    </svg>
  )
}

function LoginPage({ onLogin }) {
  const [form, setForm] = useState(initialForm)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  function handleChange(event) {
    const { checked, name, type, value } = event.target

    setForm((currentForm) => ({
      ...currentForm,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await api.post('/auth/login', {
        email: form.email,
        password: form.password,
      })

      const storage = form.remember ? localStorage : sessionStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('user')
      storage.setItem('token', response.data.token)
      storage.setItem('user', JSON.stringify(response.data.user))
      onLogin(response.data.user)
      setForm(initialForm)
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Không thể đăng nhập lúc này. Vui lòng thử lại.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-svh bg-white text-slate-950 lg:grid-cols-[516px_1fr]">
      <aside className="relative hidden overflow-hidden bg-[#111827] px-12 py-14 text-white lg:flex lg:flex-col">
        <div className="absolute inset-y-0 right-[-140px] w-[400px] rounded-l-[50%] bg-slate-700/35" />
        <div className="relative z-10 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-500 text-white shadow-[0_12px_28px_rgba(16,185,129,0.35)]">
            <WalletIcon />
          </span>
          <span className="text-2xl font-bold tracking-[-0.01em]">
            SmartSpend
          </span>
        </div>

        <div className="relative z-10 mt-16 max-w-[360px]">
          <h1 className="text-[34px] font-extrabold leading-tight tracking-normal text-white">
            Quản lý chi tiêu thông minh & hiệu quả
          </h1>
          <p className="mt-7 text-lg leading-8 text-slate-300">
            Hơn 15,000 người dùng đã tin tưởng SmartSpend để tối ưu hóa kế hoạch
            tài chính cá nhân.
          </p>
        </div>

        <div className="relative z-10 mt-12 w-[300px] rounded-2xl border border-slate-600/80 bg-slate-800/70 p-6 shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Số dư hiện tại
            </p>
            <p className="text-xs font-bold text-emerald-400">+12.5%</p>
          </div>
          <p className="mt-4 text-3xl font-extrabold text-white">
            45.280.000đ
          </p>
          <div className="mt-7 h-1.5 overflow-hidden rounded-full bg-slate-700">
            <div className="h-full w-[75%] rounded-full bg-emerald-500" />
          </div>
          <div className="mt-3 flex justify-between text-xs font-semibold text-slate-400">
            <span>Đã chi: 15.000.000đ</span>
            <span>Hạn mức: 20.000.000đ</span>
          </div>
        </div>

        <footer className="relative z-10 mt-auto flex gap-7 text-sm text-slate-500">
          <span>© 2024 SmartSpend Inc.</span>
          <a className="hover:text-slate-300" href="#terms">
            Điều khoản
          </a>
          <a className="hover:text-slate-300" href="#privacy">
            Bảo mật
          </a>
        </footer>
      </aside>

      <section className="flex min-h-svh flex-col px-6 py-8 sm:px-10">
        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center">
          <div>
            <p className="mb-2 text-sm font-semibold text-emerald-600 lg:hidden">
              SmartSpend
            </p>
            <h2 className="text-3xl font-extrabold tracking-normal text-slate-950">
              Chào mừng quay trở lại
            </h2>
            <p className="mt-3 text-[15px] text-slate-500">
              Vui lòng nhập thông tin đăng nhập của bạn để tiếp tục.
            </p>
          </div>

          <form className="mt-10 grid gap-6" onSubmit={handleSubmit}>
            <label className="grid gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Địa chỉ email
              </span>
              <span className="flex h-12 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-400 focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-500/10">
                <MailIcon />
                <input
                  autoComplete="email"
                  className="h-full min-w-0 flex-1 bg-transparent px-4 text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
                  name="email"
                  onChange={handleChange}
                  placeholder="demo@smartspend.vn"
                  required
                  type="email"
                  value={form.email}
                />
              </span>
            </label>

            <label className="grid gap-2">
              <span className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Mật khẩu
                </span>
                <a
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                  href="#forgot-password"
                >
                  Quên mật khẩu?
                </a>
              </span>
              <span className="flex h-12 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-400 focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-500/10">
                <LockIcon />
                <input
                  autoComplete="current-password"
                  className="h-full min-w-0 flex-1 bg-transparent px-4 text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
                  minLength={6}
                  name="password"
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                />
                <button
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  className="grid h-8 w-8 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  onClick={() => setShowPassword((current) => !current)}
                  type="button"
                >
                  <EyeIcon isVisible={showPassword} />
                </button>
              </span>
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                checked={form.remember}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 accent-emerald-600"
                name="remember"
                onChange={handleChange}
                type="checkbox"
              />
              Ghi nhớ đăng nhập trên thiết bị này
            </label>

            {error ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </p>
            ) : null}

            <button
              className="flex h-[54px] items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-base font-extrabold text-white shadow-[0_12px_22px_rgba(5,150,105,0.24)] transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Đang đăng nhập...' : 'Đăng Nhập'}
              <ArrowRightIcon />
            </button>
          </form>

          <div className="mt-9">
            <div className="flex items-center gap-4">
              <span className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">
                Hoặc đăng nhập với
              </span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <button
                className="flex h-12 items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50"
                type="button"
              >
                <span className="text-lg font-black text-[#4285f4]">G</span>
                Google
              </button>
              <button
                className="flex h-12 items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50"
                type="button"
              >
                <span className="grid h-5 w-5 place-items-center rounded-full bg-[#1877f2] text-sm font-black text-white">
                  f
                </span>
                Facebook
              </button>
            </div>
          </div>

          <p className="mt-10 text-center text-sm text-slate-500">
            Chưa có tài khoản?{' '}
            <a className="font-extrabold text-emerald-600" href="#register">
              Đăng ký ngay
            </a>
          </p>
        </div>

        <footer className="mt-8 flex justify-center gap-8 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
          <a href="#support">Hỗ trợ</a>
          <a href="#security">Trung tâm bảo mật</a>
          <a href="#contact">Liên hệ</a>
        </footer>
      </section>
    </main>
  )
}

export default LoginPage
