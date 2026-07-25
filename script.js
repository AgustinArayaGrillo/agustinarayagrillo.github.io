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
