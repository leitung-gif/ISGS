/* ═══════════════════════════════════════════════════
   IMMO SCHWEIZ GRUPPE — Swiss Gold Crystal
   Bright, luminous, premium — Kompetenz × Schweiz × Reich
   ═══════════════════════════════════════════════════ */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

(function () {
  const canvas = document.getElementById('heroCanvas3D');
  if (!canvas) return;

  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:0;pointer-events:none;';

  /* ─── RENDERER ─── */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.4;

  /* ─── SCENE & CAMERA ─── */
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(2.5, 1, 5);
  camera.lookAt(0, 0, 0);

  /* ─── PROCEDURAL ENVIRONMENT MAP — gives reflections without HDR file ─── */
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color(0xfff8ef);
  // Warm studio lights inside env map
  const envLight1 = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }));
  envLight1.position.set(0, 5, 0); envLight1.lookAt(0, 0, 0); envScene.add(envLight1);
  const envLight2 = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshBasicMaterial({ color: 0xffeedd, side: THREE.DoubleSide }));
  envLight2.position.set(5, 2, 3); envLight2.lookAt(0, 0, 0); envScene.add(envLight2);
  const envLight3 = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), new THREE.MeshBasicMaterial({ color: 0xD4A44A, side: THREE.DoubleSide }));
  envLight3.position.set(-4, 1, -3); envLight3.lookAt(0, 0, 0); envScene.add(envLight3);
  const envMap = pmrem.fromScene(envScene, 0.04).texture;
  pmrem.dispose();

  /* ─── LIGHTING ─── */
  scene.add(new THREE.AmbientLight(0xfff8f0, 0.8));

  const keyLight = new THREE.DirectionalLight(0xfff5e0, 3.0);
  keyLight.position.set(4, 6, 4);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xffeedd, 1.2);
  fillLight.position.set(-3, 3, 5);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xD4242B, 0.8);
  rimLight.position.set(-2, 0, -5);
  scene.add(rimLight);

  const goldUp = new THREE.PointLight(0xFFD700, 2.0, 20);
  goldUp.position.set(0, -4, 2);
  scene.add(goldUp);

  const topSpot = new THREE.PointLight(0xffffff, 1.5, 15);
  topSpot.position.set(1, 5, 1);
  scene.add(topSpot);

  /* ─── MATERIALS — bright, reflective gold ─── */
  const goldMat = new THREE.MeshPhysicalMaterial({
    color: 0xE8C547,
    metalness: 0.7,
    roughness: 0.15,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    envMap: envMap,
    envMapIntensity: 2.0,
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide
  });

  const platinumMat = new THREE.MeshPhysicalMaterial({
    color: 0xF0EBE0,
    metalness: 0.5,
    roughness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03,
    envMap: envMap,
    envMapIntensity: 1.8,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide
  });

  const crossMat = new THREE.MeshPhysicalMaterial({
    color: 0xD4242B,
    metalness: 0.3,
    roughness: 0.25,
    clearcoat: 0.6,
    envMap: envMap,
    envMapIntensity: 1.0,
    emissive: 0xD4242B,
    emissiveIntensity: 0.15,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide
  });

  /* ─── MAIN GROUP ─── */
  const group = new THREE.Group();

  /* ─── DIAMOND — proper cut-gem shape ─── */
  // Crown (top pyramid, shorter)
  const crownGeo = new THREE.ConeGeometry(1.3, 0.7, 8, 1, true);
  crownGeo.rotateX(Math.PI); // flip upside down so flat bottom is up
  crownGeo.translate(0, 0.35, 0);
  const crown = new THREE.Mesh(crownGeo, goldMat);

  // Table (flat top cap)
  const tableGeo = new THREE.CircleGeometry(1.3, 8);
  tableGeo.rotateX(-Math.PI / 2);
  tableGeo.translate(0, 0.7, 0);
  const table = new THREE.Mesh(tableGeo, goldMat);

  // Pavilion (bottom pyramid, deeper)
  const pavilionGeo = new THREE.ConeGeometry(1.3, 1.8, 8, 1, true);
  pavilionGeo.translate(0, -0.9, 0);
  const pavilion = new THREE.Mesh(pavilionGeo, goldMat);

  // Bottom cap
  const bottomGeo = new THREE.CircleGeometry(0.01, 8);
  bottomGeo.rotateX(Math.PI / 2);
  bottomGeo.translate(0, -1.8, 0);
  const bottom = new THREE.Mesh(bottomGeo, goldMat);

  const diamondGroup = new THREE.Group();
  diamondGroup.add(crown, table, pavilion, bottom);
  group.add(diamondGroup);

  /* ─── SWISS CROSS — floating inside, glowing red ─── */
  const crossGroup = new THREE.Group();
  const barH = new THREE.BoxGeometry(0.65, 0.18, 0.06);
  crossGroup.add(new THREE.Mesh(barH, crossMat));
  const barV = new THREE.BoxGeometry(0.18, 0.65, 0.06);
  crossGroup.add(new THREE.Mesh(barV, crossMat));
  crossGroup.position.set(0, -0.1, 0);
  crossGroup.scale.set(0.8, 0.8, 0.8);
  group.add(crossGroup);

  /* ─── 3 SATELLITE PRISMS — orbiting mini-diamonds ─── */
  const satGeo = new THREE.OctahedronGeometry(0.12, 0);
  satGeo.scale(1, 1.5, 1);
  const satellites = [];
  const satDefs = [
    { angle: 0, r: 2.2, y: 0.3, speed: 0.22, phase: 0 },
    { angle: 2.09, r: 2.0, y: -0.2, speed: 0.28, phase: 1.5 },
    { angle: 4.19, r: 2.3, y: 0.5, speed: 0.18, phase: 3 },
  ];
  satDefs.forEach(d => {
    const m = new THREE.Mesh(satGeo, platinumMat);
    m.userData = d;
    group.add(m);
    satellites.push(m);
  });

  scene.add(group);

  /* ─── SCROLL ─── */
  let scrollTarget = 0, scrollSmooth = 0;
  function onScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollTarget = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ─── ANIMATE ─── */
  const clock = new THREE.Clock();
  let running = true;

  function animate() {
    if (!running) return;
    requestAnimationFrame(animate);

    const t = clock.getElapsedTime();
    scrollSmooth += (scrollTarget - scrollSmooth) * 0.03;

    // Opacity fades through scroll
    const opTarget = scrollSmooth < 0.15 ? 0.9 :
                     scrollSmooth < 0.4  ? 0.7 :
                     scrollSmooth < 0.7  ? 0.45 : 0.25;
    goldMat.opacity += (opTarget - goldMat.opacity) * 0.04;
    platinumMat.opacity = goldMat.opacity * 0.85;
    crossMat.opacity = goldMat.opacity * 0.7;

    // Majestic rotation
    group.rotation.y = t * 0.12 + scrollSmooth * Math.PI * 0.8;
    group.rotation.x = Math.sin(t * 0.06) * 0.08 + scrollSmooth * 0.2;

    // Float + drift
    group.position.y = Math.sin(t * 0.3) * 0.1;
    group.position.x = 1.5 - scrollSmooth * 1.2;

    // Scale
    const s = 1.0 + scrollSmooth * 0.15;
    group.scale.set(s, s, s);

    // Swiss cross counter-rotate to stay frontal
    crossGroup.rotation.y = -group.rotation.y * 0.6;
    crossGroup.rotation.x = -group.rotation.x * 0.3;

    // Satellite orbits
    satellites.forEach(sat => {
      const d = sat.userData;
      const a = d.angle + t * d.speed;
      sat.position.x = Math.cos(a) * d.r;
      sat.position.z = Math.sin(a) * d.r;
      sat.position.y = d.y + Math.sin(t * 0.5 + d.phase) * 0.15;
      sat.rotation.y = t * 0.6 + d.phase;
      sat.rotation.x = t * 0.3;
    });

    renderer.render(scene, camera);
  }

  /* ─── RESIZE ─── */
  function onResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', onResize, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { running = false; }
    else { running = true; clock.start(); animate(); }
  });

  animate();
})();
