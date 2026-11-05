/* Bouquet 3D — procedural lilies & chrysanthemums with Three.js (WebGL). No external model files.
   API: Bouquet3D.create(canvas, reducedMotion) -> { start(), stop(), resize() } */
(function (global) {
  "use strict";

  function create(canvas, reduce) {
    const T = global.THREE;
    const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setClearColor(0x000000, 0);
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.88;

    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(28, 460 / 540, 0.1, 50);
    camera.position.set(0, 0.3, 5.1);
    camera.lookAt(0, -0.02, 0);

    /* ---------- lights ---------- */
    scene.add(new T.AmbientLight(0xffe0ea, 0.22));
    scene.add(new T.HemisphereLight(0xfff0f5, 0xc07a98, 0.5));
    const key = new T.DirectionalLight(0xffffff, 0.95); key.position.set(2.5, 3.5, 4); scene.add(key);
    const fill = new T.DirectionalLight(0xffc4da, 0.45); fill.position.set(-3, 1, -1); scene.add(fill);
    const rim = new T.DirectionalLight(0xfff4f8, 0.55); rim.position.set(0, 2.5, -4); scene.add(rim);

    /* ---------- helpers ---------- */
    const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const lerp = (a, b, t) => a + (b - a) * t;
    const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
    const ease = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
    const tex = (w, h, fn) => {
      const c = document.createElement("canvas"); c.width = w; c.height = h; fn(c.getContext("2d"), w, h);
      const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 4; return t;
    };

    /* ---------- textures ---------- */
    const lilyTex = tex(128, 256, (g, w, h) => {
      let gr = g.createLinearGradient(0, h, 0, 0);
      gr.addColorStop(0, "#d9e88c"); gr.addColorStop(0.09, "#f6a3c0"); gr.addColorStop(0.3, "#ee5c97"); gr.addColorStop(0.7, "#f487b3"); gr.addColorStop(1, "#fbc3d9");
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      gr = g.createLinearGradient(0, 0, w, 0);
      gr.addColorStop(0, "rgba(255,242,247,.8)"); gr.addColorStop(0.2, "rgba(255,242,247,0)"); gr.addColorStop(0.8, "rgba(255,242,247,0)"); gr.addColorStop(1, "rgba(255,242,247,.8)");
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      gr = g.createLinearGradient(0, h, 0, 0);
      gr.addColorStop(0, "rgba(200,40,110,0)"); gr.addColorStop(0.15, "rgba(200,40,110,.45)"); gr.addColorStop(0.85, "rgba(200,40,110,.15)"); gr.addColorStop(1, "rgba(200,40,110,0)");
      g.fillStyle = gr; g.fillRect(w / 2 - 4, 0, 8, h);
      const r = rng(7);
      for (let i = 0; i < 70; i++) {
        const v = 0.1 + 0.5 * r(), y = h * (1 - v), spread = w * 0.3 * (1 - v * 0.7), x = w / 2 + (r() + r() - 1) * spread, rad = 1.3 + 2.2 * r();
        g.fillStyle = "rgba(122,12,62," + (0.55 + 0.4 * r()) + ")"; g.beginPath(); g.arc(x, y, rad, 0, 7); g.fill();
      }
    });
    const chrysTex = tex(64, 128, (g, w, h) => {
      const gr = g.createLinearGradient(0, h, 0, 0);
      gr.addColorStop(0, "#b8245f"); gr.addColorStop(0.35, "#e9568f"); gr.addColorStop(0.75, "#f8a6c8"); gr.addColorStop(1, "#fde0ec");
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.strokeStyle = "rgba(255,255,255,.22)"; g.lineWidth = 1.2;
      for (let i = 1; i < 6; i++) { g.beginPath(); g.moveTo(w * i / 6, h); g.lineTo(w * i / 6, h * 0.1); g.stroke(); }
    });
    const leafTex = tex(128, 256, (g, w, h) => {
      const gr = g.createLinearGradient(0, h, 0, 0);
      gr.addColorStop(0, "#2a7048"); gr.addColorStop(0.6, "#4a9a65"); gr.addColorStop(1, "#8fcb98");
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.strokeStyle = "rgba(210,240,200,.55)"; g.lineWidth = 4; g.beginPath(); g.moveTo(w / 2, h); g.lineTo(w / 2, h * 0.08); g.stroke();
      g.strokeStyle = "rgba(210,240,200,.22)"; g.lineWidth = 1.4;
      for (let i = 1; i < 14; i++) { const y = h * (1 - i / 14); g.beginPath(); g.moveTo(w / 2, y); g.lineTo(0, y - 30); g.moveTo(w / 2, y); g.lineTo(w, y - 30); g.stroke(); }
    });
    const dotTex = tex(32, 32, (g, w, h) => {
      const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
      gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.35, "rgba(255,230,242,.7)"); gr.addColorStop(1, "rgba(255,200,225,0)");
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
    });

    /* ---------- materials ---------- */
    const petalMat = (map, extra) => new T.MeshPhysicalMaterial(Object.assign({
      map, roughness: 0.58, metalness: 0, side: T.DoubleSide,
      sheen: 0.5, sheenColor: new T.Color(0xffc4dc), sheenRoughness: 0.6,
      emissive: 0xffffff, emissiveMap: map, emissiveIntensity: 0.07
    }, extra));
    const lilyMat = petalMat(lilyTex);
    const chrysMat = petalMat(chrysTex, { vertexColors: true });
    const leafMat = new T.MeshStandardMaterial({ map: leafTex, roughness: 0.55, side: T.DoubleSide, emissive: 0xffffff, emissiveMap: leafTex, emissiveIntensity: 0.04 });
    const stemMat = new T.MeshStandardMaterial({ color: 0x2a6a42, roughness: 0.6 });
    const ribbonMat = new T.MeshStandardMaterial({ color: 0xd23a6e, roughness: 0.35, side: T.DoubleSide, emissive: 0x500820, emissiveIntensity: 0.2 });
    const antherMat = new T.MeshStandardMaterial({ color: 0xd9702a, roughness: 0.8, emissive: 0x6a2a00, emissiveIntensity: 0.3 });
    const filMat = new T.MeshStandardMaterial({ color: 0xf1e8c8, roughness: 0.6 });
    const discMat = new T.MeshStandardMaterial({ color: 0xd8b13a, roughness: 0.7, emissive: 0x6a5000, emissiveIntensity: 0.3 });

    /* ---------- petal / leaf geometry ----------
       A curved sheet pointing along +Y from the origin. a0 = outward tilt (rad), curl = extra bend toward the tip,
       cup = how much the edges fold toward the flower's inside (-Z). */
    function sheet(o) {
      const L = o.L, W = o.W, ns = o.ns || 10, nt = o.nt || 6, a0 = o.a0 || 0, curl = o.curl || 0, cup = o.cup || 0, pw = o.pw == null ? 0.75 : o.pw, pe = o.pe == null ? 0.8 : o.pe, wave = o.wave || 0, tip = o.tip == null ? 0 : o.tip;
      const cy = [0], cz = [0], ang = [];
      for (let i = 0; i <= ns; i++) ang.push(a0 + curl * Math.pow(i / ns, 2));
      for (let i = 1; i <= ns; i++) { const a = (ang[i] + ang[i - 1]) / 2, d = L / ns; cy.push(cy[i - 1] + Math.cos(a) * d); cz.push(cz[i - 1] + Math.sin(a) * d); }
      const pos = [], uv = [], idx = [];
      for (let i = 0; i <= ns; i++) {
        const s = i / ns, a = ang[i];
        const w = W * Math.pow(Math.max(0, Math.sin(Math.PI * Math.pow(s, pw))), pe) * (tip && s > 0.85 ? 1 : 1) + W * tip * s * s;
        for (let j = 0; j <= nt; j++) {
          const t = (j / nt) * 2 - 1, x = t * w, off = cup * t * t * w + wave * Math.sin(s * 13 + t * 2) * Math.abs(t) * W;
          pos.push(x, cy[i] + Math.sin(a) * off, cz[i] - Math.cos(a) * off);
          uv.push((t + 1) / 2, s);
        }
      }
      for (let i = 0; i < ns; i++) for (let j = 0; j < nt; j++) {
        const a = i * (nt + 1) + j, b = a + 1, c = a + nt + 1, d = c + 1;
        idx.push(a, b, c, b, d, c);
      }
      const g = new T.BufferGeometry();
      g.setAttribute("position", new T.Float32BufferAttribute(pos, 3));
      g.setAttribute("uv", new T.Float32BufferAttribute(uv, 2));
      g.setIndex(idx); g.computeVertexNormals();
      return g;
    }

    // merge many (geometry, matrix, tint) into one BufferGeometry (with vertex colours)
    function merge(list) {
      const P = [], U = [], C = [], I = []; let base = 0;
      list.forEach(({ g, m, c }) => {
        const gg = g.clone(); gg.applyMatrix4(m);
        const p = gg.attributes.position.array, u = gg.attributes.uv.array, ix = gg.index.array;
        for (let i = 0; i < p.length; i++) P.push(p[i]);
        for (let i = 0; i < u.length; i++) U.push(u[i]);
        for (let i = 0; i < p.length / 3; i++) C.push(c, c, c);
        for (let i = 0; i < ix.length; i++) I.push(ix[i] + base);
        base += p.length / 3; gg.dispose();
      });
      const g = new T.BufferGeometry();
      g.setAttribute("position", new T.Float32BufferAttribute(P, 3));
      g.setAttribute("uv", new T.Float32BufferAttribute(U, 2));
      g.setAttribute("color", new T.Float32BufferAttribute(C, 3));
      g.setIndex(I); g.computeVertexNormals();
      return g;
    }

    /* ---------- chrysanthemum ---------- */
    function chrysanthemum(R, seed) {
      const r = rng(seed), root = new T.Group(), nL = 10, layers = [], open = [];
      for (let i = 0; i < nL; i++) {
        const f = i / (nL - 1), list = [];
        const count = Math.round(9 + 22 * Math.pow(1 - f, 0.8)), pitch = lerp(1.3, 0.12, Math.pow(f, 0.8)), L = R * lerp(1, 0.42, Math.pow(f, 0.9)), W = R * lerp(0.17, 0.12, f), curl = lerp(0.75, -0.9, f), yoff = R * 0.34 * f;
        const geo = [0, 1, 2].map(() => sheet({ L: L * (0.92 + 0.16 * r()), W: W * (0.9 + 0.2 * r()), ns: 8, nt: 4, a0: 0, curl: curl * (0.8 + 0.4 * r()), cup: 0.5, pw: 0.42, pe: 0.38, tip: 0.0 }));
        const tint = lerp(1.0, 0.7, f);
        for (let k = 0; k < count; k++) {
          const yaw = (k / count) * Math.PI * 2 + i * 0.7 + (r() - 0.5) * 0.18, p = pitch + (r() - 0.5) * 0.2;
          const m = new T.Matrix4().makeTranslation(0, yoff, 0).multiply(new T.Matrix4().makeRotationY(yaw)).multiply(new T.Matrix4().makeRotationX(p));
          list.push({ g: geo[k % 3], m, c: tint * (0.9 + 0.1 * r()) });
        }
        const mesh = new T.Mesh(merge(list), chrysMat); mesh.frustumCulled = false;
        const holder = new T.Group(); holder.add(mesh); root.add(holder); layers.push(holder);
        geo.forEach((g) => g.dispose());
      }
      const disc = new T.Mesh(new T.SphereGeometry(R * 0.16, 14, 10), discMat); disc.scale.y = 0.55; disc.position.y = R * 0.42; root.add(disc);
      const flo = new T.Group(); root.add(flo);
      const fg = new T.SphereGeometry(R * 0.022, 6, 5);
      for (let i = 0; i < 26; i++) { const a = i * 2.39996, rr = R * 0.12 * Math.sqrt(i / 26), m = new T.Mesh(fg, discMat); m.position.set(rr * Math.cos(a), R * 0.46 + (1 - i / 26) * R * 0.02, rr * Math.sin(a)); flo.add(m); }
      return {
        node: root,
        set(o) {
          layers.forEach((h, i) => { const q = ease((o - i * 0.045) / 0.7); h.scale.set(lerp(0.2, 1, q), lerp(1.08, 1, q), lerp(0.2, 1, q)); });
          root.scale.setScalar(lerp(0.3, 1, ease(o * 1.2)));
        }
      };
    }

    /* ---------- lily ---------- */
    function lily(R, seed) {
      const r = rng(seed), root = new T.Group(), petals = [];
      const outer = sheet({ L: R * 1.12, W: R * 0.36, ns: 14, nt: 9, a0: 0, curl: 1.15, cup: 0.5, pw: 0.78, pe: 0.85, wave: 0.03 });
      const inner = sheet({ L: R * 1.05, W: R * 0.44, ns: 14, nt: 9, a0: 0, curl: 1.3, cup: 0.45, pw: 0.72, pe: 0.8, wave: 0.07 });
      for (let k = 0; k < 6; k++) {
        const isIn = k % 2 === 1, yaw = k * Math.PI / 3 + (isIn ? 0.0 : 0.02), yawN = new T.Group(), pitchN = new T.Group();
        yawN.rotation.y = yaw; yawN.add(pitchN);
        const m = new T.Mesh(isIn ? inner : outer, lilyMat); m.frustumCulled = false; pitchN.add(m);
        pitchN.rotation.z = (r() - 0.5) * 0.06;
        root.add(yawN); petals.push({ pitchN, open: isIn ? 0.78 + 0.1 * r() : 0.98 + 0.1 * r(), closed: isIn ? 0.1 : 0.16 });
      }
      // stamens + pistil
      const st = new T.Group(); root.add(st);
      const filG = new T.CylinderGeometry(R * 0.012, R * 0.014, R * 0.78, 5); filG.translate(0, R * 0.39, 0);
      const antG = new T.SphereGeometry(R * 0.032, 8, 6); antG.scale(0.55, 1.9, 0.55);
      const stamens = [];
      for (let k = 0; k < 6; k++) {
        const pv = new T.Group(), a = k * Math.PI / 3 + 0.5; pv.rotation.y = a; const t = new T.Group(); pv.add(t);
        t.add(new T.Mesh(filG, filMat)); const an = new T.Mesh(antG, antherMat); an.position.y = R * 0.8; an.rotation.x = Math.PI / 2.4; t.add(an);
        st.add(pv); stamens.push({ t, tilt: 0.28 + 0.1 * r() });
      }
      const pistG = new T.CylinderGeometry(R * 0.012, R * 0.016, R * 0.9, 5); pistG.translate(0, R * 0.45, 0);
      const pist = new T.Group(); pist.add(new T.Mesh(pistG, new T.MeshStandardMaterial({ color: 0xe6efc0, roughness: 0.6 })));
      const stig = new T.Mesh(new T.SphereGeometry(R * 0.03, 8, 6), new T.MeshStandardMaterial({ color: 0xb8d070, roughness: 0.7 })); stig.position.y = R * 0.9; pist.add(stig);
      st.add(pist);
      return {
        node: root,
        set(o) {
          petals.forEach((p, i) => { const q = ease((o - i * 0.04) / 0.75); p.pitchN.rotation.x = lerp(p.closed, p.open, q); });
          stamens.forEach((s) => { s.t.rotation.x = lerp(0.04, s.tilt, ease(o)); });
          pist.rotation.x = lerp(0.0, 0.12, ease(o));
          root.scale.setScalar(lerp(0.3, 1, ease(o * 1.2)));
        }
      };
    }

    /* ---------- bouquet ---------- */
    const outer = new T.Group(), spin = new T.Group(); outer.add(spin); scene.add(outer);
    const TIE = new T.Vector3(0, -0.98, 0), UP = new T.Vector3(0, 1, 0);
    // [kind, head x,y,z, radius, direction x,y,z, seed, appear delay]
    const spec = [
      ["k", 0, 0.62, 0.0, 0.46, 0.0, 1, 0.12, 3, 0.22],
      ["l", -0.6, 0.16, 0.34, 0.42, -0.6, 0.6, 0.55, 4, 0.1],
      ["l", 0.6, 0.12, -0.3, 0.4, 0.65, 0.55, -0.45, 5, 0.3],
      ["k", -0.4, -0.26, -0.46, 0.27, -0.45, 0.35, -0.85, 6, 0.42],
      ["k", 0.42, -0.28, 0.46, 0.27, 0.5, 0.35, 0.8, 7, 0.5]
    ];
    const flowers = [];
    spec.forEach(([kind, x, y, z, R, dx, dy, dz, seed, st]) => {
      const f = kind === "k" ? chrysanthemum(R, seed) : lily(R, seed);
      const pos = new T.Vector3(x, y, z), dir = new T.Vector3(dx, dy, dz).normalize();
      f.node.position.copy(pos); f.node.quaternion.setFromUnitVectors(UP, dir);
      const pivot = new T.Group(); pivot.add(f.node); spin.add(pivot); pivot.position.set(0, 0, 0);
      flowers.push({ f, st });
      const mid = TIE.clone().lerp(pos, 0.5); mid.x *= 0.7; mid.z *= 0.7;
      const curve = new T.CatmullRomCurve3([TIE.clone(), mid, pos.clone().sub(dir.clone().multiplyScalar(0.28)), pos.clone().sub(dir.clone().multiplyScalar(0.02))]);
      const stem = new T.Mesh(new T.TubeGeometry(curve, 28, 0.017, 7, false), stemMat); stem.frustumCulled = false; spin.add(stem);
    });

    // leaves fanned around the stems
    const leafSpecs = [[0.2, 0.75, 0.82, 0.15], [1.5, 0.95, 0.76, 0.14], [2.6, 0.7, 0.9, 0.16], [3.7, 1.0, 0.7, 0.13], [4.7, 0.8, 0.85, 0.15], [5.7, 1.1, 0.62, 0.12], [0.95, 0.55, 0.5, 0.11], [3.15, 0.6, 0.5, 0.11]];
    leafSpecs.forEach(([yaw, a0, L, W], i) => {
      const g = sheet({ L, W, ns: 12, nt: 6, a0: 0, curl: 1.1, cup: 0.35, pw: 0.85, pe: 0.75 });
      const m = new T.Mesh(g, leafMat), yn = new T.Group(), pn = new T.Group(); m.frustumCulled = false;
      pn.add(m); pn.rotation.x = a0 * 0.8 + 0.1; yn.add(pn); yn.rotation.y = yaw; yn.position.set(0, -0.78 + 0.035 * (i % 4), 0); spin.add(yn);
    });

    // ribbon: band + bow
    const band = new T.Mesh(new T.CylinderGeometry(0.085, 0.07, 0.11, 24, 1, true), ribbonMat); band.position.set(0, -0.86, 0); spin.add(band);
    const bow = new T.Group(); bow.position.set(0, -0.86, 0.085); spin.add(bow);
    [-1, 1].forEach((s) => {
      const loop = new T.Mesh(new T.TorusGeometry(0.1, 0.028, 10, 28), ribbonMat); loop.scale.set(1.15, 0.8, 0.5); loop.position.set(s * 0.1, 0.0, 0); loop.rotation.z = s * -0.35; bow.add(loop);
      const tail = new T.Mesh(sheet({ L: 0.4, W: 0.036, ns: 10, nt: 2, a0: Math.PI - s * 0.3, curl: -s * 0.7, cup: 0, pw: 0.3, pe: 0.3 }), ribbonMat); tail.position.set(s * 0.02, -0.03, 0.0); bow.add(tail); tail.frustumCulled = false;
    });
    const knot = new T.Mesh(new T.SphereGeometry(0.045, 12, 10), ribbonMat); knot.scale.set(1.1, 0.9, 0.8); bow.add(knot);

    // sparkles
    const SN = 46, sp = new Float32Array(SN * 3), sv = new Float32Array(SN), sr = rng(99);
    for (let i = 0; i < SN; i++) { sp[i * 3] = (sr() - 0.5) * 3; sp[i * 3 + 1] = (sr() - 0.5) * 3; sp[i * 3 + 2] = (sr() - 0.5) * 2.4; sv[i] = 0.05 + 0.1 * sr(); }
    const spGeo = new T.BufferGeometry(); spGeo.setAttribute("position", new T.BufferAttribute(sp, 3));
    const sparkles = new T.Points(spGeo, new T.PointsMaterial({ size: 0.11, map: dotTex, transparent: true, opacity: 0.8, depthWrite: false, blending: T.AdditiveBlending, sizeAttenuation: true }));
    sparkles.frustumCulled = false; outer.add(sparkles);

    /* ---------- loop / interaction ---------- */
    const DUR = 7.5, PITCH = 0.36;
    let dprCap = 2, ema = 0.016, slow = 0, raf = 0, t0 = 0, last = 0, spinA = 0.6, drag = false, vel = 0, px = 0, pitch = PITCH, pitchV = 0, py = 0, running = false;
    canvas.addEventListener("pointerdown", (e) => { drag = true; px = e.clientX; py = e.clientY; vel = 0; try { canvas.setPointerCapture(e.pointerId); } catch (_) {} });
    canvas.addEventListener("pointermove", (e) => {
      if (!drag) return;
      const dx = e.clientX - px, dy = e.clientY - py; px = e.clientX; py = e.clientY;
      spinA += dx * 0.012; vel = dx * 0.012 * 60; pitch = clamp(pitch + dy * 0.004, 0.05, 0.75);
    });
    ["pointerup", "pointercancel"].forEach((n) => canvas.addEventListener(n, () => { drag = false; }));

    function resize() {
      const w = canvas.clientWidth || 460, h = canvas.clientHeight || 540, dpr = Math.min(global.devicePixelRatio || 1, dprCap);
      renderer.setPixelRatio(dpr); renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
    }

    function render(now) {
      const gap = (now - last) / 1000 || 0.016, dt = Math.min(0.05, gap); last = now;
      // safeguard: if the device is struggling, lower the render resolution step by step (keeps phones cool)
      ema = ema * 0.92 + gap * 0.08; slow = ema > 0.034 ? slow + 1 : 0;
      if (slow > 40 && dprCap > 1) { dprCap = Math.max(1, dprCap - 0.5); slow = 0; ema = 0.016; resize(); }
      const Tm = reduce ? 1 : clamp((now - t0) / 1000 / DUR);
      if (!reduce) {
        if (!drag) { vel *= 0.94; spinA += (0.5 + vel) * dt; pitch += (PITCH - pitch) * 0.03; }
      }
      spin.rotation.y = spinA; outer.rotation.x = pitch;
      flowers.forEach(({ f, st }) => f.set(ease((Tm - st) / 0.45)));
      const rise = ease(Tm / 0.12); outer.scale.setScalar(lerp(0.85, 1, rise));
      const p = spGeo.attributes.position.array;
      if (!reduce) for (let i = 0; i < SN; i++) { p[i * 3 + 1] += sv[i] * dt; if (p[i * 3 + 1] > 1.6) p[i * 3 + 1] = -1.5; }
      spGeo.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
    }
    function loop(now) { raf = requestAnimationFrame(loop); render(now); }

    return {
      start() {
        resize(); cancelAnimationFrame(raf); drag = false; vel = 0; pitch = PITCH; spinA = 0.6; t0 = performance.now(); last = t0; running = true;
        if (reduce) { render(performance.now()); return; }
        raf = requestAnimationFrame(loop);
      },
      stop() { running = false; cancelAnimationFrame(raf); raf = 0; },
      resize() { if (running) { resize(); if (reduce) render(performance.now()); } },
      // used by tests: render at a fixed time / angle
      _debug(Tm, ang, pit) { t0 = performance.now() - Tm * DUR * 1000; spinA = ang; pitch = pit == null ? PITCH : pit; render(performance.now()); }
    };
  }

  global.Bouquet3D = { create };
})(window);
