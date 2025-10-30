(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const layers = Array.from(document.querySelectorAll('[data-parallax-depth]'));
  if (!prefersReducedMotion && layers.length) {
    let pointerX = 0;
    let pointerY = 0;
    let currentX = 0;
    let currentY = 0;

    const dampen = () => {
      currentX += (pointerX - currentX) * 0.08;
      currentY += (pointerY - currentY) * 0.08;
      layers.forEach((layer) => {
        const depth = Number(layer.getAttribute('data-parallax-depth')) || 0;
        const x = currentX * depth * 18;
        const y = currentY * depth * 18;
        layer.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      });
      requestAnimationFrame(dampen);
    };

    window.addEventListener('pointermove', (event) => {
      const ratioX = (event.clientX / window.innerWidth) * 2 - 1;
      const ratioY = (event.clientY / window.innerHeight) * 2 - 1;
      pointerX = ratioX;
      pointerY = ratioY;
    });

    dampen();
  }
})();

(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const tiltTargets = document.querySelectorAll('[data-tilt]');
  tiltTargets.forEach((target) => {
    target.style.transformStyle = 'preserve-3d';
    target.addEventListener('pointermove', (event) => {
      const rect = target.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      const rotateX = (-y * 16).toFixed(2);
      const rotateY = (x * 16).toFixed(2);
      target.style.transition = 'transform 120ms ease';
      target.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(8px)`;
    });

    target.addEventListener('pointerleave', () => {
      target.style.transition = 'transform 400ms ease';
      target.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)';
    });

    target.addEventListener('pointerdown', () => {
      target.style.transition = 'transform 80ms ease';
      target.style.transform += ' scale(0.98)';
    });

    target.addEventListener('pointerup', () => {
      target.style.transition = 'transform 180ms ease';
      target.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)';
    });
  });
})();

(() => {
  const container = document.getElementById('hero-3d');
  if (!container || typeof THREE === 'undefined' || !THREE.WebGLRenderer) {
    return;
  }

  const fallback = document.createElement('div');
  fallback.textContent = 'Rendering leadership vector field…';
  fallback.style.position = 'absolute';
  fallback.style.inset = '0';
  fallback.style.display = 'flex';
  fallback.style.alignItems = 'center';
  fallback.style.justifyContent = 'center';
  fallback.style.fontFamily = 'JetBrains Mono, monospace';
  fallback.style.fontSize = '0.7rem';
  fallback.style.letterSpacing = '0.3em';
  fallback.style.textTransform = 'uppercase';
  fallback.style.color = 'rgba(165, 243, 252, 0.6)';
  container.appendChild(fallback);

  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const resizeRenderer = () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    renderer.setSize(width, height, false);
  };
  resizeRenderer();
  container.appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(42, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.z = 6;

  const geometry = new THREE.TorusKnotGeometry(1.6, 0.42, 320, 48);
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x5eead4,
    emissive: 0x0891b2,
    emissiveIntensity: 0.6,
    roughness: 0.25,
    metalness: 0.45,
    transparent: true,
    opacity: 0.92,
    clearcoat: 0.6,
    clearcoatRoughness: 0.15,
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const wireframe = new THREE.LineSegments(new THREE.WireframeGeometry(geometry), new THREE.LineBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.35 }));
  scene.add(wireframe);

  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);
  const point = new THREE.PointLight(0xf472b6, 1.1, 20);
  point.position.set(3, 3, 5);
  scene.add(point);
  const cyanLight = new THREE.PointLight(0x22d3ee, 0.8, 18);
  cyanLight.position.set(-3, -4, 4);
  scene.add(cyanLight);

  const pointer = { x: 0, y: 0 };
  container.addEventListener('pointermove', (event) => {
    const rect = container.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
  });

  const clock = new THREE.Clock();

  const renderScene = () => {
    const elapsed = clock.getElapsedTime();
    mesh.rotation.x = elapsed * 0.35 + pointer.y * 0.25;
    mesh.rotation.y = elapsed * 0.4 + pointer.x * 0.25;
    wireframe.rotation.x = mesh.rotation.x;
    wireframe.rotation.y = mesh.rotation.y;

    point.position.x = 3 + pointer.x * 2.5;
    point.position.y = 3 + pointer.y * 2.5;
    cyanLight.position.x = -3 - pointer.x * 1.5;
    cyanLight.position.y = -4 - pointer.y * 1.5;

    renderer.render(scene, camera);
    requestAnimationFrame(renderScene);
  };

  renderScene();
  fallback.remove();

  const handleResize = () => {
    const { clientWidth, clientHeight } = container;
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
    resizeRenderer();
  };

  window.addEventListener('resize', handleResize);
})();
