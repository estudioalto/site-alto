/* alto · a sala (voxel)
   A equipe trabalhando na sala do Golden Office. As miniaturas são as mesmas do painel:
   quando alguém muda a sua no painel, ela muda aqui também (Firestore → equipe/{id}.sala). */
(() => {
const cv = document.getElementById('sala'); if (!cv) return;
const FIREBASE = {projectId: 'alto-site', apiKey: 'AIzaSyAihkkIZFXIoQDdFETh1rfhik42-vNhLa8'};
// equipe fixa (vale enquanto a pessoa ainda não entrou no painel)
const PADRAO = {
  thomaz: {nome: 'Thomaz', av: {skin:'#d9a37c', hair:'#2b211b', style:'curto', eyes:'#4a3020', glasses:'#211b16', beard:'barba', head:'nada', brinco:false, item:'tubo', shirt:'grafite', pants:'offblack', shoes:'laranja', top:'blazer'}},
  lira:   {nome: 'Lira',   av: {skin:'#e8b994', hair:'#4a2c1d', style:'longo', eyes:'#5a3a22', glasses:'', beard:'nenhuma', head:'nada', brinco:true, item:'planta', shirt:'areia', pants:'offblack', shoes:'laranja', top:'camiseta'}},
  thay:   {nome: 'Thay',   av: {skin:'#c98e68', hair:'#3a2418', style:'longo', eyes:'#3a2418', glasses:'', beard:'nenhuma', head:'nada', brinco:true, item:'calculadora', shirt:'pessego', pants:'offblack', shoes:'areia', top:'blazer'}},
};

/* ---------- miniatura (mesmo modelo do painel) ---------- */
const ALTO = {laranja:'#ff6600', areia:'#e7e0d5', offblack:'#211b16', grafite:'#3b322b', taupe:'#a99d8f', pessego:'#f9c29a'};
const alto = k => ALTO[k] || (String(k)[0] === '#' ? k : ALTO.grafite);
const hx = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
function avatarModel(a){
  const V = new Map(), K = (x, y, z) => x + ',' + y + ',' + z;
  const put = (x, y, z, c, e) => V.set(K(x, y, z), {x, y, z, c, e});
  const del = (x, y, z) => V.delete(K(x, y, z));
  const box = (x0, x1, y0, y1, z0, z1, c) => { for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) put(x, y, z, c); };
  const sh = alto(a.shirt), pa = alto(a.pants), so = alto(a.shoes), H = a.hair, S = a.skin, E = a.eyes || '#2a1a10';
  const sole = a.shoes === 'areia' ? ALTO.offblack : '#ece6dc';
  // tênis
  [[2,3],[5,6]].forEach(([x0, x1]) => { box(x0, x1, 0, 0, 0, 3, sole); box(x0, x1, 1, 1, 0, 3, so); box(x0, x1, 2, 2, 1, 2, so); });
  // pernas finas (2×2) com vão entre elas, quadril
  box(2, 3, 3, 15, 1, 2, pa); box(5, 6, 3, 15, 1, 2, pa); box(2, 6, 16, 16, 1, 2, pa);
  // tronco: cintura estreita, ombros mais largos
  box(2, 6, 17, 20, 1, 3, sh); box(1, 7, 21, 25, 1, 3, sh);
  const gola = a.shirt === 'laranja' ? ALTO.offblack : ALTO.laranja;
  if (a.top === 'blazer'){ const cam = a.shirt === 'areia' ? '#f4f0e9' : ALTO.areia; box(4, 4, 18, 25, 3, 3, cam); put(3, 25, 3, cam); put(5, 25, 3, cam); put(3, 24, 4, sh); put(5, 24, 4, sh); put(4, 22, 4, gola); }
  else { put(3, 25, 3, gola); put(4, 25, 3, gola); put(5, 25, 3, gola); }
  // braços finos: manga, antebraço, mão
  [0, 8].forEach(x => { box(x, x, 19, 25, 2, 2, sh); box(x, x, 15, 18, 2, 2, a.top === 'blazer' ? sh : S); box(x, x, 13, 14, 2, 2, S); });
  if (a.top === 'blazer') [0, 8].forEach(x => put(x, 15, 2, '#f4f0e9'));
  // pescoço e cabeça (y27–34)
  box(3, 5, 26, 26, 1, 3, S); box(2, 6, 27, 34, 0, 4, S);
  // rosto: boca, olhos, sobrancelhas
  put(4, 28, 4, '#b4614f'); put(3, 28, 4, '#c9826c'); put(5, 28, 4, '#c9826c');
  put(3, 31, 4, E); put(5, 31, 4, E);
  const brow = H; put(3, 32, 4, brow); put(5, 32, 4, brow);
  // mood do dia: expressão
  const LIP = '#b4614f', shade = (h, k) => '#' + hx(h).map(v => Math.round(v * k).toString(16).padStart(2, '0')).join('');
  const md = a.mood;
  if (md === 'animado' || md === 'tranquilo'){ put(3, 28, 4, S); put(5, 28, 4, S); put(4, 28, 4, LIP); put(3, 29, 4, LIP); put(5, 29, 4, LIP); }
  if (md === 'animado' || md === 'amil'){ put(3, 32, 4, S); put(5, 32, 4, S); put(3, 33, 4, brow); put(5, 33, 4, brow); }
  if (md === 'tranquilo'){ put(3, 31, 4, shade(S, .55)); put(5, 31, 4, shade(S, .55)); }
  if (md === 'focado'){ put(2, 32, 4, brow); put(6, 32, 4, brow); [3, 4, 5].forEach(x => put(x, 28, 4, '#8f4a3b')); }
  if (md === 'cansado'){ put(3, 30, 4, shade(S, .78)); put(5, 30, 4, shade(S, .78)); put(3, 28, 4, S); put(5, 28, 4, S); put(4, 28, 4, '#8f4a3b'); }
  if (md === 'amil'){ put(4, 28, 4, '#4a221a'); put(4, 27, 4, '#4a221a'); put(3, 28, 4, S); put(5, 28, 4, S); put(7, 32, 4, '#9cc9e8', true); put(7, 31, 4, '#bfdcef', true); }
  // barba / bigode
  if (a.beard === 'barba'){ for (let y = 27; y <= 29; y++){ [2, 6].forEach(x => box(x, x, y, y, 1, 4, H)); } box(2, 6, 27, 27, 4, 4, H); put(3, 29, 4, H); put(5, 29, 4, H); put(4, 29, 4, H); box(3, 5, 26, 26, 3, 3, H); }
  if (a.beard === 'bigode'){ put(3, 29, 4, H); put(4, 29, 4, H); put(5, 29, 4, H); }
  // cabelo
  const head = a.head || 'nada', capOn = head === 'capacete' || head === 'bone';
  if (a.style === 'raspado'){ box(2, 6, 34, 34, 0, 4, H); box(2, 6, 31, 33, 0, 0, H); }
  else {
    if (!capOn) box(2, 6, 35, 35, 0, 4, H);
    box(2, 6, 28, 34, -1, -1, H); box(1, 1, 31, 35, 0, 3, H); box(7, 7, 31, 35, 0, 3, H);
    box(2, 6, 34, 34, 4, 4, H); put(2, 33, 4, H); put(6, 33, 4, H);
    if (a.style === 'longo'){ box(1, 7, 19, 34, -2, -1, H); box(1, 1, 22, 30, 0, 3, H); box(7, 7, 22, 30, 0, 3, H); }
    if (a.style === 'coque' && !capOn){ box(3, 5, 36, 37, 0, 2, H); put(4, 38, 1, H); }
    if (a.style === 'cacheado'){ box(1, 7, 28, 35, -2, -2, H); box(0, 0, 29, 35, -1, 3, H); box(8, 8, 29, 35, -1, 3, H); if (!capOn){ box(1, 7, 36, 36, -1, 4, H); [[2,37,1],[4,37,0],[6,37,2],[3,37,3],[5,37,-1]].forEach(([x, y, z]) => put(x, y, z, H)); } [[2,35,5],[4,35,5],[6,35,5]].forEach(([x, y, z]) => put(x, y, z, H)); }
  }
  // na cabeça
  if (head === 'capacete'){ box(1, 7, 35, 35, -1, 5, ALTO.laranja); box(2, 6, 36, 37, 0, 4, ALTO.laranja); box(3, 5, 38, 38, 0, 4, ALTO.laranja); }
  if (head === 'bone'){ const bc = alto(a.capCor || 'offblack'); box(2, 6, 35, 36, 0, 4, bc); box(2, 6, 35, 35, 5, 7, bc); put(4, 37, 2, ALTO.laranja); }
  if (head === 'fone'){ box(1, 7, 37, 37, 2, 2, ALTO.offblack); box(0, 0, 33, 36, 2, 2, ALTO.offblack); box(8, 8, 33, 36, 2, 2, ALTO.offblack); box(0, 0, 30, 32, 1, 3, ALTO.laranja); box(8, 8, 30, 32, 1, 3, ALTO.laranja); }
  if (a.brinco){ put(1, 29, 2, '#e0b23a'); put(7, 29, 2, '#e0b23a'); }
  // óculos
  if (a.glasses){ const g = a.glasses; [2, 4, 6].forEach(x => put(x, 31, 5, g)); put(3, 31, 5, E); put(5, 31, 5, E); [3, 5].forEach(x => { put(x, 32, 5, g); put(x, 30, 5, g); }); box(1, 1, 31, 31, 1, 4, g); box(7, 7, 31, 31, 1, 4, g); }
  // na mão
  const it = a.item;
  if (it === 'tubo'){ box(9, 9, 8, 24, 2, 2, ALTO.laranja); box(9, 9, 24, 24, 2, 2, ALTO.offblack); }
  if (it === 'escalimetro'){ box(9, 9, 9, 20, 1, 1, '#ece6dc'); box(9, 9, 9, 20, 2, 2, ALTO.laranja); }
  if (it === 'calculadora'){ box(-1, -1, 14, 20, 0, 3, ALTO.offblack); box(-1, -1, 19, 19, 1, 2, '#9fc2a0'); [[15,1],[15,2],[17,1],[17,2]].forEach(([y, z]) => put(-2, y, z, ALTO.laranja)); }
  if (it === 'laptop'){ box(-1, -1, 15, 22, 0, 4, ALTO.grafite); put(-2, 19, 2, ALTO.laranja); }
  if (it === 'caderno'){ box(-1, -1, 15, 21, 0, 3, ALTO.offblack); box(-1, -1, 18, 18, 0, 3, ALTO.laranja); }
  if (it === 'cafe'){ box(9, 10, 12, 15, 1, 2, '#ece6dc'); box(9, 10, 13, 14, 1, 2, ALTO.laranja); box(9, 10, 16, 16, 1, 2, ALTO.offblack); }
  if (it === 'planta'){ box(11, 14, 0, 4, 0, 3, '#c4703f'); box(11, 14, 5, 5, 0, 3, '#3f3a2f'); [[12,6,1],[13,7,2],[12,8,1],[11,9,0],[14,9,3],[12,10,2],[13,11,1],[11,8,3],[14,7,0],[12,12,1]].forEach(([x, y, z]) => { box(x, x + 1, y, y, z, z + 1, '#5f8a4e'); }); put(13, 13, 2, '#78a35f'); }
  // mood do dia: símbolo flutuando ao lado da cabeça (aceso, aparece até no cenário noite)
  const B = MOODS[md]; if (B){ const bx = 10, by = 36, bz = 2; B.vox.forEach(([dx, dy, c]) => put(bx + dx, by + dy, bz, c, true)); }
  return [...V.values()].map(v => (v.grp = 'fig', v));
}
const MOODS = {
  animado:   {l: 'animado',   i: '✦', vox: [[1,0,'#FFA826'],[0,1,'#FFA826'],[1,1,'#ff6600'],[2,1,'#FFA826'],[1,2,'#FFA826']]},
  focado:    {l: 'focado',    i: '◎', vox: [[0,0,'#ff6600'],[1,0,'#ff6600'],[2,0,'#ff6600'],[0,1,'#ff6600'],[1,1,'#f4f0e9'],[2,1,'#ff6600'],[0,2,'#ff6600'],[1,2,'#ff6600'],[2,2,'#ff6600']]},
  tranquilo: {l: 'tranquilo', i: '☘', vox: [[0,0,'#5f8a4e'],[1,1,'#78a35f'],[1,0,'#78a35f'],[2,1,'#88b36b'],[2,2,'#88b36b'],[1,2,'#78a35f']]},
  cansado:   {l: 'cansado',   i: 'z',  vox: [[0,2,'#a99d8f'],[1,2,'#a99d8f'],[2,2,'#a99d8f'],[1,1,'#a99d8f'],[0,0,'#a99d8f'],[1,0,'#a99d8f'],[2,0,'#a99d8f'],[3,4,'#c9bfb2'],[4,4,'#c9bfb2'],[3,3,'#c9bfb2'],[4,3,'#c9bfb2']]},
  amil:      {l: 'a mil',     i: '⚡', vox: [[2,4,'#FFA826'],[1,3,'#FFA826'],[0,2,'#ff6600'],[1,2,'#ff6600'],[2,2,'#ff6600'],[1,1,'#FFA826'],[0,0,'#FFA826']]},
};


/* ---------- poses ---------- */
const braco = v => (v.x === 0 || v.x === 8) && v.z === 2 && v.y >= 13 && v.y <= 25;
// sentado: tronco desce, coxas para a frente, antebraços sobre a mesa; f = quadro da digitação (0, 1) ou -1 parado
function sentado(vox, f){
  const out = [];
  for (const v of vox){
    let {x, y, z} = v;
    if ((x < 0 || x > 8) && y < 26) continue;                       // o que estava na mão fica de fora
    if (braco(v)){
      if (y >= 22) y -= 6;
      else if (y >= 19) continue;
      else { z = 2 + (19 - y); const mao = v.y <= 14; y = 17 + (mao && ((f === 0 && x === 0) || (f === 1 && x === 8)) ? 1 : 0); }
    }
    else if (y >= 16) y -= 6;
    else if (y >= 9 && x >= 2 && x <= 6){ const ny = 9 + (z - 1); z = 2 + (15 - y); y = ny; }
    else if (y <= 8) z += 7;
    out.push({x, y, z, c: v.c, e: v.e});
  }
  return out;
}
// em pé andando: f alterna as pernas
function andando(vox, f){
  return vox.filter(v => !(v.x >= 11 && v.y < 14)).map(v => {
    let z = v.z;
    if (v.y <= 15 && v.x >= 2 && v.x <= 6 && f >= 0) z += (v.x <= 3 ? 1 : -1) * (f ? 1 : -1) * (v.y <= 8 ? 2 : 1);
    return {x: v.x, y: v.y, z, c: v.c, e: v.e};
  });
}
// gira em passos de 90° em torno do eixo do corpo e coloca no mundo (r: 0 = de frente para +z, 1 = +x, 2 = -z, 3 = -x)
function colocar(vox, px, pz, r){
  return vox.map(v => { const dx = v.x - 4, dz = v.z - 2;
    const [ax, az] = r === 0 ? [dx, dz] : r === 1 ? [dz, -dx] : r === 2 ? [-dx, -dz] : [-dz, dx];
    return {x: px + ax, y: v.y, z: pz + az, c: v.c, e: v.e}; });
}

/* ---------- a sala ---------- */
const X = 220, Z = 160, WH = 56;      // a sala é um triângulo: duas paredes e a frente em diagonal
const DENTRO = (x, z) => x / X + z / Z <= 1;
let DX = 0, DZ = 0;                    // deslocamento do bloco que está sendo montado
const S = new Map(), KEY = (x, y, z) => (x + 64) + (y + 8) * 512 + (z + 64) * 131072;
const put = (x, y, z, c, e) => { x += DX; z += DZ; S.set(KEY(x, y, z), {x, y, z, c, e}); };
const B = (x0, x1, y0, y1, z0, z1, c, e) => { for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) put(x, y, z, c, e); };
const hash = (a, b) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const MAD = '#c98a52', MAD2 = '#b47a45', BR = '#f2efe9', BR2 = '#dedad2', PRETO = '#262220', LAR = '#ff6600', CAD = '#e2552b', VERDE = '#5f8a4e', VERDE2 = '#78a35f', CONC = '#a9a59d';
function cadeira(px, pz, r, cor, giratoria){
  const V = []; const b = (x0, x1, y0, y1, z0, z1, c) => { for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) V.push({x, y, z, c}); };
  b(0, 8, 7, 8, -1, 8, cor); b(0, 8, 9, 21, -4, -3, cor); b(1, 7, 22, 22, -4, -3, cor);
  if (giratoria){ b(4, 4, 1, 6, 3, 3, '#8d8a85'); b(1, 7, 0, 0, 3, 3, PRETO); b(4, 4, 0, 0, 0, 6, PRETO); }
  else { [[0, -1], [8, -1], [0, 8], [8, 8]].forEach(([x, z]) => b(x, x, 0, 6, z, z, '#c96a3c')); b(0, 0, 9, 12, -1, 5, '#c96a3c'); b(8, 8, 9, 12, -1, 5, '#c96a3c'); }
  colocar(V, px, pz, r).forEach(v => put(v.x, v.y, v.z, v.c));
}
function planta(x, z, alt, vaso){
  B(x - 2, x + 2, 0, 5, z - 2, z + 2, vaso || '#b9623a'); B(x - 1, x + 1, 6, 6, z - 1, z + 1, '#3f3a2f');
  B(x, x, 7, alt - 4, z, z, '#6b4a2b');
  for (let i = 0; i < alt * 5; i++){ const a = hash(i, x) * 6.28, rr = 1 + hash(i, z) * (alt / 4), yy = alt - 8 + Math.floor(hash(x + i, z) * 10);
    const lx = Math.round(x + Math.cos(a) * rr), lz = Math.round(z + Math.sin(a) * rr); B(lx, lx + 1, yy, yy, lz, lz + 1, hash(i, 7) > .5 ? VERDE : VERDE2); }
}
// lugares: mesa (A de frente para a câmera, B de costas), reunião (M) e em pé (P)
const LUG = [
  {t: 'A', px: 56, pz: 27, r: 0}, {t: 'A', px: 100, pz: 27, r: 0}, {t: 'M', px: 36, pz: 83, r: 0},
  {t: 'B', px: 78, pz: 58, r: 2}, {t: 'B', px: 122, pz: 58, r: 2}, {t: 'M', px: 24, pz: 100, r: 1}, {t: 'M', px: 48, pz: 100, r: 3},
  {t: 'P', px: 150, pz: 26, r: 0}, {t: 'P', px: 70, pz: 84, r: 1}, {t: 'P', px: 104, pz: 70, r: 0}, {t: 'P', px: 24, pz: 56, r: 1},
];
function montarSala(){
  // armário branco baixo na parede das obras, com prateleira e objetos
  B(48, 166, 0, 17, 0, 9, BR); B(48, 166, 18, 18, 0, 10, BR2); for (let x = 70; x < 166; x += 24) B(x, x, 1, 16, 10, 10, BR2);
  B(60, 150, 27, 27, 0, 5, BR);
  B(52, 56, 19, 26, 2, 6, PRETO); B(53, 55, 21, 24, 7, 7, '#55504a'); B(140, 144, 19, 26, 2, 6, PRETO); B(141, 143, 21, 24, 7, 7, '#55504a');
  [[66, '#c96a3c'], [71, '#e9c9a8'], [76, '#8f6a4a'], [81, LAR], [118, '#d8b08a'], [123, '#b5532a'], [128, '#e7e0d5'], [133, '#c98a52']].forEach(([x, c], i) => B(x, x + 3, 19, 19 + 3 + (i % 3) * 2, 3, 4, c));
  [[64, LAR], [72, '#3f6fb5'], [80, BR2], [96, '#b5532a'], [104, PRETO], [130, '#e9c9a8'], [140, LAR]].forEach(([x, c]) => B(x, x + 5, 28, 28 + 1 + (x % 3), 1, 4, c));
  B(152, 160, 19, 34, 1, 2, '#e3c36a'); B(153, 159, 22, 30, 3, 3, '#d9a64a'); B(155, 157, 31, 33, 3, 3, '#8fb7d9');      // quadro da igreja apoiado
  planta(160, 5 + 14, 30, '#d8d2c4');
  // parede laranja: bancada de madeira com café, estante cinza e planta pendente
  B(0, 10, 0, 16, 10, 50, MAD); B(0, 11, 17, 17, 10, 50, MAD2);
  B(2, 7, 18, 27, 14, 20, PRETO); B(8, 8, 20, 22, 16, 18, LAR, true); B(3, 6, 18, 20, 26, 29, BR); B(3, 6, 18, 19, 33, 35, LAR);
  B(2, 6, 18, 18, 40, 47, '#b9b6b0');
  B(0, 8, 0, 24, 58, 74, '#9aa0a0'); for (let y = 6; y < 24; y += 6) B(9, 9, y, y, 58, 74, '#7d8383');
  B(2, 6, 25, 30, 62, 68, '#d8d2c4'); for (let i = 0; i < 26; i++){ const zz = 60 + Math.floor(hash(i, 3) * 12), yy = 31 + Math.floor(hash(i, 5) * 9), xx = 2 + Math.floor(hash(i, 9) * 6); B(xx, xx + 1, yy, yy, zz, zz + 1, i % 2 ? VERDE : VERDE2); }
  for (let i = 0; i < 14; i++) B(9, 9, 12 + i, 12 + i, 60 + (i % 3), 60 + (i % 3), VERDE);
  // ilha de mesas de madeira com monitores
  DX = -22; DZ = -14; const IL = l => ({px: l.px + 22});
  B(62, 156, 15, 16, 44, 69, MAD); for (let x = 62; x <= 156; x += 22) B(x, x, 15, 16, 44, 69, MAD2);
  [[63, 45], [155, 45], [63, 68], [155, 68], [109, 45], [109, 68]].forEach(([x, z]) => B(x, x + 1, 0, 14, z, z, BR));
  B(64, 154, 17, 17, 56, 57, BR);                                                    // calha no meio
  LUG.filter(l => l.t === 'A').map(IL).forEach(l => { B(l.px - 5, l.px + 5, 17, 17, 47, 52, '#8d8a85'); B(l.px - 5, l.px + 5, 18, 24, 53, 53, '#55504a'); B(l.px - 1, l.px, 21, 22, 54, 54, LAR, true); B(l.px + 9, l.px + 10, 17, 20, 47, 48, LAR); });
  LUG.filter(l => l.t === 'B').map(IL).forEach(l => { B(l.px - 8, l.px + 8, 20, 30, 60, 60, PRETO); B(l.px - 7, l.px + 7, 21, 29, 61, 61, '#cfe0ea', true); B(l.px - 6, l.px - 1, 26, 28, 61, 61, LAR, true); B(l.px - 6, l.px + 5, 22, 22, 61, 61, '#9fb6c4', true);
    B(l.px - 1, l.px + 1, 17, 19, 59, 60, '#55504a'); B(l.px - 5, l.px + 5, 17, 17, 63, 65, BR2); B(l.px - 11, l.px - 10, 17, 21, 64, 65, LAR); });
  B(66, 72, 17, 17, 60, 66, LAR); B(120, 126, 17, 17, 61, 66, '#e7e0d5'); B(150, 152, 17, 21, 47, 49, VERDE);
  // luminária linear branca, com a arvorezinha verde
  B(76, 146, 48, 48, 56, 58, BR, true); [80, 142].forEach(x => B(x, x, 49, WH + 4, 57, 57, '#8d8a85'));
  for (let i = 0; i < 6; i++) B(112 - (6 - i) / 2 | 0, 112 + (6 - i) / 2 | 0, 49 + i * 2, 50 + i * 2, 57 - ((6 - i) / 3 | 0), 57 + ((6 - i) / 3 | 0), '#2f6b4f');
  DX = DZ = 0;
  // luminária de papel
  for (let i = 0; i < 40; i++){ const a = hash(i, 11) * 6.28, b2 = hash(i, 13) * 3.14, rr = 5; const xx = Math.round(38 + Math.cos(a) * Math.sin(b2) * rr), yy = Math.round(46 + Math.cos(b2) * 4), zz = Math.round(98 + Math.sin(a) * Math.sin(b2) * rr); B(xx, xx + 1, yy, yy + 1, zz, zz + 1, '#f6f1e6', true); }
  B(38, 38, 51, WH + 16, 98, 98, '#8d8a85');
  // mesa de reunião triangular de granilite com pontos laranjas
  DX = 2; DZ = 24;
  for (let z = 62; z <= 92; z++){ const h = Math.round((93 - z) * 0.55); for (let x = 34 - h; x <= 34 + h; x++){
    const g = hash(x >> 1, z >> 1), f = hash(x, z); const c = g > .9 ? LAR : g < .07 ? '#8c877f' : f > .95 ? '#f7f4ee' : f < .06 ? '#b9b3a8' : '#ddd8cf';
    put(x, 16, z, c); put(x, 15, z, '#cfc9be'); } }
  B(31, 37, 0, 14, 70, 76, LAR); B(28, 40, 0, 0, 67, 79, '#e2552b');
  DX = DZ = 0;
  // cadeiras
  LUG.forEach((l, i) => { if (l.t === 'A' || l.t === 'B') cadeira(l.px, l.pz, l.r, [CAD, '#e9e6e0', '#9db5a0', CAD][i % 4], true); if (l.t === 'M') cadeira(l.px, l.pz, l.r, CAD, false); });
  // plantas grandes perto da janela
  planta(188, 9, 24, '#b9623a'); planta(10, 138, 26, '#b9623a');
  // caixa de som e tapete de amostras no chão não: mantém o piso livre
}

/* ---------- desenho ---------- */
const C = 0.866, ctx = cv.getContext('2d');
let s = 4, ox = 0, oy = 0, fundo = null, estaticos = [], dpr = 1;
const P2 = (x, y, z) => [ox + (x - z) * C * s, oy + (x + z) * .5 * s - y * s];
const tons = new Map();
function tom(c, e){ let t = tons.get(c + (e ? 'e' : '')); if (!t){ const [r, g, b] = hx(c.length === 4 ? '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3] : c), f = k => `rgb(${Math.min(255, r * k) | 0},${Math.min(255, g * k) | 0},${Math.min(255, b * k) | 0})`;
  t = e ? [f(1.04), f(1), f(.96)] : [f(1.05), f(.84), f(.68)]; tons.set(c + (e ? 'e' : ''), t); } return t; }
function cubo(g, v, mask){
  const [px, py] = P2(v.x, v.y, v.z), ex = C * s, eh = .5 * s, t = tom(v.c, v.e), o = .35;
  if (mask & 1){ g.fillStyle = t[0]; g.beginPath(); g.moveTo(px, py - s - o); g.lineTo(px + ex + o, py - s + eh); g.lineTo(px, py - s + 2 * eh + o); g.lineTo(px - ex - o, py - s + eh); g.fill(); }
  if (mask & 2){ g.fillStyle = t[1]; g.beginPath(); g.moveTo(px - ex - o, py - s + eh); g.lineTo(px, py - s + 2 * eh); g.lineTo(px, py + 2 * eh + o); g.lineTo(px - ex - o, py + eh + o); g.fill(); }   // face +z
  if (mask & 4){ g.fillStyle = t[2]; g.beginPath(); g.moveTo(px + ex + o, py - s + eh); g.lineTo(px, py - s + 2 * eh); g.lineTo(px, py + 2 * eh + o); g.lineTo(px + ex + o, py + eh + o); g.fill(); }   // face +x
}
const mascara = (v, tem) => (tem(v.x, v.y + 1, v.z) ? 0 : 1) | (tem(v.x, v.y, v.z + 1) ? 0 : 2) | (tem(v.x + 1, v.y, v.z) ? 0 : 4);
function plano(g, eixo){ // desenhar "na parede": eixo z = parede das obras (x, y), eixo x = parede laranja (z, y)
  const [a, b] = P2(0, 0, 0); if (eixo === 'z') g.setTransform(C * s, .5 * s, 0, -s, a, b); else g.setTransform(-C * s, .5 * s, 0, -s, a, b); }
function pintarFundo(){
  fundo = document.createElement('canvas'); fundo.width = cv.width; fundo.height = cv.height; const g = fundo.getContext('2d');
  const poly = (pts, c) => { g.fillStyle = c; g.beginPath(); pts.forEach((p, i) => { const q = P2(...p); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); g.closePath(); g.fill(); };
  // laje do piso (espessura), piso de madeira e réguas
  poly([[0, 0, Z], [X, 0, 0], [X, -4, 0], [0, -4, Z]], '#7d5533');
  poly([[0, 0, 0], [X, 0, 0], [0, 0, Z]], '#c79a6b');
  g.save(); g.beginPath(); [[0, 0, 0], [X, 0, 0], [0, 0, Z]].forEach((p, i) => { const q = P2(...p); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); g.clip();
  g.lineWidth = Math.max(.5, s * .12); g.strokeStyle = 'rgba(120,80,45,.35)';
  for (let z = 0; z < Z; z += 6){ const a = P2(0, 0, z), b = P2(X, 0, z); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
  for (let z = 0; z < Z; z += 6) for (let x = (z / 6 % 2) * 14; x < X; x += 28){ const a = P2(x, 0, z), b = P2(x, 0, Math.min(Z, z + 6)); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
  g.restore();
  // paredes (com espessura no topo)
  poly([[0, 0, 0], [X, 0, 0], [X, WH, 0], [0, WH, 0]], '#f4f1ea'); poly([[0, 0, 0], [0, 0, Z], [0, WH, Z], [0, WH, 0]], '#f08a4b');
  poly([[-3, WH, -3], [X, WH, -3], [X, WH, 0], [0, WH, 0], [0, WH, Z], [-3, WH, Z]], '#d9d5cd');
  poly([[X, 0, -3], [X, WH, -3], [X, WH, 0], [X, 0, 0]], '#c9c5bd'); poly([[-3, 0, Z], [0, 0, Z], [0, WH, Z], [-3, WH, Z]], '#b96a3a');
  // parede laranja: porta, rodapé de concreto no alto
  g.save(); plano(g, 'x');
  g.fillStyle = '#e97a3c'; g.fillRect(78, 0, 22, 46); g.fillStyle = '#d96a2e'; g.fillRect(78, 0, 1, 46); g.fillRect(99, 0, 1, 46); g.fillRect(78, 46, 22, 1); g.fillStyle = '#c9c5bd'; g.fillRect(82, 18, 1, 9);
  g.fillStyle = CONC; g.fillRect(0, WH - 5, Z, 5);
  g.fillStyle = '#ffd24a'; g.beginPath(); g.ellipse(54, 36, 3.2, 1.8, 0, 0, 7); g.fill(); g.fillStyle = '#fff3c4'; g.beginPath(); g.arc(54, 36, 1, 0, 7); g.fill();
  g.restore();
  // parede das obras
  g.save(); plano(g, 'z');
  g.fillStyle = CONC; g.fillRect(0, WH - 5, X, 5);
  const quadro = (x, y, w, h, c, m) => { g.fillStyle = m || PRETO; g.fillRect(x, y, w, h); g.fillStyle = c; g.fillRect(x + 1, y + 1, w - 2, h - 2); };
  g.fillStyle = '#f4f1ea'; g.fillRect(14, 22, 9, 26); g.save(); g.translate(22, 23); g.rotate(Math.PI / 2); g.scale(1, -1); g.fillStyle = '#e2401c'; g.font = '900 8.6px Arial Black, Arial, sans-serif'; g.textBaseline = 'alphabetic'; g.fillText('CIAO', 0, 0); g.restore();
  quadro(26, 26, 14, 20, '#d6577f'); g.fillStyle = '#f6d6e0'; g.fillRect(29, 30, 8, 9); g.fillStyle = '#3f3fb5'; g.fillRect(30, 31, 2, 3); g.fillRect(34, 31, 2, 3); g.fillRect(31, 36, 4, 3);
  quadro(4, 30, 9, 11, '#3f8f7a', '#7a4b2a'); quadro(26, 12, 13, 11, '#e9c96a', '#f4f1ea'); quadro(44, 34, 9, 8, '#d8d2c4');
  quadro(58, 30, 26, 15, '#1d2a33'); g.fillStyle = '#e9c9a8'; g.fillRect(68, 33, 7, 9); g.fillStyle = '#c9a45c'; g.fillRect(67, 40, 9, 3); g.fillStyle = '#f4f1ea'; g.fillRect(70, 36, 1, 1); g.fillRect(73, 36, 1, 1);
  quadro(88, 36, 8, 9, '#f4f1ea'); g.fillStyle = '#e2401c'; g.beginPath(); g.arc(92, 40.5, 2, 0, 7); g.fill();
  quadro(99, 31, 14, 16, '#f4f1ea'); g.fillStyle = PRETO; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) g.fillRect(101 + i * 2.8, 33.5 + j * 3, 2, 2.2);
  quadro(88, 28, 9, 6, '#e2401c', '#f4f1ea'); g.fillStyle = '#f4f1ea'; for (let i = 0; i < 3; i++) g.fillRect(89.5 + i * 2.3, 29.5, 1.4, 3);
  quadro(116, 30, 9, 7, '#f08a4b', '#f4f1ea'); quadro(44, 22, 9, 10, '#f4f1ea'); g.fillStyle = '#e2401c'; g.fillRect(46, 24, 5, 2); g.fillStyle = PRETO; g.fillRect(46, 27, 5, 3);
  quadro(128, 32, 6, 6, '#c9a45c', '#7a4b2a');
  g.restore(); g.setTransform(1, 0, 0, 1, 0, 0);
  // móveis e objetos (voxel), de trás para a frente
  const tem = (x, y, z) => S.has(KEY(x, y, z));
  estaticos = [...S.values()].map(v => { v.m = mascara(v, tem); v.k = v.x + v.y + v.z; return v; }).filter(v => v.m).sort((a, b) => a.k - b.k);
  // sombra de contato no piso
  g.fillStyle = 'rgba(60,35,15,.16)'; const vis = new Set();
  for (const v of S.values()) if (v.y === 0){ const k2 = v.x + ',' + v.z; if (vis.has(k2)) continue; vis.add(k2); }
  for (const k2 of vis){ const [x, z] = k2.split(',').map(Number); if (vis.has((x + 2) + ',' + (z + 2))) continue; const p = P2(x + 2, 0, z + 2), ex = C * s, eh = .5 * s; g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(p[0] + ex, p[1] + eh); g.lineTo(p[0], p[1] + 2 * eh); g.lineTo(p[0] - ex, p[1] + eh); g.fill(); }
  for (const v of estaticos) cubo(g, v, v.m);
}

/* ---------- gente ---------- */
let gente = [], tick = 0, cafe = null, proxCafe = +(new URLSearchParams(location.search).get('cafe') || 40);
function criar(lista){
  gente = lista.slice(0, LUG.length).map((p, i) => {
    const av = Object.assign({}, p.av, {mood: p.mood || null}), base = avatarModel(av), comCafe = avatarModel(Object.assign({}, av, {item: 'cafe', mood: null}));
    return {nome: p.nome, lug: LUG[i], est: 'lugar', fase: Math.floor(Math.random() * 20), pausa: 0,
      m: {dig: [sentado(base, 0), sentado(base, 1)], par: sentado(base, -1), pe: andando(base, -1), anda: [andando(comCafe, 0), andando(comCafe, 1)], cafe: andando(comCafe, -1)}};
  });
}
function voxDe(a){
  const l = a.lug;
  if (a.est === 'ida' || a.est === 'volta') return colocar(a.m.anda[(tick >> 1) & 1], a.x, 16, a.est === 'ida' ? 3 : 1);
  if (a.est === 'cafe') return colocar(a.m.cafe, a.x, 16, 3);
  if (l.t === 'P') return colocar(a.m.pe, l.px, l.pz, l.r);
  if (a.pausa > 0 || l.t === 'M' && (tick + a.fase) % 40 > 14) return colocar(a.m.par, l.px, l.pz, l.r);
  return colocar(a.m.dig[((tick + a.fase) >> 0) & 1], l.px, l.pz, l.r);
}
function passo(){
  tick++;
  gente.forEach(a => { if (a.pausa > 0) a.pausa--; else if (Math.random() < .012) a.pausa = 8 + Math.floor(Math.random() * 14); });
  // de tempos em tempos alguém da mesa vai pegar um café
  if (!cafe && --proxCafe <= 0){ const c = gente.filter(a => a.lug.t === 'A' && a.est === 'lugar'); if (c.length){ cafe = c[Math.floor(Math.random() * c.length)]; cafe.est = 'ida'; cafe.x = cafe.lug.px; } proxCafe = 70 + Math.floor(Math.random() * 60); }
  if (cafe){
    if (cafe.est === 'ida'){ cafe.x -= 2; if (cafe.x <= 17){ cafe.est = 'cafe'; cafe.t = 26; } }
    else if (cafe.est === 'cafe'){ if (--cafe.t <= 0) cafe.est = 'volta'; }
    else if (cafe.est === 'volta'){ cafe.x += 2; if (cafe.x >= cafe.lug.px){ cafe.est = 'lugar'; cafe = null; } }
  }
}
function desenhar(){
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height); ctx.drawImage(fundo, 0, 0);
  if (!gente.length) return;
  const din = [], caixas = [], tags = [];
  gente.forEach(a => {
    const V = voxDe(a), set = new Set(V.map(v => KEY(v.x, v.y, v.z))), tem = (x, y, z) => set.has(KEY(x, y, z));
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, kmin = 1e9, topo = 0, cx = 0, cz = 0;
    V.forEach(v => { v.m = mascara(v, tem); v.k = v.x + v.y + v.z; const p = P2(v.x, v.y, v.z); x0 = Math.min(x0, p[0] - s); x1 = Math.max(x1, p[0] + s); y0 = Math.min(y0, p[1] - s * 1.2); y1 = Math.max(y1, p[1] + s * 1.2); kmin = Math.min(kmin, v.k); if (v.y > topo && !v.e){ topo = v.y; } cx += v.x; cz += v.z; if (v.m) din.push(v); });
    caixas.push({x0, y0, x1, y1, kmin}); tags.push({nome: a.nome, p: P2(cx / V.length, topo + 5, cz / V.length)});
  });
  const kmin = Math.min(...caixas.map(c => c.kmin));
  ctx.save(); ctx.beginPath(); caixas.forEach(c => ctx.rect(c.x0, c.y0, c.x1 - c.x0, c.y1 - c.y0)); ctx.clip();
  const lista = din.slice();
  for (const v of estaticos){ if (v.k < kmin) continue; const p = P2(v.x, v.y, v.z);
    for (const c of caixas) if (v.k >= c.kmin && p[0] + s > c.x0 && p[0] - s < c.x1 && p[1] + s > c.y0 && p[1] - 1.2 * s < c.y1){ lista.push(v); break; } }
  lista.sort((a, b) => a.k - b.k);
  for (const v of lista) cubo(ctx, v, v.m);
  ctx.restore();
  // nomes
  const fs = Math.max(9, Math.round(s * 2.6)); ctx.font = `600 ${fs}px ${getComputedStyle(document.body).fontFamily}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  tags.forEach(t => { if (!t.nome) return; const w = ctx.measureText(t.nome).width + fs * .9, h = fs * 1.5, x = t.p[0] - w / 2, y = t.p[1] - h;
    ctx.fillStyle = 'rgba(33,27,22,.82)'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, h / 2) : ctx.rect(x, y, w, h); ctx.fill(); ctx.fillStyle = '#fffcf8'; ctx.fillText(t.nome, t.p[0], y + h / 2 + 1); });
}
function medir(){
  const r = cv.getBoundingClientRect(); if (r.width < 10) return false;
  dpr = Math.min(2, devicePixelRatio || 1);
  const largura = (X + Z + 8) * C, altura = Math.max(X, Z) * .5 + WH + 22;
  s = r.width * dpr / largura; cv.width = Math.round(r.width * dpr); cv.height = Math.round(altura * s);
  ox = (Z + 5) * C * s; oy = (WH + 14) * s;
  pintarFundo(); return true;
}

/* ---------- dados e laço ---------- */
const val = v => v == null ? null : 'stringValue' in v ? v.stringValue : 'integerValue' in v ? +v.integerValue : 'doubleValue' in v ? v.doubleValue : 'booleanValue' in v ? v.booleanValue : 'mapValue' in v ? obj(v.mapValue.fields) : null;
const obj = f => { const o = {}; Object.keys(f || {}).forEach(k => o[k] = val(f[k])); return o; };
const hoje = () => { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
async function equipe(){
  const m = JSON.parse(JSON.stringify(PADRAO)), ordem = Object.keys(m);
  try{
    const j = await fetch(`https://firestore.googleapis.com/v1/projects/${FIREBASE.projectId}/databases/(default)/documents/equipe?pageSize=60&key=${FIREBASE.apiKey}`).then(r => r.ok ? r.json() : {});
    (j.documents || []).forEach(d => { const id = d.name.split('/').pop(), o = obj(d.fields), sl = o.sala; if (!sl || !sl.av) return;
      if (!m[id]) ordem.push(id); m[id] = {nome: sl.nome || (m[id] || {}).nome || '', av: Object.assign({}, (m[id] || {}).av, sl.av), mood: sl.mood && sl.mood.d === hoje() ? sl.mood.m : null, fora: sl.fora === true}; });
  }catch(e){}
  return ordem.map(id => m[id]).filter(p => !p.fora);
}
montarSala();
for (const [k, v] of S) if (!DENTRO(v.x, v.z)) S.delete(k);
let pronto = false, naTela = false, timer = 0;
const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;
function laco(){ clearInterval(timer); if (!pronto || calmo || !naTela || document.hidden) return; timer = setInterval(() => { passo(); desenhar(); }, 170); }
equipe().then(l => { criar(l); if (medir()){ pronto = true; desenhar(); laco(); } });
new IntersectionObserver(es => { naTela = es[0].isIntersecting; if (naTela && !pronto && gente.length && medir()){ pronto = true; desenhar(); } laco(); }, {rootMargin: '100px'}).observe(cv);
document.addEventListener('visibilitychange', laco);
let rz, lw = 0; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { const w = cv.getBoundingClientRect().width; if (Math.abs(w - lw) > 8 && medir()){ lw = w; pronto = true; desenhar(); } }, 250); });
})();
