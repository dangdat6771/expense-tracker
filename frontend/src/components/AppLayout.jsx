import { useState } from 'react'

/* ── Icons ── */
function HomeIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M9 21v-8h6v8" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  )
}
function TagIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.658.33a18.849 18.849 0 0 0 5.223-5.223c.542-.878.369-1.959-.33-2.658L11.21 3.659A2.25 2.25 0 0 0 9.568 3Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M6 6h.008v.008H6V6Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
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
function LogoutIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M18 12H9m9 0-3-3m3 3-3 3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  )
}
function MenuIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  )
}
function XIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path d="M6 18 18 6M6 6l12 12" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  )
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Tổng quan', Icon: HomeIcon },
  { id: 'transactions', label: 'Giao dịch', Icon: WalletIcon },
  { id: 'categories', label: 'Danh mục', Icon: TagIcon },
]

function NavLink({ item, active, onClick }) {
  return (
    <button
      onClick={() => onClick(item.id)}
      className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
        active
          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <item.Icon />
      {item.label}
    </button>
  )
}

export default function AppLayout({ user, page, onNavigate, onLogout, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const avatarLetter = user?.name?.[0]?.toUpperCase() || '?'

  const sidebar = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-500 text-white shadow-md shadow-emerald-500/30">
          <WalletIcon />
        </span>
        <span className="text-xl font-extrabold tracking-tight text-slate-900">SmartSpend</span>
      </div>

      {/* Nav */}
      <nav className="mt-2 flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.id}
            item={item}
            active={page === item.id}
            onClick={(id) => { onNavigate(id); setSidebarOpen(false) }}
          />
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-slate-100 p-3">
        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-100 text-sm font-extrabold text-emerald-700">
            {avatarLetter}
          </span>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">{user?.name}</p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
          </div>
          <button
            onClick={onLogout}
            title="Đăng xuất"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition"
          >
            <LogoutIcon />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white lg:block">
        {sidebar}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
          <aside className="absolute left-0 top-0 h-full w-60 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-500 text-white">
              <WalletIcon />
            </span>
            <span className="text-lg font-extrabold text-slate-900">SmartSpend</span>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-600 hover:bg-slate-100"
          >
            {sidebarOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
            {/* Breadcrumb */}
            <div className="mb-5 flex items-center gap-2 text-xs font-semibold text-slate-400">
              <WalletIcon />
              <span>SmartSpend</span>
              <span>/</span>
              <span className="text-slate-600">
                {NAV_ITEMS.find((n) => n.id === page)?.label || page}
              </span>
            </div>
            {/* Slot for page content */}
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
