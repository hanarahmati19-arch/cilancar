/* Titik 7 – Chat dengan CS Dinas
   Kelas: CsChatPage  ·  terhubung lewat svc.* (core.js) dan Router/Acts (app.js) */
const Chat = { ref: null };
function chatBody() {
  const reps = svc.reports.get(), typing = svc.chat.typing.get();
  return svc.chat.get().map((m) => { const r = m.ref ? reps.find((x) => x.id === m.ref) : null;
    return `<div class="bubble-row ${m.from === 'warga' ? 'me' : 'them'}"><button class="bubble" data-act="cmsg" data-id="${m.id}">${r ? `<span class="bubble-ref" data-go="/laporan/${r.id}">${icon('report', 14)} ${r.id} · ${esc(typeTitle(r))}</span>` : ''}${esc(m.text)}<small>${fmtClock(m.at)}</small></button></div>`; }).join('')
    + (typing ? '<div class="bubble-row them"><span class="bubble typing"><i></i><i></i><i></i></span></div>' : '');
}
function chatAtt() {
  const r = Chat.ref ? svc.reports.find(Chat.ref) : null;
  return r ? `<div class="attached">${icon('clip', 16)} <span>${r.id} · ${esc(typeTitle(r))}</span><button class="icon-btn sm" data-act="cdetach" aria-label="Lepas lampiran">${icon('close', 14)}</button></div>` : '';
}
class CsChatPage {
  static watch = ['chat', 'typing', 'reports'];
  static html() {
    return `<div class="page narrow chat-page">${pageHeader({ title: t('title.chat'), back: '/', right: `<button class="icon-btn" data-act="cinfo" aria-label="Info dinas">${icon('info')}</button>` })}
      <div class="chat-who card"><span class="who-ic">${icon('shield', 22)}</span><div><b>CS Dinas Drainase Kabupaten Bandung</b><small><i class="online"></i> Online · layanan 07.00–17.00 WIB</small></div></div>
      <div class="chat-body" id="chat-body">${chatBody()}</div><div id="chat-att">${chatAtt()}</div>
      <form class="composer" data-form="chat"><button type="button" class="icon-btn" data-act="cattach" aria-label="Lampirkan laporan">${icon('clip')}</button><input id="chat-in" placeholder="Ketik pesan..." aria-label="Pesan" autocomplete="off"><button type="submit" class="send" aria-label="Kirim">${icon('send', 18)}</button></form></div>`;
  }
  static mount() { const b = document.getElementById('chat-body'); if (b) b.scrollTop = b.scrollHeight; }
  static update() {
    const b = document.getElementById('chat-body'), a = document.getElementById('chat-att'); if (!b) return;
    const stick = b.scrollHeight - b.scrollTop - b.clientHeight < 80;
    b.innerHTML = chatBody(); a.innerHTML = chatAtt();
    if (stick) b.scrollTo({ top: b.scrollHeight, behavior: 'smooth' });
  }
}
Pages.chat = CsChatPage;
Forms.chat = () => {
  const inp = document.getElementById('chat-in'), v = inp.value.trim(), r = Chat.ref ? svc.reports.find(Chat.ref) : null;
  if (!v && !r) return;
  svc.chat.send(v || `Mohon cek status laporan ${r.id}.`, r && r.id); inp.value = ''; Chat.ref = null;
};
Acts.cdetach = () => { Chat.ref = null; Pages.chat.update(); };
Acts.cattach = () => Modal.open({ title: 'Lampirkan Laporan', draw(c) {
  const reps = svc.reports.get();
  c.body.innerHTML = reps.length ? `<div class="list-card">${reps.map((r) => `<button class="row" data-pick="${r.id}">${typeTile(r.type, 38)}<span class="row-tx"><b>${esc(typeTitle(r))}</b><small>${r.id} · ${esc(r.location.address)}</small></span>${statusPill(r.status)}</button>`).join('')}</div>` : '<p class="muted">Belum ada laporan untuk dilampirkan.</p>';
  c.actions.innerHTML = '';
  c.qa('[data-pick]').forEach((b) => (b.onclick = () => { Chat.ref = b.dataset.pick; c.close(); Pages.chat.update(); }));
} });
Acts.cinfo = () => Modal.open({ title: 'Tentang CS Dinas', draw(c) {
  c.body.innerHTML = '<p>CS Dinas Drainase Kabupaten Bandung membantu warga terkait laporan dan kondisi lapangan.</p><p class="muted">Jam layanan: Senin–Jumat 07.00–17.00 WIB. Untuk kondisi darurat gunakan tombol Laporkan Darurat di Beranda.</p>';
  c.actions.innerHTML = '<button class="btn btn-ghost" data-d>Hapus percakapan</button><button class="btn btn-blue" data-c>Tutup</button>';
  c.q('[data-c]').onclick = () => c.close();
  c.q('[data-d]').onclick = () => { c.close(); Modal.confirm({ title: 'Hapus percakapan?', text: 'Seluruh pesan dengan CS Dinas akan dihapus dari perangkat ini.', confirmLabel: 'Hapus', danger: true, onConfirm: () => svc.chat.clear() }); };
} });
Acts.cmsg = (el) => {
  const m = svc.chat.get().find((x) => x.id === el.dataset.id); if (!m) return;
  Modal.open({ title: 'Pesan', draw(c) {
    c.body.innerHTML = `<p>${esc(m.text)}</p>`;
    c.actions.innerHTML = `<button class="btn btn-soft" data-copy>${icon('copy', 16)} Salin</button>${m.from === 'warga' ? `<button class="btn btn-red" data-del>${icon('trash', 16)} Hapus</button>` : ''}`;
    c.q('[data-copy]').onclick = () => { if (navigator.clipboard) navigator.clipboard.writeText(m.text).catch(() => {}); svc.toasts.success('Pesan disalin'); c.close(); };
    const d = c.q('[data-del]'); if (d) d.onclick = () => { svc.chat.remove(m.id); c.close(); };
  } });
};

