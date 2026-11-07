import React, { useState } from "react";
import {
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Home,
} from "lucide-react";
import { registerUser } from "../services/api";
import logoImg from "../assets/images/Logo Sabana Cegak.png";

export const RegisterPage = ({ onRegisterSuccess, onSwitchToLogin, onBackToLanding }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.name || !formData.email || !formData.password) {
      setErrorMsg("Mohon lengkapi semua kolom wajib!");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg("Kata sandi minimal 6 karakter.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await registerUser(formData);
      if (res.user && onRegisterSuccess) {
        onRegisterSuccess(res.user);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || "Gagal melakukan registrasi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F5F9F9] selection:bg-[#86D2DC]/30 selection:text-[#0F4643] py-8 px-4 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Brand Header */}
      <div className="max-w-md mx-auto text-center mb-6">
        <div
          onClick={onBackToLanding}
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#86D2DC]/20 to-[#11B5AE]/20 border border-[#86D2DC]/40 p-2 flex items-center justify-center mx-auto mb-3 shadow-sm cursor-pointer hover:scale-105 transition-transform"
        >
          <img
            src={logoImg}
            alt="Logo SABANA CEGAK"
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-2xl font-black text-[#0F4643] tracking-tight">SABANA CEGAK</h1>
        <p className="text-xs text-[#11B5AE] font-semibold mt-0.5">Care Better. Together.</p>
        <p className="text-xs text-slate-500 mt-1">Daftar Akun Pendamping Keluarga Pasien</p>
      </div>

      {/* Card Form */}
      <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-auto shadow-xl border border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-slate-900">Buat Akun Caregiver</h2>
          {onBackToLanding && (
            <button
              type="button"
              onClick={onBackToLanding}
              className="text-xs font-semibold text-[#11B5AE] hover:text-[#0e9690] flex items-center gap-1"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Beranda</span>
            </button>
          )}
        </div>
        <p className="text-xs text-slate-500 mb-5">
          Kelola obat, jadwal kontrol, dan pantau pemulihan anggota keluarga pasca pulang dari RS.
        </p>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap Pendamping *</label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                required
                placeholder="Misal: Siti Rahma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 bg-white focus:outline-none focus:border-[#11B5AE] focus:ring-2 focus:ring-[#11B5AE]/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Aktif *</label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="email"
                required
                placeholder="nama@keluarga.id"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 bg-white focus:outline-none focus:border-[#11B5AE] focus:ring-2 focus:ring-[#11B5AE]/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">No. WhatsApp</label>
            <div className="relative flex items-center">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="tel"
                placeholder="08123456789 (opsional untuk notifikasi)"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 bg-white focus:outline-none focus:border-[#11B5AE] focus:ring-2 focus:ring-[#11B5AE]/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Kata Sandi *</label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="password"
                required
                placeholder="Minimal 6 karakter"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 bg-white focus:outline-none focus:border-[#11B5AE] focus:ring-2 focus:ring-[#11B5AE]/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Ulangi Kata Sandi *</label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 bg-white focus:outline-none focus:border-[#11B5AE] focus:ring-2 focus:ring-[#11B5AE]/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#11B5AE] hover:bg-[#0e9690] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md shadow-[#11B5AE]/25 disabled:opacity-50"
          >
            {isLoading ? <span>Mendaftarkan...</span> : <span>Daftar Akun Keluarga</span>}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-slate-500">
          Sudah memiliki akun?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-bold text-[#11B5AE] hover:underline"
          >
            Masuk Sekarang
          </button>
        </div>
      </div>

      <div className="text-center text-[11px] text-slate-400 mt-6 flex items-center justify-center gap-2">
        <img src={logoImg} alt="Logo" className="w-4 h-4 object-contain" />
        <span>© 2026 SABANA CEGAK • Care Better. Together.</span>
      </div>
    </div>
  );
};

export default RegisterPage;
