/* ============================================
   IMMO SCHWEIZ GRUPPE — v5.0 JS
   WebGL Alpine Lake gradient, scroll reveals,
   counters, FAQ, nav, floating pill nav
   ============================================ */

(function() {
  'use strict';

  // ─── LOADING SCREEN ───
  const loader = document.getElementById('siteLoader');
  if (loader) {
    window.addEventListener('load', () => {
      setTimeout(() => loader.classList.add('loaded'), 1400);
      setTimeout(() => loader.remove(), 2200);
    });
  }

  // ─── SCROLL REVEAL ───
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('[data-reveal], [data-reveal-stagger]').forEach(el => revealObs.observe(el));

  // ─── NAV SCROLL → SIDE NAV ───
  const nav = document.getElementById('mainNav');
  if (nav) {
    const hero = document.querySelector('.hero');
    const heroHeight = hero ? hero.offsetHeight : 600;
    let navState = 'top'; // 'top' | 'hiding' | 'side'

    window.addEventListener('scroll', () => {
      const y = window.scrollY;

      if (y <= heroHeight * 0.7) {
        // In hero zone — show normal top nav
        if (navState !== 'top') {
          nav.classList.remove('nav-side', 'nav-hiding', 'scrolled');
          document.body.classList.remove('has-side-nav');
          navState = 'top';
        }
        nav.classList.toggle('scrolled', y > 60);
      } else if (y > heroHeight * 0.7 && y <= heroHeight * 1.1) {
        // Transition zone — hide nav
        if (navState !== 'hiding') {
          nav.classList.add('nav-hiding');
          nav.classList.remove('nav-side', 'scrolled');
          document.body.classList.remove('has-side-nav');
          navState = 'hiding';
        }
      } else {
        // Past hero — show side nav
        if (navState !== 'side') {
          nav.classList.remove('nav-hiding', 'scrolled');
          nav.classList.add('nav-side');
          document.body.classList.add('has-side-nav');
          navState = 'side';
        }
      }
    }, { passive: true });
  }

  // ─── MOBILE MENU ───
  const toggle = document.getElementById('menuToggle');
  const links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      links.classList.toggle('open');
      document.body.style.overflow = links.classList.contains('open') ? 'hidden' : '';
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      toggle.classList.remove('active');
      links.classList.remove('open');
      document.body.style.overflow = '';
    }));
  }

  // ─── COUNTER ANIMATION ───
  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCounter(e.target);
        counterObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(el => counterObs.observe(el));

  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const dur = 2000;
    const start = performance.now();
    (function step(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
    })(start);
  }

  // ─── FAQ ───
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

  // ─── SMOOTH ANCHORS ───
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });

  // ─── CONTACT FORM ───
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const orig = btn.textContent;
      btn.textContent = 'Gesendet ✓';
      btn.disabled = true;
      btn.style.opacity = '0.6';
      setTimeout(() => { btn.textContent = orig; btn.disabled = false; btn.style.opacity = ''; form.reset(); }, 3000);
    });
  }

  // ═══════════════════════════════════════════
  // WEBGL ALPINE LAKE GRADIENT — Beliefs Section
  // Interactive, mouse-responsive gradient
  // ═══════════════════════════════════════════
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  if (!gl) return;

  const beliefsSection = canvas.closest('.beliefs-section');
  let W, H, t = 0;
  let isVisible = false;

  function resize() {
    W = canvas.width = canvas.clientWidth * Math.min(devicePixelRatio, 1.5);
    H = canvas.height = canvas.clientHeight * Math.min(devicePixelRatio, 1.5);
    gl.viewport(0, 0, W, H);
  }
  window.addEventListener('resize', resize);

  // Visibility observer — only render when in view
  const visObs = new IntersectionObserver(entries => {
    isVisible = entries[0].isIntersecting;
  }, { threshold: 0 });
  visObs.observe(canvas);

  const vert = `
  attribute vec2 a_pos;
  void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
  `;

  const frag = `
  precision highp float;
  uniform float u_time;
  uniform vec2 u_res;
  uniform vec2 u_mouse;

  #define PI 3.14159265

  float hash(vec2 p) {
    p = fract(p * vec2(234.5, 178.3));
    p += dot(p, p + 67.21);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
    return mix(
      mix(hash(i), hash(i + vec2(1,0)), u.x),
      mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x),
      u.y
    );
  }

  float fbm(vec2 p, int oct) {
    float v = 0.0, a = 0.55;
    for(int i = 0; i < 8; i++) {
      if(i >= oct) break;
      v += a * noise(p);
      p = p * 1.95 + vec2(0.9, 1.4);
      a *= 0.48;
    }
    return v;
  }

  vec3 alpineLake(float t) {
    vec3 deep    = vec3(0.04, 0.08, 0.18);
    vec3 navy    = vec3(0.08, 0.16, 0.30);
    vec3 blue    = vec3(0.14, 0.30, 0.52);
    vec3 lake    = vec3(0.22, 0.50, 0.72);
    vec3 sky     = vec3(0.42, 0.70, 0.85);
    vec3 ice     = vec3(0.72, 0.88, 0.95);

    if(t < 0.2) return mix(deep, navy, t * 5.0);
    else if(t < 0.4) return mix(navy, blue, (t - 0.2) * 5.0);
    else if(t < 0.6) return mix(blue, lake, (t - 0.4) * 5.0);
    else if(t < 0.8) return mix(lake, sky, (t - 0.6) * 5.0);
    else return mix(sky, ice, (t - 0.8) * 5.0);
  }

  vec3 modeDrift(vec2 uv, float t, vec2 mouse) {
    vec2 p = uv - 0.5;
    p += (mouse - 0.5) * 0.25;

    vec2 q = vec2(
      fbm(uv * 2.2 + vec2(t * 0.04, t * 0.05), 5),
      fbm(uv * 2.2 + vec2(2.3, 7.1) + vec2(t * 0.045, -t * 0.035), 5)
    );
    vec2 r = vec2(
      fbm(uv * 1.8 + 3.0 * q + vec2(2.1, 8.7) + t * 0.025, 5),
      fbm(uv * 1.8 + 3.0 * q + vec2(7.4, 3.1) + t * 0.03, 5)
    );

    float f = fbm(uv * 1.8 + 3.0 * r, 5);
    f = smoothstep(0.05, 0.95, f);

    return alpineLake(clamp(f, 0.0, 1.0));
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_res;
    uv.y = 1.0 - uv.y;

    vec3 col = modeDrift(uv, u_time, u_mouse);

    // Vignette
    vec2 vp = uv - 0.5;
    float vign = 1.0 - dot(vp, vp) * 1.2;
    col *= clamp(vign, 0.0, 1.0);

    // grain
    float grain = hash(uv + vec2(u_time * 0.013)) * 0.02 - 0.01;
    col += grain;

    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
  }
  `;

  function compileShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(s));
    }
    return s;
  }

  const prog = gl.createProgram();
  gl.attachShader(prog, compileShader(gl.VERTEX_SHADER, vert));
  gl.attachShader(prog, compileShader(gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uTime  = gl.getUniformLocation(prog, 'u_time');
  const uRes   = gl.getUniformLocation(prog, 'u_res');
  const uMouse = gl.getUniformLocation(prog, 'u_mouse');

  function frame(ts) {
    requestAnimationFrame(frame);
    if (!isVisible) return;
    
    t = ts * 0.001;
    // Auto-drifting mouse position (no interaction needed)
    const autoX = 0.5 + Math.sin(t * 0.3) * 0.25;
    const autoY = 0.5 + Math.cos(t * 0.2) * 0.25;

    gl.uniform1f(uTime, t);
    gl.uniform2f(uRes, W, H);
    gl.uniform2f(uMouse, autoX, autoY);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  resize();
  requestAnimationFrame(frame);

  // ─── MATTERHORN TRAIL ANIMATION ───
  const trail = document.getElementById('matterhornTrail');
  if (trail) {
    const trailObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          trail.classList.add('trail-active');
          // Stagger step reveals
          trail.querySelectorAll('[data-trail-step]').forEach((step, i) => {
            setTimeout(() => step.classList.add('trail-visible'), 400 + i * 500);
          });
          trailObs.unobserve(trail);
        }
      });
    }, { threshold: 0.3 });
    trailObs.observe(trail);
  }

  // ─── CTA SECTION — Mini WebGL gradient ───
  document.querySelectorAll('.cta-section').forEach(section => {
    const canvas = document.createElement('canvas');
    canvas.className = 'cta-canvas';
    section.insertBefore(canvas, section.firstChild);
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, 'attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}');
    gl.compileShader(vs);

    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, `precision mediump float;
uniform float t;uniform vec2 r;
void main(){
  vec2 u=gl_FragCoord.xy/r;
  float d=length(u-0.5);
  float wave=sin(u.x*3.+t*0.4)*0.5+sin(u.y*4.+t*0.3)*0.5;
  vec3 navy=vec3(0.04,0.08,0.13);
  vec3 blue=vec3(0.08,0.18,0.35);
  vec3 gold=vec3(0.76,0.63,0.29);
  vec3 c=mix(navy,blue,wave*0.5+0.5);
  c+=gold*smoothstep(0.6,0.0,d)*0.08;
  gl_FragColor=vec4(c,1.0);
}`);
    gl.compileShader(fs);

    const pg = gl.createProgram();
    gl.attachShader(pg, vs); gl.attachShader(pg, fs); gl.linkProgram(pg); gl.useProgram(pg);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
    const pa = gl.getAttribLocation(pg, 'p');
    gl.enableVertexAttribArray(pa);
    gl.vertexAttribPointer(pa, 2, gl.FLOAT, false, 0, 0);

    const tU = gl.getUniformLocation(pg, 't');
    const rU = gl.getUniformLocation(pg, 'r');

    function resize() {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    resize();
    window.addEventListener('resize', resize);

    function draw(time) {
      gl.uniform1f(tU, time * 0.001);
      gl.uniform2f(rU, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  });

})();

