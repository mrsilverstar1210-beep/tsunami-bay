// Tsunami Bay interiors: shop (Do'kon), gun shop (Qurol-yarog'), night club (Tsunami Klub)
// buildInterior(THREE, kind, ptex) -> {group, spawn:[x,z,h], exit:[x,z], counter:[x,z], lights:[...], update(t)}
export function buildInterior(THREE, kind, ptex) {
  const G = new THREE.Group(); const upd = []; const L = [];
  const M = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: .6 }, o));
  const box = (w, h, d, m, x, y, z, ry = 0, par = G) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.rotation.y = ry; b.castShadow = b.receiveShadow = true; par.add(b); return b };
  const tex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t };
  const sign = (txt, w, h, bg, fg, font, x, y, z, ry = 0, glow = 1) => { const t = tex(1024, Math.round(1024 * h / w), (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.fillStyle = fg; g.font = font.replace('$', Math.round(H * .62)); g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = fg; g.shadowBlur = glow * 18; g.fillText(txt, W / 2, H / 2 + 4) }); const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: glow, roughness: .4 })); m.position.set(x, y, z); m.rotation.y = ry; G.add(m); return m };
  const room = (W, D, H, floorM, wallM, ceilM) => {
    const f = new THREE.Mesh(new THREE.PlaneGeometry(W, D), floorM); f.rotation.x = -Math.PI / 2; f.receiveShadow = true; G.add(f);
    const c = new THREE.Mesh(new THREE.PlaneGeometry(W, D), ceilM); c.rotation.x = Math.PI / 2; c.position.y = H; G.add(c);
    [[0, D / 2, Math.PI, W], [0, -D / 2, 0, W], [W / 2, 0, -Math.PI / 2, D], [-W / 2, 0, Math.PI / 2, D]].forEach(([x, z, r, w]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, H), wallM); m.position.set(x, H / 2, z); m.rotation.y = r; m.receiveShadow = true; G.add(m) })
  };
  const tile = (rep, a, b, line = '#00000022', size = 512, n = 8) => { const t = tex(size, size, (g, W) => { g.fillStyle = a; g.fillRect(0, 0, W, W); const s = W / n; for (let i = 0; i < n; i++)for (let j = 0; j < n; j++) { g.fillStyle = (i + j) % 2 ? a : b; g.fillRect(i * s, j * s, s, s) } g.strokeStyle = line; g.lineWidth = 3; for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, W); g.stroke(); g.beginPath(); g.moveTo(0, i * s); g.lineTo(W, i * s); g.stroke() } }); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); return t };
  const panelLight = (x, z, w, d, H, col = 0xffffff, I = 1.6) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ color: col })); m.rotation.x = Math.PI / 2; m.position.set(x, H - .02, z); G.add(m); return m };
  const pl = (c, i, d, x, y, z) => { const p = new THREE.PointLight(c, i, d, 1.6); p.position.set(x, y, z); G.add(p); L.push(p); return p };
  let R = { spawn: [0, 0, 0], exit: [0, 0], counter: [0, 0] };

  if (kind === 'shop') {
    const W = 16, D = 20, H = 4.2;
    room(W, D, H, M(0xffffff, { map: tile(6, '#d9d4ca', '#c9c3b7', '#00000025'), roughness: .3, metalness: .05 }), M(0xe8e2d6, { roughness: .9 }), M(0xbfbfbf));
    for (const [x, z, r, w] of [[0, -9.98, 0, W], [-7.98, 0, Math.PI / 2, D], [7.98, 0, -Math.PI / 2, D]]) { const b = new THREE.Mesh(new THREE.PlaneGeometry(w, .9), M(0x0b6e4f, { roughness: .6 })); b.position.set(x, 3.4, z); b.rotation.y = r; G.add(b) }
    for (let x = -6; x <= 6; x += 4) for (let z = -8; z <= 8; z += 4) { panelLight(x, z, 2.6, .5, H) }
    const hemi = new THREE.HemisphereLight(0xffffff, 0x8a8478, .55); G.add(hemi); L.push(hemi);
    const key = new THREE.DirectionalLight(0xfff6ea, .9); key.position.set(4, 8, 3); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); Object.assign(key.shadow.camera, { left: -10, right: 10, top: 12, bottom: -12 }); G.add(key); L.push(key);
    // product texture: rows of colourful packaging
    const prod = tex(1024, 256, (g, W, H) => { g.fillStyle = '#e8e4dc'; g.fillRect(0, 0, W, H); const pal = ['#d62828', '#f77f00', '#fcbf49', '#2a9d8f', '#264653', '#e76f51', '#8ecae6', '#219ebc', '#6a994e', '#bc4749', '#ffffff', '#3a86ff', '#ff006e'];
      for (let x = 4; x < W - 20;) { const w = 26 + Math.random() * 34, h = 120 + Math.random() * 120, c = pal[(Math.random() * pal.length) | 0]; g.fillStyle = c; g.fillRect(x, H - h, w, h); g.fillStyle = '#ffffffaa'; g.fillRect(x + 4, H - h + 20, w - 8, 14); g.fillStyle = '#00000033'; g.fillRect(x + w - 4, H - h, 4, h); x += w + 3 } });
    const shelfM = M(0xffffff, { map: prod, roughness: .55 }), metal = M(0xc9ccd1, { metalness: .6, roughness: .35 });
    for (const x of [-4.5, -1.5, 1.5, 4.5]) { const g = new THREE.Group(); g.position.set(x, 0, 0); G.add(g); box(.9, 2.1, 9, metal, 0, 1.05, 0, 0, g).material = M(0xdfe2e6, { metalness: .4, roughness: .4 });
      for (let s = 0; s < 4; s++) { box(1.1, .04, 9, metal, 0, .35 + s * .5, 0, 0, g); for (const sd of [-1, 1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(9, .44), shelfM); p.position.set(sd * .5, .58 + s * .5, 0); p.rotation.y = sd * Math.PI / 2; g.add(p) } }
      const tag = sign(['NONLAR', 'ICHIMLIK', 'SHIRINLIK', 'MAISHIY'][(x + 4.5) / 3], 2.4, .5, '#e63946', '#ffffff', 'bold $px Arial', x, 3.3, -4.6, 0, .6) }
    // fridges along back wall (glowing doors)
    const fr = tex(512, 512, (g, W, H) => { g.fillStyle = '#cfefff'; g.fillRect(0, 0, W, H); const pal = ['#e63946', '#2a9d8f', '#f4a261', '#3a86ff', '#ffbe0b', '#8338ec']; for (let r = 0; r < 5; r++)for (let c = 0; c < 9; c++) { g.fillStyle = pal[(r * 3 + c) % pal.length]; g.beginPath(); g.roundRect(14 + c * 55, 18 + r * 98, 36, 76, 10); g.fill(); g.fillStyle = '#ffffff88'; g.fillRect(20 + c * 55, 40 + r * 98, 24, 10) } g.fillStyle = '#ffffff55'; g.fillRect(0, 0, W, 6) });
    for (let k = 0; k < 6; k++) { const x = -6.2 + k * 2.1; box(2, 2.4, .8, M(0xe8e8e8, { metalness: .5, roughness: .3 }), x, 1.2, -9.55); const d = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 2.1), new THREE.MeshStandardMaterial({ map: fr, emissive: 0xffffff, emissiveMap: fr, emissiveIntensity: .55, roughness: .05, metalness: .2 })); d.position.set(x, 1.25, -9.14); G.add(d) }
    // checkout counter + cash register + snacks
    const cnt = M(0x6b4226, { roughness: .45 }); box(5, 1, .9, cnt, 4.5, .5, 7.2); box(5.1, .06, 1, M(0x2b2d42, { roughness: .2, metalness: .3 }), 4.5, 1.03, 7.2);
    box(.5, .35, .4, M(0x111111, { metalness: .4 }), 3.4, 1.25, 7.1); box(.45, .3, .05, M(0x111111, { emissive: 0x33ff99, emissiveIntensity: .8 }), 3.4, 1.55, 6.95, 0);
    box(1.2, 1.3, .5, M(0xffffff, { map: prod }), 6.3, .65, 6.5);
    sign('TSUNAMI MARKET', 8, 1.1, '#0b3954', '#ffffff', 'bold $px Arial', 0, 3.4, 9.95, Math.PI, 1);
    sign('KASSA', 1.8, .5, '#2a9d8f', '#ffffff', 'bold $px Arial', 4.5, 2.8, 7.2, Math.PI, .9);
    // entrance doors (glass) + rubber mat
    box(3, 2.6, .08, M(0x99ccee, { transparent: true, opacity: .35, roughness: .05, metalness: .3 }), -4.5, 1.3, 9.95);
    box(3, .02, 2, M(0x333333, { roughness: 1 }), -4.5, .01, 8.8);
    R = { spawn: [-4.5, 8, Math.PI], exit: [-4.5, 9.3], counter: [4.5, 6.3], cam: [[6.5, 2.6, 9.2], [-1.5, 1.1, -3]] };
  }

  if (kind === 'guns') {
    const W = 14, D = 16, H = 3.8;
    const conc = M(0x9a9893, { map: tile(4, '#8f8c86', '#878480', '#00000030', 512, 4), roughness: .55, metalness: .1 });
    const brick = tex(512, 512, (g, W, H) => { g.fillStyle = '#3b2a24'; g.fillRect(0, 0, W, H); for (let r = 0; r < 16; r++)for (let c = 0; c < 9; c++) { const o = r % 2 ? 28 : 0; g.fillStyle = `hsl(${12 + Math.random() * 10},${35 + Math.random() * 15}%,${26 + Math.random() * 10}%)`; g.fillRect(c * 60 - o + 3, r * 32 + 3, 54, 26) } }); brick.wrapS = brick.wrapT = THREE.RepeatWrapping; brick.repeat.set(4, 2);
    room(W, D, H, conc, M(0xffffff, { map: brick, roughness: .9 }), M(0x1c1c1c));
    const hemi = new THREE.HemisphereLight(0xfff1dc, 0x2a2420, .9); G.add(hemi); L.push(hemi);
    for (let x = -4; x <= 4; x += 4) { const lamp = box(1.4, .08, .3, M(0x111111, { emissive: 0xfff0d8, emissiveIntensity: 2 }), x, H - .15, -1); pl(0xffe6c4, 14, 12, x, H - .4, -1) }
    // pegboard wall with guns
    const peg = tex(1024, 512, (g, W, H) => { g.fillStyle = '#5a4634'; g.fillRect(0, 0, W, H); g.fillStyle = '#3d2f23'; for (let x = 12; x < W; x += 24) for (let y = 12; y < H; y += 24) { g.beginPath(); g.arc(x, y, 3, 0, 7); g.fill() } });
    const pb = new THREE.Mesh(new THREE.PlaneGeometry(12, 2.4), M(0xffffff, { map: peg, roughness: .9 })); pb.position.set(0, 2, -7.95); G.add(pb);
    const gunM = M(0x1d1f22, { metalness: .75, roughness: .32 }), woodM = M(0x6b3e1f, { roughness: .55 });
    const rifle = (x, y, s = 1, wood = true) => { const g = new THREE.Group(); g.position.set(x, y, -7.85); G.add(g); box(1.6 * s, .1, .06, gunM, 0, 0, 0, 0, g); box(.5 * s, .2, .07, wood ? woodM : gunM, -.85 * s, -.05, 0, 0, g); box(.12, .3, .06, gunM, .1, -.17, 0, 0, g); box(.4 * s, .08, .07, gunM, .25, .09, 0, 0, g); return g };
    const pistol = (x, y) => { const g = new THREE.Group(); g.position.set(x, y, -7.85); G.add(g); box(.32, .09, .05, gunM, 0, 0, 0, 0, g); box(.09, .18, .05, gunM, -.1, -.11, 0, 0, g) };
    for (let r = 0; r < 4; r++) rifle(-4.2 + (r % 2) * .2, 2.9 - r * .45, 1, r % 2 === 0);
    for (let r = 0; r < 4; r++) rifle(3.6, 2.9 - r * .45, .85, r === 1);
    for (let i = 0; i < 6; i++) pistol(-1.5 + (i % 3) * 1.1, 2.7 - Math.floor(i / 3) * .45);
    for (let i = 0; i < 3; i++) { const sg = rifle(-.5 + i * .9, 1.4, .75, true); sg.rotation.z = .02 }
    // glass display counters
    const glass = M(0xaad4ff, { transparent: true, opacity: .25, roughness: .02, metalness: .2 });
    for (const [x, z, w, r] of [[-3, -3.2, 5, 0], [3, -3.2, 5, 0]]) { box(w, .9, .9, M(0x161616, { metalness: .4, roughness: .3 }), x, .45, z); box(w, .45, .9, glass, x, 1.12, z); const lt = box(w - .2, .02, .7, M(0x000000, { emissive: 0xfff3e0, emissiveIntensity: 1.2 }), x, 1.33, z);
      for (let k = 0; k < 4; k++) { const g = new THREE.Group(); g.position.set(x - w / 2 + .8 + k * 1.15, 1.0, z); G.add(g); box(.32, .09, .05, gunM, 0, 0, 0, Math.PI / 2, g); box(.6, .02, .45, M(0x7a1f1f, { roughness: 1 }), 0, -.06, 0, 0, g) } }
    // ammo boxes on shelf right wall
    for (let s = 0; s < 3; s++) { box(.5, .04, 4, M(0x2e2e2e, { metalness: .5 }), 6.7, .6 + s * .6, 2); for (let k = 0; k < 7; k++) box(.35, .25, .5, M([0x9e2a2b, 0x335c67, 0xe09f3e, 0x2d6a4f][(k + s) % 4], { roughness: .7 }), 6.65, .76 + s * .6, .2 + k * .55) }
    // shooting range lane behind bars on the left
    box(.04, H, 6, M(0x99bbcc, { transparent: true, opacity: .18, roughness: .05 }), -4.2, H / 2, 4.5);
    for (let z = 1.8; z <= 7.4; z += .35) box(.04, H, .04, gunM, -4.2, H / 2, z);
    const tgt = tex(256, 512, (g, W, H) => { g.fillStyle = '#f1efe6'; g.fillRect(0, 0, W, H); g.fillStyle = '#111'; g.beginPath(); g.ellipse(W / 2, H * .3, 60, 70, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(W / 2, H * .72, 100, 150, 0, 0, 7); g.fill(); g.strokeStyle = '#f1efe6'; g.lineWidth = 6; for (let r = 30; r < 150; r += 30) { g.beginPath(); g.ellipse(W / 2, H * .7, r * .66, r, 0, 0, 7); g.stroke() } });
    const tp = new THREE.Mesh(new THREE.PlaneGeometry(.8, 1.6), M(0xffffff, { map: tgt })); tp.position.set(-6.9, 1.5, 4.5); tp.rotation.y = Math.PI / 2; G.add(tp); pl(0xffffff, 6, 6, -6, 3, 4.5);
    sign("QUROL-YAROG'", 6, 1, '#111111', '#ff3b30', '900 $px Arial Black, Arial', 0, 3.45, -7.9, 0, 1.4);
    sign('LITSENZIYA SHART EMAS', 3.2, .35, '#111111', '#ffd60a', 'bold $px Arial', 5.2, 2.9, 7.95, Math.PI, .8);
    R = { spawn: [2, 6.5, Math.PI], exit: [2, 7.6], counter: [0, -2.2], cam: [[5.2, 2.2, 5.6], [-1, 1.4, -6]] };
  }

  if (kind === 'club') {
    const W = 22, D = 24, H = 6;
    const dark = M(0x0b0b12, { roughness: .4, metalness: .3 });
    room(W, D, H, M(0x101018, { roughness: .2, metalness: .5 }), M(0x14101c, { roughness: .8 }), M(0x050508));
    const hemi = new THREE.HemisphereLight(0x5a3d8a, 0x0a0612, .5); G.add(hemi); L.push(hemi);
    // LED dance floor
    const N = 8, S = 1.2, tiles = [];
    for (let i = 0; i < N; i++)for (let j = 0; j < N; j++) { const m = new THREE.MeshStandardMaterial({ color: 0x050505, emissive: 0xff00aa, emissiveIntensity: 1, roughness: .2, metalness: .3 }); const t = new THREE.Mesh(new THREE.BoxGeometry(S - .06, .08, S - .06), m); t.position.set((i - N / 2 + .5) * S, .04, (j - N / 2 + .5) * S - 1); G.add(t); tiles.push([t, i, j]) }
    upd.push(t => tiles.forEach(([m, i, j]) => { const h = (Math.sin(t * 2 + i * .7) + Math.cos(t * 1.6 + j * .9) + 2) / 4; m.material.emissive.setHSL(((i + j) % 3) * .28 + .8 + h * .1, 1, .45); m.material.emissiveIntensity = .15 + .7 * Math.max(0, Math.sin(t * 6 + (i * 3 + j * 5) * .9)) }));
    // DJ booth with screens
    box(5, 1.2, 1.6, dark, 0, .6, -9.5); box(5.2, .08, 1.8, M(0x222233, { metalness: .8, roughness: .2 }), 0, 1.24, -9.5);
    for (const x of [-1.3, 1.3]) { const d = new THREE.Mesh(new THREE.CylinderGeometry(.35, .35, .06, 32), M(0x111111, { metalness: .8, roughness: .3 })); d.position.set(x, 1.3, -9.4); G.add(d) }
    const scr = tex(1024, 512, (g, W, H) => { const gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, '#ff006e'); gr.addColorStop(.5, '#8338ec'); gr.addColorStop(1, '#3a86ff'); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.fillStyle = '#fff'; g.font = 'bold 150px Impact'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = '#fff'; g.shadowBlur = 30; g.fillText('TSUNAMI', W / 2, H / 2 - 40); g.font = 'bold 60px Arial'; g.fillText('NIGHT CLUB', W / 2, H / 2 + 80) });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(9, 4.5), new THREE.MeshStandardMaterial({ map: scr, emissive: 0xffffff, emissiveMap: scr, emissiveIntensity: 1.3 })); screen.position.set(0, 3.4, -11.9); G.add(screen);
    // bar on the right with bottles
    box(1.2, 1.1, 10, M(0x1a1024, { roughness: .3, metalness: .4 }), 8.5, .55, 1); box(1.4, .06, 10.2, M(0xffffff, { emissive: 0x00e5ff, emissiveIntensity: .9 }), 8.5, 1.13, 1);
    for (let s = 0; s < 3; s++) { box(.5, .04, 9, M(0x333344, { metalness: .6 }), 10.7, 1.6 + s * .6, 1, 0, G); for (let k = 0; k < 18; k++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(.06, .07, .35, 10), new THREE.MeshStandardMaterial({ color: [0x2a9d8f, 0xe9c46a, 0xf4a261, 0x8ecae6, 0xff006e][(k + s) % 5], transparent: true, opacity: .8, roughness: .05, emissive: [0x2a9d8f, 0xe9c46a, 0xf4a261, 0x8ecae6, 0xff006e][(k + s) % 5], emissiveIntensity: .25 })); b.position.set(10.7, 1.8 + s * .6, -3 + k * .47); G.add(b) } }
    const sm = new THREE.Mesh(new THREE.PlaneGeometry(10, 2.2), new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x7b2cbf, emissiveIntensity: .5 })); sm.position.set(10.95, 2.2, 1); sm.rotation.y = -Math.PI / 2; G.add(sm);
    for (let k = 0; k < 6; k++) { const st = new THREE.Group(); st.position.set(7.4, 0, -3 + k * 1.6); G.add(st); box(.05, .8, .05, M(0xcccccc, { metalness: .9 }), 0, .4, 0, 0, st); const c = new THREE.Mesh(new THREE.CylinderGeometry(.25, .25, .1, 20), M(0xff006e, { roughness: .5 })); c.position.y = .82; st.add(c) }
    // lounge sofas on the left
    for (let k = 0; k < 3; k++) { const z = -5 + k * 5; box(1, .45, 3.4, M(0x5a189a, { roughness: .8 }), -9.8, .25, z); box(.35, .9, 3.4, M(0x5a189a, { roughness: .8 }), -10.4, .55, z); box(1.2, .5, 1.2, M(0x0f0f15, { metalness: .6, roughness: .2 }), -8.2, .25, z) }
    // neon tubes on the walls and ceiling
    const neon = (c, x, y, z, w, ry = 0) => { const m = box(w, .07, .07, new THREE.MeshBasicMaterial({ color: c }), x, y, z, ry); return m };
    for (let k = 0; k < 5; k++) { neon(0xff00aa, -10.95, 1.2 + k * .9, 1, 22, Math.PI / 2); }
    for (let k = -2; k <= 2; k++) neon([0x00e5ff, 0xff00aa, 0x9d4edd][(k + 3) % 3], k * 4, H - .1, -1, .07, 0).scale.set(1, 1, 300);
    // disco ball + coloured spot lights
    const ball = new THREE.Mesh(new THREE.SphereGeometry(.6, 24, 16), M(0xdddddd, { metalness: 1, roughness: .15, flatShading: true })); ball.position.set(0, H - 1.2, -1); G.add(ball); upd.push(t => { ball.rotation.y = t * .8 });
    const spots = [[0xff00aa, -4], [0x00e5ff, 0], [0x9d4edd, 4]].map(([c, x]) => { const s = new THREE.SpotLight(c, 80, 20, .45, .5, 1.2); s.position.set(x, H - .3, 3); s.target.position.set(x, 0, -1); G.add(s, s.target); L.push(s); return s });
    upd.push(t => spots.forEach((s, k) => { s.target.position.set(Math.sin(t * 1.3 + k * 2) * 5, 0, -1 + Math.cos(t * 1.1 + k) * 4) }));
    pl(0xff00aa, 30, 18, -6, 3, 4); pl(0x00e5ff, 30, 18, 6, 3, -4); pl(0xffffff, 8, 10, 8.5, 3, 1);
    sign('TSUNAMI KLUB', 7, 1.2, '#000000', '#ff2bd6', '900 $px Arial Black, Arial', 0, 4.6, 11.95, Math.PI, 2);
    R = { spawn: [0, 10, Math.PI], exit: [0, 11.4], counter: [7.4, 1], cam: [[-8.5, 3.4, 9.5], [1.5, 1, -4]] };
  }
  G.traverse(o => { if (o.isMesh) o.matrixAutoUpdate = true });
  return Object.assign({ group: G, lights: L, update: t => upd.forEach(f => f(t)) }, R);
}
