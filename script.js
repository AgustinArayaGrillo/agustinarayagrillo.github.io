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
