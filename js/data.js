// Data demo SIPAT-BTI. Semua data disimpan di localStorage browser (hanya untuk demo).
function seed() {
  const day = n => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
  const it = (id, kode, nama, kategori, merek, lokasi, total, rusak = 0, rawat = 0) =>
    ({ id, kode, nama, kategori, merek, lokasi, total, rusak, rawat });
  return {
    seq: 4,
    users: [
      { id: 1, nama: 'Administrator Sekolah', username: 'admin', password: 'admin123', role: 'admin', kelas: 'TU' },
      { id: 2, nama: 'Pak PLP Bengkel TI', username: 'plp', password: 'plp123', role: 'plp', kelas: 'PLP' },
      { id: 3, nama: 'Bu Siti (Guru TKJ)', username: 'guru', password: 'guru123', role: 'guru', kelas: 'XI TKJ 1' },
      { id: 4, nama: 'Pak Budi (Guru RPL)', username: 'guru2', password: 'guru123', role: 'guru', kelas: 'XI RPL 1' },
      { id: 5, nama: 'Kepala Bengkel TI', username: 'kepala', password: 'kepala123', role: 'kepala', kelas: 'Pimpinan' }
    ],
    items: [
      it(1, 'BTI-MLT-001', 'Multimeter Digital', 'Alat Ukur', 'Sanwa CD800a', 'Lemari A1', 10, 1),
      it(2, 'BTI-CRP-001', 'Tang Crimping RJ45', 'Perkakas Jaringan', 'Krisbow', 'Lemari A2', 8),
      it(3, 'BTI-LPT-001', 'Laptop Praktik', 'Perangkat Komputer', 'Acer Aspire 3', 'Lemari B1', 15, 0, 2),
      it(4, 'BTI-LAN-001', 'LAN Tester', 'Alat Ukur', 'Lan Tester Pro', 'Lemari A1', 5),
      it(5, 'BTI-OBG-001', 'Set Obeng Presisi', 'Perkakas', 'Tekiro', 'Lemari A3', 10),
      it(6, 'BTI-SLD-001', 'Solder Listrik 40W', 'Perkakas', 'Goot', 'Lemari A3', 6, 1),
      it(7, 'BTI-UTP-001', 'Kabel UTP Cat6 (roll)', 'Bahan Praktik', 'Belden', 'Rak C1', 4),
      it(8, 'BTI-RTR-001', 'Router MikroTik hAP', 'Perangkat Jaringan', 'MikroTik', 'Lemari B2', 6)
    ],
    loans: [
      { id: 1, no: 'TRX-2026-0001', borrowerId: 3, tglPinjam: day(-6), jatuhTempo: day(-2), tujuan: 'Praktik crimping kabel UTP',
        status: 'Dipinjam', diproses: 'Pak PLP Bengkel TI',
        details: [{ itemId: 2, qty: 4, kembali: 2, kondisiKembali: 'Baik' }, { itemId: 4, qty: 2, kembali: 0 }] },
      { id: 2, no: 'TRX-2026-0002', borrowerId: 4, tglPinjam: day(-1), jatuhTempo: day(2), tujuan: 'Praktik pemrograman web',
        status: 'Dipinjam', diproses: 'Pak PLP Bengkel TI', details: [{ itemId: 3, qty: 6, kembali: 0 }] },
      { id: 3, no: 'TRX-2026-0003', borrowerId: 3, tglPinjam: day(-10), jatuhTempo: day(-7), tujuan: 'Pengukuran tegangan',
        status: 'Selesai', diproses: 'Pak PLP Bengkel TI', tglKembali: day(-7),
        details: [{ itemId: 1, qty: 3, kembali: 3, kondisiKembali: 'Baik' }] },
      { id: 4, no: 'TRX-2026-0004', borrowerId: 4, tglPinjam: day(0), jatuhTempo: day(3), tujuan: 'Konfigurasi router',
        status: 'Diajukan', details: [{ itemId: 8, qty: 3, kembali: 0 }] }
    ],
    logs: [{ t: new Date().toLocaleString('id-ID'), user: 'Sistem', msg: 'Data demo dibuat' }]
  };
}
