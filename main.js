/* ═══════════════════════════════════════════════════
   IMMO SCHWEIZ GRUPPE — V2 Interactions
   ═══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ─── HAMBURGER MENU ─── */
  const hamburger = document.getElementById('hamburger');
  const menuOverlay = document.getElementById('menuOverlay');
  const menuBackdrop = document.getElementById('menuBackdrop');
  const navLinks = document.querySelectorAll('[data-nav]');

  function toggleMenu() {
    const isOpen = menuOverlay.classList.contains('open');
    hamburger.classList.toggle('active');
    menuOverlay.classList.toggle('open');
    menuBackdrop.classList.toggle('visible');
    document.body.style.overflow = isOpen ? '' : 'hidden';
  }

  hamburger.addEventListener('click', toggleMenu);
  menuBackdrop.addEventListener('click', toggleMenu);

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (menuOverlay.classList.contains('open')) toggleMenu();
    });
  });

  /* ─── HEADER SCROLL STATE ─── */
  const header = document.getElementById('header');
  let lastScroll = 0;

  function handleScroll() {
    const scrollY = window.scrollY;
    if (scrollY > 80) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    lastScroll = scrollY;
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* ─── SCROLL REVEAL (Intersection Observer) ─── */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ─── ACCORDION ─── */
  const accordionHeaders = document.querySelectorAll('.accordion-header');

  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const body = item.querySelector('.accordion-body');
      const isOpen = item.classList.contains('open');

      // Close all others
      document.querySelectorAll('.accordion-item.open').forEach(openItem => {
        if (openItem !== item) {
          openItem.classList.remove('open');
          openItem.querySelector('.accordion-body').style.maxHeight = null;
          openItem.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle current
      if (isOpen) {
        item.classList.remove('open');
        body.style.maxHeight = null;
        header.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('open');
        body.style.maxHeight = body.scrollHeight + 'px';
        header.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ─── SMOOTH SCROLL ─── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offsetTop = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: offsetTop, behavior: 'smooth' });
      }
    });
  });

  /* ─── CONTACT FORM (demo) ─── */
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('.btn-primary');
      const originalText = btn.innerHTML;
      btn.innerHTML = '✓ Gesendet';
      btn.style.background = '#4a8a5a';
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
        form.reset();
      }, 2500);
    });
  }

  /* ─── PROJECT CARD PARALLAX (subtle) ─── */
  const cards = document.querySelectorAll('.project-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const img = card.querySelector('img');
      img.style.transform = `scale(1.03) translate(${x * 8}px, ${y * 8}px)`;
    });
    card.addEventListener('mouseleave', () => {
      const img = card.querySelector('img');
      img.style.transform = '';
    });
  });

  /* ─── LOADING SCREEN ─── */
  const loader = document.getElementById('siteLoader');
  if (loader) {
    setTimeout(() => loader.classList.add('loaded'), 1400);
    setTimeout(() => loader.remove(), 2200);
  }

  /* ─── MATTERHORN TRAIL ANIMATION ─── */
  const trail = document.getElementById('matterhornTrail');
  if (trail) {
    const trailObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          trail.classList.add('trail-active');
          trail.querySelectorAll('[data-trail-step]').forEach((step, i) => {
            setTimeout(() => step.classList.add('trail-visible'), 400 + i * 500);
          });
          trailObs.unobserve(trail);
        }
      });
    }, { threshold: 0.3 });
    trailObs.observe(trail);
  }

  /* ─── WEBGL ALPINE LAKE GRADIENT (Beliefs Section) ─── */
  const beliefsCanvas = document.getElementById('heroCanvas');
  if (beliefsCanvas) {
    const gl = beliefsCanvas.getContext('webgl2') || beliefsCanvas.getContext('webgl');
    if (gl) {
      let W, H, t = 0, isVis = false;

      function resizeGL() {
        W = beliefsCanvas.width = beliefsCanvas.clientWidth * Math.min(devicePixelRatio, 1.5);
        H = beliefsCanvas.height = beliefsCanvas.clientHeight * Math.min(devicePixelRatio, 1.5);
        gl.viewport(0, 0, W, H);
      }
      window.addEventListener('resize', resizeGL);

      const visObs = new IntersectionObserver(e => { isVis = e[0].isIntersecting; }, { threshold: 0 });
      visObs.observe(beliefsCanvas);

      const vert = `attribute vec2 a_pos; void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }`;
      const frag = `precision highp float;
uniform float u_time; uniform vec2 u_res;
#define PI 3.14159265
float hash(vec2 p) { p = fract(p * vec2(234.5, 178.3)); p += dot(p, p + 67.21); return fract(p.x * p.y); }
float noise(vec2 p) { vec2 i = floor(p); vec2 f = fract(p); vec2 u = f*f*f*(f*(f*6.0-15.0)+10.0); return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y); }
float fbm(vec2 p, int oct) { float v = 0.0, a = 0.55; for(int i = 0; i < 8; i++) { if(i >= oct) break; v += a * noise(p); p = p * 1.95 + vec2(0.9, 1.4); a *= 0.48; } return v; }
vec3 alpineLake(float t) { vec3 deep=vec3(0.04,0.08,0.18); vec3 navy=vec3(0.08,0.16,0.30); vec3 blue=vec3(0.14,0.30,0.52); vec3 lake=vec3(0.22,0.50,0.72); vec3 sky=vec3(0.42,0.70,0.85); vec3 ice=vec3(0.72,0.88,0.95);
if(t<0.2) return mix(deep,navy,t*5.0); else if(t<0.4) return mix(navy,blue,(t-0.2)*5.0); else if(t<0.6) return mix(blue,lake,(t-0.4)*5.0); else if(t<0.8) return mix(lake,sky,(t-0.6)*5.0); else return mix(sky,ice,(t-0.8)*5.0); }
void main() { vec2 uv = gl_FragCoord.xy / u_res; uv.y = 1.0 - uv.y;
vec2 q = vec2(fbm(uv*2.2+vec2(u_time*0.04,u_time*0.05),5),fbm(uv*2.2+vec2(2.3,7.1)+vec2(u_time*0.045,-u_time*0.035),5));
vec2 r = vec2(fbm(uv*1.8+3.0*q+vec2(2.1,8.7)+u_time*0.025,5),fbm(uv*1.8+3.0*q+vec2(7.4,3.1)+u_time*0.03,5));
float f = fbm(uv*1.8+3.0*r,5); f = smoothstep(0.05,0.95,f); vec3 col = alpineLake(clamp(f,0.0,1.0));
vec2 vp = uv - 0.5; float vign = 1.0 - dot(vp,vp)*1.2; col *= clamp(vign,0.0,1.0);
float grain = hash(uv+vec2(u_time*0.013))*0.02-0.01; col += grain;
gl_FragColor = vec4(clamp(col,0.0,1.0), 1.0); }`;

      function compileS(type, src) {
        const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s;
      }
      const prog = gl.createProgram();
      gl.attachShader(prog, compileS(gl.VERTEX_SHADER, vert));
      gl.attachShader(prog, compileS(gl.FRAGMENT_SHADER, frag));
      gl.linkProgram(prog); gl.useProgram(prog);

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, 'a_pos');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

      const uTime = gl.getUniformLocation(prog, 'u_time');
      const uRes = gl.getUniformLocation(prog, 'u_res');

      function frame(ts) {
        requestAnimationFrame(frame);
        if (!isVis) return;
        t = ts * 0.001;
        gl.uniform1f(uTime, t);
        gl.uniform2f(uRes, W, H);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      resizeGL();
      requestAnimationFrame(frame);
    }
  }

  /* ─── PROJECT CARD SCROLL STAGGER ─── */
  const scrollCards = document.querySelectorAll('.project-card-scroll');
  if (scrollCards.length) {
    const cardObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          cardObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    scrollCards.forEach(card => cardObserver.observe(card));
  }

  /* CTA background now uses static image via CSS — no WebGL needed */

  /* ─── EDELWEISS — Fixed + Scroll Reveal ─── */
  const edelweissSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
    <g opacity="1">
      <ellipse cx="50" cy="30" rx="6" ry="14" fill="currentColor" transform="rotate(0 50 50)"/>
      <ellipse cx="50" cy="30" rx="6" ry="14" fill="currentColor" transform="rotate(72 50 50)"/>
      <ellipse cx="50" cy="30" rx="6" ry="14" fill="currentColor" transform="rotate(144 50 50)"/>
      <ellipse cx="50" cy="30" rx="6" ry="14" fill="currentColor" transform="rotate(216 50 50)"/>
      <ellipse cx="50" cy="30" rx="6" ry="14" fill="currentColor" transform="rotate(288 50 50)"/>
      <circle cx="50" cy="50" r="6" fill="currentColor" opacity="0.6"/>
    </g>
  </svg>`;

  function initEdelweiss() {
    if (document.querySelector('.edelweiss-bg')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'edelweiss-bg';
    wrapper.setAttribute('aria-hidden', 'true');

    const flowers = [];
    const TOTAL = 50;

    for (let i = 0; i < TOTAL; i++) {
      const flower = document.createElement('div');
      flower.className = 'edelweiss-flower-bg';
      flower.innerHTML = edelweissSVG;

      const size = 16 + Math.random() * 50;
      const x = 2 + Math.random() * 96;
      const y = 2 + Math.random() * 96;
      const rot = Math.random() * 360;
      const maxOpacity = 0.03 + Math.random() * 0.04;
      const delay = Math.random() * 12;
      const duration = 16 + Math.random() * 16;

      flower.style.cssText = `
        width: ${size}px; height: ${size}px;
        left: ${x}%; top: ${y}%;
        transform: rotate(${rot}deg);
        animation-delay: ${delay}s;
        animation-duration: ${duration}s;
      `;
      flower.dataset.maxOpacity = maxOpacity;
      // First 8 show immediately
      flower.dataset.revealAt = i < 8 ? 0 : (i / TOTAL);

      wrapper.appendChild(flower);
      flowers.push(flower);
    }

    document.body.appendChild(wrapper);

    // Scroll handler — reveal flowers progressively
    let lastScroll = -1;
    function onScrollReveal() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;

      if (Math.abs(progress - lastScroll) < 0.005) return;
      lastScroll = progress;

      flowers.forEach(f => {
        const threshold = parseFloat(f.dataset.revealAt);
        if (progress >= threshold && !f.classList.contains('visible')) {
          f.classList.add('visible', 'drift');
          f.style.opacity = f.dataset.maxOpacity;
        }
      });
    }

    window.addEventListener('scroll', onScrollReveal, { passive: true });
    // Trigger initial reveal
    onScrollReveal();
  }

  initEdelweiss();

});
