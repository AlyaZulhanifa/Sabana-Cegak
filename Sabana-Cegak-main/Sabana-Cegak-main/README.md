# 🏥 SABANA CEGAK
### **AI-Powered Home Care Companion for Post-Discharge Patients**
> *Inovasi Solusi AI Medis & Patient Safety untuk Hackathon FIRETECH 2026*

---

## 📌 Tentang SABANA CEGAK

**SABANA CEGAK** adalah platform berbasis AI multimodal (**Google Gemini 1.5 Flash**) yang dirancang untuk mendampingi pasien dan keluarga pendamping (*caregiver*) setelah keluar dari rumah sakit (*post-discharge*). 

Seringkali pasien pulang membawa dokumen resume medis (*discharge summary*) dan resep tulisan tangan dokter yang sulit dibaca atau dipahami oleh orang awam. Kesalahan membaca dosis atau ketidakpahaman tanda bahaya pemulihan dapat berakibat fatal pada komplikasi dan *readmission* (masuk RS kembali).

SABANA CEGAK membaca dokumen kepulangan RS (berupa foto/scan PDF) dan mengonversinya menjadi:
1. **Diagnosis Utama:** Informasi diagnosis pasien dalam bahasa yang dipahami keluarga.
2. **Jadwal Minum Obat Interaktif:** Pengelompokan waktu minum (Pagi / Siang / Malam) dengan fitur ceklis harian.
3. **Checklist Perawatan Rumah:** Panduan perawatan luka operasi, pemenuhan nutrisi, dan batasan aktivitas fisik harian.
4. **Jadwal Kontrol Ulang:** Notifikasi waktu kontrol kembali ke RS.
5. **AI Safety Audit & Care Alerts:** Deteksi otomatis bila ada tulisan dokter yang buram/terlewat (**Strictly Zero-Hallucination Policy**), serta *alert* tanda bahaya darurat (*red flags*).

---

## 🏗️ Arsitektur Proyek

```text
SabanaCegak/
├── server/                                # Backend (Node.js + Express)
│   ├── config/
│   │   └── gemini.js                      # Inisialisasi GoogleGenerativeAI & gemini-1.5-flash
│   ├── controllers/
│   │   └── documentController.js          # Controller ekstraksi PDF/Gambar -> JSON Gemini
│   ├── middlewares/
│   │   └── uploadMiddleware.js            # Multer memoryStorage handler (PDF / Gambar)
│   ├── prompts/
│   │   └── medicalPrompts.js              # Strict Medical Extraction & Safety Audit System Prompt
│   ├── routes/
│   │   └── apiRoutes.js                   # API Endpoints (/api/upload-document, /api/health)
│   ├── .env.example                       # Contoh template environment variables
│   ├── .env                               # File konfigurasi lokal (GEMINI_API_KEY)
│   ├── index.js                           # Entry point Express.js (Port 5000)
│   └── package.json
│
├── client/                                # Frontend (React + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx                 # Header bar & emergency contact
│   │   │   └── Sidebar.jsx                # Navigasi modul utama aplikasi
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx          # Ringkasan status perawatan pasien
│   │   │   ├── DocumentsPage.jsx          # Manajemen & unggah dokumen medis
│   │   │   ├── VerificationPage.jsx       # Verifikasi hasil ekstraksi Gemini AI
│   │   │   ├── MedicationPage.jsx         # Smart medication reminder & log obat
│   │   │   ├── CareChecklistPage.jsx      # Checklist perawatan & nutrisi harian
│   │   │   ├── AlertsPage.jsx             # AI safety audit & audit peringatan
│   │   │   ├── AppointmentPage.jsx        # Jadwal kontrol & kunjungan RS
│   │   │   ├── HistoryPage.jsx            # Catatan riwayat perawatan mandiri
│   │   │   ├── PatientPage.jsx            # Profil & manajemen data pasien
│   │   │   ├── LoginPage.jsx              # Autentikasi portal pasien & caregiver
│   │   │   └── RegisterPage.jsx           # Pendaftaran akun keluarga
│   │   ├── services/
│   │   │   └── api.js                     # Integrasi Axios ke backend API
│   │   ├── App.jsx                        # Root React component
│   │   ├── main.jsx                       # React entry point
│   │   └── index.css                      # Tailwind base & custom styling
│   ├── index.html
│   ├── vite.config.js                     # Vite build & proxy config
│   ├── tailwind.config.js                 # Theme styling
│   ├── postcss.config.js
│   └── package.json
│
├── .gitignore
├── package.json                           # Root convenience scripts
└── README.md
```

---

## ⚡ Panduan Menjalankan Proyek

### 1. Prasyarat
- **Node.js** (versi 18.x atau yang lebih baru)
- **NPM** atau package manager favorit Anda
- **Google Gemini API Key** (Dapat diperoleh gratis di [Google AI Studio](https://aistudio.google.com/app/apikey))

---

### 2. Konfigurasi Backend (`/server`)

1. Buka folder `/server`:
   ```bash
   cd server
   ```

2. Pasang dependensi backend:
   ```bash
   npm install
   ```

3. Buka file `.env` di dalam folder `/server`, lalu isi dengan API Key Anda:
   ```env
   PORT=5000
   GEMINI_API_KEY=AIzaSyD...your_actual_gemini_api_key_here
   ```

4. Jalankan backend server:
   ```bash
   npm run dev
   ```
   *Server akan aktif di `http://localhost:5000`*.

---

### 3. Konfigurasi Frontend (`/client`)

1. Buka terminal baru dan masuk ke folder `/client`:
   ```bash
   cd client
   ```

2. Pasang dependensi frontend:
   ```bash
   npm install
   ```

3. Jalankan Vite development server:
   ```bash
   npm run dev
   ```
   *Frontend akan aktif di `http://localhost:5173`*.

---

## 🧪 Skema Output JSON AI

Prompt AI memaksa respons murni JSON tanpa tanda kutip markdown sesuai skema baku berikut:

```json
{
  "diagnosis_utama": "Post Appendectomy Akut",
  "daftar_obat": [
    {
      "nama_obat": "Cefixime 200mg",
      "dosis": "1 Tablet (2x Sehari)",
      "waktu_minum": "Pagi/Siang/Malam",
      "catatan": "Wajib dihabiskan setelah makan"
    }
  ],
  "instruksi_perawatan_rumah": [
    {
      "kategori": "Perawatan Luka / Nutrisi / Aktivitas",
      "tindakan": "Jaga luka tetap kering dan ganti perban setiap 2 hari"
    }
  ],
  "tanggal_kontrol": "14 November 2026",
  "ai_care_alerts": [
    {
      "level": "warning",
      "kategori": "Tulisan Tidak Jelas / Informasi Hilang / Tanda Bahaya",
      "pesan": "Tulisan resep baris ke-3 tidak jelas. Harap konfirmasi ke apoteker."
    }
  ]
}
```

---

## 🛡️ Kebijakan Anti-Halusinasi Medis (Safety Audit)

1. **Tulisan Dokter Tidak Terbaca:** AI dilarang keras menebak (*anti-guesswork*). Jika ada kata/dosis yang buram atau tidak terbaca, sistem wajib menyertakannya di `ai_care_alerts` dengan status `warning`.
2. **Jadwal Kontrol:** Jika tidak tertera di dokumen, sistem tidak mengarang tanggal dan memberi tanda `Tidak Ditemukan` serta memandu pendamping menghubungi RS.
3. **Peringatan Tanda Bahaya (Red Flags):** Kondisi darurat (demam tinggi, pendarahan aktif, nyeri dada tak tertahankan) otomatis diekstraksi ke level `danger`.

---

## 🏆 Hackathon FIRETECH 2026
Dibuat dengan dedikasi penuh untuk memberikan pendampingan rawat jalan yang aman, cerdas, dan manusiawi bagi masyarakat.

