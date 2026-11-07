import React, { useState, useEffect } from "react";
import {
  CalendarDays,
  Clock,
  Building2,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  BellRing,
  Calendar,
} from "lucide-react";
import { getAppointments, createAppointment, confirmAppointment } from "../services/api";

export const AppointmentPage = ({ activePatient }) => {
  const [appointments, setAppointments] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("09:00 WIB");
  const [newHospital, setNewHospital] = useState(activePatient?.hospitalName || "RSUD Dr. M. Djamil");
  const [newClinic, setNewClinic] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const patientId = activePatient?.id || "patient-demo-1";

  const loadData = async () => {
    try {
      const res = await getAppointments(patientId);
      setAppointments(res.data || []);
    } catch (e) {
      console.error("Gagal memuat jadwal kontrol:", e);
    }
  };

  useEffect(() => {
    loadData();
  }, [patientId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newDate) return alert("Pilih tanggal kontrol!");

    try {
      await createAppointment({
        patientId,
        appointmentDate: newDate,
        appointmentTime: newTime,
        hospitalName: newHospital,
        clinicOrDoctor: newClinic,
        notes: newNotes,
      });

      setShowAddModal(false);
      setNewDate("");
      setNewClinic("");
      setNewNotes("");
      loadData();
    } catch (err) {
      alert("Gagal menambahkan jadwal: " + err.message);
    }
  };

  const handleConfirm = async (id) => {
    try {
      await confirmAppointment(id);
      loadData();
    } catch (err) {
      alert("Gagal mengonfirmasi: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <CalendarDays className="w-6 h-6 text-[#153C35]" />
            Jadwal Kontrol Rumah Sakit
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pengingat otomatis H-3 dan H-1 sebelum jadwal kunjungan kontrol ulang pasien ke rumah sakit atau poli spesialis.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#153C35] hover:bg-[#0c2420] transition-colors shadow-xs self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Jadwal Kontrol</span>
        </button>
      </div>

      {/* Appointment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {appointments.length === 0 ? (
          <div className="col-span-2 bg-white rounded-2xl border border-amber-200 p-8 text-center bg-amber-50/40">
            <AlertCircle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">Jadwal Kontrol Belum Ditemukan</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Dokumen medis belum mencantumkan tanggal kontrol pasti. Harap hubungi poli RS dan tambahkan jadwalnya di sini.
            </p>
          </div>
        ) : (
          appointments.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E8F2ED] text-[#153C35]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Tercatat Resmi</span>
                  </span>

                  {app.isConfirmed ? (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      ✓ Sudah Dikonfirmasi
                    </span>
                  ) : (
                    <button
                      onClick={() => handleConfirm(app.id)}
                      className="text-[11px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-2.5 py-0.5 rounded-full transition-colors"
                    >
                      Konfirmasi Jadwal
                    </button>
                  )}
                </div>

                <div className="text-2xl font-black text-slate-900 leading-tight">
                  {app.appointmentDate}
                </div>

                <div className="space-y-2 mt-4 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#153C35]" />
                    <span>{app.appointmentTime || "09:00 WIB"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#153C35]" />
                    <span>{app.hospitalName || "RSUD Dr. M. Djamil"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#153C35]" />
                    <span>{app.clinicOrDoctor || "Poli Penyakit Dalam"}</span>
                  </div>
                </div>

                {app.notes && (
                  <p className="text-xs text-slate-500 mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <strong>Persiapan:</strong> {app.notes}
                  </p>
                )}
              </div>

              {/* Reminder Pills */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-[#153C35] font-semibold">
                  <BellRing className="w-3.5 h-3.5" /> Pengingat Otomatis H-3 & H-1 Aktif
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Tambah Jadwal Kontrol */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <h3 className="text-base font-bold text-slate-900 mb-1">Tambah Jadwal Kontrol RS</h3>
            <p className="text-xs text-slate-500 mb-4">
              Masukkan tanggal dan poli tujuan kontrol ulang pasien.
            </p>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Kontrol</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 25 November 2026"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Waktu Kunjungan</label>
                <input
                  type="text"
                  placeholder="Contoh: 09:00 WIB"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Rumah Sakit</label>
                <input
                  type="text"
                  value={newHospital}
                  onChange={(e) => setNewHospital(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Poli / Dokter Penanggung Jawab</label>
                <input
                  type="text"
                  placeholder="Contoh: Poli Bedah Digestif / dr. Ahmad, Sp.B"
                  value={newClinic}
                  onChange={(e) => setNewClinic(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Dokumen / Persiapan</label>
                <input
                  type="text"
                  placeholder="Misal: Bawa kartu BPJS, hasil lab darah, dan sisa antibiotik"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
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
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentPage;

