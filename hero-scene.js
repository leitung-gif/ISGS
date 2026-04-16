/* ═══════════════════════════════════════════════════
   IMMO SCHWEIZ GRUPPE — Swiss Diamond Crystal
   Faceted gemstone = wealth + precision + Switzerland
   Gold with Swiss red rim accents
   ═══════════════════════════════════════════════════ */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

(function () {
  const canvas = document.getElementById('heroCanvas3D');
  if (!canvas) return;

  /* ─── Fixed viewport background ─── */
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:0;pointer-events:none;';

  /* ─── RENDERER ─── */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  /* ─── SCENE & CAMERA ─── */
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(3, 1.5, 5);
  camera.lookAt(0, 0, 0);

  /* ─── LIGHTING — dramatic jewelry lighting ─── */
  // Key light: warm gold from top-right
  const keyLight = new THREE.DirectionalLight(0xfff5e0, 2.0);
  keyLight.position.set(4, 6, 3);
  scene.add(keyLight);

  // Fill light: soft white from left
  const fillLight = new THREE.DirectionalLight(0xeeeeff, 0.6);
  fillLight.position.set(-3, 2, 4);
  scene.add(fillLight);

  // Rim light: Swiss red backlight
  const rimLight = new THREE.DirectionalLight(0xD4242B, 1.0);
  rimLight.position.set(-2, -1, -4);
  scene.add(rimLight);

  // Gold accent from below
  const goldUp = new THREE.PointLight(0xC4A24A, 1.5, 15);
  goldUp.position.set(0, -3, 2);
  scene.add(goldUp);

  // Ambient: subtle warm fill
  scene.add(new THREE.AmbientLight(0xfff8f0, 0.3));

  /* ─── MATERIALS ─── */
  // Main diamond: gold crystal
  const diamondMat = new THREE.MeshPhysicalMaterial({
    color: 0xD4B96A,
    metalness: 0.85,
    roughness: 0.12,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    reflectivity: 1.0,
    envMapIntensity: 1.5,
    transparent: true,
    opacity: 0.92,
    side: THREE.DoubleSide
  });

  // Satellite material: darker gold, more metallic
  const satMat = new THREE.MeshPhysicalMaterial({
    color: 0xB8973A,
    metalness: 0.95,
    roughness: 0.08,
    clearcoat: 0.8,
    clearcoatRoughness: 0.1,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide
  });

  // Edge wireframe: Swiss red
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0xD4242B,
    wireframe: true,
    transparent: true,
    opacity: 0.08
  });

  /* ─── MAIN DIAMOND — faceted octahedron, stretched like a cut gem ─── */
  const group = new THREE.Group();

  // Central diamond (stretched octahedron = gemstone)
  const diamondGeo = new THREE.OctahedronGeometry(1.3, 0);
  diamondGeo.scale(1, 1.6, 1); // Tall diamond proportions
  const diamond = new THREE.Mesh(diamondGeo, diamondMat);
  group.add(diamond);

  // Subtle wireframe overlay for precision feel
  const wireframe = new THREE.Mesh(diamondGeo.clone(), wireMat);
  wireframe.scale.set(1.01, 1.01, 1.01);
  group.add(wireframe);

  /* ─── 4 SATELLITE PRISMS — floating around the diamond ─── */
  const satGeo = new THREE.OctahedronGeometry(0.18, 0);
  satGeo.scale(1, 1.4, 1);
  const satellites = [];
  const satPositions = [
    { angle: 0, radius: 2.2, y: 0.4, speed: 0.3, phase: 0 },
    { angle: Math.PI * 0.5, radius: 2.0, y: -0.3, speed: 0.25, phase: 1 },
    { angle: Math.PI, radius: 2.4, y: 0.6, speed: 0.35, phase: 2 },
    { angle: Math.PI * 1.5, radius: 1.8, y: -0.5, speed: 0.28, phase: 3 },
  ];

  satPositions.forEach(s => {
    const mesh = new THREE.Mesh(satGeo, satMat);
    mesh.userData = s;
    group.add(mesh);
    satellites.push(mesh);
  });

  /* ─── SWISS CROSS — floating subtle accent ─── */
  const crossGroup = new THREE.Group();
  const crossMat = new THREE.MeshPhysicalMaterial({
    color: 0xD4242B,
    metalness: 0.7,
    roughness: 0.2,
    clearcoat: 0.5,
    transparent: true,
    opacity: 0.6
  });
  // Horizontal bar
  const barH = new THREE.BoxGeometry(0.8, 0.2, 0.08);
  crossGroup.add(new THREE.Mesh(barH, crossMat));
  // Vertical bar
  const barV = new THREE.BoxGeometry(0.2, 0.8, 0.08);
  crossGroup.add(new THREE.Mesh(barV, crossMat));
  crossGroup.position.set(0, 0, 0);
  crossGroup.scale.set(0.7, 0.7, 0.7);
  group.add(crossGroup);

  scene.add(group);

  /* ─── SCROLL TRACKING ─── */
  let scrollTarget = 0, scrollSmooth = 0;
  function onScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollTarget = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ─── COLOR STAGES ─── */
  const stages = [
    { diamond: 0xD4B96A, rim: 0xD4242B, opacity: 0.88 },  // Hero: gold
    { diamond: 0xC4A24A, rim: 0xB01E24, opacity: 0.75 },  // Mid: deeper gold
    { diamond: 0xA88830, rim: 0xD4242B, opacity: 0.55 },  // Services: warm
    { diamond: 0x8B6914, rim: 0xE84850, opacity: 0.4 },   // Dark: antique gold
    { diamond: 0xC4A24A, rim: 0xD4242B, opacity: 0.3 },   // CTA: subtle
  ];

  function lerpHex(a, b, t) {
    const ar = (a >> 16) & 0xff, ag = (a >> 8) & 0xff, ab = a & 0xff;
    const br = (b >> 16) & 0xff, bg = (b >> 8) & 0xff, bb = b & 0xff;
    const r = Math.round(ar + (br - ar) * t);
    const g = Math.round(ag + (bg - ag) * t);
    const bv = Math.round(ab + (bb - ab) * t);
    return (r << 16) | (g << 8) | bv;
  }

  /* ─── ANIMATION ─── */
  const clock = new THREE.Clock();
  let running = true;

  function animate() {
    if (!running) return;
    requestAnimationFrame(animate);

    const t = clock.getElapsedTime();
    scrollSmooth += (scrollTarget - scrollSmooth) * 0.03;

    // Color stage interpolation
    const sIdx = scrollSmooth * (stages.length - 1);
    const sFloor = Math.floor(sIdx);
    const sFrac = sIdx - sFloor;
    const sA = stages[Math.min(sFloor, stages.length - 1)];
    const sB = stages[Math.min(sFloor + 1, stages.length - 1)];

    diamondMat.color.setHex(lerpHex(sA.diamond, sB.diamond, sFrac));
    rimLight.color.setHex(lerpHex(sA.rim, sB.rim, sFrac));
    const targetOpacity = sA.opacity + (sB.opacity - sA.opacity) * sFrac;
    diamondMat.opacity += (targetOpacity - diamondMat.opacity) * 0.05;
    satMat.opacity = diamondMat.opacity * 0.8;
    crossMat.opacity = diamondMat.opacity * 0.6;
    wireMat.opacity = diamondMat.opacity * 0.1;

    // Main rotation: majestic, slow
    group.rotation.y = t * 0.15 + scrollSmooth * Math.PI;
    group.rotation.x = Math.sin(t * 0.08) * 0.1 + scrollSmooth * 0.3;

    // Float hover
    group.position.y = Math.sin(t * 0.3) * 0.12;
    group.position.x = 1.5 - scrollSmooth * 1.0; // starts right, drifts center

    // Scale with scroll
    const s = 1.0 + scrollSmooth * 0.2;
    group.scale.set(s, s, s);

    // Animate satellites orbiting
    satellites.forEach(sat => {
      const d = sat.userData;
      const angle = d.angle + t * d.speed;
      const r = d.radius + Math.sin(t * 0.5 + d.phase) * 0.15;
      sat.position.x = Math.cos(angle) * r;
      sat.position.z = Math.sin(angle) * r;
      sat.position.y = d.y + Math.sin(t * 0.6 + d.phase * 2) * 0.2;
      sat.rotation.y = t * 0.8 + d.phase;
      sat.rotation.x = t * 0.4;
    });

    // Swiss cross: counter-rotate, stays frontal
    crossGroup.rotation.y = -group.rotation.y * 0.5;
    crossGroup.rotation.x = -group.rotation.x * 0.3;
    crossGroup.position.z = Math.sin(t * 0.2) * 0.05;

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
