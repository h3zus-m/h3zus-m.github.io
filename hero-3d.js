/**
 * HARSH MISTRY PORTFOLIO - HERO 3D SCENE: "THE INDUSTRIAL CONTINUUM"
 * Lead Creative Developer & 3D Interaction Architecture
 *
 * Concepts:
 * 1. Physical Engineering Core (ASME / CNC machined impeller hub)
 * 2. Precision Fabrication Gimbal (Automated welding / optical profilometry)
 * 3. Global Intermodal Freight Corridor (Maritime / logistics orbits)
 * 4. Analytical Decision Field (Stochastic network & telemetry markers)
 *
 * Reference: Igloo Inc. design principles (spatial restraint, PBR materials, smooth choreography, dependable fallbacks)
 */

import * as THREE from './assets/three.module.min.js';

class IndustrialContinuumHero {
  constructor() {
    this.container = document.getElementById('hero-spatial-viewport');
    this.canvas = document.getElementById('hero-3d-canvas');
    this.fallback = document.getElementById('hero-spatial-fallback');
    this.hudPhaseKicker = document.getElementById('hud-phase-kicker');
    this.hudPhaseTitle = document.getElementById('hud-phase-title');
    this.hudPhaseDesc = document.getElementById('hud-phase-desc');
    this.phaseButtons = document.querySelectorAll('.hero-phase-btn');

    if (!this.container || !this.canvas) {
      console.warn('[HERO-3D] Missing container or canvas elements.');
      return;
    }

    this.isWebGLAvailable = this.checkWebGL();
    if (!this.isWebGLAvailable) {
      console.warn('[HERO-3D] WebGL unavailable. Preserving static fallback.');
      if (this.fallback) this.fallback.classList.remove('hidden');
      return;
    }

    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Interaction state
    this.pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.isDragging = false;
    this.previousPointer = { x: 0, y: 0 };
    this.rotationVelocity = { x: 0, y: 0.003 };
    this.currentPhase = 1;
    this.targetCameraPos = new THREE.Vector3(0, 1.2, 5.8);
    this.currentCameraPos = new THREE.Vector3(0, 1.2, 5.8);
    this.targetLookAt = new THREE.Vector3(0, 0, 0);
    this.currentLookAt = new THREE.Vector3(0, 0, 0);
    this.scrollProgress = 0;
    this.isRunning = false;
    this.hasRenderedFirstFrame = false;

    this.initScene();
    this.initLights();
    this.initGeometry();
    this.initInteraction();
    this.initScroll();
    this.initPhaseHUD();
    this.initLifecycle();

    this.start();
  }

  checkWebGL() {
    try {
      const testCanvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  initScene() {
    const rect = this.container.getBoundingClientRect();
    const width = rect.width || this.container.clientWidth || 600;
    const height = rect.height || this.container.clientHeight || 600;

    this.scene = new THREE.Scene();
    // Subtle fog to blend distant geometries into deep slate background
    this.scene.fog = new THREE.FogExp2(0x080b12, 0.08);

    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    this.camera.position.copy(this.currentCameraPos);
    this.camera.lookAt(this.currentLookAt);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Group for the entire dynamic sculpture
    this.sculptureGroup = new THREE.Group();
    this.scene.add(this.sculptureGroup);
  }

  initLights() {
    // 1. Ambient architectural fill
    const ambientLight = new THREE.AmbientLight(0x0f172a, 1.2);
    this.scene.add(ambientLight);

    // 2. Primary directional key light (high studio key)
    this.keyLight = new THREE.DirectionalLight(0xf8fafc, 2.2);
    this.keyLight.position.set(6, 8, 7);
    this.scene.add(this.keyLight);

    // 3. Cinematic industrial cyan rim light (back-left silhouette)
    this.rimLight = new THREE.DirectionalLight(0x38bdf8, 3.8);
    this.rimLight.position.set(-7, 4, -5);
    this.scene.add(this.rimLight);

    // 4. Warm precision tungsten accent (underside mechanical fill)
    this.accentLight = new THREE.PointLight(0xf59e0b, 1.6, 25);
    this.accentLight.position.set(1.5, -4, 3);
    this.scene.add(this.accentLight);

    // 5. Central glowing core point light
    this.coreLight = new THREE.PointLight(0x0ea5e9, 2.5, 8);
    this.coreLight.position.set(0, 0, 0);
    this.sculptureGroup.add(this.coreLight);
  }

  initGeometry() {
    // Shared Materials
    const titaniumMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.88,
      roughness: 0.22,
      flatShading: false
    });

    const darkSteelMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.92,
      roughness: 0.38
    });

    const brushedChromeMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.95,
      roughness: 0.18
    });

    const cyanGlowMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.9,
      metalness: 0.4,
      roughness: 0.2
    });

    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.25
    });

    // -------------------------------------------------------------
    // TIER 1: PHYSICAL MECHANICAL CORE (Impeller / Turbine Rotor)
    // -------------------------------------------------------------
    this.tier1Core = new THREE.Group();

    // Central cylindrical spindle
    const spindleGeo = new THREE.CylinderGeometry(0.38, 0.38, 1.8, 32);
    const spindleMesh = new THREE.Mesh(spindleGeo, darkSteelMat);
    this.tier1Core.add(spindleMesh);

    // Center internal glowing ring
    const coreGlowGeo = new THREE.CylinderGeometry(0.39, 0.39, 0.35, 32);
    const coreGlowMesh = new THREE.Mesh(coreGlowGeo, cyanGlowMat);
    this.tier1Core.add(coreGlowMesh);

    // CNC Turbine / Impeller blades (12 radial helical blades)
    const bladeCount = 12;
    const bladeGeo = new THREE.BoxGeometry(0.12, 0.75, 0.45);
    for (let i = 0; i < bladeCount; i++) {
      const angle = (i / bladeCount) * Math.PI * 2;
      const blade = new THREE.Mesh(bladeGeo, titaniumMat);
      blade.position.set(Math.cos(angle) * 0.72, 0, Math.sin(angle) * 0.72);
      blade.rotation.y = -angle + 0.35;
      blade.rotation.z = 0.28;
      this.tier1Core.add(blade);
    }

    // Outer retaining shroud ring (beveled torus)
    const shroudGeo = new THREE.TorusGeometry(1.05, 0.08, 16, 64);
    const shroudMesh = new THREE.Mesh(shroudGeo, brushedChromeMat);
    shroudMesh.rotation.x = Math.PI / 2;
    this.tier1Core.add(shroudMesh);

    // Bevel gear teeth on bottom collar
    const gearCollarGeo = new THREE.CylinderGeometry(0.68, 0.68, 0.22, 24);
    const gearCollar = new THREE.Mesh(gearCollarGeo, darkSteelMat);
    gearCollar.position.y = -0.7;
    this.tier1Core.add(gearCollar);

    this.sculptureGroup.add(this.tier1Core);

    // -------------------------------------------------------------
    // TIER 2: FABRICATION & SENSOR GIMBAL (Laser profilometry ring)
    // -------------------------------------------------------------
    this.tier2Gimbal = new THREE.Group();

    const gimbalRingGeo = new THREE.TorusGeometry(1.55, 0.045, 16, 80);
    const gimbalRing = new THREE.Mesh(gimbalRingGeo, titaniumMat);
    this.tier2Gimbal.add(gimbalRing);

    // 4 Optical Profilometry Sensor Nodes with laser emitters
    const sensorGeo = new THREE.BoxGeometry(0.14, 0.14, 0.26);
    this.sensorLasers = [];
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const sensor = new THREE.Mesh(sensorGeo, darkSteelMat);
      sensor.position.set(Math.cos(angle) * 1.55, Math.sin(angle) * 1.55, 0);
      sensor.lookAt(0, 0, 0);

      // Laser guide line shooting toward center
      const laserGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -1.0)
      ]);
      const laserLine = new THREE.Line(
        laserGeo,
        new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.65 })
      );
      sensor.add(laserLine);
      this.sensorLasers.push(laserLine);

      // Subtle emitter dot
      const dotGeo = new THREE.SphereGeometry(0.04, 12, 12);
      const dotMesh = new THREE.Mesh(dotGeo, cyanGlowMat);
      dotMesh.position.z = -0.14;
      sensor.add(dotMesh);

      this.tier2Gimbal.add(sensor);
    }

    this.tier2Gimbal.rotation.x = 0.55;
    this.sculptureGroup.add(this.tier2Gimbal);

    // -------------------------------------------------------------
    // TIER 3: GLOBAL LOGISTICS CORRIDOR (Intermodal Orbital Flow)
    // -------------------------------------------------------------
    this.tier3Logistics = new THREE.Group();

    // Elliptical transit corridor ring
    const logisticsCurve = new THREE.EllipseCurve(0, 0, 2.15, 1.85, 0, Math.PI * 2, false, 0);
    const corridorPoints = logisticsCurve.getPoints(100).map(p => new THREE.Vector3(p.x, 0, p.y));
    const corridorGeo = new THREE.BufferGeometry().setFromPoints(corridorPoints);
    const corridorLine = new THREE.Line(
      corridorGeo,
      new THREE.LineBasicMaterial({ color: 0x0284c7, transparent: true, opacity: 0.55 })
    );
    this.tier3Logistics.add(corridorLine);

    // In-transit container vessel pulses (orbiting nodes)
    this.vesselNodes = [];
    const vesselGeo = new THREE.BoxGeometry(0.12, 0.08, 0.22);
    const vesselColors = [0x38bdf8, 0x10b981, 0xf59e0b];
    for (let i = 0; i < 6; i++) {
      const vMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        emissive: vesselColors[i % vesselColors.length],
        emissiveIntensity: 0.8,
        metalness: 0.8,
        roughness: 0.2
      });
      const vessel = new THREE.Mesh(vesselGeo, vMat);
      vessel.userData = { offset: i / 6, speed: 0.0018 + (i % 2) * 0.0006 };
      this.tier3Logistics.add(vessel);
      this.vesselNodes.push(vessel);
    }

    this.tier3Logistics.rotation.x = -0.35;
    this.tier3Logistics.rotation.z = 0.25;
    this.sculptureGroup.add(this.tier3Logistics);

    // -------------------------------------------------------------
    // TIER 4: ANALYTICAL DECISION FIELD (Wireframe Cage & Constellation)
    // -------------------------------------------------------------
    this.tier4Analytics = new THREE.Group();

    // Outer spherical coordinate cage
    const cageGeo = new THREE.IcosahedronGeometry(2.7, 1);
    const cageMesh = new THREE.Mesh(cageGeo, wireMat);
    this.tier4Analytics.add(cageMesh);

    // Decision Telemetry Nodes (3D Coordinate Waypoints)
    this.telemetryWaypoints = [
      { name: 'Node 01: Physical Specs', pos: new THREE.Vector3(-1.8, 1.2, 1.4), color: 0x38bdf8, phase: 1 },
      { name: 'Node 02: Robotics Telemetry', pos: new THREE.Vector3(1.7, -1.1, 1.5), color: 0x10b981, phase: 2 },
      { name: 'Node 03: Trans-Pacific Lane', pos: new THREE.Vector3(-1.4, -1.6, -1.4), color: 0xf59e0b, phase: 3 },
      { name: 'Node 04: Stochastic Inventory', pos: new THREE.Vector3(1.9, 1.5, -1.2), color: 0xa855f7, phase: 4 }
    ];

    this.telemetryWaypoints.forEach(wp => {
      const wpGroup = new THREE.Group();
      wpGroup.position.copy(wp.pos);

      // Node ring
      const ringGeo = new THREE.RingGeometry(0.08, 0.12, 16);
      const ringMat = new THREE.MeshBasicMaterial({ color: wp.color, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      wpGroup.add(ringMesh);

      // Node core
      const coreDotGeo = new THREE.SphereGeometry(0.045, 12, 12);
      const coreDotMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const coreDot = new THREE.Mesh(coreDotGeo, coreDotMat);
      wpGroup.add(coreDot);

      // Connective line to origin
      const rayGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        wp.pos.clone().multiplyScalar(-0.4)
      ]);
      const rayLine = new THREE.Line(
        rayGeo,
        new THREE.LineDashedMaterial({ color: wp.color, dashSize: 0.1, gapSize: 0.05, transparent: true, opacity: 0.35 })
      );
      rayLine.computeLineDistances();
      wpGroup.add(rayLine);

      this.tier4Analytics.add(wpGroup);
    });

    this.sculptureGroup.add(this.tier4Analytics);

    // -------------------------------------------------------------
    // VOLUMETRIC DUST FIELD (Atmospheric depth particles)
    // -------------------------------------------------------------
    const particleCount = 420;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const radius = 1.8 + Math.random() * 3.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3]     = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      scales[i] = Math.random();
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.038,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });

    this.dustParticles = new THREE.Points(particleGeo, particleMat);
    this.scene.add(this.dustParticles);
  }

  initInteraction() {
    // Mouse / Pointer motion tracking for damped parallax
    const onPointerMove = (e) => {
      const rect = this.container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      this.pointer.targetX = Math.max(-1, Math.min(1, x));
      this.pointer.targetY = Math.max(-1, Math.min(1, y));

      if (this.isDragging) {
        const deltaX = e.clientX - this.previousPointer.x;
        const deltaY = e.clientY - this.previousPointer.y;

        this.sculptureGroup.rotation.y += deltaX * 0.007;
        this.sculptureGroup.rotation.x += deltaY * 0.007;

        this.rotationVelocity.y = deltaX * 0.002;
        this.rotationVelocity.x = deltaY * 0.002;

        this.previousPointer.x = e.clientX;
        this.previousPointer.y = e.clientY;
      }
    };

    const onPointerDown = (e) => {
      this.isDragging = true;
      this.previousPointer.x = e.clientX;
      this.previousPointer.y = e.clientY;
    };

    const onPointerUp = () => {
      this.isDragging = false;
    };

    this.container.addEventListener('mousemove', onPointerMove, { passive: true });
    this.container.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mouseup', onPointerUp);

    // Touch support for mobile devices
    this.container.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        onPointerMove(touch);
      }
    }, { passive: true });

    this.container.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        onPointerDown(e.touches[0]);
      }
    }, { passive: true });

    window.addEventListener('touchend', onPointerUp, { passive: true });

    // Window resize handler
    window.addEventListener('resize', () => this.onResize(), { passive: true });
  }

  initScroll() {
    // Scroll-driven camera glides and depth transitions toward selected work
    const heroSection = document.getElementById('hero');
    if (!heroSection) return;

    window.addEventListener('scroll', () => {
      const rect = heroSection.getBoundingClientRect();
      const totalHeight = heroSection.offsetHeight;
      const scrolled = -rect.top;
      this.scrollProgress = Math.max(0, Math.min(1, scrolled / totalHeight));

      // As user scrolls down, push camera out and shift angle
      if (this.scrollProgress > 0) {
        this.camera.position.z = this.currentCameraPos.z + this.scrollProgress * 2.2;
        this.camera.position.y = this.currentCameraPos.y - this.scrollProgress * 1.0;
        this.sculptureGroup.position.y = -this.scrollProgress * 1.2;
      }
    }, { passive: true });
  }

  initPhaseHUD() {
    const phaseData = {
      1: {
        kicker: "PHASE 01 // MECHANICAL FOUNDATION",
        title: "Precision Engineering & Physical Rigor",
        desc: "ASME Sec VIII pressure equipment, machined turbine impeller architectures, and tight dimensional tolerances (±0.02mm) anchoring physical systems ownership.",
        camera: new THREE.Vector3(0, 0.4, 4.2),
        lookAt: new THREE.Vector3(0, 0, 0)
      },
      2: {
        kicker: "PHASE 02 // AUTOMATED FABRICATION",
        title: "Robotic Welding & In-Process Inspection",
        desc: "Laser optical profilometry and automated weld seam tracking at Larsen & Toubro, delivering a 20% defect speed lift and real-time variance detection.",
        camera: new THREE.Vector3(-1.8, 1.2, 4.6),
        lookAt: new THREE.Vector3(-0.3, 0.2, 0)
      },
      3: {
        kicker: "PHASE 03 // GLOBAL LOGISTICS",
        title: "Intermodal Corridors & Port Dwell Buffers",
        desc: "Trans-Pacific freight management, container demurrage reduction, and dynamic 14-day port buffer policies translating transit variance into predictable inventory.",
        camera: new THREE.Vector3(2.2, -0.8, 4.8),
        lookAt: new THREE.Vector3(0.5, -0.2, 0)
      },
      4: {
        kicker: "PHASE 04 // DECISION INTELLIGENCE",
        title: "Stochastic Optimization & Operations Analytics",
        desc: "Sizing $1.2M annual sourcing leverage at Generac, Pareto warehouse slotting, and guaranteed-service inventory modeling built on USC Viterbi research.",
        camera: new THREE.Vector3(0, 1.8, 5.5),
        lookAt: new THREE.Vector3(0, 0.3, 0)
      }
    };

    this.phaseButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const phaseNum = parseInt(btn.getAttribute('data-phase'), 10);
        if (!phaseData[phaseNum]) return;

        this.currentPhase = phaseNum;

        this.phaseButtons.forEach(b => {
          const isActive = (b === btn);
          b.classList.toggle('active', isActive);
          b.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        const data = phaseData[phaseNum];
        if (this.hudPhaseKicker) this.hudPhaseKicker.textContent = data.kicker;
        if (this.hudPhaseTitle) this.hudPhaseTitle.textContent = data.title;
        if (this.hudPhaseDesc) this.hudPhaseDesc.textContent = data.desc;

        this.targetCameraPos.copy(data.camera);
        this.targetLookAt.copy(data.lookAt);
      });
    });
  }

  initLifecycle() {
    // 1. IntersectionObserver: Pause render loop when Hero is offscreen
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!this.isRunning) this.start();
        } else {
          this.stop();
        }
      });
    }, { threshold: 0.05 });

    const heroSection = document.getElementById('hero');
    if (heroSection) this.observer.observe(heroSection);

    // 2. Tab Visibility: Pause when browser tab is backgrounded
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stop();
      } else {
        const rect = heroSection?.getBoundingClientRect();
        if (rect && rect.bottom > 0 && rect.top < window.innerHeight) {
          this.start();
        }
      }
    });
  }

  onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const rect = this.container.getBoundingClientRect();
    const width = rect.width || this.container.clientWidth;
    const height = rect.height || this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.animate();
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  animate() {
    if (!this.isRunning) return;
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    // Damp pointer interpolation
    this.pointer.x += (this.pointer.targetX - this.pointer.x) * 0.05;
    this.pointer.y += (this.pointer.targetY - this.pointer.y) * 0.05;

    // Smooth camera choreography towards target positions
    this.currentCameraPos.lerp(this.targetCameraPos, 0.04);
    this.currentLookAt.lerp(this.targetLookAt, 0.04);

    this.camera.position.x = this.currentCameraPos.x + this.pointer.x * 0.6;
    this.camera.position.y = this.currentCameraPos.y + this.pointer.y * 0.4;
    this.camera.position.z = this.currentCameraPos.z;
    this.camera.lookAt(this.currentLookAt);

    // Inertial rotation
    if (!this.prefersReducedMotion) {
      if (!this.isDragging) {
        this.sculptureGroup.rotation.y += this.rotationVelocity.y;
        this.sculptureGroup.rotation.x += this.rotationVelocity.x;
        // Damp rotational velocity back to base idle speed
        this.rotationVelocity.y += (0.0028 - this.rotationVelocity.y) * 0.03;
        this.rotationVelocity.x += (0.0000 - this.rotationVelocity.x) * 0.05;
      }

      // Counter-rotations for mechanical gimbals
      if (this.tier1Core) this.tier1Core.rotation.y += 0.004;
      if (this.tier2Gimbal) this.tier2Gimbal.rotation.z -= 0.003;
      if (this.tier3Logistics) this.tier3Logistics.rotation.y += 0.002;
      if (this.tier4Analytics) this.tier4Analytics.rotation.y -= 0.001;

      // Pulse orbiting logistics vessels
      if (this.vesselNodes) {
        const time = performance.now() * 0.001;
        this.vesselNodes.forEach(vessel => {
          const t = (time * vessel.userData.speed + vessel.userData.offset) % 1;
          const angle = t * Math.PI * 2;
          vessel.position.set(Math.cos(angle) * 2.15, 0, Math.sin(angle) * 1.85);
          vessel.rotation.y = -angle + Math.PI / 2;
        });
      }

      // Drift dust particles
      if (this.dustParticles) {
        this.dustParticles.rotation.y += 0.0006;
      }
    }

    this.renderer.render(this.scene, this.camera);

    // Hide fallback smoothly after first verified render frame
    if (!this.hasRenderedFirstFrame) {
      this.hasRenderedFirstFrame = true;
      if (this.fallback) {
        this.fallback.classList.add('rendered-hidden');
      }
    }
  }
}

// Auto-initialize when DOM ready
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', () => {
    new IndustrialContinuumHero();
  });
} else {
  new IndustrialContinuumHero();
}
