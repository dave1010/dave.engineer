import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const parallaxLayers = Array.from(document.querySelectorAll("[data-parallax-depth]"));
let pointerX = 0;
let pointerY = 0;
let animationFrameId = null;

const PARALLAX_POINTER_MULTIPLIER = 120;
const PARALLAX_SCROLL_MULTIPLIER = 160;

const applyParallax = () => {
  animationFrameId = null;
  const scrollFactor = window.scrollY / window.innerHeight || 0;

  parallaxLayers.forEach((layer) => {
    const depth = parseFloat(layer.dataset.parallaxDepth || "0");
    if (Number.isNaN(depth)) return;
    const translateX = pointerX * depth * PARALLAX_POINTER_MULTIPLIER;
    const translateY =
      pointerY * depth * PARALLAX_POINTER_MULTIPLIER + scrollFactor * depth * -PARALLAX_SCROLL_MULTIPLIER;
    layer.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
  });
};

const scheduleParallax = () => {
  if (parallaxLayers.length === 0) return;
  if (animationFrameId) return;
  animationFrameId = window.requestAnimationFrame(applyParallax);
};

window.addEventListener(
  "mousemove",
  (event) => {
    pointerX = clamp(event.clientX / window.innerWidth - 0.5, -0.75, 0.75) * 2;
    pointerY = clamp(event.clientY / window.innerHeight - 0.5, -0.75, 0.75) * 2;
    scheduleParallax();
  },
  { passive: true },
);

window.addEventListener(
  "scroll",
  () => {
    scheduleParallax();
  },
  { passive: true },
);

scheduleParallax();

const initialiseOrb = () => {
  const canvas = document.getElementById("hero-orb");
  if (!canvas) return;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x060b13, 0.12);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 50);
  camera.position.set(0, 0, 4.4);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const resizeRenderer = () => {
    const { clientWidth, clientHeight } = canvas;
    if (clientHeight === 0 || clientWidth === 0) return;
    const dpr = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(clientWidth, clientHeight, false);
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
  };

  const group = new THREE.Group();

  const coreGeometry = new THREE.IcosahedronGeometry(1.4, 2);
  const coreMaterial = new THREE.MeshStandardMaterial({
    color: 0x7d5af0,
    wireframe: true,
    emissive: 0x13c2c2,
    emissiveIntensity: 0.35,
    transparent: true,
    opacity: 0.9,
  });
  const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
  group.add(coreMesh);

  const haloGeometry = new THREE.TorusKnotGeometry(1.35, 0.18, 180, 24, 2, 3);
  const haloMaterial = new THREE.MeshBasicMaterial({
    color: 0x19ffb6,
    wireframe: true,
    transparent: true,
    opacity: 0.25,
  });
  const haloMesh = new THREE.Mesh(haloGeometry, haloMaterial);
  group.add(haloMesh);

  const pointsGeometry = new THREE.BufferGeometry();
  const points = [];
  const pointCount = 600;
  for (let i = 0; i < pointCount; i += 1) {
    const phi = Math.acos(1 - 2 * Math.random());
    const theta = 2 * Math.PI * Math.random();
    const radius = 2.1 + Math.random() * 0.3;
    points.push(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.sin(phi) * Math.sin(theta),
      radius * Math.cos(phi),
    );
  }
  pointsGeometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
  const pointsMaterial = new THREE.PointsMaterial({
    color: 0x7d5af0,
    size: 0.025,
    transparent: true,
    opacity: 0.5,
  });
  const pointsCloud = new THREE.Points(pointsGeometry, pointsMaterial);
  group.add(pointsCloud);

  scene.add(group);

  const ambientLight = new THREE.AmbientLight(0x172033, 0.8);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0x7d5af0, 0.8);
  directionalLight.position.set(2, 2, 3);
  scene.add(directionalLight);
  const rimLight = new THREE.PointLight(0x19ffb6, 0.5, 12);
  rimLight.position.set(-3, -2, 2);
  scene.add(rimLight);

  resizeRenderer();

  const clock = new THREE.Clock();
  let autoRotate = { x: 0, y: 0 };

  const animate = () => {
    const elapsed = clock.getElapsedTime();
    autoRotate = {
      x: Math.sin(elapsed * 0.3) * 0.2,
      y: Math.cos(elapsed * 0.25) * 0.2,
    };
    group.rotation.x += 0.003 + autoRotate.x * 0.0015;
    group.rotation.y += 0.004 + autoRotate.y * 0.0015;
    haloMesh.rotation.y -= 0.006;
    haloMesh.rotation.x += 0.002;
    pointsCloud.rotation.y -= 0.0025;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  const pointerVector = new THREE.Vector2();
  window.addEventListener(
    "pointermove",
    (event) => {
      const bounds = canvas.getBoundingClientRect();
      pointerVector.x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      pointerVector.y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
      group.rotation.x += pointerVector.y * 0.0025;
      group.rotation.y += pointerVector.x * 0.0025;
    },
    { passive: true },
  );

  window.addEventListener("resize", resizeRenderer, { passive: true });

  animate();
};

initialiseOrb();
