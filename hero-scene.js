/* ═══════════════════════════════════════════════════
   IMMO SCHWEIZ GRUPPE — Red Diamond + Swiss Cross
   Swiss red with white 6:7:6:7:6 cross on flat table
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
  renderer.toneMappingExposure = 1.3;

  /* ─── SCENE & CAMERA ─── */
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(2, 2, 6);
  camera.lookAt(0, 0, 0);

  /* ─── ENV MAP ─── */
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color(0xf8f5f0);
  [[0,8,0,12,0xffffff],[6,3,4,8,0xffffff],[-5,2,-3,6,0xffeedd],[0,-4,5,10,0xffffff],[3,1,-6,5,0xffcccc],[-4,4,2,5,0xffdddd],[4,-2,-4,3,0xD4242B]].forEach(([x,y,z,s,c]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(s,s), new THREE.MeshBasicMaterial({color:c,side:THREE.DoubleSide}));
    m.position.set(x,y,z); m.lookAt(0,0,0); envScene.add(m);
  });
  const envMap = pmrem.fromScene(envScene, 0.02).texture;
  pmrem.dispose();

  /* ─── LIGHTING ─── */
  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const key = new THREE.DirectionalLight(0xffffff, 3.5);
  key.position.set(3, 6, 4); scene.add(key);
  const fill = new THREE.DirectionalLight(0xffeedd, 1.8);
  fill.position.set(-4, 3, 5); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffaaaa, 1.2);
  rim.position.set(-1, -2, -5); scene.add(rim);
  const top = new THREE.PointLight(0xffffff, 2.5, 15);
  top.position.set(0, 6, 0); scene.add(top);
  const redGlow = new THREE.PointLight(0xD4242B, 1.5, 12);
  redGlow.position.set(0, -3, 2); scene.add(redGlow);

  /* ─── DIAMOND GEOMETRY — Brilliant Cut ─── */
  const profile = [
    new THREE.Vector2(0.001, -1.4),
    new THREE.Vector2(1.15,  -0.05),
    new THREE.Vector2(1.2,    0.0),
    new THREE.Vector2(1.15,   0.05),
    new THREE.Vector2(0.72,   0.35),
    new THREE.Vector2(0.65,   0.38),
    new THREE.Vector2(0.001,  0.38),
  ];
  const diamondGeo = new THREE.LatheGeometry(profile, 8);
  diamondGeo.computeVertexNormals();

  /* ─── DIAMOND MATERIAL — Swiss Red, mostly solid ─── */
  const diamondMat = new THREE.MeshPhysicalMaterial({
    color: 0xC42028,
    metalness: 0.1,
    roughness: 0.05,
    transmission: 0.15,
    thickness: 2.5,
    ior: 2.42,
    clearcoat: 1.0,
    clearcoatRoughness: 0.0,
    envMap: envMap,
    envMapIntensity: 3.5,
    specularIntensity: 1.0,
    specularColor: new THREE.Color(0xffffff),
    attenuationColor: new THREE.Color(0xD4242B),
    attenuationDistance: 1.5,
    transparent: true,
    opacity: 0.92,
    side: THREE.DoubleSide,
  });

  /* ─── MAIN GROUP ─── */
  const group = new THREE.Group();

  const diamond = new THREE.Mesh(diamondGeo, diamondMat);
  group.add(diamond);

  /* ─── FACET EDGES ─── */
  const edgesGeo = new THREE.EdgesGeometry(diamondGeo, 15);
  const edgeLines = new THREE.LineSegments(edgesGeo, new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.15
  }));
  group.add(edgeLines);

  /* ─── SWISS CROSS — 6:7:6:7:6 proportions on the table ─── */
  // Official Swiss cross: total grid 32 units
  // Cross arm width = 7/32, arm length = 20/32 (6 margin each side)
  // Positioned on the flat table (y = 0.38) of the diamond
  const unit = 0.65 / 32; // scale to match table radius (~0.65)
  const armW = 7 * unit;   // 0.142
  const armL = 20 * unit;  // 0.406

  const crossMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.0,
    roughness: 0.3,
    clearcoat: 0.5,
    envMap: envMap,
    envMapIntensity: 1.0,
    transparent: true,
    opacity: 0.75,
    side: THREE.DoubleSide,
  });

  const crossGroup = new THREE.Group();
  // Horizontal bar
  const hBar = new THREE.BoxGeometry(armL, 0.015, armW);
  crossGroup.add(new THREE.Mesh(hBar, crossMat));
  // Vertical bar
  const vBar = new THREE.BoxGeometry(armW, 0.015, armL);
  crossGroup.add(new THREE.Mesh(vBar, crossMat));

  // Position on diamond table + slight float above
  crossGroup.position.y = 0.40;
  crossGroup.rotation.x = -Math.PI / 2; // lay flat on table
  group.add(crossGroup);

  /* ─── Scale up — more present ─── */
  group.scale.set(1.15, 1.15, 1.15);
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

    // Slow majestic rotation
    group.rotation.y = t * 0.12 + scrollSmooth * Math.PI * 0.6;

    // Gentle tilt
    group.rotation.x = Math.sin(t * 0.07) * 0.05;

    // Floating hover
    const floatY = Math.sin(t * 0.35) * 0.1 + Math.sin(t * 0.17) * 0.04;
    group.position.y = floatY;

    // Drift: right → center on scroll
    group.position.x = 1.2 - scrollSmooth * 1.0;

    // Opacity fades
    const opTarget = scrollSmooth < 0.1 ? 0.92 :
                     scrollSmooth < 0.35 ? 0.78 :
                     scrollSmooth < 0.6  ? 0.5 : 0.25;
    diamondMat.opacity += (opTarget - diamondMat.opacity) * 0.04;
    edgeLines.material.opacity = diamondMat.opacity * 0.18;
    crossMat.opacity = diamondMat.opacity * 0.8;

    // Scale
    const s = 1.15 + scrollSmooth * 0.1;
    group.scale.set(s, s, s);

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
