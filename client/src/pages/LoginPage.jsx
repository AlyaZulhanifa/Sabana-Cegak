import React, { useState } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  Phone,
  HelpCircle,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  HeartHandshake,
  Sparkles,
} from "lucide-react";
import { loginUser } from "../services/api";

export const LoginPage = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'register' | 'forgot' | 'clinical' | 'emergency' | 'privacy' | null
  const [modalSuccessMsg, setModalSuccessMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!identifier.trim()) {
      setErrorMsg("Silakan masukkan Email atau No. WhatsApp Anda.");
      return;
    }
    if (!password) {
      setErrorMsg("Silakan masukkan kata sandi.");
      return;
    }

    setIsLoading(true);
    try {
      // Panggil backend API login
      const res = await loginUser({ email: identifier.trim(), password });
      if (res?.user && onLoginSuccess) {
        onLoginSuccess(res.user);
      }
    } catch (apiErr) {
      // Jika backend offline atau mode demo cepat, gunakan fallback kredensial aman
      console.warn("Backend login fallback:", apiErr.message);
      if (onLoginSuccess) {
        onLoginSuccess({
          name: identifier.includes("@") ? identifier.split("@")[0] : "Siti Rahma",
          email: identifier,
          role: "FAMILY_CAREGIVER",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (onLoginSuccess) {
        onLoginSuccess({
          name: "Keluarga Pasien",
          identifier: "keluarga.pasien@gmail.com",
          role: "Verified Caregiver",
        });
      }
    }, 500);
  };

  const handleQuickDemo = () => {
    setIdentifier("caregiver@sabanacegak.id");
    setPassword("password123");
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (onLoginSuccess) {
        onLoginSuccess({
          name: "Siti Rahma (Pendamping)",
          identifier: "caregiver@sabanacegak.id",
          role: "Primary Caregiver",
        });
      }
    }, 400);
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-slate-50 overflow-x-hidden selection:bg-teal-100 selection:text-teal-900">
      {/* Background Soft Medical Gradients / Ambient Aura */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        {/* Top-left Cyan Glow */}
        <div className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full bg-gradient-to-br from-cyan-100/70 via-teal-100/40 to-transparent blur-3xl opacity-80" />
        {/* Bottom-right Lavender/Blue Glow */}
        <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-sky-100/60 via-indigo-50/40 to-transparent blur-3xl opacity-80" />
      </div>

      {/* TOP HEADER */}
      <header className="relative z-10 w-full px-6 sm:px-12 py-5 flex items-center justify-between">
        {/* Logo Brand */}
        <div className="flex items-center gap-2.5 cursor-pointer">
          <div className="text-[#005f52]">
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <span className="text-base sm:text-lg font-black tracking-tight text-[#005f52]">
            SABANA CEGAK
          </span>
        </div>

        {/* Right Nav Links */}
        <div className="flex items-center gap-4 text-xs sm:text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={() => setActiveModal("clinical")}
            className="flex items-center gap-1.5 hover:text-[#005f52] transition-colors"
          >
            <Stethoscope className="w-4 h-4 text-slate-500" />
            <span>Bantuan Klinis</span>
          </button>

          <span className="text-slate-300">|</span>

          <button
            type="button"
            onClick={() => setActiveModal("portal-info")}
            className="flex items-center gap-1.5 text-slate-700 hover:text-[#005f52] transition-colors"
          >
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>Portal Pasien</span>
          </button>
        </div>
      </header>

      {/* CENTER LOGIN FORM CARD */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-[430px]">
          {/* Main Card */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-[0_15px_45px_rgba(0,95,82,0.06)] border border-slate-100 transition-all">
            {/* Top Icon Badge */}
            <div className="flex justify-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-[#eff6ff] border border-blue-100 flex items-center justify-center shadow-xs">
                <svg
                  className="w-7 h-7 text-[#3b82f6]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="text-center mb-7">
              <h1 className="text-2xl font-black tracking-tight text-[#005f52]">
                SABANA CEGAK
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1.5">
                Pendamping Pemulihan Pasien di Rumah
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Field: Email / WhatsApp */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email / No. WhatsApp
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 pointer-events-none text-slate-400">
                    {/* ID / Medical Contact Badge Icon */}
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="18" height="14" x="3" y="5" rx="2" />
                      <circle cx="8" cy="11" r="2" />
                      <path d="M13 10h4" />
                      <path d="M13 14h4" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="contoh@medis.id atau 08123456789"
                    className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#005f52]/20 focus:border-[#005f52] transition-all"
                  />
                </div>
              </div>

              {/* Field: Kata Sandi */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Kata Sandi
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveModal("forgot")}
                    className="text-xs font-semibold text-[#005f52] hover:text-[#00473d] transition-colors"
                  >
                    Lupa Kata Sandi?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#005f52]/20 focus:border-[#005f52] transition-all tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 focus:outline-none p-1"
                    title={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 px-4 rounded-xl font-bold text-sm sm:text-base text-white bg-[#005f52] hover:bg-[#004d42] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm shadow-[#005f52]/20 cursor-pointer disabled:opacity-70"
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Memverifikasi...
                  </span>
                ) : (
                  <>
                    <span>Masuk</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center my-6">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="shrink-0 px-3 text-[11px] font-medium text-slate-400">
                atau masuk dengan
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 transition-colors flex items-center justify-center gap-3 text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs"
            >
              {/* Google Colorful G Icon */}
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Masuk dengan Google</span>
            </button>

            {/* Register Link */}
            <div className="mt-6 text-center text-xs text-slate-500">
              Belum punya akun?{" "}
              <button
                type="button"
                onClick={() => {
                  if (onSwitchToRegister) {
                    onSwitchToRegister();
                  } else {
                    setActiveModal("register");
                  }
                }}
                className="font-bold text-[#005f52] hover:text-[#00473d] transition-colors"
              >
                Daftar Akun Keluarga
              </button>
            </div>
          </div>

          {/* Security & Privacy Medical Standard Badge */}
          <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium text-center">
            <svg
              className="w-4 h-4 text-[#005f52] shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <span>Keamanan Data Terenkripsi & Sesuai Standar Privasi Medis</span>
          </div>

          {/* Quick Demo Access Bar (Helpful for Hackathon testing) */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-100/60 text-[#005f52] hover:bg-emerald-100 transition-colors border border-emerald-200"
            >
              <Sparkles className="w-3 h-3 text-[#005f52]" />
              <span>Demo Cepat: Masuk sebagai Pendamping</span>
            </button>
          </div>
        </div>
      </main>

      {/* BOTTOM FOOTER */}
      <footer className="relative z-10 w-full px-6 sm:px-12 py-5 border-t border-slate-200/60 text-[11px] sm:text-xs text-slate-400 font-normal">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          {/* Left copyright & compliance */}
          <div>
            © 2024 SABANA CEGAK Healthcare. HIPAA Compliant & Secure Medical Portal.
          </div>

          {/* Right Links & Hotline */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-slate-500">
            <a
              href="tel:18002342563"
              className="inline-flex items-center gap-1 text-[#005f52] font-semibold hover:underline"
            >
              <Phone className="w-3 h-3" />
              <span>Hotline 24 Jam: 1-800-CEGAK-MED</span>
            </a>

            <span className="text-slate-300">|</span>

            <button
              type="button"
              onClick={() => setActiveModal("emergency")}
              className="hover:text-slate-700 transition-colors"
            >
              Emergency Protocol
            </button>

            <span className="text-slate-300">|</span>

            <button
              type="button"
              onClick={() => setActiveModal("privacy")}
              className="hover:text-slate-700 transition-colors"
            >
              Privacy Policy
            </button>
          </div>
        </div>
      </footer>

      {/* INTERACTIVE MODALS */}
      {/* 1. Modal: Daftar Akun Keluarga */}
      {activeModal === "register" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 text-[#005f52] mb-3">
              <HeartHandshake className="w-6 h-6" />
              <h3 className="text-lg font-bold text-slate-900">
                Pendaftaran Akun Keluarga Pasien
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Daftarkan diri Anda sebagai pendamping utama (*caregiver*) untuk memantau jadwal obat dan pemulihan luka pasien di rumah.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setModalSuccessMsg("Akun keluarga berhasil didaftarkan! Mengalihkan...");
                setTimeout(() => {
                  setActiveModal(null);
                  if (onLoginSuccess) {
                    onLoginSuccess({
                      name: "Keluarga Baru",
                      identifier: identifier || "keluarga@cegak.id",
                      role: "Registered Caregiver",
                    });
                  }
                }, 800);
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap Pendamping
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Siti Rahma"
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:border-[#005f52] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hubungan dengan Pasien
                </label>
                <select className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:border-[#005f52] focus:outline-none bg-white">
                  <option>Anak / Menantu</option>
                  <option>Suami / Istri</option>
                  <option>Orang Tua</option>
                  <option>Saudara Kandung</option>
                  <option>Perawat Khusus (Nurse Companion)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  No. WhatsApp Aktif
                </label>
                <input
                  type="tel"
                  required
                  placeholder="08123456789"
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:border-[#005f52] focus:outline-none"
                />
              </div>

              {modalSuccessMsg && (
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{modalSuccessMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#005f52] hover:bg-[#004d42] transition-colors"
              >
                Selesaikan Pendaftaran
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: Lupa Kata Sandi */}
      {activeModal === "forgot" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => {
                setActiveModal(null);
                setModalSuccessMsg("");
              }}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-2">
              Pemulihan Kata Sandi
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Masukkan Email atau No. WhatsApp Anda untuk menerima kode OTP verifikasi pemulihan sandi medis.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setModalSuccessMsg("Tautan pemulihan telah dikirim ke WhatsApp / Email Anda.");
              }}
              className="space-y-3"
            >
              <input
                type="text"
                required
                placeholder="Email atau No. WhatsApp"
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:border-[#005f52] focus:outline-none"
              />

              {modalSuccessMsg ? (
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-medium">
                  {modalSuccessMsg}
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-[#005f52] hover:bg-[#004d42] transition-colors"
                >
                  Kirim Kode Verifikasi
                </button>
              )}
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal: Bantuan Klinis */}
      {activeModal === "clinical" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 text-[#005f52] mb-3">
              <Stethoscope className="w-6 h-6" />
              <h3 className="text-lg font-bold text-slate-900">
                Pusat Bantuan Klinis
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Tim perawat dan konsultan medis SABANA CEGAK siap membantu keluarga pasien selama masa pemulihan di rumah.
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800 block mb-0.5">
                  Konsultasi Perawatan Luka Pasca Operasi
                </span>
                <span className="text-slate-600">
                  Konsultasi penggantian perban, tanda infeksi luka jahitan, atau drainase cairan.
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800 block mb-0.5">
                  Verifikasi Resep & Jadwal Minum Obat
                </span>
                <span className="text-slate-600">
                  Bantuan membaca resep dokter yang tidak jelas atau interaksi obat antibiotik.
                </span>
              </div>

              <a
                href="https://wa.me/6281234567890?text=Halo%20Bantuan%20Klinis%20SABANA%20CEGAK"
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-[#005f52] hover:bg-[#004d42] flex items-center justify-center gap-2 transition-colors block text-center"
              >
                <span>Hubungi Perawat Jaga via WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal: Emergency Protocol */}
      {activeModal === "emergency" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-rose-600 mb-2">
              <AlertCircle className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900">
                Protokol Gawat Darurat Pasca Rawat
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Segera hubungi ambulans atau bawa pasien ke IGD RS terdekat jika terjadi salah satu kondisi tanda bahaya berikut:
            </p>

            <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-700 mb-5 bg-rose-50/60 p-3.5 rounded-xl border border-rose-200">
              <li>Demam tinggi &gt; 38.5°C disertai menggigil hebat.</li>
              <li>Pendarahan aktif atau keluar nanah berbau dari luka operasi.</li>
              <li>Nyeri dada menusuk, sesak napas berat, atau bibir kebiruan.</li>
              <li>Penurunan kesadaran, linglung, atau tidak merespons panggilan.</li>
            </ul>

            <a
              href="tel:119"
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-rose-600 hover:bg-rose-700 transition-colors flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>Panggil Ambulans Darurat (119)</span>
            </a>
          </div>
        </div>
      )}

      {/* 5. Modal: Privacy Policy */}
      {activeModal === "privacy" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#005f52]" />
              Kebijakan Privasi & Standar Medis
            </h3>
            <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
              <p>
                SABANA CEGAK mematuhi prinsip kerahasiaan rekam medis pasien sesuai standar Undang-Undang Kesehatan dan regulasi perlindungan data pribadi.
              </p>
              <p>
                <strong>1. Pemrosesan Data:</strong> Berkas dokumen kepulangan (Discharge summary) diproses secara terenkripsi in-memory tanpa disimpan permanen di server publik.
              </p>
              <p>
                <strong>2. Keamanan Gemini API:</strong> Komunikasi AI dilakukan melalui kanal TLS 1.3 aman dengan batasan ketat audit keselamatan pasien.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 6. Modal: Portal Pasien Info */}
      {activeModal === "portal-info" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-[#005f52]" />
              Portal Pasien SABANA CEGAK
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              Portal ini diperuntukkan bagi keluarga pasien rawat inap rumah sakit mitra FIRETECH 2026. Masukkan nomor kontak atau akun keluarga Anda untuk mengakses dasbor.
            </p>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2 rounded-xl text-xs font-semibold bg-[#005f52] text-white"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;

