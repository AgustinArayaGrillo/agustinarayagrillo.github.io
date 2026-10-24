// Typing effect
const roles = [
  '· Angular · React · Next.js',
  '· Node.js · Python · FastAPI',
  '· Córdoba, Argentina',
];
let ri = 0, ci = 0, deleting = false;
const typedEl = document.getElementById('typed');

function type() {
  const txt = roles[ri];
  typedEl.textContent = deleting ? txt.slice(0, ci--) : txt.slice(0, ci++);
  if (!deleting && ci > txt.length) { deleting = true; setTimeout(type, 1600); return; }
  if (deleting && ci < 0) { deleting = false; ri = (ri + 1) % roles.length; ci = 0; }
  setTimeout(type, deleting ? 38 : 72);
}
setTimeout(type, 700);

// Scroll reveal
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.fade').forEach(el => observer.observe(el));

// Nav shrink + scroll-to-top button
const navbar = document.getElementById('navbar');
const scrollTopBtn = document.getElementById('scrollTop');
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  navbar.classList.toggle('scrolled', y > 60);
  scrollTopBtn.classList.toggle('visible', y > 400);
});
scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// Mobile nav
const toggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
toggle.addEventListener('click', () => navLinks.classList.toggle('open'));
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

// Smooth scroll — animated with easing + section flash
function easeInOutQuart(t) {
  return t < 0.5 ? 8*t*t*t*t : 1 - Math.pow(-2*t+2, 4)/2;
}
function smoothScrollTo(targetY, duration) {
  const startY = window.scrollY;
  const diff   = targetY - startY;
  if (Math.abs(diff) < 1) return;
  const t0 = performance.now();
  (function tick(now) {
    const p = Math.min((now - t0) / duration, 1);
    window.scrollTo(0, startY + diff * easeInOutQuart(p));
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}
function flashSection(el) {
  el.style.transition = 'none';
  el.style.boxShadow  = '0 0 0 0 rgba(96,165,250,0)';
  requestAnimationFrame(() => {
    el.style.transition = 'box-shadow 0.9s cubic-bezier(.22,.61,.36,1)';
    el.style.boxShadow  = '0 0 0 2px rgba(96,165,250,0.55), 0 0 40px 4px rgba(96,165,250,0.12)';
    setTimeout(() => { el.style.boxShadow = ''; el.style.transition = ''; }, 950);
  });
}
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id     = a.getAttribute('href');
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const navbar = document.getElementById('navbar');
    const offset = navbar ? navbar.offsetHeight + 16 : 16;
    const targetY = target.getBoundingClientRect().top + window.scrollY - offset;
    const dist  = Math.abs(targetY - window.scrollY);
    const dur   = Math.min(1200, Math.max(500, dist * 0.6));
    smoothScrollTo(targetY, dur);
    setTimeout(() => flashSection(target), dur * 0.85);
    // close mobile menu if open
    document.getElementById('navLinks')?.classList.remove('open');
  });
});

// ── EPIC EFFECTS ──────────────────────────────────────────────────

// 1. Cursor spotlight (global --mx / --my)
document.addEventListener('mousemove', e => {
  document.documentElement.style.setProperty('--mx', e.clientX + 'px');
  document.documentElement.style.setProperty('--my', e.clientY + 'px');
});

// 3. Stat counter animation
function easeOut(t) { return 1 - (1 - t) ** 3; }
const ctrObs = new IntersectionObserver(entries => {
  entries.forEach(({ isIntersecting, target: el }) => {
    if (!isIntersecting) return;
    const raw  = el.textContent.trim();
    const num  = parseFloat(raw);
    const sfx  = raw.replace(/[\d.]/g, '');
    const t0   = performance.now();
    const dur  = 1500;
    (function tick(now) {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = Math.floor(easeOut(p) * num) + sfx;
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
    ctrObs.unobserve(el);
  });
}, { threshold: 0.8 });
document.querySelectorAll('.stat-num').forEach(el => ctrObs.observe(el));

// 4. Hero name text scramble on load
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&';
function scramble(el, lines, dur = 1100, delay = 350) {
  const flat = lines.join('\n');
  setTimeout(() => {
    const t0 = performance.now();
    (function tick(now) {
      const p   = Math.min((now - t0) / dur, 1);
      const rev = Math.floor(easeOut(p) * flat.length);
      let out = '', i = 0;
      for (const line of lines) {
        for (const ch of line) {
          if (i < rev || ch === ' ') out += ch;
          else out += `<span style="color:var(--accent);opacity:.45">${GLYPHS[Math.floor(Math.random()*GLYPHS.length)]}</span>`;
          i++;
        }
        out += '<br>'; i++;
      }
      el.innerHTML = out;
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }, delay);
}
const hn = document.querySelector('.hero-name');
if (hn) scramble(hn, ['Agustín', 'Araya Grillo']);

// 5. Hero background — pescador en bote sobre agua en perspectiva
(function () {
  const canvas = document.getElementById('heroCanvas');
  const hero = document.getElementById('hero');
  if (!canvas || !hero) return;
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const blue = a => `rgba(96,165,250,${a})`;
  const warm = a => `rgba(251,146,60,${a})`;
  const FILL = '#0e1b30', FILL_DARK = '#0a1424', RIM = blue(.5), RIM_SOFT = blue(.2);
  const clamp01 = t => Math.min(1, Math.max(0, t));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeOut = t => 1 - (1 - t) ** 3;
  const easeInOut = t => t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
  const rad = d => d * Math.PI / 180;

  // Línea de tiempo de cada lance (ms)
  const REST = 32;                                    // ángulo de la caña en reposo
  const RELEASE = 600, CAST = 1500, BITE = 6400, BITE_LEN = 1100, REEL_AT = 9200, REEL = 1800, CYCLE = 13000;

  let W = 0, H = 0, S = 1;
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.offsetWidth; H = canvas.offsetHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    S = Math.min(1.5, Math.max(.85, H / 900 * 1.3)) * (W < 700 ? .75 : 1);
  }

  const waterTop = () => H * .8;
  const depthY = d => waterTop() + (H - waterTop()) * d;
  const boatX = () => W < 768 ? W * .8 : Math.min(W - 110 * S, Math.max(W * .86, (W + 1020) / 2 + 70 * S));
  let jitter = 0;
  const landPoint = () => ({
    x: Math.max(W * .1, boatX() - (W < 768 ? W * .5 : Math.min(W * .32, 560 * S)) + jitter * S),
    y: depthY(.26),
  });

  function bite(t) {
    if (t < BITE || t > BITE + BITE_LEN) return 0;
    const k = (t - BITE) / BITE_LEN;
    return Math.abs(Math.sin(k * Math.PI * 2)) * (1 - k);
  }

  // Ángulo de la caña (grados sobre la horizontal, apuntando hacia adelante/izquierda)
  function rodAngle(t) {
    if (t < 450) return lerp(REST, 115, easeInOut(t / 450));             // lleva la caña atrás
    if (t < 720) return lerp(115, 26, easeOut((t - 450) / 270));       // latigazo
    if (t < 1200) return lerp(26, REST, easeInOut((t - 720) / 480));
    if (t < REEL_AT) return REST - bite(t) * 10;
    if (t < REEL_AT + REEL) return REST + 16 * Math.sin(Math.PI * (t - REEL_AT) / REEL);
    return REST;
  }

  // ── Ondas y gotas ────────────────────────────────
  const ripples = [], drops = [];
  const ripple = (x, y, now, size = 1, delay = 0, str = size) =>
    ripples.push({ x, y, born: now + delay, life: 2200 * size, max: 46 * size, str });
  function splash(x, y, now) {
    for (let i = 0; i < 14; i++) {
      const a = -Math.PI / 2 + (Math.random() - .5) * 1.6, v = 1.2 + Math.random() * 2.4;
      drops.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1 });
    }
    [0, 260, 560].forEach((d, i) => ripple(x, y, now, 1 - i * .2, d));
  }

  function drawWater(now) {
    const top = waterTop();
    const g = ctx.createLinearGradient(0, top - 30, 0, H);
    g.addColorStop(0, blue(0)); g.addColorStop(.12, blue(.045)); g.addColorStop(1, blue(.015));
    ctx.fillStyle = g; ctx.fillRect(0, top - 30, W, H - top + 30);

    const N = 15;
    for (let i = 0; i < N; i++) {
      const d = i / (N - 1);                          // 0 = horizonte, 1 = frente
      const y = top + (H - top) * d ** 1.6;
      const amp = .5 + d * 3, freq = .011 - d * .005, speed = .00035 + d * .00025;
      ctx.strokeStyle = blue(.04 + d * .11);
      ctx.lineWidth = .6 + d * .6;
      ctx.beginPath();
      for (let x = 0; x <= W + 16; x += 16) {
        const yy = y + Math.sin(x * freq + now * speed + i * 1.7) * amp
                     + Math.sin(x * freq * .37 - now * speed * .6 + i) * amp * .6;
        x === 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }
  }

  function drawEffects(now) {
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i], p = (now - r.born) / r.life;
      if (p < 0) continue;
      if (p >= 1) { ripples.splice(i, 1); continue; }
      const rr = r.max * easeOut(p);
      ctx.strokeStyle = blue((1 - p) * .4 * r.str);
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(r.x, r.y, rr, rr * .26, 0, 0, Math.PI * 2); ctx.stroke();
    }
    for (let i = drops.length - 1; i >= 0; i--) {
      const d = drops[i];
      d.x += d.vx; d.y += d.vy; d.vy += .14; d.life -= .03;
      if (d.life <= 0) { drops.splice(i, 1); continue; }
      ctx.fillStyle = blue(d.life * .7);
      ctx.beginPath(); ctx.arc(d.x, d.y, 1.4 * d.life + .4, 0, Math.PI * 2); ctx.fill();
    }
  }

  // ── Pescador ─────────────────────────────────────
  // Coordenadas locales: origen en la línea de flotación del bote, proa a la izquierda.
  const HIP = { x: 28, y: -20 };
  const rotAround = (p, c, a) => {
    const dx = p.x - c.x, dy = p.y - c.y, cs = Math.cos(a), sn = Math.sin(a);
    return { x: c.x + dx * cs - dy * sn, y: c.y + dx * sn + dy * cs };
  };
  // Codo por cinemática inversa de dos huesos, doblado hacia abajo
  function elbow(sh, hand, len) {
    const dx = hand.x - sh.x, dy = hand.y - sh.y, d = Math.hypot(dx, dy) || 1;
    const h = Math.sqrt(Math.max(0, (len / 2) ** 2 - (d / 2) ** 2));
    let px = -dy / d, py = dx / d;
    if (py < 0) { px = -px; py = -py; }
    return { x: (sh.x + hand.x) / 2 + px * h, y: (sh.y + hand.y) / 2 + py * h };
  }
  function limb(pts, w, fill = FILL) {
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const [lw, col] of [[w + 2.2, RIM], [w, fill]]) {
      ctx.lineWidth = lw; ctx.strokeStyle = col;
      ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.stroke();
    }
  }
  function shape(build, fill = FILL, rim = RIM) {
    ctx.beginPath(); build(); ctx.fillStyle = fill; ctx.fill();
    ctx.lineWidth = 1.1; ctx.strokeStyle = rim; ctx.stroke();
  }

  function rodGeometry(t) {
    const a = rad(rodAngle(t)), dir = { x: -Math.cos(a), y: -Math.sin(a) };
    const butt = { x: 6, y: -32 };
    const L = 175;
    let nx = -dir.y, ny = dir.x; if (ny < 0) { nx = -nx; ny = -ny; }   // normal hacia abajo
    const bend = 4 + bite(t) * 16;
    const tip = { x: butt.x + dir.x * L + nx * bend * .6, y: butt.y + dir.y * L + ny * bend * .6 };
    return { a, dir, butt, tip, nx, ny, bend, L };
  }

  function drawFisherman(now, t, rod) {
    const lean = (rodAngle(t) - REST) / 75 * .12;        // se inclina hacia atrás al cargar
    const P = p => rotAround(p, HIP, lean);
    const { dir, butt, tip, nx, ny, bend, L } = rod;
    const at = k => ({ x: butt.x + dir.x * L * k, y: butt.y + dir.y * L * k });

    // Brazo trasero (gira la manivela del reel)
    const reel = { x: at(.1).x + nx * 6, y: at(.1).y + ny * 6 };
    const crank = t > REEL_AT && t < REEL_AT + REEL ? now * .02 : 0;
    const backHand = { x: reel.x + Math.cos(crank) * 3, y: reel.y + Math.sin(crank) * 3 };
    const shB = P({ x: 14, y: -62 });
    limb([shB, elbow(shB, backHand, 36), backHand], 6.5, FILL_DARK);

    // Piernas (rodillas sobre la borda)
    limb([{ x: 22, y: -24 }, { x: -6, y: -36 }, { x: -16, y: -16 }], 10);

    // Torso con campera
    ctx.save(); ctx.translate(HIP.x, HIP.y); ctx.rotate(lean); ctx.translate(-HIP.x, -HIP.y);
    shape(() => {
      ctx.moveTo(12, -14); ctx.lineTo(40, -14);
      ctx.bezierCurveTo(42, -34, 38, -54, 30, -66);
      ctx.bezierCurveTo(24, -72, 13, -72, 7, -65);
      ctx.bezierCurveTo(3, -50, 6, -30, 12, -14);
      ctx.closePath();
    });
    // costura y bolsillo
    ctx.strokeStyle = RIM_SOFT; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(10, -60); ctx.quadraticCurveTo(8, -40, 14, -20); ctx.stroke();
    ctx.beginPath(); ctx.rect(14, -44, 10, 8); ctx.stroke();
    // cuello de la campera
    shape(() => { ctx.moveTo(8, -66); ctx.lineTo(14, -74); ctx.lineTo(26, -74); ctx.lineTo(30, -68); ctx.closePath(); });
    // cuello
    shape(() => ctx.rect(13, -78, 9, 7));
    // cabeza de perfil: nuca, frente, nariz, barba
    shape(() => {
      ctx.moveTo(26, -80);
      ctx.bezierCurveTo(28, -92, 20, -97, 13, -96);
      ctx.bezierCurveTo(7, -95, 5, -91, 5, -88);
      ctx.lineTo(-1, -84);                            // nariz
      ctx.lineTo(4, -81);
      ctx.bezierCurveTo(4, -78, 5, -74, 10, -72);     // barba
      ctx.bezierCurveTo(16, -71, 22, -73, 26, -80);
      ctx.closePath();
    });
    // oreja
    ctx.strokeStyle = RIM_SOFT; ctx.beginPath(); ctx.arc(18, -85, 2.2, 0, Math.PI * 2); ctx.stroke();
    // sombrero piluso: copa, cinta y ala caída
    shape(() => {
      ctx.moveTo(4, -92); ctx.bezierCurveTo(5, -106, 27, -106, 29, -92); ctx.closePath();
    });
    ctx.strokeStyle = blue(.35); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(5, -94.5); ctx.lineTo(28.5, -94.5); ctx.stroke();
    shape(() => {
      ctx.moveTo(-5, -89);
      ctx.quadraticCurveTo(16, -96, 37, -89);
      ctx.quadraticCurveTo(16, -91, -5, -89);
      ctx.closePath();
    });
    ctx.restore();

    // Caña: mango de corcho, reel, pasahilos y puntera
    const p0 = at(.16), mid = at(.55), cp = { x: mid.x + nx * bend, y: mid.y + ny * bend };
    const onRod = u => ({
      x: (1 - u) ** 2 * p0.x + 2 * (1 - u) * u * cp.x + u * u * tip.x,
      y: (1 - u) ** 2 * p0.y + 2 * (1 - u) * u * cp.y + u * u * tip.y,
    });
    ctx.lineCap = 'round';
    ctx.strokeStyle = blue(.55); ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.quadraticCurveTo(cp.x, cp.y, tip.x, tip.y); ctx.stroke();
    ctx.strokeStyle = blue(.75); ctx.lineWidth = 1.2;                 // puntera más fina y clara
    ctx.beginPath();
    for (let u = .55; u <= 1.001; u += .05) { const q = onRod(u); u === .55 ? ctx.moveTo(q.x, q.y) : ctx.lineTo(q.x, q.y); }
    ctx.stroke();
    limb([butt, p0], 4.2);                             // mango
    ctx.fillStyle = blue(.6);
    for (const u of [.25, .5, .72, .9]) {              // pasahilos
      const q = onRod(u);
      ctx.beginPath(); ctx.arc(q.x, q.y, 1.3, 0, Math.PI * 2); ctx.fill();
    }
    shape(() => ctx.arc(reel.x, reel.y, 4.5, 0, Math.PI * 2), FILL_DARK);
    ctx.strokeStyle = RIM_SOFT; ctx.beginPath(); ctx.arc(reel.x, reel.y, 2, 0, Math.PI * 2); ctx.stroke();

    // Brazo delantero sujetando el mango
    const frontHand = at(.13);
    const shF = P({ x: 24, y: -63 });
    limb([shF, elbow(shF, frontHand, 38), frontHand], 7.5);
    shape(() => ctx.arc(frontHand.x, frontHand.y, 3.6, 0, Math.PI * 2));
  }

  function drawBoat(now) {
    // casco
    shape(() => {
      ctx.moveTo(-92, -27);
      ctx.bezierCurveTo(-80, -6, -56, 6, -24, 7);
      ctx.lineTo(40, 7);
      ctx.bezierCurveTo(62, 6, 74, -6, 78, -20);
      ctx.quadraticCurveTo(-6, -13, -92, -27);
      ctx.closePath();
    });
    // tablas
    ctx.strokeStyle = RIM_SOFT; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-84, -17); ctx.quadraticCurveTo(-10, -3, 75, -9); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-68, -5); ctx.quadraticCurveTo(-10, 4, 64, 0); ctx.stroke();
    // borda resaltada
    ctx.strokeStyle = blue(.7); ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(78, -20); ctx.quadraticCurveTo(-6, -13, -92, -27); ctx.stroke();
    // remo apoyado en la chumacera
    ctx.strokeStyle = RIM; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-34, -24); ctx.lineTo(-58, 4); ctx.stroke();
    shape(() => ctx.ellipse(-61, 8, 3, 7, rad(40), 0, Math.PI * 2));
    shape(() => ctx.rect(-36, -27, 4, 5));

    // farol en la popa
    ctx.strokeStyle = RIM; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(72, -19); ctx.lineTo(72, -60); ctx.lineTo(64, -60); ctx.stroke();
    const flick = .85 + Math.sin(now * .013) * .05 + Math.sin(now * .031) * .04;
    const lg = ctx.createRadialGradient(64, -50, 0, 64, -50, 46);
    lg.addColorStop(0, warm(.28 * flick)); lg.addColorStop(1, warm(0));
    ctx.fillStyle = lg; ctx.fillRect(18, -96, 92, 92);
    shape(() => ctx.rect(60, -56, 8, 11), warm(.75 * flick), warm(.9));
    ctx.fillStyle = FILL; ctx.fillRect(59, -58, 10, 2.5);
  }

  function drawReflection(bx, by, now) {
    for (let i = 0; i < 6; i++) {
      const y = by + (9 + i * 5) * S, w = (150 - i * 18) * S, off = Math.sin(now * .003 + i) * 3 * S;
      ctx.strokeStyle = blue(.14 * (1 - i / 6)); ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(bx - w / 2 + off - 10 * S, y); ctx.lineTo(bx + w / 2 + off - 10 * S, y); ctx.stroke();
      if (i < 4) {                                     // reflejo del farol
        ctx.strokeStyle = warm(.22 * (1 - i / 4));
        ctx.beginPath(); ctx.moveTo(bx + (56 + off) * S, y + 4 * S); ctx.lineTo(bx + (72 + off) * S, y + 4 * S); ctx.stroke();
      }
    }
  }

  function drawLine(tip, bob, cp, alpha) {
    ctx.shadowColor = blue(.6); ctx.shadowBlur = 6;
    ctx.strokeStyle = blue(.5 * alpha); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(tip.x, tip.y); ctx.quadraticCurveTo(cp.x, cp.y, bob.x, bob.y); ctx.stroke();
    ctx.shadowBlur = 0;
  }

  function drawBobber(p, alpha, onWater) {
    if (onWater) {
      ctx.fillStyle = warm(.12 * alpha);
      ctx.beginPath(); ctx.ellipse(p.x, p.y + 7, 4, 1.6, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.shadowColor = warm(.8); ctx.shadowBlur = 12;
    ctx.fillStyle = warm(.9 * alpha);
    ctx.beginPath(); ctx.arc(p.x, p.y, 4.2, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = `rgba(255,255,255,${.55 * alpha})`;
    ctx.beginPath(); ctx.arc(p.x - 1.2, p.y - 1.4, 1.3, 0, Math.PI * 2); ctx.fill();
  }

  // ── Escena ───────────────────────────────────────
  let cycleStart = 0, events = {}, lastRipple = 0, lastBoatRipple = 0;

  function scene(now, t) {
    ctx.clearRect(0, 0, W, H);
    drawWater(now);
    if (W < 768) return;                               // en mobile el texto ocupa el hero: solo agua

    const bx = boatX(), by = depthY(.18) + Math.sin(now * .0016) * 1.5;
    const rock = Math.sin(now * .0011) * .022;
    const toWorld = p => {
      const cs = Math.cos(rock), sn = Math.sin(rock);
      return { x: bx + S * (p.x * cs - p.y * sn), y: by + S * (p.x * sn + p.y * cs) };
    };

    // contraluz detrás del bote
    const bg = ctx.createRadialGradient(bx, by - 60 * S, 0, bx, by - 60 * S, 280 * S);
    bg.addColorStop(0, blue(.07)); bg.addColorStop(1, blue(0));
    ctx.fillStyle = bg; ctx.fillRect(bx - 280 * S, by - 340 * S, 560 * S, 560 * S);
    drawReflection(bx, by, now);

    const rod = rodGeometry(t), tip = toWorld(rod.tip), land = landPoint();
    const hang = { x: tip.x + Math.sin(now * .003) * 2 * S, y: tip.y + 16 * S };
    let bob, cp, onWater = false;

    if (t < RELEASE || t >= REEL_AT + REEL) {          // corcho colgando de la puntera
      bob = hang; cp = { x: (tip.x + bob.x) / 2, y: (tip.y + bob.y) / 2 };
    } else if (t < CAST) {                             // vuelo
      const u = easeOut((t - RELEASE) / (CAST - RELEASE));
      bob = { x: lerp(tip.x, land.x, u), y: lerp(tip.y, land.y, u) - Math.sin(Math.PI * u) * H * .14 };
      cp = { x: lerp(tip.x, bob.x, .5), y: lerp(tip.y, bob.y, .5) - 30 * (1 - u) };
    } else if (t < REEL_AT) {                          // flotando
      const b = bite(t);
      bob = { x: land.x, y: land.y + Math.sin(now * .002) * 1.2 + b * 7 };
      cp = { x: lerp(tip.x, bob.x, .5), y: Math.max(tip.y, bob.y) + 10 * S * (1 - b) };
      onWater = true;
    } else {                                           // recogiendo
      const v = easeInOut((t - REEL_AT) / REEL);
      bob = { x: lerp(land.x, hang.x, v), y: lerp(land.y, hang.y, v) - Math.sin(Math.PI * v) * H * .04 };
      cp = { x: lerp(tip.x, bob.x, .5), y: lerp(tip.y, bob.y, .5) + 8 * (1 - v) };
      onWater = v < .05;
    }

    if (!reduceMotion) {
      if (t >= CAST && !events.land) { events.land = 1; splash(land.x, land.y, now); lastRipple = now; }
      if (t >= BITE && !events.bite) { events.bite = 1; ripple(land.x, land.y, now, 1.2); ripple(land.x, land.y, now, 1, BITE_LEN / 2); }
      if (t >= REEL_AT && !events.reel) { events.reel = 1; ripple(land.x, land.y, now, .8); }
      if (onWater && t < REEL_AT && now - lastRipple > 2600) { ripple(land.x, land.y, now, .55); lastRipple = now; }
      if (now - lastBoatRipple > 3400) { ripple(bx - 6 * S, by + 4 * S, now, 2.4, 0, .35); lastBoatRipple = now; }
      drawEffects(now);
    }

    ctx.save();
    ctx.translate(bx, by); ctx.rotate(rock); ctx.scale(S, S);
    drawFisherman(now, t, rod);
    drawBoat(now);
    ctx.restore();

    drawLine(tip, bob, cp, 1);
    drawBobber(bob, 1, onWater);
  }

  let raf = 0, running = false;
  function frame(now) {
    if (!cycleStart || now - cycleStart >= CYCLE) {
      cycleStart = now; events = {};
      jitter = (Math.random() - .5) * 120;
    }
    scene(now, now - cycleStart);
    raf = requestAnimationFrame(frame);
  }
  const start = () => { if (!running) { running = true; raf = requestAnimationFrame(frame); } };
  const stop = () => { running = false; cancelAnimationFrame(raf); };
  const still = () => scene(0, CAST + 1500);          // cuadro fijo: corcho flotando

  resize();
  window.addEventListener('resize', () => { resize(); if (reduceMotion) still(); });
  if (reduceMotion) { still(); return; }
  new IntersectionObserver(([e]) => e.isIntersecting ? start() : stop()).observe(hero);
})();

// 6. Proyectos + caso de estudio (la captura se expande hasta ser el hero del panel)
(function () {
  const list = document.getElementById('projectsList');
  const cs = document.getElementById('caseStudy');
  if (!list || !cs || typeof PROJECTS === 'undefined') return;
  const body = document.getElementById('csBody');
  const closeBtn = document.getElementById('csClose');
  const barTitle = document.getElementById('csBarTitle');
  const progress = document.getElementById('csProgress');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EASE = 'cubic-bezier(.75,0,.15,1)';
  const FLIP_MS = 850;

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const pad = n => String(n).padStart(2, '0');
  const status = p => `<span class="project-status${p.status === 'En desarrollo' ? ' is-wip' : ''}">${esc(p.status)}</span>`;
  const tags = (p, n = p.tags.length) => p.tags.slice(0, n).map(t => `<span class="tag">${esc(t)}</span>`).join('');
  const links = p => [
    p.url ? `<a href="${p.url}" target="_blank" rel="noopener" class="plink">↗ Ver sitio</a>` : '',
    p.repo
      ? `<a href="${p.repo}" target="_blank" rel="noopener" class="plink">⌥ Ver código</a>`
      : '<span class="plink is-muted">🔒 Código privado (cliente)</span>',
  ].join('');

  // ── Filas de la sección Proyectos ──
  list.innerHTML = PROJECTS.map((p, i) => `
    <article class="prow fade" style="--pc:${p.color}">
      <button class="prow-media" type="button" data-open="${p.id}" aria-label="Ver caso completo: ${esc(p.name)}">
        <div class="browser-bar">
          <div class="b-dots"><span></span><span></span><span></span></div>
          <div class="b-url">${esc(p.urlLabel || p.name)}</div>
        </div>
        <img class="prow-shot" src="${p.cover}" alt="${esc(p.name)}" loading="lazy" />
        <span class="prow-open">Ver caso completo →</span>
      </button>
      <div class="prow-info">
        <div class="prow-num">${pad(i + 1)}</div>
        <div class="prow-kicker">${esc(p.kicker)} ${status(p)}</div>
        <h3 class="prow-title">${esc(p.name)}</h3>
        <p class="prow-summary">${esc(p.summary)}</p>
        <ul class="prow-highlights">${p.highlights.map(h => `<li>${esc(h)}</li>`).join('')}</ul>
        <div class="project-tags">${tags(p, 6)}</div>
        <div class="prow-actions">
          <button class="btn-case" type="button" data-open="${p.id}">Ver caso completo</button>
          ${links(p)}
        </div>
      </div>
    </article>`).join('');
  list.querySelectorAll('.fade').forEach(el => observer.observe(el));

  // ── Contenido del panel ──
  function render(p) {
    const i = PROJECTS.indexOf(p);
    const prev = PROJECTS[(i - 1 + PROJECTS.length) % PROJECTS.length];
    const next = PROJECTS[(i + 1) % PROJECTS.length];
    const step = s => `<div class="cs-step">${pad(p.sections.indexOf(s) + 1)}</div>`;
    let sideCount = 0;                                   // las capturas verticales van al costado del texto, alternando
    const feature = s => `
      <div class="cs-feature cs-reveal${s.layout === 'side' ? ` is-side${sideCount++ % 2 ? ' is-flip' : ''}` : ''}">
        <div class="cs-feature-text"><div>${step(s)}<h4>${esc(s.title)}</h4></div><p>${esc(s.text)}</p></div>
        <button class="cs-feature-media" type="button" data-zoom="${s.img}" aria-label="Ampliar captura: ${esc(s.title)}">
          <img src="${s.img}" alt="${esc(s.title)}" />
        </button>
      </div>`;
    const card = s => `<div class="cs-card cs-reveal">${step(s)}<h4>${esc(s.title)}</h4><p>${esc(s.text)}</p></div>`;
    // Respeta el orden: cada sección con captura va a todo el ancho y las de texto seguidas se agrupan en tarjetas
    const groups = [];
    for (const sec of p.sections) {
      if (sec.img) groups.push({ img: sec });
      else if (groups.at(-1)?.cards) groups.at(-1).cards.push(sec);
      else groups.push({ cards: [sec] });
    }

    cs.style.setProperty('--pc', p.color);
    barTitle.textContent = p.name;
    body.innerHTML = `
      <div class="cs-hero"><img id="csHeroImg" src="${p.cover}" alt="${esc(p.name)}" /></div>
      <header class="cs-head cs-reveal">
        <div>
          <div class="cs-kicker">${esc(p.kicker)}</div>
          <h2 class="cs-title" id="csTitle">${esc(p.name)}</h2>
          <p class="cs-summary">${esc(p.summary)}</p>
          <div class="project-tags">${tags(p)}</div>
          <div class="cs-links">${links(p)}</div>
        </div>
        <dl class="cs-meta">${p.meta.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
      </header>
      <div class="cs-ps">
        <div class="cs-ps-card cs-reveal"><h3>El problema</h3><p>${esc(p.problem)}</p></div>
        <div class="cs-ps-card cs-reveal"><h3>La solución</h3><p>${esc(p.solution)}</p></div>
      </div>
      <h3 class="cs-h cs-reveal">Recorrido por el sistema</h3>
      ${groups.map(g => g.img ? feature(g.img) : `<div class="cs-cards">${g.cards.map(card).join('')}</div>`).join('')}
      <div class="cs-next" role="navigation" aria-label="Otros proyectos">
        <button type="button" data-open="${prev.id}"><small>← Anterior</small><span>${esc(prev.name)}</span></button>
        <button type="button" data-open="${next.id}"><small>Siguiente →</small><span>${esc(next.name)}</span></button>
      </div>`;
  }

  let revealObs = null;
  function reveal() {
    revealObs?.disconnect();
    revealObs = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); revealObs.unobserve(e.target); }
    }), { root: cs, threshold: .12 });
    body.querySelectorAll('.cs-reveal').forEach((el, k) => {
      el.style.transitionDelay = k < 4 ? `${k * 90}ms` : '';
      revealObs.observe(el);
    });
  }

  // Imagen "fantasma" que viaja entre la tarjeta y el hero del panel
  function flip(from, to, color, ms) {
    const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
    const ghost = new Image();
    ghost.src = from.currentSrc || from.src;
    ghost.className = 'cs-ghost';
    ghost.alt = '';
    document.body.appendChild(ghost);
    from.style.visibility = to.style.visibility = 'hidden';
    const box = r => ({ left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
    const anim = ghost.animate([
      { ...box(a), borderRadius: '12px', boxShadow: `0 0 0 0 ${color}00` },
      { offset: .6, boxShadow: `0 50px 140px -30px ${color}88` },
      { ...box(b), borderRadius: '16px', boxShadow: `0 40px 120px -50px ${color}88` },
    ], { duration: ms, easing: EASE, fill: 'forwards' });
    return anim.finished.then(() => {
      from.style.visibility = to.style.visibility = '';
      ghost.remove();
    });
  }

  let current = null, busy = false;
  const cardImg = id => list.querySelector(`.prow-media[data-open="${id}"] .prow-shot`);

  function open(id, { fromCard = false, history: mode = 'push' } = {}) {
    const p = PROJECTS.find(x => x.id === id);
    if (!p || busy || current === p) return;
    const switching = current !== null;
    history.scrollRestoration = 'manual';               // va antes del pushState: aplica a la entrada a la que se vuelve
    if (mode !== 'none') {
      try { history[mode === 'push' ? 'pushState' : 'replaceState']({ cs: id }, '', '#proyecto/' + id); } catch { /* sin historial: el panel funciona igual */ }
    }
    current = p;

    render(p);
    cs.hidden = false;
    cs.scrollTop = 0;
    document.body.classList.add('cs-open');
    closeBtn.focus({ preventScroll: true });

    const src = fromCard && cardImg(id);
    if (reduceMotion) { reveal(); return; }
    if (switching || !src) {
      body.animate([{ opacity: 0, transform: 'translateY(40px)' }, { opacity: 1, transform: 'none' }], { duration: 600, easing: EASE });
      if (!switching) cs.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400 });
      reveal();
      return;
    }
    busy = true;
    cs.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FLIP_MS * .55, easing: 'ease-out' });
    setTimeout(reveal, FLIP_MS * .6);
    flip(src, document.getElementById('csHeroImg'), p.color, FLIP_MS).then(() => { busy = false; });
  }

  function close() {
    if (!current || busy) return;
    const p = current;
    const hero = document.getElementById('csHeroImg');
    const target = cardImg(p.id);
    const finish = () => {
      cs.hidden = true;
      body.innerHTML = '';
      document.body.classList.remove('cs-open');
      current = null; busy = false;
      target?.closest('.prow-media').focus({ preventScroll: true });
      setTimeout(() => { history.scrollRestoration = 'auto'; });
    };
    target?.scrollIntoView({ block: 'center', behavior: 'instant' });
    if (reduceMotion) return finish();
    busy = true;
    const fade = cs.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 450, delay: 120, easing: 'ease-in', fill: 'forwards' });
    if (target && hero.getBoundingClientRect().bottom > 120) {
      flip(hero, target, p.color, FLIP_MS * .8).then(() => { fade.cancel(); finish(); });
    } else {
      fade.finished.then(() => { fade.cancel(); finish(); });
    }
  }

  // Captura ampliada
  const zoom = document.createElement('div');
  zoom.className = 'cs-zoom';
  zoom.hidden = true;
  zoom.innerHTML = '<img alt="" />';
  document.body.appendChild(zoom);
  const zoomImg = zoom.querySelector('img');
  let zoomFrom = null;
  function openZoom(btn) {
    zoomFrom = btn;
    zoomImg.src = btn.dataset.zoom;
    zoomImg.alt = btn.querySelector('img').alt;
    zoom.hidden = false;
    if (!reduceMotion) zoomImg.animate([{ opacity: 0, transform: 'scale(.94)' }, { opacity: 1, transform: 'none' }], { duration: 350, easing: EASE });
  }
  function closeZoom() {
    zoom.hidden = true;
    zoomFrom?.focus({ preventScroll: true });
  }
  zoom.addEventListener('click', closeZoom);

  // ── Eventos ──
  body.addEventListener('click', e => {
    const z = e.target.closest('[data-zoom]');
    if (z) openZoom(z);
  });
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-open]');
    if (!t) return;
    e.preventDefault();
    open(t.dataset.open, { fromCard: !current, history: current ? 'replace' : 'push' });
  });
  closeBtn.addEventListener('click', () => history.state?.cs ? history.back() : close());
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (!zoom.hidden) closeZoom();
    else if (current) closeBtn.click();
  });
  window.addEventListener('popstate', e => {
    if (e.state?.cs) open(e.state.cs, { history: 'none' });
    else close();
  });
  cs.addEventListener('scroll', () => {
    const max = cs.scrollHeight - cs.clientHeight;
    progress.style.transform = `scaleX(${max > 0 ? cs.scrollTop / max : 0})`;
    barTitle.classList.toggle('show', cs.scrollTop > 420);
  }, { passive: true });

  // Link directo a un caso (#proyecto/punto-campo): "Volver" lleva a la sección Proyectos
  const deep = location.hash.match(/^#proyecto\/([\w-]+)$/);
  if (deep && PROJECTS.some(p => p.id === deep[1])) {
    history.replaceState(null, '', '#proyectos');
    document.getElementById('proyectos').scrollIntoView({ behavior: 'instant' });
    open(deep[1], { history: 'push' });
  }
})();
