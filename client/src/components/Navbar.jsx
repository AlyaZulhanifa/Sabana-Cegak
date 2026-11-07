import React from "react";
import {
  Menu,
  PhoneCall,
  LogOut,
  User,
  Users,
  ChevronDown,
  UploadCloud,
  Bell,
} from "lucide-react";

export const Navbar = ({
  currentUser,
  activePatient,
  patients = [],
  onSelectPatient,
  onOpenMobileMenu,
  onLogout,
  onOpenUpload,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-2xs">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile hamburger + Active Patient Indicator */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenMobileMenu}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Patient Selector */}
            <div className="flex items-center gap-2 bg-[#E8F2ED] text-[#153C35] px-3 py-1.5 rounded-xl border border-emerald-200/60">
              <Users className="w-4 h-4 text-[#153C35]" />
              <div className="text-left">
                <span className="text-[10px] text-emerald-800/80 font-bold uppercase tracking-wider block leading-none">
                  Pasien Aktif
                </span>
                <span className="text-xs sm:text-sm font-black text-[#153C35] leading-tight">
                  {activePatient?.name || "Ibu Siti (DEMO)"}
                </span>
              </div>
            </div>
          </div>

          {/* Right Info & Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Quick Upload Button */}
            {onOpenUpload && (
              <button
                onClick={onOpenUpload}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#153C35] hover:bg-[#0c2420] transition-colors shadow-xs"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Unggah Dokumen</span>
              </button>
            )}

            {/* Emergency 119 Hotline */}
            <a
              href="tel:119"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
              title="Panggilan Darurat Medis 119"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Darurat 119</span>
            </a>

            {/* User Profile & Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-800 leading-tight">
                  {currentUser?.name || "Siti Rahma"}
                </span>
                <span className="text-[10px] text-slate-500">
                  {currentUser?.role || "Pendamping Pasien"}
                </span>
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors border border-slate-200 hover:border-rose-200 flex items-center gap-1"
                title="Keluar dari akun"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
