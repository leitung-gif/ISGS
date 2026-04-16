/* ═══════════════════════════════════════════════════
   IMMO SCHWEIZ GRUPPE — Hero Organic Shape
   Three.js WebGL — Scroll-driven floating blob
   ═══════════════════════════════════════════════════ */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

(function() {
  const canvas = document.getElementById('heroCanvas3D');
  if (!canvas) return;

  /* ─── RENDERER ─── */
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setClearColor(0x000000, 0);

  /* ─── SCENE & CAMERA ─── */
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 5);

  /* ─── LIGHTING ─── */
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xfff5e6, 1.2);
  keyLight.position.set(3, 4, 5);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0xD4242B, 0.6);
  rimLight.position.set(-3, 2, -2);
  scene.add(rimLight);

  const goldLight = new THREE.PointLight(0xC4A24A, 0.8, 15);
  goldLight.position.set(2, -1, 3);
  scene.add(goldLight);

  /* ─── ORGANIC SHAPE ─── */
  const geometry = new THREE.IcosahedronGeometry(1.4, 64);
  const basePositions = geometry.attributes.position.array.slice();

  const material = new THREE.MeshPhysicalMaterial({
    color: 0xf5f0eb,
    metalness: 0.15,
    roughness: 0.35,
    clearcoat: 0.5,
    clearcoatRoughness: 0.2,
    envMapIntensity: 0.8,
    transparent: true,
    opacity: 0.92
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  /* ─── SIMPLEX NOISE (inline for zero deps) ─── */
  function noise3D(x, y, z) {
    const p = x * 1.17 + y * 2.31 + z * 0.79;
    const s1 = Math.sin(p * 3.14) * 0.5;
    const s2 = Math.sin(x * 2.7 + z * 1.3) * 0.3;
    const s3 = Math.cos(y * 3.1 + x * 0.9) * 0.2;
    return s1 + s2 + s3;
  }

  /* ─── SCROLL TRACKING ─── */
  let scrollProgress = 0;
  let targetScroll = 0;

  function updateScroll() {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    targetScroll = docH > 0 ? window.scrollY / docH : 0;
  }
  window.addEventListener('scroll', updateScroll, { passive: true });
  updateScroll();

  /* ─── ANIMATION LOOP ─── */
  let raf;
  const clock = new THREE.Clock();

  function animate() {
    raf = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Smooth scroll lerp
    scrollProgress += (targetScroll - scrollProgress) * 0.05;

    // Morph geometry
    const positions = geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      const bx = basePositions[i];
      const by = basePositions[i + 1];
      const bz = basePositions[i + 2];
      const len = Math.sqrt(bx * bx + by * by + bz * bz);
      const nx = bx / len, ny = by / len, nz = bz / len;

      const freq = 1.5 + scrollProgress * 1.2;
      const amp = 0.12 + scrollProgress * 0.08;
      const displacement = noise3D(
        nx * freq + t * 0.3,
        ny * freq + t * 0.2,
        nz * freq + t * 0.15
      ) * amp;

      const newLen = len + displacement;
      positions[i] = nx * newLen;
      positions[i + 1] = ny * newLen;
      positions[i + 2] = nz * newLen;
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();

    // Gentle rotation
    mesh.rotation.x = t * 0.08 + scrollProgress * 0.5;
    mesh.rotation.y = t * 0.12 + scrollProgress * 0.8;

    // Floating hover
    mesh.position.y = Math.sin(t * 0.6) * 0.15;
    mesh.position.x = Math.sin(t * 0.4) * 0.08;

    // Color shift on scroll — from warm cream to gold to red-tinted
    const r = 0.96 - scrollProgress * 0.12;
    const g = 0.94 - scrollProgress * 0.20;
    const b = 0.92 - scrollProgress * 0.30;
    material.color.setRGB(r, g, b);

    // Scale on scroll
    const s = 1 + scrollProgress * 0.15;
    mesh.scale.set(s, s, s);

    renderer.render(scene, camera);
  }

  /* ─── RESIZE ─── */
  function onResize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== w || canvas.height !== h) {
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
  }
  window.addEventListener('resize', onResize, { passive: true });

  /* ─── VISIBILITY: pause when off-screen ─── */
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        if (!raf) animate();
      } else {
        cancelAnimationFrame(raf);
        raf = null;
      }
    });
  }, { threshold: 0 });
  observer.observe(canvas);

  animate();
})();
