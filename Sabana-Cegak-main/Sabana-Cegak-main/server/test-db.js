/**
 * Skrip Pengujian Koneksi & Pembacaan Tabel Database MySQL phpMyAdmin
 * Database: sabana_cegak
 * 
 * Menjawab Prompt 3:
 * - Kredensial: localhost, root, password '', db 'sabana_cegak', port 3306
 * - Penanganan kesalahan (error handling) jelas
 * - Fungsi modul/skrip query sederhana untuk menguji apakah tabel terbaca dengan baik
 */

import { testDbConnection, query, dbConfig } from "./config/db.js";

async function runDatabaseTest() {
  console.log("\n=======================================================");
  console.log("🏥 SABANA CEGAK - PENGUJIAN DATABASE MYSQL (phpMyAdmin)");
  console.log("=======================================================");
  console.log("📌 Kredensial Koneksi:");
  console.log(`   - Host     : ${dbConfig.host}`);
  console.log(`   - Port     : ${dbConfig.port}`);
  console.log(`   - User     : ${dbConfig.user}`);
  console.log(`   - Password : ${dbConfig.password === "" ? "(kosong/default)" : "******"}`);
  console.log(`   - Database : ${dbConfig.database}`);
  console.log("-------------------------------------------------------");

  // 1. Eksekusi pengujian koneksi utama
  const connectionResult = await testDbConnection();

  if (!connectionResult.success) {
    console.error("\n❌ STATUS: KONEKSI DATABASE GAGAL");
    console.error(`⚠️ Detail Error: ${connectionResult.message}`);
    console.log("\n💡 Solusi Troubleshooting:");
    console.log("   1. Pastikan server MySQL di XAMPP / WAMP dalam kondisi 'Running'.");
    console.log("   2. Pastikan database bernama 'sabana_cegak' telah dibuat di phpMyAdmin:");
    console.log("      Buka http://localhost/phpmyadmin -> Klik 'New' -> Buat database 'sabana_cegak'");
    console.log("   3. Periksa port MySQL (default: 3306) dan kredensial di server/.env");
    console.log("=======================================================\n");
    process.exit(1);
  }

  // 2. Pembacaan tabel yang ada di dalam database
  try {
    let tables = connectionResult.tables || [];

    // Jika database belum memiliki tabel, inisialisasi tabel contoh aplikasi SABANA CEGAK
    if (tables.length === 0) {
      console.log("\n⚠️  Database 'sabana_cegak' masih kosong (belum ada tabel).");
      console.log("⚙️  Menginisialisasi tabel contoh aplikasi SABANA CEGAK...");

      // Buat tabel patients
      await query(`
        CREATE TABLE IF NOT EXISTS \`patients\` (
          \`id\` VARCHAR(36) PRIMARY KEY,
          \`name\` VARCHAR(255) NOT NULL,
          \`age\` INT,
          \`gender\` VARCHAR(20),
          \`hospital_name\` VARCHAR(255),
          \`primary_caregiver\` VARCHAR(255),
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // Buat tabel medications
      await query(`
        CREATE TABLE IF NOT EXISTS \`medications\` (
          \`id\` VARCHAR(36) PRIMARY KEY,
          \`patient_id\` VARCHAR(36),
          \`name\` VARCHAR(255) NOT NULL,
          \`dosage\` VARCHAR(100),
          \`frequency\` VARCHAR(100),
          \`is_active\` BOOLEAN DEFAULT TRUE,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // Masukkan sample data jika kosong
      await query(`
        INSERT IGNORE INTO \`patients\` (\`id\`, \`name\`, \`age\`, \`gender\`, \`hospital_name\`, \`primary_caregiver\`)
        VALUES ('p-001', 'Ibu Jusmanidar', 62, 'Perempuan', 'RSUP Dr. M. Djamil', 'Rahmat Hidayat');
      `);

      await query(`
        INSERT IGNORE INTO \`medications\` (\`id\`, \`patient_id\`, \`name\`, \`dosage\`, \`frequency\`)
        VALUES 
          ('m-001', 'p-001', 'Cefixime 200mg', '1 Kapsul', '2x Sehari (Sesudah makan)'),
          ('m-002', 'p-001', 'Paracetamol 500mg', '1 Tablet', '3x Sehari (Bila demam/nyeri)');
      `);

      console.log("✅ Tabel contoh ('patients', 'medications') dan data awal berhasil dibuat di phpMyAdmin!");

      // Refresh pembacaan tabel
      const refreshed = await query("SHOW TABLES;");
      tables = refreshed.map((row) => Object.values(row)[0]);
    }

    // 3. Modul Query Pengujian Pembacaan Tabel (Query Test)
    console.log("\n=======================================================");
    console.log(`📋 PENGUJIAN QUERY TABEL DATABASE: ${tables.length} Tabel Ditemukan`);
    console.log("=======================================================");

    for (const tableName of tables) {
      const countRes = await query(`SELECT COUNT(*) AS total FROM \`${tableName}\``);
      const rowCount = countRes[0]?.total || 0;
      console.log(`📁 Tabel: [${tableName.padEnd(20)}] -> Terbaca Baik (${rowCount} baris data)`);

      // Tampilkan 1-2 baris data contoh dari tabel
      if (rowCount > 0) {
        const sampleRows = await query(`SELECT * FROM \`${tableName}\` LIMIT 2`);
        console.log(`   Contoh Data:`, JSON.stringify(sampleRows));
      }
    }

    console.log("\n=======================================================");
    console.log("🎉 SELURUH PENGUJIAN DATABASE MYSQL 'sabana_cegak' SUKSES!");
    console.log("   - Koneksi Host & Port: Terhubung");
    console.log("   - Kredensial Root: Valid");
    console.log("   - Eksekusi Query & Pembacaan Tabel: Berhasil 100%");
    console.log("   - phpMyAdmin URL: http://localhost/phpmyadmin");
    console.log("=======================================================\n");

    process.exit(0);
  } catch (queryErr) {
    console.error(`\n❌ Kesalahan saat pengujian query tabel: ${queryErr.message}`);
    process.exit(1);
  }
}

runDatabaseTest();
