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

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

// ── EPIC EFFECTS ──────────────────────────────────────────────────

// 1. Cursor spotlight (global --mx / --my)
document.addEventListener('mousemove', e => {
  document.documentElement.style.setProperty('--mx', e.clientX + 'px');
  document.documentElement.style.setProperty('--my', e.clientY + 'px');
});

// 2. 3D card tilt + per-card glow
if (window.matchMedia('(pointer:fine)').matches) {
  document.querySelectorAll('.project-card').forEach(card => {
    let raf;
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'border-color .3s, transform .08s';
    });
    card.addEventListener('mousemove', e => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width  - 0.5;
        const y = (e.clientY - r.top)  / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${x*10}deg) rotateX(${-y*7}deg) translateY(-6px)`;
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top)  + 'px');
      });
    });
    card.addEventListener('mouseleave', () => {
      cancelAnimationFrame(raf);
      card.style.transition = 'border-color .3s, transform .6s cubic-bezier(.22,.61,.36,1)';
      card.style.transform = '';
    });
  });
}

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

// 5. Fisherman casting animation
(function() {
  const canvas = document.getElementById('fishermanCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const CYCLE = 6200; // ms per cast
  let lineSmooth = 0, startTime = null;

  function lerp(a, b, t) { return a + (b - a) * Math.min(1, Math.max(0, t)); }

  // Cast angle in degrees. Negative = rod goes LEFT (forward), Positive = RIGHT (backswing)
  function castAngle(t) {
    if (t < 0.10) return lerp(0,   55, t / 0.10);
    if (t < 0.32) return lerp(55, -38, (t - 0.10) / 0.22);
    if (t < 0.52) return lerp(-38,-30, (t - 0.32) / 0.20);
    if (t < 0.72) return lerp(-30,  -4, (t - 0.52) / 0.20);
    if (t < 1.00) return lerp(-4,    0, (t - 0.72) / 0.28);
    return 0;
  }

  // Line extension 0=coiled, 1=full cast
  function lineExt(t) {
    if (t < 0.10) return 0;
    if (t < 0.38) return lerp(0, 1, (t - 0.10) / 0.28);
    if (t < 0.60) return 1;
    if (t < 0.80) return lerp(1, 0.15, (t - 0.60) / 0.20);
    if (t < 1.00) return lerp(0.15, 0, (t - 0.80) / 0.20);
    return 0;
  }

  function rotPt(px, py, rad) {
    return {
      x: px * Math.cos(rad) - py * Math.sin(rad),
      y: px * Math.sin(rad) + py * Math.cos(rad)
    };
  }

  function draw(now) {
    if (!startTime) startTime = now;
    const t   = ((now - startTime) % CYCLE) / CYCLE;
    const W   = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const s   = Math.min(H / 820, W / 1100) * 0.92; // responsive scale
    const fx  = W * 0.80;   // fisherman centre X
    const fy  = H * 0.93;   // feet Y

    const deg = castAngle(t);
    const rad = deg * Math.PI / 180;
    const ext = lineExt(t);

    // smooth line angle for natural lag
    lineSmooth += (rad - lineSmooth) * 0.09;

    const c = (a) => `rgba(96,165,250,${a})`;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // ── STATIC BODY ────────────────────────────────────────
    ctx.fillStyle = c(0.13);

    // Head
    ctx.beginPath();
    ctx.arc(fx, fy - 600*s, 44*s, 0, Math.PI*2);
    ctx.fill();

    // Hat brim (tilted slightly left — facing left)
    ctx.beginPath();
    ctx.ellipse(fx - 10*s, fy - 630*s, 62*s, 9*s, -0.08, 0, Math.PI*2);
    ctx.fill();

    // Hat crown
    ctx.beginPath();
    ctx.moveTo(fx - 55*s, fy - 627*s);
    ctx.quadraticCurveTo(fx - 8*s, fy - 685*s, fx + 50*s, fy - 627*s);
    ctx.closePath();
    ctx.fill();

    // Torso
    ctx.beginPath();
    ctx.moveTo(fx - 55*s, fy - 548*s);
    ctx.lineTo(fx + 52*s, fy - 548*s);
    ctx.lineTo(fx + 36*s, fy - 344*s);
    ctx.lineTo(fx - 38*s, fy - 344*s);
    ctx.closePath();
    ctx.fill();

    // Legs
    ctx.beginPath();
    ctx.moveTo(fx - 38*s, fy - 344*s);
    ctx.lineTo(fx - 50*s, fy);
    ctx.lineTo(fx - 26*s, fy);
    ctx.lineTo(fx - 10*s, fy - 175*s);
    ctx.lineTo(fx + 22*s, fy);
    ctx.lineTo(fx + 48*s, fy);
    ctx.lineTo(fx + 36*s, fy - 344*s);
    ctx.closePath();
    ctx.fill();

    // Non-casting arm (left arm, down holding reel)
    ctx.lineWidth = 20*s;
    ctx.strokeStyle = c(0.13);
    ctx.beginPath();
    ctx.moveTo(fx - 52*s, fy - 512*s);
    ctx.quadraticCurveTo(fx - 88*s, fy - 415*s, fx - 105*s, fy - 355*s);
    ctx.stroke();

    // Reel
    ctx.lineWidth = 2.2*s;
    ctx.strokeStyle = c(0.2);
    ctx.beginPath();
    ctx.arc(fx - 108*s, fy - 348*s, 17*s, 0, Math.PI*2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(fx - 108*s, fy - 348*s, 8*s, 0, Math.PI*2);
    ctx.stroke();

    // ── CASTING ARM + ROD (rotated) ─────────────────────
    const sx = fx + 50*s;   // shoulder X
    const sy = fy - 530*s;  // shoulder Y

    function wp(lx, ly) {   // local → world
      const r = rotPt(lx * s, ly * s, rad);
      return { x: sx + r.x, y: sy + r.y };
    }

    const elbow = wp(52, -88);
    const hand  = wp(92, -155);
    const rodM  = wp(200, -295);
    const rodT  = wp(298, -435);   // rod tip

    // Upper arm
    ctx.lineWidth = 22*s; ctx.strokeStyle = c(0.13);
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(elbow.x, elbow.y); ctx.stroke();

    // Forearm
    ctx.lineWidth = 17*s;
    ctx.beginPath(); ctx.moveTo(elbow.x, elbow.y); ctx.lineTo(hand.x, hand.y); ctx.stroke();

    // Hand grip
    ctx.fillStyle = c(0.15);
    ctx.beginPath(); ctx.arc(hand.x, hand.y, 13*s, 0, Math.PI*2); ctx.fill();

    // Rod body
    ctx.lineWidth = 5*s; ctx.strokeStyle = c(0.36);
    ctx.beginPath(); ctx.moveTo(hand.x, hand.y); ctx.lineTo(rodM.x, rodM.y); ctx.stroke();

    // Rod tip
    ctx.lineWidth = 2.5*s; ctx.strokeStyle = c(0.42);
    ctx.beginPath(); ctx.moveTo(rodM.x, rodM.y); ctx.lineTo(rodT.x, rodT.y); ctx.stroke();

    // Tip glow dot
    ctx.fillStyle = c(0.7);
    ctx.beginPath(); ctx.arc(rodT.x, rodT.y, 5*s, 0, Math.PI*2); ctx.fill();

    // ── FISHING LINE ───────────────────────────────────
    const nearEnd = { x: fx - 55*s,  y: fy - 12*s };
    const farEnd  = { x: fx - 520*s, y: fy - 80*s };
    const lineEnd = { x: lerp(nearEnd.x, farEnd.x, ext), y: lerp(nearEnd.y, farEnd.y, ext) };

    // Control point arcs UP during cast
    const arcH = lerp(40, 220, ext) * s;
    const cpX  = (rodT.x + lineEnd.x) / 2;
    const cpY  = Math.min(rodT.y, lineEnd.y) - arcH;

    ctx.lineWidth = 1.6*s;
    ctx.strokeStyle = c(0.58);
    ctx.beginPath();
    ctx.moveTo(rodT.x, rodT.y);
    ctx.quadraticCurveTo(cpX, cpY, lineEnd.x, lineEnd.y);
    ctx.stroke();

    // Bobber (orange dot)
    if (ext > 0.08) {
      ctx.fillStyle = `rgba(251,146,60,${ext * 0.75})`;
      ctx.beginPath(); ctx.arc(lineEnd.x, lineEnd.y, 6*s, 0, Math.PI*2); ctx.fill();

      // Water ripples
      for (let r = 0; r < 2; r++) {
        const rp  = ((t * 2.2 + r * 0.44) % 1);
        const rs  = rp * 38*s;
        ctx.strokeStyle = `rgba(96,165,250,${(1-rp) * 0.13 * ext})`;
        ctx.lineWidth   = 1*s;
        ctx.beginPath();
        ctx.ellipse(lineEnd.x, lineEnd.y, rs, rs * 0.28, 0, 0, Math.PI*2);
        ctx.stroke();
      }
    }

    // ── SUBTLE WATER SURFACE ───────────────────────────
    ctx.strokeStyle = c(0.07);
    ctx.lineWidth   = 1.5*s;
    ctx.beginPath();
    ctx.moveTo(0, fy + 4*s);
    for (let x = 0; x <= W; x += 30) {
      ctx.lineTo(x, fy + 4*s + Math.sin(x * 0.018 + now * 0.0008) * 3*s);
    }
    ctx.stroke();

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
})();
