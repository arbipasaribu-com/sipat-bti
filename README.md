# SIPAT-BTI
**Sistem Informasi Peminjaman dan Inventaris Alat Bengkel TI** — demo aplikasi web berdasarkan dokumen *Analisis Kasus* (Arbi Pasaribu, SMK Negeri 14 Medan).

Masalah yang diselesaikan: pencatatan buku fisik, barang terlambat kembali, catatan hilang, dan stok alat yang tidak terlihat real-time.

## Fitur (Prioritas 1 & sebagian Prioritas 2)
- Login berbasis peran: **Administrator, PLP, Guru, Kepala Bengkel**
- Dashboard: total aset, tersedia, dipinjam, terlambat, rusak
- Inventaris alat (tambah/ubah/hapus, kode inventaris, lokasi, kondisi)
- Pengajuan peminjaman oleh guru → persetujuan/penyerahan oleh PLP/Kepala
- Pengembalian **sebagian**, pencatatan kondisi (Baik/Rusak)
- Stok tersedia dihitung otomatis; peminjaman melebihi stok ditolak
- Status **Terlambat** otomatis setelah jatuh tempo
- Laporan: alat terpopuler, daftar keterlambatan, ekspor CSV (Excel), cetak/PDF
- Log aktivitas, nomor transaksi unik

## Akun demo
| Peran | Username | Password |
|---|---|---|
| Administrator | admin | admin123 |
| PLP | plp | plp123 |
| Guru | guru / guru2 | guru123 |
| Kepala bengkel | kepala | kepala123 |

## Menjalankan di VS Code
1. Buka folder ini di VS Code (`File > Open Folder`).
2. Pasang ekstensi **Live Server** (disarankan otomatis).
3. Klik kanan `index.html` → **Open with Live Server**. (Atau cukup klik dua kali `index.html`.)

## Publikasi ke GitHub
```bash
git init
git add .
git commit -m "SIPAT-BTI: versi demo awal"
git branch -M main
git remote add origin https://github.com/USERNAME/sipat-bti.git
git push -u origin main
```
Lalu di GitHub: **Settings → Pages → Source: GitHub Actions**. Workflow `.github/workflows/pages.yml` akan men-deploy otomatis, alamatnya `https://USERNAME.github.io/sipat-bti/`.

## Struktur
```
index.html        halaman utama
css/style.css     tampilan (responsif, mode gelap otomatis)
js/data.js        data demo
js/app.js         logika aplikasi
db/schema.sql     rancangan database produksi (MySQL)
```

## Catatan penting
- Versi ini **demo**: data tersimpan di `localStorage` browser dan password berupa teks biasa. **Jangan dipakai untuk data sebenarnya.**
- Untuk produksi, ikuti dokumen: backend Laravel/Node.js + MySQL/PostgreSQL, password di-hash, HTTPS, backup terjadwal. Skema ada di `db/schema.sql`.
- Pengembangan lanjutan (Prioritas 3): QR code, notifikasi WhatsApp/email, peminjaman terjadwal, manajemen pengguna.
