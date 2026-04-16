/* ═══════════════════════════════════════════════════
   IMMO SCHWEIZ GRUPPE — Brilliant-Cut Diamond
   Traditional cut, transparent glass, red fire
   Schwebend (floating)
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
  camera.position.set(2, 1.5, 6);
  camera.lookAt(0, 0, 0);

  /* ─── PROCEDURAL ENV MAP (studio reflections) ─── */
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color(0xf8f5f0);
  // Bright studio panels
  [[0,8,0,12],[6,3,4,8],[-5,2,-3,6],[0,-4,5,10],[3,1,-6,5]].forEach(([x,y,z,s]) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(s, s),
      new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
    );
    m.position.set(x, y, z); m.lookAt(0, 0, 0); envScene.add(m);
  });
  // Gold accent panel
  const gp = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), new THREE.MeshBasicMaterial({ color: 0xFFD700, side: THREE.DoubleSide }));
  gp.position.set(-4, 4, 2); gp.lookAt(0, 0, 0); envScene.add(gp);
  // Red accent panel
  const rp = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), new THREE.MeshBasicMaterial({ color: 0xD4242B, side: THREE.DoubleSide }));
  rp.position.set(4, -2, -4); rp.lookAt(0, 0, 0); envScene.add(rp);
  const envMap = pmrem.fromScene(envScene, 0.02).texture;
  pmrem.dispose();

  /* ─── LIGHTING ─── */
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 4.0);
  key.position.set(3, 5, 4); scene.add(key);
  const fill = new THREE.DirectionalLight(0xffeedd, 2.0);
  fill.position.set(-4, 3, 3); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xD4242B, 1.5);
  rim.position.set(-1, -2, -5); scene.add(rim);
  const top = new THREE.PointLight(0xffffff, 3.0, 15);
  top.position.set(0, 6, 0); scene.add(top);

  /* ─── DIAMOND GEOMETRY — Brilliant Cut Profile via LatheGeometry ─── */
  // Profile: culet → pavilion → girdle → crown → table edge
  // Traditional proportions: table ~53%, crown ~16%, pavilion ~43%
  const profile = [
    new THREE.Vector2(0.001, -1.4),   // culet (bottom point)
    new THREE.Vector2(1.15,  -0.05),  // lower girdle facet
    new THREE.Vector2(1.2,    0.0),   // girdle (widest)
    new THREE.Vector2(1.15,   0.05),  // upper girdle facet
    new THREE.Vector2(0.72,   0.35),  // star facet / bezel
    new THREE.Vector2(0.65,   0.38),  // table edge
    new THREE.Vector2(0.001,  0.38),  // table center (flat top)
  ];

  const diamondGeo = new THREE.LatheGeometry(profile, 8); // 8 = octagonal brilliant
  diamondGeo.computeVertexNormals();

  /* ─── DIAMOND MATERIAL — transparent glass with red fire ─── */
  const diamondMat = new THREE.MeshPhysicalMaterial({
    color: 0xf5e6c8,
    metalness: 0.15,
    roughness: 0.02,
    transmission: 0.25,        // mostly solid, subtle transparency
    thickness: 2.0,           // refraction depth
    ior: 2.42,                // real diamond IOR
    clearcoat: 1.0,
    clearcoatRoughness: 0.0,
    envMap: envMap,
    envMapIntensity: 4.0,
    specularIntensity: 1.0,
    specularColor: new THREE.Color(0xD4242B), // RED specular fire
    attenuationColor: new THREE.Color(0xffcccc), // subtle warm internal tint
    attenuationDistance: 3.0,
    transparent: true,
    opacity: 0.92,
    side: THREE.DoubleSide,
  });

  const diamond = new THREE.Mesh(diamondGeo, diamondMat);
  diamond.scale.set(0.9, 0.9, 0.9);
  scene.add(diamond);

  /* ─── CLEAN FACET EDGES ─── */
  const edgesGeo = new THREE.EdgesGeometry(diamondGeo, 15);
  const edgeLines = new THREE.LineSegments(edgesGeo, new THREE.LineBasicMaterial({
    color: 0xccbbaa,
    transparent: true,
    opacity: 0.35
  }));
  edgeLines.scale.set(0.9, 0.9, 0.9);
  scene.add(edgeLines);

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
    diamond.rotation.y = t * 0.15 + scrollSmooth * Math.PI * 0.6;
    edgeLines.rotation.y = diamond.rotation.y;

    // Gentle tilt
    diamond.rotation.x = Math.sin(t * 0.07) * 0.06;
    edgeLines.rotation.x = diamond.rotation.x;

    // Floating hover (schweben)
    const floatY = Math.sin(t * 0.35) * 0.12 + Math.sin(t * 0.17) * 0.05;
    diamond.position.y = floatY;
    edgeLines.position.y = floatY;

    // Drift
    const driftX = 1.2 - scrollSmooth * 1.0;
    diamond.position.x = driftX;
    edgeLines.position.x = driftX;

    // Opacity fades through page
    const opTarget = scrollSmooth < 0.1 ? 0.95 :
                     scrollSmooth < 0.35 ? 0.8 :
                     scrollSmooth < 0.6  ? 0.5 : 0.25;
    diamondMat.opacity += (opTarget - diamondMat.opacity) * 0.04;

    // Red specular intensifies on scroll
    const redIntensity = 0.8 + scrollSmooth * 0.5;
    diamondMat.specularColor.setRGB(
      0.83 * redIntensity,
      0.14 * redIntensity * 0.5,
      0.17 * redIntensity * 0.5
    );

    // Scale
    const s = 0.9 + scrollSmooth * 0.1;
    diamond.scale.set(s, s, s);
    edgeLines.scale.set(s, s, s);

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
