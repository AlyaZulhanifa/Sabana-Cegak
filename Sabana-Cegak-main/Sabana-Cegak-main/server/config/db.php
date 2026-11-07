<?php
/**
 * Konfigurasi Koneksi Database MySQL (phpMyAdmin)
 * Aplikasi: SABANA CEGAK - Home Care Companion
 * Database Name: sabana_cegak
 */

$host = 'localhost';
$port = 3306;
$db   = 'sabana_cegak';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;port=$port;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
    // Log keberhasilan koneksi
    error_log("✅ [MySQL phpMyAdmin] Koneksi ke database 'sabana_cegak' BERHASIL!");
} catch (\PDOException $e) {
    // Log penanganan kegagalan koneksi
    error_log("❌ [MySQL phpMyAdmin] Gagal terhubung ke database 'sabana_cegak': " . $e->getMessage());
    die(json_encode([
        'success' => false,
        'message' => 'Koneksi database gagal: ' . $e->getMessage(),
        'troubleshoot' => 'Pastikan MySQL di phpMyAdmin / XAMPP sudah dijalankan dan database sabana_cegak telah dibuat.'
    ]));
}

/**
 * Contoh fungsi modul/skrip query sederhana untuk menguji apakah tabel di database sabana_cegak dapat terbaca
 */
function testDatabaseTables($pdo) {
    try {
        $stmt = $pdo->query("SHOW TABLES");
        $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        return [
            'success' => true,
            'message' => 'Tabel berhasil dibaca.',
            'tables' => $tables
        ];
    } catch (\PDOException $e) {
        return [
            'success' => false,
            'message' => 'Gagal membaca tabel: ' . $e->getMessage()
        ];
    }
}
?>

