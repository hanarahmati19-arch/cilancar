# CILANCAR – Sistem Pelaporan Drainase & Banjir (HTML + CSS + JavaScript, tanpa React)

## Cara menjalankan
Cukup **klik dua kali `index.html`** (Chrome/Edge/Firefox). Tidak perlu npm atau server.
Untuk kamera & GPS yang lebih lancar di HP, jalankan server lokal: `python -m http.server 8000` lalu buka `http://localhost:8000`
(kamera/GPS pada HP memerlukan HTTPS atau localhost).

## Struktur – satu file = satu kelas per titik, saling terhubung
```
index.html
css/style.css                      tema terang/gelap, responsif Android & desktop
js/core.js                         Store + service: Settings, Account, Toast, Notification,
                                   Telegram, Alert, Sensor, Report, Chat  (objek svc.*)
js/ui.js                           ikon, Modal (popup), Toast, kamera, foto hero
js/pages/00-shared.js              registri aksi + popup titik drainase & Laporan Darurat
js/pages/01-dashboard.js           class DashboardPage
js/pages/02-buat-laporan.js        class CreateReportPage   (kamera, lokasi, ubah laporan)
js/pages/03-riwayat-laporan.js     class ReportHistoryPage
js/pages/04-peta-drainase.js       class DrainageMapPage    (CRUD titik)
js/pages/05-detail-laporan.js      class ReportDetailPage
js/pages/06-peringatan-otomatis.js class AlertNotificationPage (+ AlertService di core.js)
js/pages/07-chat-cs-dinas.js       class CsChatPage
js/pages/08-pengaturan-akun.js     class AccountPage
js/app.js                          Router, shell, sinkronisasi data ke halaman
```
Keterhubungan: `ReportService` → `NotificationService` + `TelegramService`; `SensorService` → `AlertService`
→ notifikasi warga + Bot Telegram; semua halaman membaca `svc.*` dan otomatis tampil ulang saat data berubah.

## CRUD yang berfungsi (data di localStorage)
Laporan (buat/lihat/ubah/hapus), titik drainase (tambah/ubah/hapus), notifikasi, chat, profil.

## Catatan
- Sensor alat CILANCAR **simulasi** (tombol "Mode uji"). Ganti `SensorService.tick()` dengan data alat asli.
- Bot Telegram: isi token + chat ID di Akun → Pengaturan Notifikasi (tanpa itu hanya log simulasi).
- Balasan CS Dinas otomatis (simulasi).

## Pembaruan terbaru (wilayah Bandung)
- **Wilayah**: seluruh data contoh kini Kabupaten Bandung – **Dayeuhkolot, Bojongsoang, Baleendah** (titik pantau, laporan,
  notifikasi, peta, CS Dinas). Data Semarang lama di peramban otomatis diganti saat file dibuka (lihat `migrateData` di `js/core.js`).
- **Lihat Peta** di Beranda kini langsung membuka halaman Peta Drainase, memperbesar & menandai titik yang bermasalah.
- **Input foto** diperbaiki: tombol kamera → pilih *Kamera* atau *Galeri* (maks. 3 foto). Penyebab lama: CSS popup hilang.
- **Popup, toast & notifikasi** dirapikan (ukuran, tata letak, tampil di tengah/bawah layar). Toast maksimal 2 dan singkat;
  peringatan yang sama untuk titik yang sama menggantikan yang lama (tidak menumpuk), jeda 30 menit per titik.
- **Latar login**: video banjir Pexels (https://www.pexels.com/id-id/video/orang-orang-jalan-berjalan-area-9249395/) dimuat dari internet.
  Untuk offline, unduh videonya dan simpan sebagai `assets/video/banjir.mp4`.
- **Foto Beranda**: foto banjir jalan dari Pexels (bingkai video yang sama). Foto sendiri: simpan sebagai `assets/banjir.jpg`.
  Tanpa internet & tanpa file lokal, tampil ilustrasi banjir bawaan.
- Peta: nama jalan/lokasi diganti (Jl. Raya Dayeuhkolot, Jl. Mohammad Toha, Jl. Raya Bojongsoang, Jl. Raya Baleendah, Sungai Citarum, dll).
  Peta tetap ilustrasi, tidak berskala.

## Pembaruan tampilan sebelumnya
- **Peta Drainase**: peta ilustrasi, gaya *Peta* / *Satelit*, bisa digeser & di-zoom. Penanda titik berupa pin yang bisa diklik.
