/* ═══════════════════════════════════════════════════
   IMMO SCHWEIZ GRUPPE — Bold Red Diamond + Swiss Cross
   Deep red, sharp facets, cross flat on table
   ═══════════════════════════════════════════════════ */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

(function () {
  const canvas = document.getElementById('heroCanvas3D');
  if (!canvas) return;
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:0;pointer-events:none;';

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.4;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 2.5, 7);
  camera.lookAt(0, -0.2, 0);

  /* ─── ENV MAP ─── */
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envS = new THREE.Scene();
  envS.background = new THREE.Color(0xf0e8e0);
  [[0,8,0,14,0xffffff],[6,2,5,8,0xfff0e0],[-5,3,-4,7,0xffeedd],
   [0,-5,4,12,0xffffff],[3,0,-7,5,0xffcccc],[-3,6,3,4,0xD4242B],
   [5,-3,-3,4,0xaa1111]].forEach(([x,y,z,s,c]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(s,s), new THREE.MeshBasicMaterial({color:c,side:THREE.DoubleSide}));
    m.position.set(x,y,z); m.lookAt(0,0,0); envS.add(m);
  });
  const envMap = pmrem.fromScene(envS, 0.02).texture;
  pmrem.dispose();

  /* ─── LIGHTING — dramatic ─── */
  scene.add(new THREE.AmbientLight(0xfff0f0, 0.4));
  const key = new THREE.DirectionalLight(0xffffff, 4.0);
  key.position.set(4, 8, 5); scene.add(key);
  const fill = new THREE.DirectionalLight(0xffddcc, 2.0);
  fill.position.set(-5, 3, 4); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xff4444, 1.5);
  rim.position.set(0, -3, -6); scene.add(rim);
  const spot = new THREE.PointLight(0xffffff, 3.0, 15);
  spot.position.set(0, 8, 0); scene.add(spot);
  const redUp = new THREE.PointLight(0xD4242B, 2.0, 10);
  redUp.position.set(0, -4, 1); scene.add(redUp);

  /* ─── DIAMOND GEO — 6-sided (hexagonal) for sharp edges ─── */
  const profile = [
    new THREE.Vector2(0.001, -1.5),   // culet point
    new THREE.Vector2(1.2,  -0.05),   // pavilion to girdle
    new THREE.Vector2(1.25,   0.0),   // girdle
    new THREE.Vector2(1.2,   0.05),   // girdle to crown
    new THREE.Vector2(0.75,   0.38),  // crown
    new THREE.Vector2(0.68,   0.42),  // table edge
    new THREE.Vector2(0.001,  0.42),  // table center
  ];
  const diamondGeo = new THREE.LatheGeometry(profile, 6); // 6 = hexagonal, very sharp
  diamondGeo.computeVertexNormals();

  /* ─── DIAMOND MAT — bold, solid red ─── */
  const diamondMat = new THREE.MeshPhysicalMaterial({
    color: 0xAA1520,
    metalness: 0.25,
    roughness: 0.08,
    transmission: 0.0,        // NO transparency — solid
    clearcoat: 1.0,
    clearcoatRoughness: 0.0,
    envMap,
    envMapIntensity: 3.0,
    specularIntensity: 1.0,
    specularColor: new THREE.Color(0xffffff),
    emissive: 0x330808,
    emissiveIntensity: 0.3,
    transparent: true,
    opacity: 0.95,
    side: THREE.DoubleSide,
  });

  const group = new THREE.Group();
  const diamond = new THREE.Mesh(diamondGeo, diamondMat);
  group.add(diamond);

  /* ─── SHARP WHITE EDGES ─── */
  const edgesGeo = new THREE.EdgesGeometry(diamondGeo, 10);
  const edgeLines = new THREE.LineSegments(edgesGeo, new THREE.LineBasicMaterial({
    color: 0xD4242B, transparent: true, opacity: 0.35
  }));
  group.add(edgeLines);

  /* ─── SWISS CROSS — 6:7:6:7:6, FLAT on table (XZ plane) ─── */
  const unit = 0.68 / 32;
  const armW = 7 * unit;
  const armL = 20 * unit;
  const crossH = 0.018; // very thin

  const crossMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.0,
    roughness: 0.2,
    clearcoat: 0.6,
    envMap,
    envMapIntensity: 1.5,
    emissive: 0xffffff,
    emissiveIntensity: 0.1,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide,
  });

  // Bars in XZ plane (NO rotation needed — they're already flat)
  const hBar = new THREE.Mesh(new THREE.BoxGeometry(armL, crossH, armW), crossMat);
  const vBar = new THREE.Mesh(new THREE.BoxGeometry(armW, crossH, armL), crossMat);

  const crossGroup = new THREE.Group();
  crossGroup.add(hBar);
  crossGroup.add(vBar);
  crossGroup.position.y = 0.43; // just above table surface
  group.add(crossGroup);

  /* ─── SCALE ─── */
  group.scale.set(1.17, 1.17, 1.17);
  scene.add(group);

  /* ─── SCROLL ─── */
  let scrollTarget = 0, scrollSmooth = 0;
  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollTarget = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
  }, { passive: true });

  /* ─── ANIMATE — upgraded dynamics ─── */
  const clock = new THREE.Clock();
  let running = true;

  function animate() {
    if (!running) return;
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    scrollSmooth += (scrollTarget - scrollSmooth) * 0.04;

    // Rotation: steady spin + scroll acceleration
    group.rotation.y = t * 0.18 + scrollSmooth * Math.PI * 0.8;

    // Dynamic tilt — more lively
    group.rotation.x = Math.sin(t * 0.09) * 0.08 + Math.sin(t * 0.22) * 0.03;
    group.rotation.z = Math.sin(t * 0.12) * 0.02;

    // Float with subtle bounce
    group.position.y = Math.sin(t * 0.4) * 0.1 + Math.sin(t * 0.19) * 0.06;

    // Drift right → center
    group.position.x = 1.5 - scrollSmooth * 1.3;

    // Opacity
    const opTarget = scrollSmooth < 0.1 ? 0.95 :
                     scrollSmooth < 0.3 ? 0.82 :
                     scrollSmooth < 0.6 ? 0.55 : 0.3;
    diamondMat.opacity += (opTarget - diamondMat.opacity) * 0.05;
    edgeLines.material.opacity = diamondMat.opacity * 0.38;
    crossMat.opacity = Math.min(diamondMat.opacity * 0.85, 0.8);

    // Emissive pulse — diamond breathes red
    const pulse = 0.25 + Math.sin(t * 0.7) * 0.1;
    diamondMat.emissiveIntensity = pulse;

    // Cross glow pulse
    crossMat.emissiveIntensity = 0.08 + Math.sin(t * 0.5) * 0.04;

    // Scale
    const s = 1.17 + scrollSmooth * 0.1;
    group.scale.set(s, s, s);

    renderer.render(scene, camera);
  }

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
