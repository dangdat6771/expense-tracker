import { useState } from "react";
import api from "../api.js";

const initialForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
};

function Icon({ children }) {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      {children}
    </svg>
  );
}

function WalletIcon() {
  return (
    <Icon>
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
    </Icon>
  );
}

function UserIcon() {
  return (
    <Icon>
      <path
        d="M12 12.25A3.75 3.75 0 1 0 12 4.75a3.75 3.75 0 0 0 0 7.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M4.75 19.25c1.25-3.25 3.67-5 7.25-5s6 1.75 7.25 5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </Icon>
  );
}

function MailIcon() {
  return (
    <Icon>
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
    </Icon>
  );
}

function LockIcon() {
  return (
    <Icon>
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
    </Icon>
  );
}

function ArrowRightIcon() {
  return (
    <Icon>
      <path
        d="M5 12h14m-5-5 5 5-5 5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
    </Icon>
  );
}

function CheckIcon() {
  return (
    <Icon>
      <path
        d="m6 12.5 4 4 8-9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </Icon>
  );
}

function RegisterPage({ onSwitchToLogin }) {
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [registeredName, setRegisteredName] = useState("");

  function handleChange(event) {
    const { checked, name, type, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    if (!form.acceptTerms) {
      setError("Bạn cần đồng ý với điều khoản dịch vụ.");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
      });

      setRegisteredName(form.name);
      setForm(initialForm);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Không thể đăng ký lúc này. Vui lòng thử lại.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (registeredName) {
    return (
      <main className="grid min-h-svh place-items-center bg-slate-50 px-6">
        <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckIcon />
          </div>
          <p className="mt-6 text-sm font-bold text-emerald-600">
            SmartSpend
          </p>
          <h1 className="mt-3 text-3xl font-extrabold text-slate-950">
            Đăng ký thành công
          </h1>
          <p className="mt-3 text-slate-500">
            Chào mừng {registeredName}! Tài khoản của bạn đã được tạo. Vui lòng
            đăng nhập để tiếp tục.
          </p>
          <button
            className="mt-8 h-12 w-full rounded-xl bg-emerald-600 px-5 font-bold text-white hover:bg-emerald-700"
            onClick={onSwitchToLogin}
            type="button"
          >
            Đến trang đăng nhập
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="grid min-h-svh bg-white text-slate-950 lg:grid-cols-[516px_1fr]">
      <aside className="relative hidden overflow-hidden bg-[#0f172a] px-12 py-14 text-white lg:flex lg:flex-col">
        <div className="absolute inset-y-0 right-[-120px] w-[380px] rounded-l-[50%] bg-emerald-500/10" />
        <div className="relative z-10 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-500 shadow-[0_12px_28px_rgba(16,185,129,0.35)]">
            <WalletIcon />
          </span>
          <span className="text-2xl font-bold">SmartSpend</span>
        </div>

        <div className="relative z-10 mt-16 max-w-[360px]">
          <h1 className="text-[34px] font-extrabold leading-tight text-white">
            Làm chủ tài chính từ bước đầu tiên
          </h1>
          <p className="mt-7 text-lg leading-8 text-slate-300">
            Bắt đầu hành trình quản lý chi tiêu và đạt được các mục tiêu tài
            chính cá nhân cùng SmartSpend.
          </p>
        </div>

        <div className="relative z-10 mt-12 w-[320px] rounded-2xl border border-emerald-500/20 bg-emerald-600/10 p-6 shadow-2xl backdrop-blur">
          <p className="text-sm font-bold uppercase tracking-wider text-emerald-400">
            Quyền lợi thành viên
          </p>
          <ul className="mt-5 grid gap-4 text-sm text-slate-300">
            <li className="flex items-center gap-3">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-white">
                <CheckIcon />
              </span>
              Báo cáo chi tiêu chi tiết hàng tháng
            </li>
            <li className="flex items-center gap-3">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-white">
                <CheckIcon />
              </span>
              Thiết lập hạn mức ngân sách thông minh
            </li>
            <li className="flex items-center gap-3">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-white">
                <CheckIcon />
              </span>
              Đồng bộ hóa trên mọi thiết bị
            </li>
          </ul>
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
        <div className="mx-auto flex w-full max-w-[460px] flex-1 flex-col justify-center">
          <p className="mb-2 text-sm font-semibold text-emerald-600 lg:hidden">
            SmartSpend
          </p>
          <h2 className="text-3xl font-extrabold text-slate-950">
            Tạo tài khoản mới
          </h2>

          <form className="mt-9 grid gap-5" onSubmit={handleSubmit}>
            {error ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </p>
            ) : null}

            <label className="grid gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Họ và tên
              </span>
              <span className="flex h-12 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-400 focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-500/10">
                <UserIcon />
                <input
                  autoComplete="name"
                  className="h-full min-w-0 flex-1 bg-transparent px-4 text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
                  name="name"
                  onChange={handleChange}
                  placeholder="Nguyễn Văn A"
                  required
                  type="text"
                  value={form.name}
                />
              </span>
            </label>

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

            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <label className="grid min-w-0 gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Mật khẩu
                </span>
                <span className="flex h-12 min-w-0 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-400 focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-500/10">
                  <LockIcon />
                  <input
                    autoComplete="new-password"
                    className="h-full min-w-0 flex-1 bg-transparent px-3 text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
                    minLength={6}
                    name="password"
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    type="password"
                    value={form.password}
                  />
                </span>
              </label>

              <label className="grid min-w-0 gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Xác nhận
                </span>
                <span className="flex h-12 min-w-0 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-400 focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-500/10">
                  <LockIcon />
                  <input
                    autoComplete="new-password"
                    className="h-full min-w-0 flex-1 bg-transparent px-3 text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
                    minLength={6}
                    name="confirmPassword"
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    type="password"
                    value={form.confirmPassword}
                  />
                </span>
              </label>
            </div>

            <label className="flex items-start gap-3 text-sm text-slate-600">
              <input
                checked={form.acceptTerms}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-emerald-600"
                name="acceptTerms"
                onChange={handleChange}
                required
                type="checkbox"
              />
              <span>
                Tôi đồng ý với{" "}
                <a className="font-bold text-emerald-600" href="#terms">
                  Điều khoản dịch vụ
                </a>{" "}
                và{" "}
                <a className="font-bold text-emerald-600" href="#privacy">
                  Chính sách bảo mật
                </a>
                .
              </span>
            </label>

            <button
              className="mt-1 flex h-[54px] items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-base font-extrabold text-white shadow-[0_12px_22px_rgba(5,150,105,0.24)] transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Đang tạo tài khoản..." : "Đăng Ký Tài Khoản"}
              <ArrowRightIcon />
            </button>
          </form>

          <p className="mt-9 text-center text-sm text-slate-500">
            Đã có tài khoản?{" "}
            <button
              className="font-extrabold text-emerald-600 hover:underline"
              onClick={onSwitchToLogin}
              type="button"
            >
              Đăng nhập ngay
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}

export default RegisterPage;
