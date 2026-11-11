/* alto · projetos do site
   Os projetos vêm da pasta SITE › PROJETOS do Drive (script "alto · Projetos do site").
   - página inicial (#destaque): um projeto por vez, sorteado, de ponta a ponta
   - projetos.html (#grid): todos os projetos, com filtros
   - nas duas: clique abre a galeria do projeto */
(() => {
const PROJETOS_URL = 'https://script.google.com/macros/s/AKfycbxdhnMk08NMd5UKvvilB5NZsnrH5aSGfmjwzejaleCaIUpaoGVa_dYnEjDKsU-BYCCyNw/exec';
const TROCA_S = 7;             // segundos de cada projeto no destaque
const img = (id, w) => 'https://lh3.googleusercontent.com/d/' + id + '=w' + w;
const esc = s => String(s || '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const $ = id => document.getElementById(id);
const MIN = /^(de|da|do|das|dos|e|em|com|para)$/i;
// "LOREM IPSUM" → "Lorem Ipsum"; sigla sozinha (RGS, FIJ, REB) fica em maiúsculas
const palavra = (w, i) => {
  if (!w || /^\(?\d/.test(w) || w === '&') return w;
  if (i > 0 && MIN.test(w)) return w.toLowerCase();
  return w.toLowerCase().replace(/^(\(?)(\p{L})/u, (m, a, b) => a + b.toUpperCase());
};
const bonito = (s, frase) => {
  const ws = s.trim().split(/\s+/);
  if (ws.length === 1 && /^[A-ZÀ-Ý]{2,3}$/.test(ws[0])) return ws[0];
  return ws.map((w, i) => frase && i > 0 && !/^[A-ZÀ-Ý]{2,3}$/.test(w) ? w.toLowerCase() : palavra(w, i)).join(' ');
};
const CATS = {residencial: 'Residencial', interiores: 'Interiores', comercial: 'Comercial', reforma: 'Reforma'};
function categoria(p){
  const c = (p.categoria || '').toLowerCase();
  for (const k in CATS) if (c.startsWith(k.slice(0, 5))) return k;
  const n = (p.nome + ' ' + p.pasta).toUpperCase();
  if (/REFORMA/.test(n)) return 'reforma';
  if (/RESID[ÊE]NCIA/.test(n)) return 'residencial';
  if (/\bAP\b|APARTAMENTO|STUDIO|INTERIOR/.test(n)) return 'interiores';
  return 'comercial';
}
function titulo(p){
  if (p.nome) return {t: p.nome.trim(), sub: ''};          // nome escrito no info.txt: vale como está
  const seg = p.pasta.split('•').map(s => s.trim()).filter(Boolean);
  const t = [seg.shift()];
  while (seg.length && /^\d+$/.test(seg[0])) t.push(seg.shift());   // "TEJU • 01 • ..." → "Teju 01"
  return {t: bonito(t.join(' ')), sub: seg.map(s => bonito(s, true)).join(' · ')};
}
const linha = p => [p.cod, CATS[p.cat], p.cidade].filter(Boolean).join(' · ');

let LISTA = [];
async function carregar(){
  let d = null;
  try{ const c = JSON.parse(sessionStorage.getItem('alto.projetos') || 'null'); if (c && Date.now() - c.t < 6e5) d = c.d; }catch(e){}
  if (!d){ d = await fetch(PROJETOS_URL).then(r => r.json()); try{ sessionStorage.setItem('alto.projetos', JSON.stringify({t: Date.now(), d})); }catch(e){} }
  LISTA = (d.projetos || []).filter(p => p.imagens && p.imagens.length).map((p, i) => ({...p, ...titulo(p), cat: categoria(p), cod: 'PR—' + String(i + 1).padStart(2, '0')}));
  if (!LISTA.length) throw new Error('sem projetos');
}

/* ---------- galeria (as duas páginas) ---------- */
document.body.insertAdjacentHTML('beforeend', `<div class="galeria" id="galeria" hidden role="dialog" aria-modal="true" aria-labelledby="galTit">
  <div class="gal-palco">
    <button class="gal-x" data-g="x" aria-label="Fechar">✕</button>
    <button class="gal-seta ant" data-g="ant" aria-label="Imagem anterior">←</button>
    <img id="galImg" alt="">
    <button class="gal-seta prox" data-g="prox" aria-label="Próxima imagem">→</button>
    <div class="gal-cont mono" id="galCont"></div>
  </div>
  <aside class="gal-txt"><span class="mono" id="galCod"></span><h3 id="galTit"></h3><p class="sub" id="galSub"></p><dl id="galDl"></dl><div id="galDesc"></div><div class="gal-tumbs" id="galTumbs"></div></aside>
</div>`);
const G = $('galeria'), GI = $('galImg');
let P = null, k = 0, ultimoFoco = null;
function mostrar(n){
  k = (n + P.imagens.length) % P.imagens.length;
  GI.classList.add('ld'); GI.onload = () => GI.classList.remove('ld');
  GI.src = img(P.imagens[k], 1800); GI.alt = P.t + ' — imagem ' + (k + 1);
  $('galCont').textContent = String(k + 1).padStart(2, '0') + ' / ' + String(P.imagens.length).padStart(2, '0');
  document.querySelectorAll('#galTumbs button').forEach((b, i) => b.setAttribute('aria-current', i === k));
  [1, -1].forEach(d => { const id = P.imagens[(k + d + P.imagens.length) % P.imagens.length]; new Image().src = img(id, 1800); });
}
function abrir(p){
  P = p; if (!P) return; ultimoFoco = document.activeElement;
  $('galCod').textContent = P.cod + ' · ' + CATS[P.cat];
  $('galTit').textContent = P.t;
  $('galSub').textContent = P.sub; $('galSub').hidden = !P.sub;
  const dl = [['Local', P.cidade], ['Ano', P.ano], ['Área', P.area]].filter(x => x[1]);
  const D = $('galDl'); D.innerHTML = dl.map(([a, b]) => `<dt>${a}</dt><dd>${esc(b)}</dd>`).join(''); D.hidden = !dl.length;
  $('galDesc').innerHTML = (P.descricao || '').split(/\n\s*\n/).filter(Boolean).map(t => `<p>${esc(t).replace(/\n/g, '<br>')}</p>`).join('');
  $('galTumbs').innerHTML = P.imagens.length > 1 ? P.imagens.map((id, j) => `<button data-t="${j}" aria-label="Imagem ${j + 1}"><img src="${img(id, 160)}" alt="" loading="lazy"></button>`).join('') : '';
  G.querySelectorAll('.gal-seta').forEach(b => b.hidden = P.imagens.length < 2);
  G.hidden = false; requestAnimationFrame(() => G.classList.add('on'));
  document.documentElement.style.overflow = 'hidden';
  mostrar(0); G.querySelector('.gal-x').focus();
}
function fechar(){ G.classList.remove('on'); setTimeout(() => { G.hidden = true; GI.src = ''; }, 250); document.documentElement.style.overflow = ''; if (ultimoFoco) ultimoFoco.focus(); }
G.addEventListener('click', e => {
  const b = e.target.closest('[data-g],[data-t]');
  if (!b){ if (e.target === G || e.target.classList.contains('gal-palco')) fechar(); return; }
  if (b.dataset.t != null) return mostrar(+b.dataset.t);
  ({x: fechar, ant: () => mostrar(k - 1), prox: () => mostrar(k + 1)})[b.dataset.g]();
});
addEventListener('keydown', e => { if (G.hidden) return; if (e.key === 'Escape') fechar(); if (e.key === 'ArrowLeft') mostrar(k - 1); if (e.key === 'ArrowRight') mostrar(k + 1); });
let x0 = null; GI.addEventListener('touchstart', e => x0 = e.touches[0].clientX, {passive: true});
GI.addEventListener('touchend', e => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) mostrar(k + (dx < 0 ? 1 : -1)); x0 = null; });

/* ---------- página inicial: destaque ---------- */
function destaque(box){
  const cel = matchMedia('(max-width:760px)').matches, calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const imgs = [...box.querySelectorAll(':scope > img')], leg = $('dqLeg');
  // ordem sorteada a cada visita
  const fila = LISTA.map((p, i) => i); for (let i = fila.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [fila[i], fila[j]] = [fila[j], fila[i]]; }
  let pos = -1, atual = null, frente = 0, timer = 0, ocupado = false;
  // carrega a capa; pula as pequenas demais para a tela cheia (e, no computador, as em pé)
  const testar = p => new Promise(ok => { const im = new Image(); im.onload = () => ok(im.naturalWidth >= (cel ? 700 : 1300) && (cel || im.naturalWidth >= im.naturalHeight) ? im.src : null); im.onerror = () => ok(null); im.src = img(p.imagens[0], cel ? 1400 : 2400); });
  async function ir(dir){
    if (ocupado) return; ocupado = true; clearTimeout(timer);
    let src = null, p = null;
    for (let n = 0; n < fila.length && !src; n++){ pos = (pos + dir + fila.length) % fila.length; p = LISTA[fila[pos]]; if (p.ruim) continue; src = await testar(p); if (!src) p.ruim = true; }
    if (!src){ ocupado = false; if (!atual) box.hidden = true; return; }
    atual = p; frente = 1 - frente;
    const nova = imgs[frente], velha = imgs[1 - frente];
    nova.src = src; nova.alt = p.t;
    leg.classList.add('troca');
    requestAnimationFrame(() => { nova.classList.add('on'); velha.classList.remove('on'); });
    setTimeout(() => { $('dqTit').innerHTML = esc(p.t) + (p.sub ? ` <span>· ${esc(p.sub)}</span>` : ''); $('dqSub').textContent = linha(p); leg.hidden = false; leg.classList.remove('troca'); box.classList.remove('sk'); ocupado = false; }, leg.hidden ? 0 : 450);
    agenda();
  }
  function agenda(){ clearTimeout(timer); if (!calmo) timer = setTimeout(() => { if (document.hidden || !G.hidden || !naTela) return agenda(); ir(1); }, TROCA_S * 1000); }
  let naTela = true; new IntersectionObserver(es => { naTela = es[0].isIntersecting; }).observe(box);
  box.addEventListener('click', e => { const b = e.target.closest('[data-dq]'); if (b){ e.stopPropagation(); return ir(+b.dataset.dq); } if (atual) abrir(atual); });
  box.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target === box && atual){ e.preventDefault(); abrir(atual); } });
  ir(1);
}

/* ---------- projetos.html: todos ---------- */
function lista(grid){
  grid.innerHTML = LISTA.map((p, i) => `<a class="plate in" data-cat="${p.cat}" data-i="${i}" href="#${esc(p.id)}">
    <div class="mat"><div class="img"><img src="${img(p.imagens[0], 1000)}" alt="${esc(p.t)}" loading="lazy" decoding="async"></div>
    <div class="legend"><h3>${esc(p.t)}${p.sub ? ` <span style="opacity:.75;font-weight:400">· ${esc(p.sub)}</span>` : ''}</h3><span class="mono">${esc(linha(p))}</span></div></div></a>`).join('');
  const sh = document.querySelector('#projetos .sec-head .mono'); if (sh) sh.textContent = 'Pranchas 01—' + String(LISTA.length).padStart(2, '0');
  grid.addEventListener('click', e => { const a = e.target.closest('.plate[data-i]'); if (!a) return; e.preventDefault(); abrir(LISTA[+a.dataset.i]); });
  const fs = document.querySelectorAll('.filter');
  fs.forEach(f => f.addEventListener('click', () => { fs.forEach(x => x.classList.remove('active')); f.classList.add('active');
    grid.querySelectorAll('.plate').forEach(p => p.classList.toggle('hide', !(f.dataset.f === 'todos' || p.dataset.cat === f.dataset.f))); }));
  const alvo = LISTA.find(p => '#' + p.id === location.hash); if (alvo) abrir(alvo);
}

const box = $('destaque'), grid = $('grid');
if (grid) grid.innerHTML = Array.from({length: 6}, () => '<div class="plate sk"><div class="mat"><div class="img"></div></div></div>').join('');
carregar().then(() => { if (box) destaque(box); if (grid) lista(grid); })
  .catch(() => { if (box) box.hidden = true; if (grid) grid.innerHTML = '<p style="grid-column:1/-1">Não foi possível carregar os projetos agora. Tente de novo em instantes.</p>'; });
})();
