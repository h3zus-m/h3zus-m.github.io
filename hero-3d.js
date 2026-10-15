/**
 * HARSH MISTRY PORTFOLIO - HERO 3D NARRATIVE ENGINE
 * "The Berserker Sword Opening the World of Industrial Systems"
 *
 * Governing Chapters:
 * 00. The Entrance: Berserker Avatar & Greatsword Monolith Cleave
 * 01. Generac Power Systems: Explodable PWRmicro Solar Inverter & PCBA Sourcing
 * 02. USC Distribution Center: Kinetic Warehouse Topology & Slotting
 * 03. Precision Fabrication: Robotic Welding & Optical Profilometry
 * 04. Global Analytics: Multi-Echelon Supply Network Decision Workbench
 *
 * Architecture:
 * - Built on self-contained Three.js r160 ES module (zero CDN dependency)
 * - Hierarchical articulated character model with weight-transfer forward kinematics
 * - 4-6s cinematic strike sequence with luminous portal fissure & flythrough
 * - Accessible HTML evidence drawer for component-to-sourcing analysis
 * - Lifecycle observers (IntersectionObserver, visibilitychange, prefers-reduced-motion)
 */

import * as THREE from './assets/three.module.min.js';

export class BerserkerIndustrialEngine {
  constructor() {
    this.container = document.getElementById('hero-spatial-viewport');
    this.canvas = document.getElementById('hero-3d-canvas');
    this.fallback = document.getElementById('hero-spatial-fallback');

    // UI elements
    this.enterBtn = document.getElementById('btn-enter-world');
    this.skipBtn = document.getElementById('btn-skip-intro');
    this.hudKicker = document.getElementById('hud-phase-kicker');
    this.hudTitle = document.getElementById('hud-phase-title');
    this.hudDesc = document.getElementById('hud-phase-desc');
    this.phaseButtons = document.querySelectorAll('.hero-phase-btn');
    this.evidenceDrawer = document.getElementById('generac-evidence-drawer');

    if (!this.container || !this.canvas) {
      console.warn('[3D-ENGINE] Missing container or canvas elements.');
      return;
    }

    if (!this.checkWebGL()) {
      console.warn('[3D-ENGINE] WebGL not supported. Fallback active.');
      if (this.fallback) this.fallback.classList.remove('hidden');
      return;
    }

    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // State Machine
    // 'ENTRANCE_IDLE', 'ENTRANCE_STRIKE', 'GENERAC_VIEW', 'CONTINUUM_VIEW'
    this.currentState = 'ENTRANCE_IDLE';
    this.container.classList.add('entrance-active');
    this.container.classList.remove('generac-active');
    this.isExploded = false;
    this.selectedComponent = 'mosfet';
    this.strikeTime = 0;
    this.isStriking = false;
    this.isRunning = false;
    this.hasRenderedFirstFrame = false;

    // Camera & Interaction
    this.pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.isDragging = false;
    this.previousPointer = { x: 0, y: 0 };
    this.currentCameraPos = new THREE.Vector3(0, 1.3, 5.2);
    this.targetCameraPos = new THREE.Vector3(0, 1.3, 5.2);
    this.currentLookAt = new THREE.Vector3(0, 0.4, 0);
    this.targetLookAt = new THREE.Vector3(0, 0.4, 0);

    // Component Explode Offsets
    this.explodeProgress = 0;
    this.targetExplodeProgress = 0;

    this.initScene();
    this.initLights();
    this.initBerserkerAvatar();
    this.initMonolithPortal();
    this.initGeneracMicroinverter();
    this.initIndustrialContinuumSculpture();
    this.initSparksParticleSystem();
    this.initInteraction();
    this.initUI();
    this.initLifecycle();

    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    if (hash === '#generac' || search.includes('chapter=generac')) {
      this.skipToGenerac();
    }

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
    const height = rect.height || this.container.clientHeight || 550;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x070a12, 0.07);

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
    this.renderer.toneMappingExposure = 1.25;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Master Groups
    this.entranceGroup = new THREE.Group();
    this.generacGroup = new THREE.Group();
    this.continuumGroup = new THREE.Group();

    this.scene.add(this.entranceGroup);
    this.scene.add(this.generacGroup);
    this.scene.add(this.continuumGroup);

    // Initial position: Generac sits behind the monolith portal along Z
    this.generacGroup.position.set(0, 0, -8);
    this.generacGroup.visible = true;

    this.continuumGroup.position.set(0, 0, -20);
    this.continuumGroup.visible = false;
  }

  initLights() {
    const ambientLight = new THREE.AmbientLight(0xdde8f8, 0.8);
    this.scene.add(ambientLight);

    // Studio Key Light (Sculpts armor plates and casing)
    this.keyLight = new THREE.DirectionalLight(0xe8f0ff, 2.6);
    this.keyLight.position.set(4, 6, 5);
    this.scene.add(this.keyLight);

    // Atmospheric Cyan Fill Light (Deep industrial glow)
    this.fillLight = new THREE.DirectionalLight(0x0ea5e9, 1.8);
    this.fillLight.position.set(-5, -2, 2);
    this.scene.add(this.fillLight);

    // Rim / Back Light (Sharpening silhouette and greatsword edge)
    this.rimLight = new THREE.DirectionalLight(0xf97316, 2.2);
    this.rimLight.position.set(0, 5, -4);
    this.scene.add(this.rimLight);
  }

  /* =========================================================================
   * CHAPTER 00: BERSERKER AVATAR & GREATSWORD RIG
   * ========================================================================= */
  initBerserkerAvatar() {
    this.avatar = new THREE.Group();
    this.avatar.position.set(0, -1.2, 1.2);

    // Materials: Dark worn industrial steel and heavy textured cloak
    const steelMat = new THREE.MeshStandardMaterial({
      color: 0x1a2230,
      metalness: 0.88,
      roughness: 0.28
    });

    const darkTrimMat = new THREE.MeshStandardMaterial({
      color: 0x0e131d,
      metalness: 0.92,
      roughness: 0.22
    });

    const cloakMat = new THREE.MeshStandardMaterial({
      color: 0x111622,
      roughness: 0.85,
      metalness: 0.1
    });

    const bladeMat = new THREE.MeshStandardMaterial({
      color: 0xc8d4e4,
      metalness: 0.95,
      roughness: 0.14
    });

    // 1. Torso & Armor Cuirass
    this.torso = new THREE.Group();
    this.torso.position.set(0, 1.35, 0);

    const chestGeo = new THREE.BoxGeometry(0.58, 0.65, 0.38);
    const chest = new THREE.Mesh(chestGeo, steelMat);
    this.torso.add(chest);

    // Abdominal Armor Lames
    const abGeo = new THREE.CylinderGeometry(0.24, 0.26, 0.42, 16);
    const ab = new THREE.Mesh(abGeo, darkTrimMat);
    ab.position.set(0, -0.38, 0.02);
    this.torso.add(ab);

    // Heavy Pauldrons (Shoulder Guards)
    const pauldronGeo = new THREE.SphereGeometry(0.22, 16, 12, 0, Math.PI * 2, 0, Math.PI / 1.7);
    const pauldronL = new THREE.Mesh(pauldronGeo, steelMat);
    pauldronL.position.set(-0.38, 0.25, 0);
    pauldronL.rotation.z = Math.PI / 4;
    this.torso.add(pauldronL);

    const pauldronR = new THREE.Mesh(pauldronGeo, steelMat);
    pauldronR.position.set(0.38, 0.25, 0);
    pauldronR.rotation.z = -Math.PI / 4;
    this.torso.add(pauldronR);

    // Flowing Fabric Cloak (Curved mesh cascading behind back)
    const cloakGeo = new THREE.CylinderGeometry(0.38, 0.72, 1.8, 16, 4, true, -Math.PI / 1.5, Math.PI * 1.3);
    this.cloak = new THREE.Mesh(cloakGeo, cloakMat);
    this.cloak.position.set(0, -0.4, -0.16);
    this.cloak.rotation.y = Math.PI;
    this.torso.add(this.cloak);

    // Head / Hood Silhouette
    const headGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x131a26, roughness: 0.7 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(0, 0.52, 0.04);
    this.torso.add(head);

    // 2. Arms & Forearms (Hierarchical joints for strike kinematics)
    this.armL = new THREE.Group();
    this.armL.position.set(-0.35, 0.2, 0);
    const armLGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.42, 12);
    const armLMesh = new THREE.Mesh(armLGeo, steelMat);
    armLMesh.position.set(0, -0.21, 0);
    this.armL.add(armLMesh);

    this.forearmL = new THREE.Group();
    this.forearmL.position.set(0, -0.42, 0);
    const forearmLMesh = new THREE.Mesh(armLGeo, darkTrimMat);
    forearmLMesh.position.set(0, -0.21, 0.05);
    forearmLMesh.rotation.x = Math.PI / 6;
    this.forearmL.add(forearmLMesh);
    this.armL.add(this.forearmL);
    this.torso.add(this.armL);

    this.armR = new THREE.Group();
    this.armR.position.set(0.35, 0.2, 0);
    const armRMesh = new THREE.Mesh(armLGeo, steelMat);
    armRMesh.position.set(0, -0.21, 0);
    this.armR.add(armRMesh);

    this.forearmR = new THREE.Group();
    this.forearmR.position.set(0, -0.42, 0);
    const forearmRMesh = new THREE.Mesh(armLGeo, darkTrimMat);
    forearmRMesh.position.set(0, -0.21, 0.05);
    forearmRMesh.rotation.x = Math.PI / 6;
    this.forearmR.add(forearmRMesh);
    this.armR.add(this.forearmR);
    this.torso.add(this.armR);

    // 3. Lower Body (Legs & Sabaton Boots in Grounded Stance)
    this.legs = new THREE.Group();
    this.legs.position.set(0, 0.7, 0);

    const legGeo = new THREE.CylinderGeometry(0.12, 0.09, 0.8, 12);
    const legL = new THREE.Mesh(legGeo, steelMat);
    legL.position.set(-0.24, -0.4, 0);
    legL.rotation.z = -0.08;
    this.legs.add(legL);

    const legR = new THREE.Mesh(legGeo, steelMat);
    legR.position.set(0.24, -0.4, 0);
    legR.rotation.z = 0.08;
    this.legs.add(legR);

    // Armored Sabatons
    const bootGeo = new THREE.BoxGeometry(0.16, 0.14, 0.32);
    const bootL = new THREE.Mesh(bootGeo, darkTrimMat);
    bootL.position.set(-0.27, -0.82, 0.06);
    this.legs.add(bootL);

    const bootR = new THREE.Mesh(bootGeo, darkTrimMat);
    bootR.position.set(0.27, -0.82, 0.06);
    this.legs.add(bootR);

    this.avatar.add(this.torso);
    this.avatar.add(this.legs);

    // 4. The Monolithic Greatsword (2.2m industrial blade resting vertically)
    this.swordGroup = new THREE.Group();
    // Positioned in front of the avatar, resting point-down
    this.swordGroup.position.set(0, 0.65, 0.42);

    // Blade
    const bladeGeo = new THREE.BoxGeometry(0.22, 1.7, 0.04);
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.position.set(0, -0.5, 0);
    this.swordGroup.add(blade);

    // Fuller (Central groove)
    const fullerGeo = new THREE.BoxGeometry(0.06, 1.4, 0.045);
    const fuller = new THREE.Mesh(fullerGeo, darkTrimMat);
    fuller.position.set(0, -0.45, 0);
    this.swordGroup.add(fuller);

    // Crossguard
    const guardGeo = new THREE.BoxGeometry(0.68, 0.08, 0.1);
    const guard = new THREE.Mesh(guardGeo, steelMat);
    guard.position.set(0, 0.38, 0);
    this.swordGroup.add(guard);

    // Grip (Two-handed leather wrap)
    const gripGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.46, 12);
    const gripMat = new THREE.MeshStandardMaterial({ color: 0x1c1712, roughness: 0.9 });
    const grip = new THREE.Mesh(gripGeo, gripMat);
    grip.position.set(0, 0.65, 0);
    this.swordGroup.add(grip);

    // Pommel (Faceted counterbalance)
    const pommelGeo = new THREE.DodecahedronGeometry(0.08);
    const pommel = new THREE.Mesh(pommelGeo, steelMat);
    pommel.position.set(0, 0.92, 0);
    this.swordGroup.add(pommel);

    this.avatar.add(this.swordGroup);
    this.entranceGroup.add(this.avatar);
  }

  /* =========================================================================
   * MONOLITH WALL & LUMINOUS SPLITTING SEAM
   * ========================================================================= */
  initMonolithPortal() {
    this.portalGroup = new THREE.Group();
    this.portalGroup.position.set(0, 0.6, 0);

    const slabMat = new THREE.MeshStandardMaterial({
      color: 0x0f141e,
      metalness: 0.75,
      roughness: 0.45
    });

    // Left and Right Architectural Slabs (Divide at X = 0)
    const slabGeo = new THREE.BoxGeometry(2.8, 4.4, 0.4);
    this.slabLeft = new THREE.Mesh(slabGeo, slabMat);
    this.slabLeft.position.set(-1.42, 0, 0);
    this.portalGroup.add(this.slabLeft);

    this.slabRight = new THREE.Mesh(slabGeo, slabMat);
    this.slabRight.position.set(1.42, 0, 0);
    this.portalGroup.add(this.slabRight);

    // Glowing Laser Seam (Emissive fissure line)
    const seamGeo = new THREE.PlaneGeometry(0.06, 4.3);
    this.seamMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    this.seam = new THREE.Mesh(seamGeo, this.seamMat);
    this.seam.position.set(0, 0, 0.21);
    this.portalGroup.add(this.seam);

    this.entranceGroup.add(this.portalGroup);
  }

  initSparksParticleSystem() {
    const sparkCount = 60;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(sparkCount * 3);
    const velocities = [];

    for (let i = 0; i < sparkCount; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;

      velocities.push(new THREE.Vector3(
        (Math.random() - 0.5) * 4.5,
        Math.random() * 3.5 + 1.0,
        (Math.random() - 0.5) * 3.5
      ));
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xf97316,
      size: 0.08,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    });

    this.sparks = new THREE.Points(geometry, material);
    this.sparks.userData = { velocities, active: false, timer: 0 };
    this.sparks.position.set(0, -0.2, 0.4);
    this.entranceGroup.add(this.sparks);
  }

  /* =========================================================================
   * CHAPTER 01: GENERAC PWRmicro SOLAR INVERTER & PCBA SOURCING MODEL
   * ========================================================================= */
  initGeneracMicroinverter() {
    this.generacModel = new THREE.Group();

    // Materials: Die-cast aluminum casing, heatsink fins, FR-4 PCB
    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x222a36,
      metalness: 0.85,
      roughness: 0.32
    });

    const finMat = new THREE.MeshStandardMaterial({
      color: 0x2d3748,
      metalness: 0.88,
      roughness: 0.28
    });

    const pcbMat = new THREE.MeshStandardMaterial({
      color: 0x0f291e, // Deep green FR-4
      metalness: 0.35,
      roughness: 0.45
    });

    // 1. Lower Aluminum Base Chassis
    const baseGeo = new THREE.BoxGeometry(2.4, 0.4, 1.8);
    this.generacBase = new THREE.Mesh(baseGeo, chassisMat);
    this.generacBase.position.set(0, -0.3, 0);
    this.generacModel.add(this.generacBase);

    // Mounting Bracket Flange Tabs
    const flangeGeo = new THREE.BoxGeometry(2.8, 0.08, 0.6);
    const flange = new THREE.Mesh(flangeGeo, chassisMat);
    flange.position.set(0, -0.45, -0.8);
    this.generacBase.add(flange);

    // 2. High-Density PCBA Assembly
    this.pcba = new THREE.Group();
    this.pcba.position.set(0, 0.0, 0);

    const pcbBoard = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.06, 1.5), pcbMat);
    this.pcba.add(pcbBoard);

    // Component A: Power MOSFET Array (6x TO-247 packages)
    this.mosfetGroup = new THREE.Group();
    this.mosfetGroup.name = 'mosfet';
    const mosfetGeo = new THREE.BoxGeometry(0.18, 0.22, 0.08);
    const mosfetMat = new THREE.MeshStandardMaterial({ color: 0x181e26, roughness: 0.4, metalness: 0.6 });
    const tabMat = new THREE.MeshStandardMaterial({ color: 0xd8e2ed, roughness: 0.2, metalness: 0.95 });

    for (let i = 0; i < 6; i++) {
      const mosfet = new THREE.Mesh(mosfetGeo, mosfetMat);
      const tab = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.02), tabMat);
      tab.position.set(0, 0.12, -0.035);
      mosfet.add(tab);
      mosfet.position.set(-0.75 + (i * 0.3), 0.12, -0.45);
      this.mosfetGroup.add(mosfet);
    }
    this.pcba.add(this.mosfetGroup);

    // Component B: Toroidal Inductors (2x copper power coils)
    this.inductorGroup = new THREE.Group();
    this.inductorGroup.name = 'inductor';
    const toroidGeo = new THREE.TorusGeometry(0.2, 0.085, 16, 32);
    const copperMat = new THREE.MeshStandardMaterial({ color: 0xc86432, roughness: 0.35, metalness: 0.85 });

    const toroid1 = new THREE.Mesh(toroidGeo, copperMat);
    toroid1.rotation.x = Math.PI / 2;
    toroid1.position.set(-0.45, 0.12, 0.15);
    this.inductorGroup.add(toroid1);

    const toroid2 = new THREE.Mesh(toroidGeo, copperMat);
    toroid2.rotation.x = Math.PI / 2;
    toroid2.position.set(0.25, 0.12, 0.15);
    this.inductorGroup.add(toroid2);
    this.pcba.add(this.inductorGroup);

    // Component C: Film Capacitors (4x high-voltage box units)
    this.capacitorGroup = new THREE.Group();
    this.capacitorGroup.name = 'capacitor';
    const capGeo = new THREE.BoxGeometry(0.25, 0.32, 0.18);
    const capMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.5, metalness: 0.2 });

    for (let i = 0; i < 4; i++) {
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.set(0.65, 0.18, -0.4 + (i * 0.26));
      this.capacitorGroup.add(cap);
    }
    this.pcba.add(this.capacitorGroup);

    // Component D: Microcontroller / DSP IC
    this.mcuGroup = new THREE.Group();
    this.mcuGroup.name = 'mcu';
    const mcuGeo = new THREE.BoxGeometry(0.28, 0.05, 0.28);
    const mcuMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.3, metalness: 0.7 });
    const mcu = new THREE.Mesh(mcuGeo, mcuMat);
    mcu.position.set(-0.25, 0.06, -0.05);
    this.mcuGroup.add(mcu);
    this.pcba.add(this.mcuGroup);

    // Component E: Waterproof DC Terminals
    this.connectorGroup = new THREE.Group();
    this.connectorGroup.name = 'connector';
    const connGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.45, 16);
    const connMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.5 });
    const conn1 = new THREE.Mesh(connGeo, connMat);
    conn1.rotation.z = Math.PI / 2;
    conn1.position.set(-1.15, 0, 0.3);
    this.connectorGroup.add(conn1);
    const conn2 = new THREE.Mesh(connGeo, connMat);
    conn2.rotation.z = Math.PI / 2;
    conn2.position.set(-1.15, 0, -0.3);
    this.connectorGroup.add(conn2);
    this.pcba.add(this.connectorGroup);

    this.generacModel.add(this.pcba);

    // 3. Top Aluminum Enclosure Lid with Integrated Heat Sink Fins
    this.generacLid = new THREE.Group();
    this.generacLid.position.set(0, 0.28, 0);

    const lidPlateGeo = new THREE.BoxGeometry(2.38, 0.12, 1.78);
    const lidPlate = new THREE.Mesh(lidPlateGeo, chassisMat);
    this.generacLid.add(lidPlate);

    // 14 Parallel Heatsink Fins along top
    const finGeo = new THREE.BoxGeometry(0.04, 0.45, 1.74);
    for (let i = 0; i < 14; i++) {
      const fin = new THREE.Mesh(finGeo, finMat);
      fin.position.set(-1.0 + (i * 0.155), 0.25, 0);
      this.generacLid.add(fin);
    }

    this.generacModel.add(this.generacLid);

    // Hotspot Waypoint Markers
    this.initGeneracHotspots();

    this.generacModel.rotation.y = Math.PI * 0.22;
    this.generacGroup.add(this.generacModel);
  }

  initGeneracHotspots() {
    this.hotspots = [];
    const createMarker = (name, pos, label) => {
      const group = new THREE.Group();
      group.name = name;
      group.position.copy(pos);

      // Inner pulse dot
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
      );
      group.add(dot);

      // Outer ring
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.09, 0.12, 24),
        new THREE.MeshBasicMaterial({ color: 0x0ea5e9, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
      );
      ring.rotation.x = Math.PI / 2;
      group.add(ring);

      group.userData = { label, compName: name };
      this.generacModel.add(group);
      this.hotspots.push(group);
    };

    createMarker('mosfet', new THREE.Vector3(0, 0.85, -0.45), 'Power MOSFETs (1.2M/yr Sized)');
    createMarker('inductor', new THREE.Vector3(-0.1, 0.85, 0.15), 'Toroidal Inductors');
    createMarker('capacitor', new THREE.Vector3(0.65, 0.85, 0), 'DC Film Capacitors');
  }

  /* =========================================================================
   * CHAPTER 02-04: INDUSTRIAL CONTINUUM SCULPTURE
   * ========================================================================= */
  initIndustrialContinuumSculpture() {
    this.continuumSculpture = new THREE.Group();

    // Reusing the tested 4-tier geometry as background spatial environment
    const hubMat = new THREE.MeshStandardMaterial({ color: 0x18202c, metalness: 0.88, roughness: 0.22 });
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 0.7, 32), hubMat);
    this.continuumSculpture.add(hub);

    const gimbalMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.3 });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.045, 16, 64), gimbalMat);
    ring.rotation.x = Math.PI / 2.3;
    this.continuumSculpture.add(ring);

    const cageGeo = new THREE.IcosahedronGeometry(2.8, 1);
    const cageMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.15 });
    this.continuumSculpture.add(new THREE.Mesh(cageGeo, cageMat));

    this.continuumGroup.add(this.continuumSculpture);
  }

  /* =========================================================================
   * INTERACTION & CONTROLS
   * ========================================================================= */
  initInteraction() {
    let isPointerDown = false;

    const onPointerDown = (e) => {
      isPointerDown = true;
      this.previousPointer.x = e.clientX || (e.touches && e.touches[0].clientX);
      this.previousPointer.y = e.clientY || (e.touches && e.touches[0].clientY);
    };

    const onPointerMove = (e) => {
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      if (!clientX || !clientY) return;

      const rect = this.container.getBoundingClientRect();
      this.pointer.targetX = ((clientX - rect.left) / rect.width) * 2 - 1;
      this.pointer.targetY = -(((clientY - rect.top) / rect.height) * 2 - 1);

      if (isPointerDown) {
        const deltaX = clientX - this.previousPointer.x;
        const deltaY = clientY - this.previousPointer.y;
        this.previousPointer.x = clientX;
        this.previousPointer.y = clientY;

        if (this.currentState === 'GENERAC_VIEW') {
          this.generacModel.rotation.y += deltaX * 0.008;
          this.generacModel.rotation.x += deltaY * 0.005;
          this.generacModel.rotation.x = Math.max(-0.6, Math.min(0.6, this.generacModel.rotation.x));
        } else if (this.currentState === 'ENTRANCE_IDLE') {
          this.avatar.rotation.y += deltaX * 0.006;
          this.avatar.rotation.y = Math.max(-0.6, Math.min(0.6, this.avatar.rotation.y));
        }
      }
    };

    const onPointerUp = () => { isPointerDown = false; };

    this.container.addEventListener('mousedown', onPointerDown);
    this.container.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    this.container.addEventListener('touchstart', onPointerDown, { passive: true });
    this.container.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // Raycaster for clicking 3D hotspots / components
    this.raycaster = new THREE.Raycaster();
    this.mouseCoord = new THREE.Vector2();

    this.container.addEventListener('click', (e) => {
      if (this.currentState !== 'GENERAC_VIEW') return;

      const rect = this.container.getBoundingClientRect();
      this.mouseCoord.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouseCoord.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      this.raycaster.setFromCamera(this.mouseCoord, this.camera);
      const intersects = this.raycaster.intersectObjects(this.generacModel.children, true);

      if (intersects.length > 0) {
        let hit = intersects[0].object;
        while (hit.parent && hit.parent !== this.generacModel && hit.parent !== this.pcba) {
          hit = hit.parent;
        }

        const compName = hit.name || hit.userData?.compName;
        if (compName) {
          this.selectGeneracComponent(compName);
        }
      }
    });
  }

  initUI() {
    // 1. Enter My World Button
    if (this.enterBtn) {
      this.enterBtn.addEventListener('click', () => {
        this.triggerEntranceStrike();
      });
    }

    // 2. Skip Intro Button
    if (this.skipBtn) {
      this.skipBtn.addEventListener('click', () => {
        this.skipToGenerac();
      });
    }

    // 3. Explode Assembly Toggle
    const explodeBtn = document.getElementById('btn-explode-assembly');
    if (explodeBtn) {
      explodeBtn.addEventListener('click', () => {
        this.toggleExplode();
      });
    }

    // 4. Evidence Drawer Close Button
    const closeDrawerBtn = document.getElementById('btn-close-evidence');
    if (closeDrawerBtn) {
      closeDrawerBtn.addEventListener('click', () => {
        this.closeEvidenceDrawer();
      });
    }

    // 5. Phase Navigation HUD Buttons
    this.phaseButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const phaseNum = parseInt(btn.getAttribute('data-phase'), 10);
        this.navigateToPhase(phaseNum);
      });
    });
  }

  /* =========================================================================
   * CINEMATIC STRIKE & TRANSITION SEQUENCER
   * ========================================================================= */
  triggerEntranceStrike() {
    if (this.isStriking) return;
    this.isStriking = true;
    this.currentState = 'ENTRANCE_STRIKE';
    this.strikeStartTime = performance.now();

    if (this.enterBtn) this.enterBtn.classList.add('btn-striking');

    if (this.hudKicker) this.hudKicker.textContent = "CHAPTER 00 // BERSERKER CLEAVE";
    if (this.hudTitle) this.hudTitle.textContent = "Forging the Luminous Rift";
    if (this.hudDesc) this.hudDesc.textContent = "A weighted strike cleaves the monolithic threshold, opening the interconnected world of industrial manufacturing and supply networks.";
  }

  skipToGenerac() {
    this.isStriking = false;
    this.currentState = 'GENERAC_VIEW';
    this.explodeProgress = 1.0;
    this.targetExplodeProgress = 1.0;
    this.isExploded = true;

    // Immediately place camera in front of Generac Microinverter
    this.targetCameraPos.set(0, 1.2, -4.5);
    this.currentCameraPos.copy(this.targetCameraPos);
    this.targetLookAt.set(0, 0.1, -8);
    this.currentLookAt.copy(this.targetLookAt);

    // Hide entrance slabs
    this.portalGroup.visible = false;
    this.avatar.visible = false;

    this.container.classList.remove('entrance-active');
    this.container.classList.add('generac-active');

    this.updatePhaseUI(1);
    this.selectGeneracComponent('mosfet');
  }

  toggleExplode() {
    this.isExploded = !this.isExploded;
    this.targetExplodeProgress = this.isExploded ? 1.0 : 0.0;
    const btn = document.getElementById('btn-explode-assembly');
    if (btn) {
      btn.textContent = this.isExploded ? 'Collapse Assembly' : 'Explode Assembly';
    }
  }

  selectGeneracComponent(compName) {
    this.selectedComponent = compName;

    // Component data dictionary
    const componentData = {
      mosfet: {
        title: "Power MOSFET Array (6x N-Channel 650V Superjunction)",
        category: "Power Semiconductor Electronics · Inverter Core",
        bomQty: "6 per microinverter · 200,000 units/yr volume forecast = 1,200,000 units/year",
        problem: "Single-source tier-1 fab vulnerability with fragmented distributor price tiers, exposing production ramp to margin compression and wafer allocation bottlenecks.",
        quotes: [
          { supplier: "Incumbent Supplier A", tier: "500k-1M", quote: "$1.42 / unit", leadTime: "24 weeks", status: "Single-Source" },
          { supplier: "Qualified Alternative B", tier: "1M+ Commitment", quote: "$1.18 / unit", leadTime: "14 weeks", status: "AEC-Q101 Passed" }
        ],
        reliability: "AEC-Q101 automotive-grade qualification, PPAP Level 3 documentation, and 1,000-hour thermal stress testing (-40°C to +85°C).",
        decision: "Dual-sourcing allocation (70% primary, 30% qualified secondary), securing $0.24 unit delta across 1.2M annual run rate while protecting against fab stoppages.",
        sizing: "Contributed ~$288,000 to the total $1.2M annualized sourcing opportunity sized across the microinverter electrical BOM.",
        disclosure: "Sized & validated during NPI sourcing; actual realized savings depend on production volume ramp realization."
      },
      inductor: {
        title: "Toroidal Power Inductors (High-Permeability Ferrite Chokes)",
        category: "Magnetics & Passive Power Stage",
        bomQty: "2 per microinverter · 400,000 coils/year",
        problem: "Custom winding geometry with high manual labor content driving cost premiums and copper scrap variance across baseline supplier bids.",
        quotes: [
          { supplier: "Baseline Vendor X", tier: "Annual PO", quote: "$3.85 / unit", leadTime: "18 weeks", status: "Custom Tooling" },
          { supplier: "Automated Winder Y", tier: "Contracted Volume", quote: "$3.15 / unit", leadTime: "10 weeks", status: "Automated Winding" }
        ],
        reliability: "UL 1446 Class F insulation system, high-frequency core loss thermal modeling, and 45-day salt spray corrosion certification.",
        decision: "Transitioned to high-speed automated toroidal winding technology, saving $0.70/unit while enhancing winding consistency.",
        sizing: "Contributed ~$280,000 to the total annualized sourcing leverage model.",
        disclosure: "Validated against engineering specifications and pre-production sample builds."
      },
      capacitor: {
        title: "High-Voltage DC-Link Film Capacitors (4x Polypropylene)",
        category: "DC Filtering & Ripple Current Suppression",
        bomQty: "4 per microinverter · 800,000 units/year",
        problem: "Tight ESR (Equivalent Series Resistance) specifications and limited qualified global capacitor manufacturers creating pricing inflexibility.",
        quotes: [
          { supplier: "Supplier Alpha", tier: "Catalog Pricing", quote: "$0.94 / unit", leadTime: "16 weeks", status: "Incumbent" },
          { supplier: "Direct Manufacturer Beta", tier: "Consolidated Master Agreement", quote: "$0.76 / unit", leadTime: "12 weeks", status: "Direct Mill Agreement" }
        ],
        reliability: "Self-healing metallized polypropylene film, 105°C endurance test rating (5,000 hours), and vibration dampening epoxy seal.",
        decision: "Bypassed tiered distributor markups by negotiating directly with tier-1 capacitor manufacturers under a consolidated clean-energy master agreement.",
        sizing: "Contributed ~$144,000 in annualized bill-of-materials savings.",
        disclosure: "Cost model anchored in raw material resin and aluminum foil index pricing."
      }
    };

    const data = componentData[compName] || componentData['mosfet'];

    // Update HTML Evidence Drawer
    if (this.evidenceDrawer) {
      this.evidenceDrawer.classList.add('active');

      const elTitle = document.getElementById('drawer-comp-title');
      const elCat = document.getElementById('drawer-comp-category');
      const elUsage = document.getElementById('drawer-comp-usage');
      const elProblem = document.getElementById('drawer-comp-problem');
      const elDecision = document.getElementById('drawer-comp-decision');
      const elSizing = document.getElementById('drawer-comp-sizing');
      const elDisclosure = document.getElementById('drawer-comp-disclosure');
      const elTableBody = document.getElementById('drawer-quotes-body');

      if (elTitle) elTitle.textContent = data.title;
      if (elCat) elCat.textContent = data.category;
      if (elUsage) elUsage.textContent = data.bomQty;
      if (elProblem) elProblem.textContent = data.problem;
      if (elDecision) elDecision.textContent = data.decision;
      if (elSizing) elSizing.textContent = data.sizing;
      if (elDisclosure) elDisclosure.textContent = data.disclosure;

      if (elTableBody) {
        elTableBody.innerHTML = data.quotes.map(q => `
          <tr>
            <td><strong>${q.supplier}</strong></td>
            <td>${q.tier}</td>
            <td class="quote-price">${q.quote}</td>
            <td>${q.leadTime}</td>
            <td><span class="status-pill">${q.status}</span></td>
          </tr>
        `).join('');
      }
    }

    // Highlight 3D part
    if (this.generacModel) {
      this.generacModel.traverse((child) => {
        if (child.isMesh && child.material) {
          if (child.name === compName || child.parent?.name === compName) {
            child.material.emissive = new THREE.Color(0x0ea5e9);
            child.material.emissiveIntensity = 0.45;
          } else if (child.material.emissive) {
            child.material.emissive.setHex(0x000000);
          }
        }
      });
    }
  }

  closeEvidenceDrawer() {
    if (this.evidenceDrawer) {
      this.evidenceDrawer.classList.remove('active');
    }
  }

  navigateToPhase(phaseNum) {
    this.phaseButtons.forEach(btn => {
      const isActive = (parseInt(btn.getAttribute('data-phase'), 10) === phaseNum);
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    if (phaseNum === 1) {
      // Generac PWRmicro
      this.currentState = 'GENERAC_VIEW';
      this.container.classList.remove('entrance-active');
      this.container.classList.add('generac-active');
      this.targetCameraPos.set(0, 1.2, -4.5);
      this.targetLookAt.set(0, 0.1, -8);
      this.portalGroup.visible = false;
      this.avatar.visible = false;
      this.continuumGroup.visible = false;
      this.updatePhaseUI(1);
    } else if (phaseNum === 2) {
      // Warehouse DC
      this.currentState = 'CONTINUUM_VIEW';
      this.container.classList.remove('entrance-active');
      this.container.classList.remove('generac-active');
      this.continuumGroup.visible = true;
      this.targetCameraPos.set(-1.8, 1.2, -15.5);
      this.targetLookAt.set(-0.3, 0.2, -20);
      this.updatePhaseUI(2);
    } else if (phaseNum === 3) {
      // Robotics & Fabrication
      this.currentState = 'CONTINUUM_VIEW';
      this.continuumGroup.visible = true;
      this.targetCameraPos.set(2.2, -0.8, -15.2);
      this.targetLookAt.set(0.5, -0.2, -20);
      this.updatePhaseUI(3);
    } else if (phaseNum === 4) {
      // Decision Workbench
      this.currentState = 'CONTINUUM_VIEW';
      this.continuumGroup.visible = true;
      this.targetCameraPos.set(0, 1.8, -14.5);
      this.targetLookAt.set(0, 0.3, -20);
      this.updatePhaseUI(4);
    }
  }

  updatePhaseUI(phaseNum) {
    const phaseData = {
      1: {
        kicker: "CHAPTER 01 // GENERAC CLEAN ENERGY",
        title: "PWRmicro Microinverter Sourcing Architecture",
        desc: "Exploded conceptual assembly of the Generac PWRmicro solar inverter. Click on components to inspect BOM usage, dual-source quotations, and the $1.2M annualized sourcing model."
      },
      2: {
        kicker: "CHAPTER 02 // WAREHOUSE TOPOLOGY",
        title: "USC Distribution Center & Omnichannel Logistics",
        desc: "Pareto velocity slotting, dynamic pick-path travel reduction, and physical inventory reconciliation maintaining >98% SKU accuracy across 40,000 sq ft operations."
      },
      3: {
        kicker: "CHAPTER 03 // AUTOMATED FABRICATION",
        title: "Robotic Welding & Optical Profilometry",
        desc: "In-process weld seam inspection at Larsen & Toubro, delivering a 20% defect speed lift and ASME Section VIII pressure vessel manufacturing rigor."
      },
      4: {
        kicker: "CHAPTER 04 // DECISION INTELLIGENCE",
        title: "12-Plant Supply Network Optimization",
        desc: "Multi-Echelon Inventory Optimization (MEIO), deterministic lead-time buffering, and stochastic linear programming workbench developed at USC Viterbi."
      }
    };

    const d = phaseData[phaseNum] || phaseData[1];
    if (this.hudKicker) this.hudKicker.textContent = d.kicker;
    if (this.hudTitle) this.hudTitle.textContent = d.title;
    if (this.hudDesc) this.hudDesc.textContent = d.desc;
  }

  initLifecycle() {
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

    window.addEventListener('resize', () => this.onResize());
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

  /* =========================================================================
   * MAIN ANIMATION LOOP & KINEMATICS
   * ========================================================================= */
  animate() {
    if (!this.isRunning) return;
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    const now = performance.now();

    // 1. Damped Pointer Interpolation
    this.pointer.x += (this.pointer.targetX - this.pointer.x) * 0.05;
    this.pointer.y += (this.pointer.targetY - this.pointer.y) * 0.05;

    // 2. Camera Choreography Lerp
    this.currentCameraPos.lerp(this.targetCameraPos, 0.04);
    this.currentLookAt.lerp(this.targetLookAt, 0.04);

    this.camera.position.x = this.currentCameraPos.x + this.pointer.x * 0.35;
    this.camera.position.y = this.currentCameraPos.y + this.pointer.y * 0.25;
    this.camera.position.z = this.currentCameraPos.z;
    this.camera.lookAt(this.currentLookAt);

    // 3. Explode Animation Lerp for Generac Assembly
    this.explodeProgress += (this.targetExplodeProgress - this.explodeProgress) * 0.08;
    if (this.generacLid) {
      this.generacLid.position.y = 0.28 + this.explodeProgress * 1.5;
    }
    if (this.pcba) {
      this.pcba.position.y = 0.0 + this.explodeProgress * 0.45;
    }

    // Pulse Hotspot Rings
    if (this.hotspots) {
      const pulse = 1 + Math.sin(now * 0.005) * 0.15;
      this.hotspots.forEach(h => {
        h.children[1].scale.set(pulse, pulse, pulse);
      });
    }

    // 4. Berserker State Machine
    if (this.currentState === 'ENTRANCE_IDLE') {
      // Idle Breathing Weight Transfer
      const t = now * 0.002;
      this.torso.position.y = 1.35 + Math.sin(t) * 0.025;
      this.cloak.rotation.x = Math.sin(t * 0.7) * 0.05;
      this.swordGroup.position.y = 0.65 + Math.sin(t) * 0.015;
      this.avatar.position.y = -1.2 + Math.sin(t * 0.5) * 0.01;
      this.seamMat.opacity = 0.3 + Math.sin(t * 2) * 0.15;
    } else if (this.currentState === 'ENTRANCE_STRIKE') {
      const elapsed = (now - this.strikeStartTime) * 0.001; // in seconds

      if (elapsed < 1.2) {
        // Phase 1: High Guard Windup (0.0s - 1.2s)
        const p = elapsed / 1.2;
        // Raise sword overhead with both arms
        this.swordGroup.position.set(0, 0.65 + p * 1.1, 0.42 - p * 0.25);
        this.swordGroup.rotation.x = -p * 1.4;
        this.swordGroup.rotation.z = p * 0.2;
        this.torso.rotation.x = -p * 0.25; // Back arches slightly
        this.armL.rotation.x = -p * 1.5;
        this.armR.rotation.x = -p * 1.5;
        this.camera.position.z += (Math.random() - 0.5) * 0.01; // subtle tension
      } else if (elapsed < 2.0) {
        // Phase 2: Downward Diagonal Cleave (1.2s - 2.0s)
        const p = (elapsed - 1.2) / 0.8;
        const strikeCurve = Math.pow(p, 2); // Accelerate into strike

        this.swordGroup.position.set(
          Math.sin(strikeCurve * Math.PI) * 0.2,
          1.75 - strikeCurve * 1.6,
          0.17 + strikeCurve * 0.3
        );
        this.swordGroup.rotation.x = -1.4 + strikeCurve * 2.6; // Downward slash arc
        this.swordGroup.rotation.z = 0.2 - strikeCurve * 0.4;
        this.torso.rotation.x = -0.25 + strikeCurve * 0.5; // Lean into cut
        this.armL.rotation.x = -1.5 + strikeCurve * 2.2;
        this.armR.rotation.x = -1.5 + strikeCurve * 2.2;
      } else if (elapsed < 3.2) {
        // Phase 3: Impact, Sparks & Fissure (2.0s - 3.2s)
        const p = (elapsed - 2.0) / 1.2;

        // Trigger Sparks
        if (this.sparks && !this.sparks.userData.active) {
          this.sparks.userData.active = true;
          this.sparks.material.opacity = 1.0;
        }

        // Camera Impact Shudder
        const shake = (1 - p) * 0.08;
        this.camera.position.x += (Math.random() - 0.5) * shake;
        this.camera.position.y += (Math.random() - 0.5) * shake;

        // Seam glows blindingly hot
        this.seamMat.opacity = 1.0;
        this.seamMat.color.setHex(0xf97316); // Molten amber flash
      } else if (elapsed < 4.4) {
        // Phase 4: Monolith Slabs Part Laterally (3.2s - 4.4s)
        const p = (elapsed - 3.2) / 1.2;
        const split = Math.pow(p, 1.8) * 2.6;

        this.slabLeft.position.x = -1.42 - split;
        this.slabRight.position.x = 1.42 + split;
        this.seam.scale.x = 1.0 + split * 4.0;
        this.seamMat.color.setHex(0x38bdf8); // Transmutes to cool blue rift
      } else if (elapsed < 5.8) {
        // Phase 5: Camera Accelerates Through Portal into Generac (4.4s - 5.8s)
        const p = (elapsed - 4.4) / 1.4;

        this.targetCameraPos.set(0, 1.2, -4.5);
        this.targetLookAt.set(0, 0.1, -8);

        // Fade avatar and portal behind camera
        this.avatar.position.y -= p * 0.5;
        this.portalGroup.position.z += p * 0.5;
      } else {
        // Strike Complete: Transition into Generac View
        this.currentState = 'GENERAC_VIEW';
        this.isStriking = false;
        this.portalGroup.visible = false;
        this.avatar.visible = false;
        this.container.classList.remove('entrance-active');
        this.container.classList.add('generac-active');
        this.updatePhaseUI(1);
        this.toggleExplode();
        this.selectGeneracComponent('mosfet');
      }
    }

    // 5. Update Particle Sparks
    if (this.sparks && this.sparks.userData.active) {
      const pos = this.sparks.geometry.attributes.position.array;
      const vels = this.sparks.userData.velocities;
      for (let i = 0; i < vels.length; i++) {
        pos[i * 3] += vels[i].x * 0.016;
        pos[i * 3 + 1] += vels[i].y * 0.016;
        pos[i * 3 + 2] += vels[i].z * 0.016;
        vels[i].y -= 9.8 * 0.0012; // Gravity
      }
      this.sparks.geometry.attributes.position.needsUpdate = true;
      this.sparks.material.opacity *= 0.94;
    }

    // 6. Idle Rotation for Generac Model when active
    if (this.currentState === 'GENERAC_VIEW') {
      if (!this.prefersReducedMotion) {
        this.generacModel.rotation.y += 0.0018;
      }
    } else if (this.currentState === 'CONTINUUM_VIEW') {
      if (!this.prefersReducedMotion && this.continuumSculpture) {
        this.continuumSculpture.rotation.y += 0.003;
      }
    }

    this.renderer.render(this.scene, this.camera);

    // 7. Hide Static Fallback Smoothly After First Verified Render Frame
    if (!this.hasRenderedFirstFrame) {
      this.hasRenderedFirstFrame = true;
      if (this.fallback) {
        this.fallback.classList.add('rendered-hidden');
      }
    }
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', () => {
    new BerserkerIndustrialEngine();
  });
} else {
  new BerserkerIndustrialEngine();
}
