/* ═══════════════════════════════════════════════════
   IMMO SCHWEIZ — Diamond Scroll Choreography
   Keyframe path: RIGHT → LEFT → RIGHT(small) → LEFT → CENTER → LEFT → GONE
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

  /* ─── LIGHTING ─── */
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

  /* ─── DIAMOND GEOMETRY — 6-sided ─── */
  const profile = [
    new THREE.Vector2(0.001, -1.5),
    new THREE.Vector2(1.2,  -0.05),
    new THREE.Vector2(1.25,   0.0),
    new THREE.Vector2(1.2,   0.05),
    new THREE.Vector2(0.75,   0.38),
    new THREE.Vector2(0.68,   0.42),
    new THREE.Vector2(0.001,  0.42),
  ];
  const diamondGeo = new THREE.LatheGeometry(profile, 6);
  diamondGeo.computeVertexNormals();

  /* ─── MATERIAL ─── */
  const diamondMat = new THREE.MeshPhysicalMaterial({
    color: 0xAA1520, metalness: 0.25, roughness: 0.08,
    transmission: 0.0, clearcoat: 1.0, clearcoatRoughness: 0.0,
    envMap, envMapIntensity: 3.0,
    specularIntensity: 1.0, specularColor: new THREE.Color(0xffffff),
    emissive: 0x330808, emissiveIntensity: 0.3,
    transparent: true, opacity: 0.95, side: THREE.DoubleSide,
  });

  const group = new THREE.Group();
  group.add(new THREE.Mesh(diamondGeo, diamondMat));

  /* ─── EDGES ─── */
  const edgeLines = new THREE.LineSegments(
    new THREE.EdgesGeometry(diamondGeo, 10),
    new THREE.LineBasicMaterial({ color: 0xD4242B, transparent: true, opacity: 0.35 })
  );
  group.add(edgeLines);

  /* ─── SWISS CROSS ─── */
  const unit = 0.68 / 32;
  const crossMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, metalness: 0.0, roughness: 0.2, clearcoat: 0.6,
    envMap, envMapIntensity: 1.5, emissive: 0xffffff, emissiveIntensity: 0.1,
    transparent: true, opacity: 0.8, side: THREE.DoubleSide,
  });
  const crossGroup = new THREE.Group();
  crossGroup.add(new THREE.Mesh(new THREE.BoxGeometry(20*unit, 0.018, 7*unit), crossMat));
  crossGroup.add(new THREE.Mesh(new THREE.BoxGeometry(7*unit, 0.018, 20*unit), crossMat));
  crossGroup.position.y = 0.43;
  group.add(crossGroup);

  scene.add(group);

  /* ═══════════════════════════════════════════════════
     KEYFRAME PATH — Diamond position at each section
     ═══════════════════════════════════════════════════ */
  // Each keyframe: [scrollProgress, x, y, scale, opacity]
  // Scroll progress is based on section positions (computed dynamically)
  const keyframes = [
    { id: 'home',        x:  1.5,  y: 0,   scale: 1.17, opacity: 0.95 },
    { id: 'projekte',    x: -1.5,  y: 0,   scale: 1.17, opacity: 0.92 },
    { id: 'matterhorn',  x:  1.8,  y: -0.3,scale: 0.58, opacity: 0.85 },
    { id: 'leistungen',  x: -1.8,  y: 0,   scale: 0.85, opacity: 0.90 },
    { id: 'ueber-uns',   x:  1.5,  y: 0,   scale: 1.0,  opacity: 0.92 },
    { id: 'team',        x: -1.8,  y: 0,   scale: 0.9,  opacity: 0.88 },
    { id: 'kontakt',     x:  0.0,  y: 2.0, scale: 0.7,  opacity: 0.0  },
  ];

  // Compute section top offsets
  function getSectionTops() {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    return keyframes.map(kf => {
      const el = document.getElementById(kf.id) ||
                 document.querySelector(`.${kf.id}-section`) ||
                 document.querySelector(`[data-diamond="${kf.id}"]`);
      if (!el) return { ...kf, scroll: 0 };
      const top = el.offsetTop;
      return { ...kf, scroll: docH > 0 ? top / docH : 0 };
    });
  }

  let waypoints = [];
  function recalc() { waypoints = getSectionTops(); }
  window.addEventListener('resize', () => { setTimeout(recalc, 100); });
  setTimeout(recalc, 200);

  // Lerp between two keyframes
  function lerpKF(a, b, t) {
    t = Math.max(0, Math.min(1, t));
    const ease = t * t * (3 - 2 * t); // smoothstep
    return {
      x: a.x + (b.x - a.x) * ease,
      y: a.y + (b.y - a.y) * ease,
      scale: a.scale + (b.scale - a.scale) * ease,
      opacity: a.opacity + (b.opacity - a.opacity) * ease,
    };
  }

  function getTarget(scrollProg) {
    if (waypoints.length < 2) return { x: 1.5, y: 0, scale: 1.17, opacity: 0.95 };

    // Find which two waypoints we're between
    for (let i = 0; i < waypoints.length - 1; i++) {
      const a = waypoints[i], b = waypoints[i + 1];
      if (scrollProg <= b.scroll) {
        const range = b.scroll - a.scroll;
        const t = range > 0 ? (scrollProg - a.scroll) / range : 0;
        return lerpKF(a, b, t);
      }
    }
    // Past last keyframe
    const last = waypoints[waypoints.length - 1];
    return { x: last.x, y: last.y, scale: last.scale, opacity: last.opacity };
  }

  /* ─── SCROLL ─── */
  let scrollRaw = 0;
  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollRaw = max > 0 ? window.scrollY / max : 0;
  }, { passive: true });

  /* ─── ANIMATE ─── */
  const clock = new THREE.Clock();
  let running = true;
  let smoothX = 1.5, smoothY = 0, smoothScale = 1.17, smoothOpacity = 0.95;

  function animate() {
    if (!running) return;
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Get target from keyframes
    const target = getTarget(scrollRaw);

    // Smooth interpolation (clean, direct movement)
    const lerp = 0.06;
    smoothX += (target.x - smoothX) * lerp;
    smoothY += (target.y - smoothY) * lerp;
    smoothScale += (target.scale - smoothScale) * lerp;
    smoothOpacity += (target.opacity - smoothOpacity) * lerp;

    // Apply position
    group.position.x = smoothX;
    group.position.y = smoothY + Math.sin(t * 0.35) * 0.06; // subtle float

    // Rotation — steady spin
    group.rotation.y = t * 0.15;
    group.rotation.x = Math.sin(t * 0.09) * 0.05;
    group.rotation.z = Math.sin(t * 0.12) * 0.015;

    // Scale
    group.scale.set(smoothScale, smoothScale, smoothScale);

    // Opacity
    diamondMat.opacity = smoothOpacity;
    edgeLines.material.opacity = smoothOpacity * 0.38;
    crossMat.opacity = Math.min(smoothOpacity * 0.85, 0.8);

    // Emissive pulse
    diamondMat.emissiveIntensity = 0.25 + Math.sin(t * 0.7) * 0.08;
    crossMat.emissiveIntensity = 0.08 + Math.sin(t * 0.5) * 0.03;

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
