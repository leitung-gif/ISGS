/* ═══════════════════════════════════════════════════
   IMMO SCHWEIZ GRUPPE — Scroll-Following Scene
   Based on Solstice seasonal flow concept
   Fixed canvas background, morphing shape, color shifts
   ═══════════════════════════════════════════════════ */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

(function () {
  const canvas = document.getElementById('heroCanvas3D');
  if (!canvas) return;

  /* ─── Make canvas fixed full-page background ─── */
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.zIndex = '0';
  canvas.style.pointerEvents = 'none';

  /* ─── RENDERER ─── */
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  const dpr = Math.min(window.devicePixelRatio, 1.5);
  renderer.setPixelRatio(dpr);
  renderer.setSize(window.innerWidth, window.innerHeight);

  /* ─── SCENE & CAMERA ─── */
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(2.5, 0, 4.5);

  /* ─── SECTION COLOR PALETTES (like Solstice seasons) ─── */
  const palettes = [
    { bg: [0.98, 0.97, 0.95], shape: [0.96, 0.94, 0.90], rim: [0.83, 0.14, 0.17], spec: [0.77, 0.64, 0.29] },  // Hero — cream/warm
    { bg: [1.00, 1.00, 1.00], shape: [0.90, 0.86, 0.80], rim: [0.77, 0.64, 0.29], spec: [0.83, 0.14, 0.17] },  // Projekte — white/gold
    { bg: [0.96, 0.95, 0.93], shape: [0.85, 0.78, 0.68], rim: [0.83, 0.14, 0.17], spec: [0.77, 0.64, 0.29] },  // Services — warm gray
    { bg: [0.10, 0.10, 0.10], shape: [0.42, 0.09, 0.10], rim: [0.77, 0.64, 0.29], spec: [0.96, 0.94, 0.90] },  // Dark / Stats — deep red
    { bg: [0.06, 0.06, 0.06], shape: [0.55, 0.42, 0.18], rim: [0.83, 0.14, 0.17], spec: [0.96, 0.94, 0.90] },  // CTA — gold on dark
  ];

  function lerpColor(a, b, t) {
    return [
      a[0] + (b[0] - a[0]) * t,
      a[1] + (b[1] - a[1]) * t,
      a[2] + (b[2] - a[2]) * t
    ];
  }

  /* ─── VERTEX SHADER — GPU noise ─── */
  const vertexShader = `
    uniform float uTime;
    uniform float uMorph;
    varying vec3 vNormal;
    varying vec3 vPos;
    varying float vDisp;

    vec3 mod289(vec3 x){ return x - floor(x*(1.0/289.0))*289.0; }
    vec4 mod289(vec4 x){ return x - floor(x*(1.0/289.0))*289.0; }
    vec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314*r; }

    float snoise(vec3 v){
      const vec2 C = vec2(1.0/6.0,1.0/3.0);
      const vec4 D = vec4(0.0,0.5,1.0,2.0);
      vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
      vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g;
      vec3 i1=min(g,l.zxy); vec3 i2=max(g,l.zxy);
      vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
      i=mod289(i);
      vec4 p=permute(permute(permute(i.z+vec4(0,i1.z,i2.z,1))+i.y+vec4(0,i1.y,i2.y,1))+i.x+vec4(0,i1.x,i2.x,1));
      float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
      vec4 j=p-49.0*floor(p*ns.z*ns.z);
      vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
      vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy;
      vec4 h=1.0-abs(x)-abs(y);
      vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
      vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0;
      vec4 sh=-step(h,vec4(0));
      vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
      vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y);
      vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
      vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
      p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
      vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
      m=m*m;
      return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
    }

    void main(){
      float t = uTime * 0.2;
      float freq = 1.4 + uMorph * 0.6;
      float amp = 0.15 + uMorph * 0.08;
      float n1 = snoise(normal*freq + t);
      float n2 = snoise(normal*freq*2.0 + t*1.4) * 0.4;
      float d = (n1 + n2) * amp;
      vec3 newPos = position + normal * d;
      vDisp = d;
      vNormal = normalMatrix * normal;
      vPos = (modelViewMatrix * vec4(newPos,1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos,1.0);
    }
  `;

  /* ─── FRAGMENT SHADER ─── */
  const fragmentShader = `
    uniform vec3 uShapeColor;
    uniform vec3 uRimColor;
    uniform vec3 uSpecColor;
    uniform float uOpacity;
    varying vec3 vNormal;
    varying vec3 vPos;
    varying float vDisp;

    void main(){
      vec3 lightDir = normalize(vec3(0.5, 0.8, 1.0));
      vec3 viewDir = normalize(-vPos);
      vec3 halfDir = normalize(lightDir + viewDir);
      vec3 n = normalize(vNormal);

      float diff = max(dot(n, lightDir), 0.0);
      float spec = pow(max(dot(n, halfDir), 0.0), 48.0);

      // Rim lighting
      float rim = 1.0 - max(dot(viewDir, n), 0.0);
      rim = pow(rim, 3.0);

      vec3 color = uShapeColor * (0.3 + diff * 0.7);
      color += spec * uSpecColor * 0.35;
      color += uRimColor * rim * 0.3;
      color += uShapeColor * rim * 0.05;

      gl_FragColor = vec4(color, uOpacity);
    }
  `;

  /* ─── MESH ─── */
  const geo = new THREE.IcosahedronGeometry(1.2, 14);
  const uniforms = {
    uTime:       { value: 0 },
    uMorph:      { value: 0 },
    uShapeColor: { value: new THREE.Vector3(0.96, 0.94, 0.90) },
    uRimColor:   { value: new THREE.Vector3(0.83, 0.14, 0.17) },
    uSpecColor:  { value: new THREE.Vector3(0.77, 0.64, 0.29) },
    uOpacity:    { value: 0.7 }
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

  /* ─── SCROLL TRACKING ─── */
  let scrollTarget = 0;
  let scrollSmooth = 0;

  function onScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollTarget = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ─── ANIMATION ─── */
  const clock = new THREE.Clock();
  let running = true;

  function animate() {
    if (!running) return;
    requestAnimationFrame(animate);

    const t = clock.getElapsedTime();
    scrollSmooth += (scrollTarget - scrollSmooth) * 0.03;

    uniforms.uTime.value = t;
    uniforms.uMorph.value = scrollSmooth;

    // Determine current palette based on scroll
    const pIdx = scrollSmooth * (palettes.length - 1);
    const pFloor = Math.floor(pIdx);
    const pFrac = pIdx - pFloor;
    const pA = palettes[Math.min(pFloor, palettes.length - 1)];
    const pB = palettes[Math.min(pFloor + 1, palettes.length - 1)];

    const shapeCol = lerpColor(pA.shape, pB.shape, pFrac);
    const rimCol = lerpColor(pA.rim, pB.rim, pFrac);
    const specCol = lerpColor(pA.spec, pB.spec, pFrac);

    uniforms.uShapeColor.value.set(shapeCol[0], shapeCol[1], shapeCol[2]);
    uniforms.uRimColor.value.set(rimCol[0], rimCol[1], rimCol[2]);
    uniforms.uSpecColor.value.set(specCol[0], specCol[1], specCol[2]);

    // Opacity: visible in hero, subtle in middle, fades on dark sections
    const opacityMap = scrollSmooth < 0.15 ? 0.7 :
                       scrollSmooth < 0.5  ? 0.5 :
                       scrollSmooth < 0.8  ? 0.35 : 0.25;
    uniforms.uOpacity.value += (opacityMap - uniforms.uOpacity.value) * 0.05;

    // Gentle rotation + scroll influence
    blob.rotation.x = t * 0.05 + scrollSmooth * Math.PI * 0.3;
    blob.rotation.y = t * 0.07 + scrollSmooth * Math.PI * 0.5;

    // Float hover
    blob.position.y = Math.sin(t * 0.4) * 0.1;
    blob.position.x = 1.8 - scrollSmooth * 1.2; // starts right, drifts center
    blob.position.z = -scrollSmooth * 0.5;

    // Scale changes through scroll
    const scale = 1.0 + scrollSmooth * 0.3;
    blob.scale.set(scale, scale, scale);

    renderer.render(scene, camera);
  }

  /* ─── RESIZE ─── */
  function onResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', onResize, { passive: true });

  /* ─── VISIBILITY ─── */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { running = false; }
    else { running = true; clock.start(); animate(); }
  });

  animate();
})();
