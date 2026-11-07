import React, { useState } from "react";
import {
  HeartPulse,
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { registerUser } from "../services/api";

export const RegisterPage = ({ onRegisterSuccess, onSwitchToLogin }) => {
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
    <div className="min-h-screen flex flex-col justify-between bg-[#F5F7F6] selection:bg-emerald-100 selection:text-emerald-900 py-8 px-4">
      {/* Brand Header */}
      <div className="max-w-md mx-auto text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-[#153C35] text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-[#153C35]/20">
          <HeartPulse className="w-6 h-6 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-black text-[#153C35]">SABANA CEGAK</h1>
        <p className="text-xs text-slate-500 mt-1">Daftar Akun Pendamping Keluarga Pasien</p>
      </div>

      {/* Card Form */}
      <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-auto shadow-xl border border-slate-100">
        <h2 className="text-lg font-bold text-slate-900 mb-1">Buat Akun Caregiver</h2>
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
                className="w-full text-xs rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 bg-white focus:outline-none focus:border-[#153C35]"
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
                placeholder="caregiver@email.id"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 bg-white focus:outline-none focus:border-[#153C35]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">No. WhatsApp</label>
            <div className="relative flex items-center">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="tel"
                placeholder="08123456789"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 bg-white focus:outline-none focus:border-[#153C35]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Kata Sandi (Min 6 Karakter) *</label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 bg-white focus:outline-none focus:border-[#153C35]"
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
                className="w-full text-xs rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 bg-white focus:outline-none focus:border-[#153C35]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#153C35] hover:bg-[#0c2420] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
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
            className="font-bold text-[#153C35] hover:underline"
          >
            Masuk Sekarang
          </button>
        </div>
      </div>

      <div className="text-center text-[11px] text-slate-400 mt-6">
        © 2026 SABANA CEGAK Healthcare • FIRETECH 2026 Hackathon
      </div>
    </div>
  );
};

export default RegisterPage;

