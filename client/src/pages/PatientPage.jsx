import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Calendar,
  Building2,
  HeartHandshake,
  Check,
  Trash2,
  Edit,
  Clock,
  Sparkles,
} from "lucide-react";
import { getPatients, createPatient } from "../services/api";

export const PatientPage = ({ activePatient, onSelectPatient }) => {
  const [patients, setPatients] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    age: "",
    gender: "Perempuan",
    dischargeDate: new Date().toISOString().split("T")[0],
    hospitalName: "",
    primaryCaregiver: "",
    relationship: "Anak Kandung",
  });

  const loadPatients = async () => {
    try {
      const res = await getPatients();
      setPatients(res.data || []);
    } catch (e) {
      console.error("Gagal memuat pasien:", e);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.dischargeDate || !formData.primaryCaregiver) {
      return alert("Mohon lengkapi data wajib pasien!");
    }

    try {
      const res = await createPatient(formData);
      setShowAddModal(false);
      setFormData({
        name: "",
        birthDate: "",
        age: "",
        gender: "Perempuan",
        dischargeDate: new Date().toISOString().split("T")[0],
        hospitalName: "",
        primaryCaregiver: "",
        relationship: "Anak Kandung",
      });
      loadPatients();
      if (onSelectPatient && res.data) {
        onSelectPatient(res.data);
      }
    } catch (err) {
      alert("Gagal menambahkan pasien: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-[#153C35]" />
            Data Profil Pasien Pasca Rawat
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola profil pasien rawat jalan keluarga Anda. Satu akun dapat mendampingi beberapa anggota keluarga.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#153C35] hover:bg-[#0c2420] transition-colors shadow-xs self-start sm:self-center"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Profil Pasien</span>
        </button>
      </div>

      {/* Patient Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {patients.map((p) => {
          const isActive = activePatient?.id === p.id;

          return (
            <div
              key={p.id}
              className={`bg-white rounded-2xl border p-5 shadow-sm transition-all flex flex-col justify-between ${
                isActive
                  ? "border-[#153C35] ring-2 ring-[#153C35]/15"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                    {p.gender || "Pasien"} {p.age ? `• ${p.age} thn` : ""}
                  </span>

                  {isActive && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8F2ED] text-[#153C35]">
                      ✓ Sedang Dipantau
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-black text-slate-900 leading-tight">
                  {p.name}
                </h3>

                <div className="space-y-1.5 mt-3 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Pulang RS: {p.dischargeDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>RS: {p.hospitalName || "RS Rujukan"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HeartHandshake className="w-3.5 h-3.5 text-slate-400" />
                    <span>Pendamping: {p.primaryCaregiver} ({p.relationship})</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onSelectPatient && onSelectPatient(p)}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-[#E8F2ED] text-[#153C35] cursor-default"
                      : "bg-[#153C35] hover:bg-[#0c2420] text-white shadow-xs"
                  }`}
                >
                  {isActive ? "Sedang Aktif Dipantau" : "Pilih Pasien Ini"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Tambah Pasien */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Tambah Profil Pasien Baru</h3>
            <p className="text-xs text-slate-500 mb-4">
              Masukkan informasi dasar pasien pasca rawat inap untuk memulai pendampingan di rumah.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap Pasien *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Bapak Hendra"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Usia (Tahun)</label>
                  <input
                    type="number"
                    placeholder="Contoh: 62"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white"
                  >
                    <option>Perempuan</option>
                    <option>Laki-laki</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Keluar RS *</label>
                  <input
                    type="date"
                    required
                    value={formData.dischargeDate}
                    onChange={(e) => setFormData({ ...formData, dischargeDate: e.target.value })}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Rumah Sakit</label>
                  <input
                    type="text"
                    placeholder="Contoh: RSUD Dr. M. Djamil"
                    value={formData.hospitalName}
                    onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Pendamping Utama *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama anggota keluarga"
                    value={formData.primaryCaregiver}
                    onChange={(e) => setFormData({ ...formData, primaryCaregiver: e.target.value })}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hubungan Keluarga *</label>
                  <select
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white"
                  >
                    <option>Anak Kandung</option>
                    <option>Suami / Istri</option>
                    <option>Orang Tua</option>
                    <option>Saudara Kandung</option>
                    <option>Perawat Khusus</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#153C35] hover:bg-[#0c2420]"
                >
                  Simpan Profil Pasien
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientPage;

