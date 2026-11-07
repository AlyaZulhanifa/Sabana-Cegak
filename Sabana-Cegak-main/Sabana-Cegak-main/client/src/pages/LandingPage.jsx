import React, { useState } from "react";
import {
  FileText,
  Pill,
  ClipboardCheck,
  CalendarCheck,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Heart,
  ChevronRight,
  Stethoscope,
  Activity,
  Clock,
  Phone,
  Lock,
  Layers,
} from "lucide-react";
import logoImg from "../assets/images/Logo Sabana Cegak.png";

export const LandingPage = ({ onGetStarted, onGoToLogin, onGoToRegister }) => {
  const [activeTab, setActiveTab] = useState("ocr");

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F9F9] text-slate-800 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#86D2DC]/30 selection:text-[#0F4643]">
      {/* =================================================================== */}
      {/* 1. NAVBAR / HEADER */}
      {/* =================================================================== */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Brand Identity */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#86D2DC]/20 to-[#11B5AE]/20 border border-[#86D2DC]/40 flex items-center justify-center p-2 shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <img
                src={logoImg}
                alt="Logo SABANA CEGAK"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-black tracking-tight text-[#0F4643] leading-none">
                  SABANA CEGAK
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#86D2DC]/20 text-[#0F4643] border border-[#86D2DC]/40">
                  FIRETECH 2026
                </span>
              </div>
              <span className="text-[11px] text-[#11B5AE] font-semibold tracking-wide block mt-1">
                Care Better. Together.
              </span>
            </div>
          </div>

          {/* Center Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <button
              onClick={() => scrollToSection("problem-solution")}
              className="hover:text-[#11B5AE] transition-colors"
            >
              Tantangan & Solusi
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className="hover:text-[#11B5AE] transition-colors"
            >
              Fitur Utama
            </button>
            <button
              onClick={() => scrollToSection("preview")}
              className="hover:text-[#11B5AE] transition-colors"
            >
              Simulasi AI
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="hover:text-[#11B5AE] transition-colors"
            >
              Tentang Kami
            </button>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onGoToLogin || onGetStarted}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-[#0F4643] hover:text-[#11B5AE] transition-colors"
            >
              Masuk Portal
            </button>

            <button
              type="button"
              onClick={onGetStarted}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#11B5AE] hover:bg-[#0e9690] active:scale-95 transition-all shadow-md shadow-[#11B5AE]/25"
            >
              <span>Mulai Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* =================================================================== */}
      {/* 2. HERO SECTION */}
      {/* =================================================================== */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Soft Ambient Medical Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none -z-10">
          <div className="absolute top-8 left-10 w-96 h-96 rounded-full bg-[#86D2DC]/25 blur-3xl opacity-80" />
          <div className="absolute top-20 right-10 w-[420px] h-[420px] rounded-full bg-[#11B5AE]/15 blur-3xl opacity-70" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              {/* Innovation Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#86D2DC]/50 shadow-2xs text-[#0F4643] text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-[#11B5AE] animate-pulse" />
                <Sparkles className="w-3.5 h-3.5 text-[#11B5AE]" />
                <span>Solusi Pemulihan Pasien Pasca-Rawat Inap • FIRETECH 2026</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[2.75rem] font-black text-[#0F4643] tracking-tight leading-[1.18]">
                SABANA CEGAK – Pendamping Perawatan Pasien Pasca-Rawat Inap Berbasis AI
              </h1>

              {/* Subheadline */}
              <p className="text-base sm:text-lg md:text-xl text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Merawat keluarga bukan hanya tentang perhatian, tetapi memastikan setiap langkah perawatan dilakukan dengan tepat.
              </p>

              {/* CTA Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  type="button"
                  onClick={onGetStarted}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold text-white bg-[#11B5AE] hover:bg-[#0e9690] active:scale-98 transition-all shadow-lg shadow-[#11B5AE]/30 flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <span>Mulai Sekarang</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection("features")}
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl text-base font-bold text-[#0F4643] bg-white border-2 border-[#86D2DC] hover:bg-[#86D2DC]/10 hover:border-[#11B5AE] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Activity className="w-5 h-5 text-[#11B5AE]" />
                  <span>Pelajari Fitur</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#11B5AE]" />
                  <span>Standar Rekam Medis Aman</span>
                </div>
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-[#11B5AE]" />
                  <span>Didukung Gemini 2.0 AI</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#11B5AE]" />
                  <span>Didesain Khusus Keluarga Pasien</span>
                </div>
              </div>
            </div>

            {/* Right Logo Display */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md aspect-square flex items-center justify-center p-4 sm:p-8">
                {/* Soft Ambient Medical Aura */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#86D2DC]/30 via-[#11B5AE]/20 to-transparent blur-3xl opacity-75 pointer-events-none" />
                
                {/* Logo Image (Responsif & Proporsional) */}
                <img
                  src={logoImg}
                  alt="Logo SABANA CEGAK"
                  className="relative z-10 w-full h-full max-h-[320px] sm:max-h-[380px] md:max-h-[420px] object-contain drop-shadow-[0_20px_35px_rgba(17,181,174,0.18)] hover:scale-105 transition-transform duration-500 ease-out"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 3. PROBLEM & SOLUTION SECTION */}
      {/* =================================================================== */}
      <section id="problem-solution" className="py-16 sm:py-24 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Heading */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-black tracking-widest text-[#11B5AE] uppercase">
              Tantangan Nyata Perawatan Pasca Pulang RS
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0F4643] tracking-tight">
              Keluarga Seringkali Kewalahan Saat Membawa Pasien Pulang ke Rumah
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Masa transisi dari pengawasan perawat rumah sakit ke lingkungan rumah penuh kecemasan. Berikut 3 masalah utama yang sering dialami keluarga:
            </p>
          </div>

          {/* 3 Main Problem Cards */}
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {/* Problem 1 */}
            <div className="p-7 rounded-3xl bg-rose-50/50 border border-rose-200/70 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-5 shadow-2xs">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-black text-rose-950 mb-2">
                  Bingung Memahami Dokumen Medis yang Rumit
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Lembaran *Discharge Summary*, tulisan tangan dokter yang padat, dan istilah latin kedokteran seringkali membuat keluarga bingung apa yang sebenarnya harus dilakukan di rumah.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-rose-200/60 text-xs font-bold text-rose-700 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Rentan salah persepsi instruksi dokter</span>
              </div>
            </div>

            {/* Problem 2 */}
            <div className="p-7 rounded-3xl bg-amber-50/50 border border-amber-200/70 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-5 shadow-2xs">
                  <Pill className="w-6 h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-black text-amber-950 mb-2">
                  Lupa Jadwal & Tertukar Dosis Obat
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Pasien pulang biasanya membawa 4 sampai 8 jenis obat dengan jadwal berbeda (pagi, siang, malam, sebelum/sesudah makan). Risiko lupa minum atau dosis ganda sangat tinggi.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-amber-200/60 text-xs font-bold text-amber-800 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Efektivitas obat menurun & risiko resistensi</span>
              </div>
            </div>

            {/* Problem 3 */}
            <div className="p-7 rounded-3xl bg-blue-50/50 border border-blue-200/70 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-[#0F4643] flex items-center justify-center mb-5 shadow-2xs">
                  <ClipboardCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 mb-2">
                  Perawatan Rumah yang Tak Teratur
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Penggantian perban luka bedah, kepatuhan pantangan makanan, dan monitoring tanda-tanda komplikasi darurat tidak tercatat dengan standar klinis yang benar.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-blue-200/60 text-xs font-bold text-[#0F4643] flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Komplikasi pasca rawat berisiko readmisi RS</span>
              </div>
            </div>
          </div>

          {/* Integrated Solution Banner */}
          <div className="mt-12 rounded-3xl bg-gradient-to-r from-[#0F4643] to-[#11B5AE] p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl text-center md:text-left">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-xs inline-block">
                Solusi Terpadu SABANA CEGAK
              </span>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Mengubah Lembar Medis Rumit Menjadi Tindakan Harian yang Pasti & Mudah
              </h3>
              <p className="text-xs sm:text-sm text-teal-50 leading-relaxed">
                Melalui kolaborasi kecerdasan buatan Gemini AI dan standar rekam medis modern, seluruh instruksi dokter diterjemahkan ke dalam panduan keluarga yang interaktif, aman, dan menenangkan.
              </p>
            </div>
            <button
              type="button"
              onClick={onGetStarted}
              className="px-6 py-3.5 rounded-2xl bg-white text-[#0F4643] hover:bg-[#86D2DC]/20 hover:text-white border border-transparent hover:border-white font-black text-sm shrink-0 transition-all shadow-md"
            >
              Coba Sekarang Gratis
            </button>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 4. CORE FEATURES SECTION (4 CARD GRID) */}
      {/* =================================================================== */}
      <section id="features" className="py-16 sm:py-24 bg-[#F5F9F9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Title */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-black tracking-widest text-[#11B5AE] uppercase">
              Fitur Andalan Berbasis AI
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0F4643] tracking-tight">
              4 Pilar Utama Pendampingan Pasien SABANA CEGAK
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Dirancang dengan human-centered design agar ramah untuk semua generasi keluarga, dari anak hingga lansia.
            </p>
          </div>

          {/* 4 CARDS GRID */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: AI Medical Document Reader */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200/90 hover:border-[#11B5AE] hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#86D2DC]/20 to-[#11B5AE]/20 border border-[#86D2DC]/40 text-[#11B5AE] flex items-center justify-center mb-6 shadow-xs group-hover:scale-105 transition-transform">
                  <FileText className="w-7 h-7" />
                </div>
                <div className="text-[10px] font-bold text-[#11B5AE] uppercase tracking-wider mb-1">
                  Fitur 01 • Multimodal OCR
                </div>
                <h3 className="text-lg font-black text-[#0F4643] mb-2.5">
                  AI Medical Document Reader
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Analisis dokumen medis & instruksi dokter secara akurat.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-slate-500">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#11B5AE] shrink-0 mt-0.5" />
                    <span>Scan foto berkas kepulangan RS / resep obat</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#11B5AE] shrink-0 mt-0.5" />
                    <span>Terjemahan bahasa medis ke instruksi keluarga</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#11B5AE] shrink-0 mt-0.5" />
                    <span>Deteksi peringatan tanda bahaya darurat</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#11B5AE]">
                <span>Tersertifikasi AI Gemini</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 2: Smart Medication Reminder */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200/90 hover:border-[#11B5AE] hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#86D2DC]/20 to-[#11B5AE]/20 border border-[#86D2DC]/40 text-[#11B5AE] flex items-center justify-center mb-6 shadow-xs group-hover:scale-105 transition-transform">
                  <Pill className="w-7 h-7" />
                </div>
                <div className="text-[10px] font-bold text-[#11B5AE] uppercase tracking-wider mb-1">
                  Fitur 02 • Jadwal & Dosis
                </div>
                <h3 className="text-lg font-black text-[#0F4643] mb-2.5">
                  Smart Medication Reminder
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Pengingat jadwal dan dosis obat otomatis.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-slate-500">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#11B5AE] shrink-0 mt-0.5" />
                    <span>Alarm interaktif jam minum obat keluarga</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#11B5AE] shrink-0 mt-0.5" />
                    <span>Pencatatan status diminum atau terlewat</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#11B5AE] shrink-0 mt-0.5" />
                    <span>Pencegahan salah dosis & interaksi obat berbahaya</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#11B5AE]">
                <span>Pengingat Tepat Waktu</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 3: Daily Home Care Checklist */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200/90 hover:border-[#11B5AE] hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#86D2DC]/20 to-[#11B5AE]/20 border border-[#86D2DC]/40 text-[#11B5AE] flex items-center justify-center mb-6 shadow-xs group-hover:scale-105 transition-transform">
                  <ClipboardCheck className="w-7 h-7" />
                </div>
                <div className="text-[10px] font-bold text-[#11B5AE] uppercase tracking-wider mb-1">
                  Fitur 03 • Rencana Pemulihan
                </div>
                <h3 className="text-lg font-black text-[#0F4643] mb-2.5">
                  Daily Home Care Checklist
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Daftar pantau perawatan harian keluarga.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-slate-500">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#11B5AE] shrink-0 mt-0.5" />
                    <span>Prosedur ganti perban luka operasi steril</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#11B5AE] shrink-0 mt-0.5" />
                    <span>Panduan asupan nutrisi & pantangan medis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#11B5AE] shrink-0 mt-0.5" />
                    <span>Monitoring suhu, tensi, dan keluhan fisik</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#11B5AE]">
                <span>Langkah Terarah</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 4: Appointment Monitoring */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200/90 hover:border-[#11B5AE] hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#86D2DC]/20 to-[#11B5AE]/20 border border-[#86D2DC]/40 text-[#11B5AE] flex items-center justify-center mb-6 shadow-xs group-hover:scale-105 transition-transform">
                  <CalendarCheck className="w-7 h-7" />
                </div>
                <div className="text-[10px] font-bold text-[#11B5AE] uppercase tracking-wider mb-1">
                  Fitur 04 • Kunjungan Spesialis
                </div>
                <h3 className="text-lg font-black text-[#0F4643] mb-2.5">
                  Appointment Monitoring
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Jadwal kontrol dan konsultasi rutin pasien.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-slate-500">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#11B5AE] shrink-0 mt-0.5" />
                    <span>Hitung mundur tanggal kontrol poliklinik</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#11B5AE] shrink-0 mt-0.5" />
                    <span>Checklist kelengkapan berkas rujukan BPJS / RS</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#11B5AE] shrink-0 mt-0.5" />
                    <span>Rangkuman perkembangan siap ditunjukkan ke dokter</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#11B5AE]">
                <span>Kontrol Tanpa Terlewat</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 5. SIMULATION / INTERACTIVE PREVIEW SECTION */}
      {/* =================================================================== */}
      <section id="preview" className="py-16 bg-white border-t border-slate-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 space-y-2">
            <span className="text-xs font-black tracking-widest text-[#11B5AE] uppercase">
              Pengalaman Pengguna
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0F4643]">
              Bagaimana SABANA CEGAK Bekerja
            </h2>
          </div>

          <div className="bg-[#F5F9F9] rounded-3xl p-6 sm:p-10 border border-slate-200">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-[#86D2DC]/20 text-[#0F4643] font-black flex items-center justify-center mx-auto mb-3">
                  1
                </div>
                <h4 className="font-bold text-sm text-slate-800 mb-1">Unggah Dokumen Medis</h4>
                <p className="text-xs text-slate-500">
                  Ambil foto resume pulang atau resep obat dari ponsel Anda.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-[#11B5AE]/20 text-[#11B5AE] font-black flex items-center justify-center mx-auto mb-3">
                  2
                </div>
                <h4 className="font-bold text-sm text-slate-800 mb-1">AI Ekstraksi Otomatis</h4>
                <p className="text-xs text-slate-500">
                  Gemini AI mengidentifikasi obat, jadwal, dan pantauan klinis.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-[#0F4643]/20 text-[#0F4643] font-black flex items-center justify-center mx-auto mb-3">
                  3
                </div>
                <h4 className="font-bold text-sm text-slate-800 mb-1">Dampingi dengan Tenang</h4>
                <p className="text-xs text-slate-500">
                  Seluruh keluarga menerima pengingat dan checklist harian yang jelas.
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={onGetStarted}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm text-white bg-[#11B5AE] hover:bg-[#0e9690] shadow-md shadow-[#11B5AE]/30 transition-all"
              >
                <span>Mulai Gunakan SABANA CEGAK</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 6. FOOTER SECTION */}
      {/* =================================================================== */}
      <footer id="faq" className="mt-auto bg-[#0F4643] text-white pt-14 pb-8 border-t border-teal-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-teal-800/40">
            {/* Left Col: Brand & Tagline */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-[#86D2DC]/40 flex items-center justify-center p-2 shadow-xs shrink-0">
                  <img
                    src={logoImg}
                    alt="Logo SABANA CEGAK"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <span className="text-lg font-black tracking-tight text-white block">
                    SABANA CEGAK
                  </span>
                  <span className="text-xs font-semibold text-[#86D2DC]">
                    Care Better. Together.
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-teal-100/80 leading-relaxed max-w-sm">
                Platform pendamping perawatan pasien pasca-rawat inap berbasis AI pertama yang memberdayakan keluarga dan *caregiver* menuju pemulihan optimal di rumah.
              </p>

              <div className="pt-1 flex items-center gap-3 text-xs text-[#86D2DC]">
                <span className="px-2.5 py-1 rounded-md bg-white/10 border border-white/10 font-bold">
                  FIRETECH 2026
                </span>
                <span>Healthcare Innovation Award</span>
              </div>
            </div>

            {/* Quick Navigation */}
            <div className="md:col-span-4 space-y-3">
              <h4 className="text-sm font-bold text-[#86D2DC] uppercase tracking-wider">
                Navigasi Cepat
              </h4>
              <ul className="space-y-2 text-xs text-teal-100/80">
                <li>
                  <button
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className="hover:text-white transition-colors"
                  >
                    Beranda Utama
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("problem-solution")}
                    className="hover:text-white transition-colors"
                  >
                    Tantangan & Solusi
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("features")}
                    className="hover:text-white transition-colors"
                  >
                    4 Fitur Utama AI
                  </button>
                </li>
                <li>
                  <button
                    onClick={onGoToLogin || onGetStarted}
                    className="hover:text-white transition-colors"
                  >
                    Portal Akun Keluarga
                  </button>
                </li>
              </ul>
            </div>

            {/* Emergency & Support */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="text-sm font-bold text-[#86D2DC] uppercase tracking-wider">
                Bantuan & Darurat
              </h4>
              <p className="text-xs text-teal-100/70">
                Layanan gawat darurat medis nasional:
              </p>
              <a
                href="tel:119"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white font-bold text-xs shadow-xs transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Panggilan Darurat 119</span>
              </a>
              <div className="text-[11px] text-teal-200/60 pt-2">
                Hotline Konsultasi: 0812-3456-7890
              </div>
            </div>
          </div>

          {/* Bottom Copyright & Tagline */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs text-teal-200/60">
            <div>
              © 2026 SABANA CEGAK. Hak Cipta Dilindungi Undang-Undang.
            </div>
            <div className="flex items-center gap-2 text-[#86D2DC] font-semibold text-xs">
              <Heart className="w-3.5 h-3.5 text-[#11B5AE]" />
              <span>Tagline: "Care Better. Together."</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

