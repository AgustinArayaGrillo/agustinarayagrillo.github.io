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

// 5. Fisherman casting animation — EPIC VERSION
(function() {
  const canvas = document.getElementById('fishermanCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; }
  resize(); window.addEventListener('resize', resize);

  const CYCLE = 6200;
  let startTime = null, lineSmooth = 0, prevExt = 0, prevDeg = 0;

  // ── Particles ──────────────────────────────────────────
  let particles = [];
  const STARS = Array.from({length:70}, () => ({
    rx: Math.random(), ry: Math.random() * 0.88,
    sz: 0.4 + Math.random() * 1.8, br: 0.08 + Math.random() * 0.28,
    ts: 0.6 + Math.random() * 2.2, tp: Math.random() * Math.PI * 2
  }));
  const ORBS = Array.from({length:18}, () => ({
    rx: Math.random(), ry: 0.08 + Math.random() * 0.72,
    vx: (Math.random()-0.5)*0.00012, vy: (Math.random()-0.5)*0.00006,
    sz: 1 + Math.random()*2.5, ph: Math.random()*Math.PI*2, sp: 0.4+Math.random()
  }));
  const FISH = Array.from({length:4}, () => ({
    rx: Math.random(), ry: 0.935 + Math.random()*0.05,
    spd: (0.015+Math.random()*0.025)*(Math.random()>.5?1:-1),
    sz: 0.9+Math.random()*0.7
  }));
  const TIP_TRAIL = [];
  const TRAIL_LEN = 32;

  function spawnSplash(x, y, s) {
    for (let i=0;i<22;i++) {
      const a = (Math.random()-0.5)*Math.PI*0.9 - Math.PI/2;
      const spd = (1.5 + Math.random()*4)*s;
      particles.push({ x, y, vx: Math.cos(a)*spd, vy: Math.sin(a)*spd,
        life:1, dec:0.018+Math.random()*0.022, sz:(0.8+Math.random()*2.5)*s });
    }
  }

  function lerp(a,b,t){ return a+(b-a)*Math.min(1,Math.max(0,t)); }

  function castAngle(t) {
    if(t<0.10) return lerp(0,   58, t/0.10);
    if(t<0.32) return lerp(58, -40, (t-0.10)/0.22);
    if(t<0.52) return lerp(-40,-32, (t-0.32)/0.20);
    if(t<0.72) return lerp(-32,  -5, (t-0.52)/0.20);
    return     lerp(-5,   0, (t-0.72)/0.28);
  }
  function lineExt(t) {
    if(t<0.10) return 0;
    if(t<0.38) return lerp(0,1,(t-0.10)/0.28);
    if(t<0.60) return 1;
    if(t<0.80) return lerp(1,0.12,(t-0.60)/0.20);
    return lerp(0.12,0,(t-0.80)/0.20);
  }
  function rotPt(px,py,rad){
    return { x:px*Math.cos(rad)-py*Math.sin(rad), y:px*Math.sin(rad)+py*Math.cos(rad) };
  }

  function draw(now) {
    if(!startTime) startTime = now;
    const t  = ((now-startTime)%CYCLE)/CYCLE;
    const W  = canvas.width, H = canvas.height;
    ctx.clearRect(0,0,W,H);
    ctx.lineCap='round'; ctx.lineJoin='round';

    const s  = Math.min(H/820, W/1100)*1.15;
    const fx = W*0.80, fy = H*0.93;
    const deg= castAngle(t), rad=deg*Math.PI/180;
    const ext= lineExt(t);
    lineSmooth += (rad-lineSmooth)*0.09;

    const c = (a)=>`rgba(96,165,250,${a})`;

    // ── TWINKLING STARS ──────────────────────────────
    for(const st of STARS){
      const tw = 0.5+0.5*Math.sin(now*0.001*st.ts+st.tp);
      ctx.fillStyle=`rgba(210,230,255,${st.br*tw})`;
      ctx.beginPath(); ctx.arc(st.rx*W, st.ry*H, st.sz*s, 0, Math.PI*2); ctx.fill();
    }

    // ── FLOATING ORBS (bioluminescence) ──────────────
    for(const o of ORBS){
      o.rx+=o.vx; o.ry+=o.vy;
      if(o.rx<0)o.rx=1; if(o.rx>1)o.rx=0;
      if(o.ry<0.05)o.vy=Math.abs(o.vy); if(o.ry>0.88)o.vy=-Math.abs(o.vy);
      const pulse=0.5+0.5*Math.sin(now*0.001*o.sp+o.ph);
      const alpha=(0.08+0.18*pulse);
      ctx.shadowColor=c(0.5); ctx.shadowBlur=8*s;
      ctx.fillStyle=c(alpha);
      ctx.beginPath(); ctx.arc(o.rx*W, o.ry*H, o.sz*s, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur=0;
    }

    // ── ATMOSPHERE GLOW ───────────────────────────────
    const ag=ctx.createRadialGradient(fx,fy-280*s,0,fx,fy-280*s,380*s);
    ag.addColorStop(0,'rgba(96,165,250,0.055)'); ag.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=ag; ctx.fillRect(fx-400*s,fy-680*s,800*s,800*s);

    // ── WATER GLOW + WAVES ────────────────────────────
    const wg=ctx.createLinearGradient(0,fy-8*s,0,H);
    wg.addColorStop(0,'rgba(96,165,250,0.08)'); wg.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=wg; ctx.fillRect(0,fy-8*s,W,H);

    for(let layer=0;layer<3;layer++){
      const amp=(3-layer)*2.5*s, yOff=layer*4*s;
      ctx.strokeStyle=c(0.05+layer*0.04); ctx.lineWidth=(2-layer*0.5)*s;
      ctx.beginPath(); ctx.moveTo(0,fy+yOff);
      for(let x=0;x<=W;x+=25)
        ctx.lineTo(x,fy+yOff+Math.sin(x*0.014+now*0.0007*(1+layer*0.4)+layer)*amp);
      ctx.stroke();
    }

    // ── FISH SILHOUETTES ──────────────────────────────
    for(const f of FISH){
      f.rx+=f.spd*0.003; if(f.rx>1.12)f.rx=-0.12; if(f.rx<-0.12)f.rx=1.12;
      const fishX=f.rx*W, fishY=f.ry*H, sz=f.sz*22*s;
      const tail=Math.sin(now*0.003+f.rx*10)*0.25;
      ctx.save(); ctx.translate(fishX,fishY);
      if(f.spd<0) ctx.scale(-1,1);
      ctx.fillStyle='rgba(96,165,250,0.065)';
      ctx.beginPath(); ctx.ellipse(0,0,sz,sz*0.38,0,0,Math.PI*2); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-sz*0.85,0); ctx.lineTo(-sz*1.4,-sz*0.32+tail*sz);
      ctx.lineTo(-sz*1.4,sz*0.32+tail*sz); ctx.closePath(); ctx.fill();
      ctx.restore();
    }

    // ── STATIC BODY ───────────────────────────────────
    ctx.fillStyle = c(0.17);

    // BOOTS — chunky wading boots
    // Front boot (left / water-facing side)
    ctx.beginPath();
    ctx.moveTo(fx - 62*s, fy);
    ctx.bezierCurveTo(fx - 66*s, fy - 12*s, fx - 58*s, fy - 36*s, fx - 50*s, fy - 44*s);
    ctx.lineTo(fx - 14*s, fy - 44*s);
    ctx.bezierCurveTo(fx - 8*s,  fy - 36*s, fx - 6*s,  fy - 14*s, fx - 8*s,  fy);
    ctx.closePath(); ctx.fill();
    // Back boot (right side)
    ctx.beginPath();
    ctx.moveTo(fx + 10*s, fy);
    ctx.bezierCurveTo(fx + 8*s,  fy - 14*s, fx + 10*s, fy - 36*s, fx + 18*s, fy - 44*s);
    ctx.lineTo(fx + 54*s, fy - 44*s);
    ctx.bezierCurveTo(fx + 60*s, fy - 36*s, fx + 64*s, fy - 12*s, fx + 60*s, fy);
    ctx.closePath(); ctx.fill();

    // LEGS — bezier curves with visible knee bend
    // Front left leg
    ctx.beginPath();
    ctx.moveTo(fx - 50*s, fy - 44*s);
    ctx.lineTo(fx - 14*s, fy - 44*s);
    ctx.bezierCurveTo(fx - 7*s,  fy - 130*s, fx - 4*s,  fy - 188*s, fx - 16*s, fy - 218*s);
    ctx.bezierCurveTo(fx - 26*s, fy - 268*s, fx - 34*s, fy - 324*s, fx - 38*s, fy - 356*s);
    ctx.lineTo(fx - 54*s, fy - 356*s);
    ctx.bezierCurveTo(fx - 52*s, fy - 314*s, fx - 54*s, fy - 265*s, fx - 48*s, fy - 218*s);
    ctx.bezierCurveTo(fx - 58*s, fy - 188*s, fx - 58*s, fy - 126*s, fx - 50*s, fy - 44*s);
    ctx.closePath(); ctx.fill();
    // Back right leg
    ctx.beginPath();
    ctx.moveTo(fx + 18*s, fy - 44*s);
    ctx.lineTo(fx + 54*s, fy - 44*s);
    ctx.bezierCurveTo(fx + 60*s, fy - 126*s, fx + 60*s, fy - 188*s, fx + 50*s, fy - 218*s);
    ctx.bezierCurveTo(fx + 44*s, fy - 265*s, fx + 40*s, fy - 314*s, fx + 40*s, fy - 356*s);
    ctx.lineTo(fx + 26*s, fy - 356*s);
    ctx.bezierCurveTo(fx + 20*s, fy - 314*s, fx + 16*s, fy - 265*s, fx + 18*s, fy - 218*s);
    ctx.bezierCurveTo(fx + 8*s,  fy - 188*s, fx + 8*s,  fy - 130*s, fx + 18*s, fy - 44*s);
    ctx.closePath(); ctx.fill();

    // TORSO — natural curved silhouette, slight forward lean
    ctx.beginPath();
    ctx.moveTo(fx - 60*s, fy - 560*s);   // front shoulder
    ctx.bezierCurveTo(fx - 68*s, fy - 475*s, fx - 66*s, fy - 408*s, fx - 54*s, fy - 356*s);
    ctx.lineTo(fx + 40*s, fy - 356*s);
    ctx.bezierCurveTo(fx + 56*s, fy - 408*s, fx + 60*s, fy - 472*s, fx + 57*s, fy - 548*s);
    ctx.bezierCurveTo(fx + 36*s, fy - 566*s, fx +  4*s, fy - 570*s, fx - 32*s, fy - 566*s);
    ctx.closePath(); ctx.fill();

    // NECK
    ctx.beginPath();
    ctx.moveTo(fx - 13*s, fy - 562*s);
    ctx.bezierCurveTo(fx - 12*s, fy - 590*s, fx - 8*s, fy - 598*s, fx - 5*s, fy - 600*s);
    ctx.lineTo(fx + 12*s, fy - 600*s);
    ctx.bezierCurveTo(fx + 13*s, fy - 590*s, fx + 14*s, fy - 575*s, fx + 15*s, fy - 562*s);
    ctx.closePath(); ctx.fill();

    // HEAD — slightly oval, left-facing profile
    ctx.beginPath();
    ctx.ellipse(fx - 2*s, fy - 640*s, 38*s, 42*s, -0.06, 0, Math.PI*2);
    ctx.fill();
    // Nose (small bump on the left/front side)
    ctx.beginPath();
    ctx.moveTo(fx - 36*s, fy - 638*s);
    ctx.bezierCurveTo(fx - 54*s, fy - 634*s, fx - 54*s, fy - 622*s, fx - 36*s, fy - 618*s);
    ctx.closePath(); ctx.fill();
    // Chin/jaw (lower-front of head — makes it read as a profile)
    ctx.beginPath();
    ctx.moveTo(fx - 28*s, fy - 602*s);
    ctx.bezierCurveTo(fx - 44*s, fy - 602*s, fx - 44*s, fy - 616*s, fx - 28*s, fy - 620*s);
    ctx.closePath(); ctx.fill();

    // HAT — wide-brim fishing hat (Tilley-style)
    // Crown / dome
    ctx.beginPath();
    ctx.moveTo(fx - 50*s, fy - 674*s);
    ctx.bezierCurveTo(fx - 44*s, fy - 742*s, fx + 44*s, fy - 742*s, fx + 50*s, fy - 674*s);
    ctx.closePath(); ctx.fill();
    // Brim — wide and slightly drooping at the tips
    ctx.beginPath();
    ctx.moveTo(fx - 92*s, fy - 656*s);   // far-left tip (droops slightly)
    ctx.bezierCurveTo(fx - 70*s, fy - 672*s, fx - 26*s, fy - 678*s, fx,        fy - 678*s);
    ctx.bezierCurveTo(fx + 26*s, fy - 678*s, fx + 66*s, fy - 673*s, fx + 88*s, fy - 659*s);
    ctx.lineTo(fx + 84*s, fy - 648*s);
    ctx.bezierCurveTo(fx + 63*s, fy - 661*s, fx + 24*s, fy - 666*s, fx,        fy - 666*s);
    ctx.bezierCurveTo(fx - 24*s, fy - 666*s, fx - 67*s, fy - 661*s, fx - 88*s, fy - 645*s);
    ctx.closePath(); ctx.fill();

    // NON-CASTING ARM (front / left arm, holds reel down)
    ctx.lineWidth = 20*s; ctx.strokeStyle = c(0.16);
    ctx.beginPath();
    ctx.moveTo(fx - 58*s, fy - 528*s);
    ctx.quadraticCurveTo(fx - 94*s, fy - 428*s, fx - 112*s, fy - 358*s);
    ctx.stroke();
    // REEL
    ctx.lineWidth = 2.5*s; ctx.strokeStyle = c(0.25);
    ctx.beginPath(); ctx.arc(fx - 115*s, fy - 350*s, 18*s, 0, Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.arc(fx - 115*s, fy - 350*s,  9*s, 0, Math.PI*2); ctx.stroke();

    // ── CASTING ARM + ROD ─────────────────────────────
    const sx=fx+50*s, sy=fy-530*s;
    function wp(lx,ly){ const r=rotPt(lx*s,ly*s,rad); return {x:sx+r.x,y:sy+r.y}; }

    const elbow=wp(53,-89), hand=wp(93,-157), rodM=wp(202,-298), rodT=wp(300,-438);

    ctx.lineWidth=22*s; ctx.strokeStyle=c(0.16);
    ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(elbow.x,elbow.y); ctx.stroke();
    ctx.lineWidth=17*s;
    ctx.beginPath(); ctx.moveTo(elbow.x,elbow.y); ctx.lineTo(hand.x,hand.y); ctx.stroke();
    ctx.fillStyle=c(0.18);
    ctx.beginPath(); ctx.arc(hand.x,hand.y,14*s,0,Math.PI*2); ctx.fill();

    // ── ROD WITH GLOW ─────────────────────────────────
    const castSpeed=Math.abs(deg-prevDeg);
    const snap=Math.min(1,castSpeed*0.06);
    ctx.shadowColor=`rgba(96,165,250,${0.3+snap*0.7})`; ctx.shadowBlur=(6+snap*18)*s;
    ctx.lineWidth=5*s; ctx.strokeStyle=`rgba(${lerp(96,255,snap*0.5).toFixed(0)},165,250,${0.4+snap*0.4})`;
    ctx.beginPath(); ctx.moveTo(hand.x,hand.y); ctx.lineTo(rodM.x,rodM.y); ctx.stroke();
    ctx.lineWidth=2.8*s;
    ctx.beginPath(); ctx.moveTo(rodM.x,rodM.y); ctx.lineTo(rodT.x,rodT.y); ctx.stroke();
    ctx.shadowBlur=0;

    // ── ROD TIP TRAIL ─────────────────────────────────
    TIP_TRAIL.push({x:rodT.x,y:rodT.y});
    if(TIP_TRAIL.length>TRAIL_LEN) TIP_TRAIL.shift();
    for(let i=1;i<TIP_TRAIL.length;i++){
      const p=i/TIP_TRAIL.length;
      ctx.shadowColor=c(p*0.8); ctx.shadowBlur=8*s*p;
      ctx.strokeStyle=c(p*0.55);
      ctx.lineWidth=p*5*s;
      ctx.beginPath(); ctx.moveTo(TIP_TRAIL[i-1].x,TIP_TRAIL[i-1].y);
      ctx.lineTo(TIP_TRAIL[i].x,TIP_TRAIL[i].y); ctx.stroke();
    }
    ctx.shadowBlur=0;

    // Tip glow dot
    ctx.shadowColor=c(1); ctx.shadowBlur=20*s;
    ctx.fillStyle=`rgba(180,220,255,${0.7+snap*0.3})`;
    ctx.beginPath(); ctx.arc(rodT.x,rodT.y,(5+snap*4)*s,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur=0;

    // ── FISHING LINE WITH GLOW ────────────────────────
    const nearEnd={x:fx-55*s,y:fy-12*s}, farEnd={x:fx-530*s,y:fy-90*s};
    const lineEnd={x:lerp(nearEnd.x,farEnd.x,ext),y:lerp(nearEnd.y,farEnd.y,ext)};
    const arcH=lerp(40,230,ext)*s;
    const cpX=(rodT.x+lineEnd.x)/2, cpY=Math.min(rodT.y,lineEnd.y)-arcH;

    // Detect lure splash
    if(prevExt<0.9 && ext>=0.9) spawnSplash(lineEnd.x,lineEnd.y,s);

    ctx.shadowColor=c(0.9); ctx.shadowBlur=10*s;
    ctx.lineWidth=2*s; ctx.strokeStyle=c(0.7);
    ctx.beginPath(); ctx.moveTo(rodT.x,rodT.y);
    ctx.quadraticCurveTo(cpX,cpY,lineEnd.x,lineEnd.y); ctx.stroke();
    ctx.shadowBlur=0;

    // Bobber
    if(ext>0.06){
      ctx.shadowColor='rgba(251,146,60,0.9)'; ctx.shadowBlur=14*s;
      ctx.fillStyle=`rgba(251,146,60,${ext*0.85})`;
      ctx.beginPath(); ctx.arc(lineEnd.x,lineEnd.y,7*s,0,Math.PI*2); ctx.fill();
      ctx.shadowBlur=0;
      for(let r=0;r<3;r++){
        const rp=((t*2.5+r*0.33)%1), rs=rp*50*s;
        ctx.strokeStyle=c((1-rp)*0.18*ext); ctx.lineWidth=1.2*s;
        ctx.beginPath(); ctx.ellipse(lineEnd.x,lineEnd.y,rs,rs*0.3,0,0,Math.PI*2); ctx.stroke();
      }
    }

    // ── SPLASH PARTICLES ──────────────────────────────
    particles=particles.filter(p=>p.life>0);
    for(const p of particles){
      p.x+=p.vx; p.y+=p.vy; p.vy+=0.18*s; p.life-=p.dec;
      ctx.shadowColor=c(p.life*0.8); ctx.shadowBlur=6*s;
      ctx.fillStyle=c(p.life*0.75);
      ctx.beginPath(); ctx.arc(p.x,p.y,p.sz*p.life,0,Math.PI*2); ctx.fill();
    }
    ctx.shadowBlur=0;

    prevExt=ext; prevDeg=deg;
    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
})();
