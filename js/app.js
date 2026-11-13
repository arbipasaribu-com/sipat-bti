const KEY = 'sipat-bti-v1';
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const day = n => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
const today = () => day(0);
let db = JSON.parse(localStorage.getItem(KEY) || 'null') || seed();
let me = db.users.find(u => u.id == sessionStorage.getItem('me'));
let view = 'dashboard';
const save = () => localStorage.setItem(KEY, JSON.stringify(db));
const log = msg => { db.logs.unshift({ t: new Date().toLocaleString('id-ID'), user: me?.nama || 'Sistem', msg }); db.logs = db.logs.slice(0, 200); save(); };

const NAV = {
  admin: ['dashboard', 'inventaris', 'peminjaman', 'laporan', 'log'],
  plp: ['dashboard', 'inventaris', 'peminjaman', 'laporan', 'log'],
  guru: ['dashboard', 'inventaris', 'ajukan', 'saya'],
  kepala: ['dashboard', 'inventaris', 'peminjaman', 'laporan', 'log']
};
const TITLE = { dashboard: 'Dashboard', inventaris: 'Inventaris Alat', peminjaman: 'Peminjaman & Pengembalian', laporan: 'Laporan', log: 'Log Aktivitas', ajukan: 'Ajukan Peminjaman', saya: 'Pinjaman Saya' };
const canEdit = () => ['admin', 'plp'].includes(me.role);

// ---------- Helper data ----------
const item = id => db.items.find(i => i.id == id);
const user = id => db.users.find(u => u.id == id);
const borrowed = id => db.loans.filter(l => l.status === 'Dipinjam').flatMap(l => l.details).filter(d => d.itemId == id).reduce((s, d) => s + d.qty - d.kembali, 0);
const avail = i => Math.max(0, i.total - i.rusak - i.rawat - borrowed(i.id));
const statusOf = l => (l.status === 'Dipinjam' && l.jatuhTempo < today()) ? 'Terlambat' : l.status;
const badge = s => `<span class="badge b-${{ Diajukan: 'mut', Dipinjam: 'pri', Terlambat: 'bad', Selesai: 'ok', Ditolak: 'mut', Dibatalkan: 'mut' }[s] || 'mut'}">${s}</span>`;
const summary = l => l.details.map(d => `${esc(item(d.itemId)?.nama)} ×${d.qty}`).join(', ');
const table = (head, rows) => `<div class="scroll"><table><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr>${rows.join('') || `<tr><td colspan="${head.length}" class="mut">Belum ada data.</td></tr>`}</table></div>`;

// ---------- Login ----------
$('#demoAcc').innerHTML = db.users.map(u => `<button type="button" onclick="fill('${u.username}','${u.password}')">${u.username}</button>`).join('');
function fill(u, p) { const f = document.forms[0]; f.u.value = u; f.p.value = p; }
function doLogin(e) {
  e.preventDefault();
  const f = new FormData(e.target);
  const u = db.users.find(x => x.username === f.get('u') && x.password === f.get('p'));
  if (!u) { alert('Username atau password salah.'); return false; }
  me = u; sessionStorage.setItem('me', u.id); view = 'dashboard'; log('Login'); render(); return false;
}
function logout() { log('Logout'); sessionStorage.removeItem('me'); me = null; render(); }
function resetDemo() { if (confirm('Kembalikan semua data ke data demo awal?')) { db = seed(); save(); render(); } }
const go = v => { view = v; render(); };
const modal = html => { $('#dlg').innerHTML = html; $('#dlg').showModal(); };
const closeM = () => $('#dlg').close();

// ---------- Render utama ----------
function render() {
  $('#login').hidden = !!me; $('#app').hidden = !me;
  if (!me) return;
  $('#who').textContent = `${me.nama} (${me.role.toUpperCase()})`;
  $('#resetBtn').hidden = me.role !== 'admin';
  $('#nav').innerHTML = NAV[me.role].map(v => `<a class="${v === view ? 'on' : ''}" onclick="go('${v}')">${TITLE[v]}</a>`).join('');
  $('#title').textContent = TITLE[view];
  $('#view').innerHTML = VIEWS[view]();
}

const VIEWS = {
  dashboard() {
    const total = db.items.reduce((s, i) => s + i.total, 0), av = db.items.reduce((s, i) => s + avail(i), 0);
    const out = db.items.reduce((s, i) => s + borrowed(i.id), 0), rusak = db.items.reduce((s, i) => s + i.rusak, 0);
    const late = db.loans.filter(l => statusOf(l) === 'Terlambat').length;
    const stat = (n, l, c = '') => `<div class="stat ${c}"><b>${n}</b>${l}</div>`;
    return `<div class="grid">${stat(total, 'Total aset')}${stat(av, 'Tersedia')}${stat(out, 'Sedang dipinjam')}${stat(late, 'Transaksi terlambat', late ? 'bad' : '')}${stat(rusak, 'Rusak')}</div>
    <h3>Transaksi terbaru</h3>${loanTable(db.loans.slice().reverse().slice(0, 5), false)}`;
  },

  inventaris() {
    const rows = db.items.map(i => `<tr><td>${esc(i.kode)}</td><td>${esc(i.nama)}<br><span class="mut small">${esc(i.merek)}</span></td><td>${esc(i.kategori)}</td><td>${esc(i.lokasi)}</td>
      <td>${i.total}</td><td><b>${avail(i)}</b></td><td>${borrowed(i.id)}</td><td>${i.rusak}</td><td>${i.rawat}</td>
      ${canEdit() ? `<td><button class="btn sm ghost" onclick="itemForm(${i.id})">Edit</button> <button class="btn sm bad" onclick="delItem(${i.id})">Hapus</button></td>` : ''}</tr>`);
    return (canEdit() ? `<div class="row"><button class="btn" onclick="itemForm()">+ Tambah alat</button></div>` : '') +
      table(['Kode', 'Alat', 'Kategori', 'Lokasi', 'Total', 'Tersedia', 'Dipinjam', 'Rusak', 'Dirawat', ...(canEdit() ? [''] : [])], rows);
  },

  ajukan() {
    const rows = db.items.filter(i => avail(i) > 0).map(i => `<tr><td>${esc(i.nama)}</td><td>${avail(i)}</td><td><input type="number" name="q${i.id}" min="0" max="${avail(i)}" value="0"></td></tr>`);
    return `<form class="card" onsubmit="return submitLoan(event)">
      <div class="row"><label>Tanggal pinjam<input type="date" name="tp" value="${today()}" required></label>
      <label>Rencana kembali<input type="date" name="jt" value="${day(3)}" required></label></div>
      <label>Tujuan penggunaan<input name="tj" required placeholder="mis. Praktik crimping kabel UTP"></label>
      ${table(['Alat', 'Tersedia', 'Jumlah pinjam'], rows)}<button class="btn">Kirim pengajuan</button></form>`;
  },

  saya() { return loanTable(db.loans.filter(l => l.borrowerId == me.id).reverse(), true); },
  peminjaman() { return loanTable(db.loans.slice().reverse(), true); },

  laporan() {
    const usage = db.items.map(i => ({ n: i.nama, q: db.loans.filter(l => !['Ditolak', 'Dibatalkan', 'Diajukan'].includes(l.status)).flatMap(l => l.details).filter(d => d.itemId == i.id).reduce((s, d) => s + d.qty, 0) })).sort((a, b) => b.q - a.q);
    const late = db.loans.filter(l => statusOf(l) === 'Terlambat');
    return `<div class="row"><button class="btn" onclick="exportCSV()">Ekspor CSV (Excel)</button><button class="btn ghost" onclick="print()">Cetak / Simpan PDF</button></div>
      <h3>Alat paling sering dipinjam</h3>${table(['Alat', 'Total unit dipinjam'], usage.map(u => `<tr><td>${esc(u.n)}</td><td>${u.q}</td></tr>`))}
      <h3>Daftar keterlambatan (${late.length})</h3>${table(['No', 'Peminjam', 'Jatuh tempo', 'Terlambat', 'Alat'], late.map(l => `<tr><td>${l.no}</td><td>${esc(user(l.borrowerId)?.nama)}</td><td>${l.jatuhTempo}</td><td>${Math.round((new Date(today()) - new Date(l.jatuhTempo)) / 864e5)} hari</td><td class="w">${summary(l)}</td></tr>`))}
      <h3>Seluruh transaksi</h3>${loanTable(db.loans.slice().reverse(), false)}`;
  },

  log() { return table(['Waktu', 'Pengguna', 'Aktivitas'], db.logs.map(l => `<tr><td>${esc(l.t)}</td><td>${esc(l.user)}</td><td class="w">${esc(l.msg)}</td></tr>`)); }
};

function loanTable(loans, actions) {
  const staff = ['admin', 'plp'].includes(me.role);
  const rows = loans.map(l => {
    const s = statusOf(l); let a = '';
    if (actions) {
      if (l.status === 'Diajukan' && (staff || me.role === 'kepala')) a += `<button class="btn sm" onclick="act('confirm',${l.id})">Setujui & serahkan</button> <button class="btn sm bad" onclick="act('reject',${l.id})">Tolak</button> `;
      if (l.status === 'Diajukan' && l.borrowerId == me.id) a += `<button class="btn sm ghost" onclick="act('cancel',${l.id})">Batalkan</button>`;
      if (l.status === 'Dipinjam' && staff) a += `<button class="btn sm" onclick="returnForm(${l.id})">Catat pengembalian</button>`;
    }
    return `<tr><td>${l.no}</td><td>${esc(user(l.borrowerId)?.nama)}</td><td>${l.tglPinjam}</td><td>${l.jatuhTempo}</td><td class="w">${summary(l)}<br><span class="mut small">${esc(l.tujuan)}</span></td><td>${badge(s)}</td>${actions ? `<td>${a}</td>` : ''}</tr>`;
  });
  return table(['No', 'Peminjam', 'Pinjam', 'Jatuh tempo', 'Alat', 'Status', ...(actions ? [''] : [])], rows);
}

// ---------- Inventaris ----------
function itemForm(id) {
  const i = id ? item(id) : { kode: '', nama: '', kategori: '', merek: '', lokasi: '', total: 1, rusak: 0, rawat: 0 };
  const f = (n, l, t = 'text') => `<label>${l}<input name="${n}" type="${t}" value="${esc(i[n])}" ${t === 'number' ? 'min="0"' : ''} required></label>`;
  modal(`<form onsubmit="return saveItem(event,${id || 0})"><h3>${id ? 'Edit' : 'Tambah'} alat</h3>${f('kode', 'Kode inventaris')}${f('nama', 'Nama alat')}${f('kategori', 'Kategori')}${f('merek', 'Merek/tipe')}${f('lokasi', 'Lokasi penyimpanan')}
    <div class="row">${f('total', 'Total unit', 'number')}${f('rusak', 'Rusak', 'number')}${f('rawat', 'Dirawat', 'number')}</div>
    <div class="row"><button class="btn">Simpan</button><button type="button" class="btn ghost" onclick="closeM()">Batal</button></div></form>`);
}
function saveItem(e, id) {
  e.preventDefault(); const f = Object.fromEntries(new FormData(e.target));
  ['total', 'rusak', 'rawat'].forEach(k => f[k] = +f[k]);
  if (f.rusak + f.rawat > f.total) { alert('Rusak + dirawat tidak boleh melebihi total.'); return false; }
  if (id) { Object.assign(item(id), f); log(`Mengubah alat ${f.nama}`); }
  else { db.items.push({ id: Math.max(0, ...db.items.map(i => i.id)) + 1, ...f }); log(`Menambah alat ${f.nama}`); }
  save(); closeM(); render(); return false;
}
function delItem(id) {
  if (db.loans.some(l => l.details.some(d => d.itemId == id))) return alert('Alat sudah punya riwayat transaksi, tidak boleh dihapus. Ubah jumlah/kondisinya saja.');
  if (confirm('Hapus alat ini?')) { log(`Menghapus alat ${item(id).nama}`); db.items = db.items.filter(i => i.id != id); save(); render(); }
}

// ---------- Transaksi ----------
function submitLoan(e) {
  e.preventDefault(); const f = Object.fromEntries(new FormData(e.target));
  const details = db.items.map(i => ({ itemId: i.id, qty: +(f['q' + i.id] || 0), kembali: 0 })).filter(d => d.qty > 0);
  if (!details.length) { alert('Pilih minimal satu alat.'); return false; }
  if (f.jt < f.tp) { alert('Tanggal kembali tidak boleh sebelum tanggal pinjam.'); return false; }
  const bad = details.find(d => d.qty > avail(item(d.itemId)));
  if (bad) { alert(`Jumlah ${item(bad.itemId).nama} melebihi stok tersedia (${avail(item(bad.itemId))}).`); return false; }
  const no = `TRX-${new Date().getFullYear()}-${String(++db.seq).padStart(4, '0')}`;
  db.loans.push({ id: db.seq, no, borrowerId: me.id, tglPinjam: f.tp, jatuhTempo: f.jt, tujuan: f.tj, status: 'Diajukan', details });
  log(`Mengajukan peminjaman ${no}`); go('saya'); return false;
}
function act(type, id) {
  const l = db.loans.find(x => x.id == id);
  if (type === 'confirm') {
    const bad = l.details.find(d => d.qty > avail(item(d.itemId)));
    if (bad) return alert(`Stok ${item(bad.itemId).nama} tidak cukup (tersedia ${avail(item(bad.itemId))}).`);
    l.status = 'Dipinjam'; l.diproses = me.nama; log(`Menyerahkan alat ${l.no}`);
  } else if (type === 'reject') { l.status = 'Ditolak'; log(`Menolak ${l.no}`); }
  else { l.status = 'Dibatalkan'; log(`Membatalkan ${l.no}`); }
  save(); render();
}
function returnForm(id) {
  const l = db.loans.find(x => x.id == id);
  const rows = l.details.filter(d => d.qty > d.kembali).map((d, k) => `<tr><td>${esc(item(d.itemId).nama)}</td><td>${d.qty - d.kembali}</td>
    <td><input type="number" name="k${k}" min="0" max="${d.qty - d.kembali}" value="${d.qty - d.kembali}"></td>
    <td><select name="c${k}"><option>Baik</option><option>Rusak</option></select></td></tr>`);
  modal(`<form onsubmit="return saveReturn(event,${id})"><h3>Pengembalian ${l.no}</h3>${table(['Alat', 'Sisa', 'Kembali sekarang', 'Kondisi'], rows)}
    <div class="row"><button class="btn">Simpan</button><button type="button" class="btn ghost" onclick="closeM()">Batal</button></div></form>`);
}
function saveReturn(e, id) {
  e.preventDefault(); const f = Object.fromEntries(new FormData(e.target));
  const l = db.loans.find(x => x.id == id);
  l.details.filter(d => d.qty > d.kembali).forEach((d, k) => {
    const n = +f['k' + k]; if (!n) return;
    d.kembali += n; d.kondisiKembali = f['c' + k];
    if (f['c' + k] === 'Rusak') item(d.itemId).rusak += n;   // alat rusak keluar dari stok layak pakai
  });
  if (l.details.every(d => d.kembali >= d.qty)) { l.status = 'Selesai'; l.tglKembali = today(); }
  log(`Mencatat pengembalian ${l.no}${l.status === 'Selesai' ? ' (selesai)' : ' (sebagian)'}`);
  save(); closeM(); render(); return false;
}

// ---------- Ekspor ----------
function exportCSV() {
  const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = [['No', 'Peminjam', 'Tgl Pinjam', 'Jatuh Tempo', 'Alat', 'Tujuan', 'Status'],
    ...db.loans.map(l => [l.no, user(l.borrowerId)?.nama, l.tglPinjam, l.jatuhTempo, l.details.map(d => `${item(d.itemId)?.nama} x${d.qty}`).join('; '), l.tujuan, statusOf(l)])];
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['\ufeff' + rows.map(r => r.map(q).join(',')).join('\n')], { type: 'text/csv' }));
  a.download = `laporan-peminjaman-${today()}.csv`; a.click(); log('Ekspor laporan CSV');
}
render();
