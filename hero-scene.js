/* ═══════════════════════════════════════════════════
   IMMO SCHWEIZ GRUPPE — GPU Organic Shape
   All displacement on GPU via custom shaders
   Swiss Red × Gold palette — scroll-reactive
   ═══════════════════════════════════════════════════ */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

(function () {
  const canvas = document.getElementById('heroCanvas3D');
  if (!canvas) return;

  /* ─── VERTEX SHADER — GPU noise displacement ─── */
  const vertexShader = `
    uniform float uTime;
    uniform float uScroll;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying float vDisplacement;

    // Simplex-style noise on GPU
    vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
    vec4 mod289(vec4 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
    vec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v){
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      vec4 x = x_ * ns.x + ns.yyyy;
      vec4 y = y_ * ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
    }

    void main() {
      float freq = 1.2 + uScroll * 0.8;
      float amp = 0.18 + uScroll * 0.06;
      float t = uTime * 0.25;

      float n1 = snoise(normal * freq + t);
      float n2 = snoise(normal * freq * 2.0 + t * 1.3) * 0.5;
      float displacement = (n1 + n2) * amp;

      vec3 newPosition = position + normal * displacement;
      vDisplacement = displacement;
      vNormal = normalMatrix * normal;
      vPosition = (modelViewMatrix * vec4(newPosition, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `;

  /* ─── FRAGMENT SHADER — Swiss luxury surface ─── */
  const fragmentShader = `
    uniform float uTime;
    uniform float uScroll;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying float vDisplacement;

    void main() {
      vec3 lightDir = normalize(vec3(0.5, 0.8, 1.0));
      vec3 viewDir = normalize(-vPosition);
      vec3 halfDir = normalize(lightDir + viewDir);
      vec3 norm = normalize(vNormal);

      float diff = max(dot(norm, lightDir), 0.0);
      float spec = pow(max(dot(norm, halfDir), 0.0), 64.0);

      // Brand colors
      vec3 warmCream = vec3(0.96, 0.94, 0.90);
      vec3 gold = vec3(0.77, 0.64, 0.29);
      vec3 swissRed = vec3(0.83, 0.14, 0.17);

      // Base color shifts with displacement
      vec3 baseColor = mix(warmCream, gold, smoothstep(-0.1, 0.15, vDisplacement));
      baseColor = mix(baseColor, swissRed, smoothstep(0.1, 0.25, vDisplacement) * 0.15);

      // Scroll shifts toward gold
      baseColor = mix(baseColor, gold, uScroll * 0.2);

      // Rim light (Swiss red edge glow)
      float rim = 1.0 - max(dot(viewDir, norm), 0.0);
      rim = pow(rim, 3.0);
      vec3 rimColor = swissRed * rim * 0.35;

      // Final composition
      vec3 color = baseColor * (0.35 + diff * 0.65);
      color += spec * gold * 0.4;
      color += rimColor;

      // Subtle fresnel glow
      color += warmCream * rim * 0.08;

      gl_FragColor = vec4(color, 0.88);
    }
  `;

  /* ─── RENDERER ─── */
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  /* ─── SCENE & CAMERA ─── */
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 4.5);

  /* ─── SHAPE (GPU-displaced, 12 subdivisions = ~2.5K verts — fast) ─── */
  const geo = new THREE.IcosahedronGeometry(1.3, 12);
  const uniforms = {
    uTime: { value: 0 },
    uScroll: { value: 0 }
  };

  const mat = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: true,
    side: THREE.DoubleSide
  });

  const blob = new THREE.Mesh(geo, mat);
  scene.add(blob);

  /* ─── SCROLL ─── */
  let scrollTarget = 0;
  let scrollSmooth = 0;
  function onScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollTarget = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ─── ANIMATE ─── */
  let raf = null;
  let running = false;
  const clock = new THREE.Clock();

  function animate() {
    if (!running) return;
    raf = requestAnimationFrame(animate);

    const t = clock.getElapsedTime();
    scrollSmooth += (scrollTarget - scrollSmooth) * 0.04;

    uniforms.uTime.value = t;
    uniforms.uScroll.value = scrollSmooth;

    // Gentle idle rotation + scroll influence
    blob.rotation.x = t * 0.06 + scrollSmooth * 0.4;
    blob.rotation.y = t * 0.09 + scrollSmooth * 0.6;

    // Float hover
    blob.position.y = Math.sin(t * 0.5) * 0.12;
    blob.position.x = Math.sin(t * 0.35) * 0.06;

    // Scale up slightly on scroll
    const s = 1.0 + scrollSmooth * 0.12;
    blob.scale.set(s, s, s);

    renderer.render(scene, camera);
  }

  function start() {
    if (running) return;
    running = true;
    clock.start();
    animate();
  }

  function stop() {
    running = false;
    if (raf) { cancelAnimationFrame(raf); raf = null; }
  }

  /* ─── RESIZE ─── */
  function onResize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', onResize, { passive: true });

  /* ─── VISIBILITY (pause off-screen → save GPU) ─── */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => e.isIntersecting ? start() : stop());
  }, { threshold: 0.05 });
  io.observe(canvas);

  // Initial kick
  onResize();
  start();
})();
