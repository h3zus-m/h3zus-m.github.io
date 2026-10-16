/**
 * CHAPTER 01: GENERAC POWER SYSTEMS // PWRMICRO MICROINVERTER ASSEMBLY & PCBA
 * Dimensioned exterior per Generac Manual (Doc a0008718926: 25.61cm W × 37.62cm H × 5.67cm D),
 * die-cast aluminum casing, heatsink cooling fins, mounting bracket, MC4 DC inputs, AC trunk,
 * exploded internal PCBA assembly, and interactive component sourcing inspection.
 */

import * as THREE from '../../assets/three.module.min.js';

export class GeneracScene {
  constructor(rendererInstance) {
    this.rendererInstance = rendererInstance;
    this.group = new THREE.Group();
    this.group.name = 'GeneracScene';
    this.group.position.set(0, 0, -8); // Positioned behind the entrance monolith

    this.explodeProgress = 0; // 0 (collapsed) to 1 (fully exploded)
    this.targetExplodeProgress = 0;
    this.selectedComponent = 'mosfet';
    this.interactiveHotspots = [];

    this.initMicroinverterAssembly();
  }

  initMicroinverterAssembly() {
    this.assemblyGroup = new THREE.Group();

    // Scale ratio: 1 Three.js unit = 10 cm
    // W: 25.61 cm -> 2.56 units
    // H: 37.62 cm -> 3.76 units
    // D: 5.67 cm -> 0.57 units
    const W = 2.56;
    const H = 3.76;
    const D = 0.57;

    const aluMat = this.rendererInstance.materials.brushedAluminum || new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.85,
      roughness: 0.28
    });

    const darkTrimMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.6,
      roughness: 0.4
    });

    // 1. FRONT COVER / EXTERIOR DIE-CAST HOUSING (Explodes Forward)
    this.frontHousing = new THREE.Group();

    const frontPanelGeo = new THREE.BoxGeometry(W, H, 0.12);
    const frontPanel = new THREE.Mesh(frontPanelGeo, aluMat);
    frontPanel.castShadow = true;
    this.frontHousing.add(frontPanel);

    // Beveled perimeter bezel
    const bezelGeo = new THREE.BoxGeometry(W + 0.08, H + 0.08, 0.08);
    const bezel = new THREE.Mesh(bezelGeo, darkTrimMat);
    bezel.position.z = -0.04;
    this.frontHousing.add(bezel);

    // Embossed Generac Branding Plate & QR Code label pad
    const badgeGeo = new THREE.PlaneGeometry(1.2, 0.35);
    const badgeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
    const badge = new THREE.Mesh(badgeGeo, badgeMat);
    badge.position.set(0, 0.8, 0.065);
    this.frontHousing.add(badge);

    // Status Indicator LED (Printed manual component E: Status LED)
    const ledGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.04, 16);
    this.ledMat = new THREE.MeshBasicMaterial({ color: 0x10b981 }); // Emerald nominal green
    const led = new THREE.Mesh(ledGeo, this.ledMat);
    led.rotation.x = Math.PI / 2;
    led.position.set(0.85, -1.2, 0.065);
    this.frontHousing.add(led);

    const ledGlow = new THREE.PointLight(0x10b981, 0.6, 0.8);
    ledGlow.position.set(0.85, -1.2, 0.15);
    this.frontHousing.add(ledGlow);

    this.assemblyGroup.add(this.frontHousing);

    // 2. INTERNAL MULTI-LAYER PCBA (Center Assembly)
    this.pcbaGroup = new THREE.Group();

    // FR4 Green Matte Solder Mask Board
    const pcbGeo = new THREE.BoxGeometry(W - 0.28, H - 0.4, 0.04);
    const pcbMat = new THREE.MeshStandardMaterial({
      color: 0x064e3b, // High-grade industrial dark green
      roughness: 0.45,
      metalness: 0.15
    });
    this.pcb = new THREE.Mesh(pcbGeo, pcbMat);
    this.pcbaGroup.add(this.pcb);

    // Gold ground planes & copper trace runs (visualized via accent strips)
    const traceGeo = new THREE.PlaneGeometry(W - 0.4, 0.06);
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 });
    for (let i = -1.2; i <= 1.2; i += 0.4) {
      const trace = new THREE.Mesh(traceGeo, goldMat);
      trace.position.set(0, i, 0.022);
      this.pcbaGroup.add(trace);
    }

    // Component 1: 6x Power MOSFET Array in TO-247 Packages
    this.mosfetGroup = new THREE.Group();
    this.mosfetGroup.name = 'mosfet';
    const mosfetBodyGeo = new THREE.BoxGeometry(0.18, 0.26, 0.06);
    const mosfetTabGeo = new THREE.BoxGeometry(0.18, 0.08, 0.02);
    const mosfetMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.4 });
    const tabMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.9, roughness: 0.2 });

    for (let i = 0; i < 6; i++) {
      const mSingle = new THREE.Group();
      const mBody = new THREE.Mesh(mosfetBodyGeo, mosfetMat);
      const mTab = new THREE.Mesh(mosfetTabGeo, tabMat);
      mTab.position.y = 0.15;
      mSingle.add(mBody);
      mSingle.add(mTab);

      // Two columns of 3 MOSFETs along thermal spreader bar
      const col = i < 3 ? -0.7 : 0.7;
      const row = (i % 3) * 0.38 - 0.38;
      mSingle.position.set(col, row, 0.05);
      this.mosfetGroup.add(mSingle);
    }
    this.pcbaGroup.add(this.mosfetGroup);
    this.interactiveHotspots.push({ name: 'mosfet', object: this.mosfetGroup });

    // Component 2: 2x Heavy Toroidal Power Chokes / Inductors
    this.chokeGroup = new THREE.Group();
    this.chokeGroup.name = 'choke';
    const toroidGeo = new THREE.TorusGeometry(0.24, 0.11, 16, 24);
    const copperMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.85, roughness: 0.25 });
    
    const choke1 = new THREE.Mesh(toroidGeo, copperMat);
    choke1.position.set(-0.25, 0.8, 0.12);
    this.chokeGroup.add(choke1);

    const choke2 = new THREE.Mesh(toroidGeo, copperMat);
    choke2.position.set(0.25, 0.8, 0.12);
    this.chokeGroup.add(choke2);

    this.pcbaGroup.add(this.chokeGroup);
    this.interactiveHotspots.push({ name: 'choke', object: this.chokeGroup });

    // Component 3: 4x High-Voltage DC-Link Film Capacitors
    this.capGroup = new THREE.Group();
    this.capGroup.name = 'capacitor';
    const capGeo = new THREE.BoxGeometry(0.35, 0.45, 0.25);
    const capMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.3 }); // Industrial blue film cap

    const capPositions = [
      [-0.45, -0.9, 0.14],
      [-0.05, -0.9, 0.14],
      [0.35, -0.9, 0.14],
      [0.75, -0.9, 0.14]
    ];

    capPositions.forEach(pos => {
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.set(pos[0], pos[1], pos[2]);
      this.capGroup.add(cap);
    });
    this.pcbaGroup.add(this.capGroup);
    this.interactiveHotspots.push({ name: 'capacitor', object: this.capGroup });

    // Component 4: Digital Signal Processor / Control MCU
    this.mcuGroup = new THREE.Group();
    this.mcuGroup.name = 'mcu';
    const mcuGeo = new THREE.BoxGeometry(0.32, 0.32, 0.05);
    const mcuMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.25 });
    const mcu = new THREE.Mesh(mcuGeo, mcuMat);
    mcu.position.set(0, 0.15, 0.045);
    this.mcuGroup.add(mcu);
    this.pcbaGroup.add(this.mcuGroup);
    this.interactiveHotspots.push({ name: 'mcu', object: this.mcuGroup });

    this.assemblyGroup.add(this.pcbaGroup);

    // 3. REAR CHASSIS & EXTRUDED HEATSINK FINS (Explodes Backward)
    this.rearHousing = new THREE.Group();

    const rearPlateGeo = new THREE.BoxGeometry(W, H, 0.12);
    const rearPlate = new THREE.Mesh(rearPlateGeo, aluMat);
    rearPlate.position.z = -0.12;
    this.rearHousing.add(rearPlate);

    // 18 Extruded Aluminum Heatsink Cooling Fins (Rear)
    const finGeo = new THREE.BoxGeometry(0.04, H - 0.2, 0.32);
    for (let i = -1.1; i <= 1.1; i += 0.13) {
      const fin = new THREE.Mesh(finGeo, aluMat);
      fin.position.set(i, 0, -0.32);
      this.rearHousing.add(fin);
    }

    // Upper Mounting Bracket with Keyhole Slot (Printed manual component C)
    const bracketGeo = new THREE.BoxGeometry(W * 0.5, 0.45, 0.08);
    const bracket = new THREE.Mesh(bracketGeo, darkTrimMat);
    bracket.position.set(0, H * 0.5 + 0.15, -0.12);
    this.rearHousing.add(bracket);

    // Lower Dual DC Input Connectors (MC4) & AC Trunk Port (Components B & D)
    const dcConnGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.45, 12);
    const connMat = new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.7 });

    const dc1 = new THREE.Mesh(dcConnGeo, connMat);
    dc1.position.set(-0.65, -H * 0.5 - 0.18, 0);
    this.rearHousing.add(dc1);

    const dc2 = new THREE.Mesh(dcConnGeo, connMat);
    dc2.position.set(-0.35, -H * 0.5 - 0.18, 0);
    this.rearHousing.add(dc2);

    const acTrunk = new THREE.Mesh(dcConnGeo, connMat);
    acTrunk.position.set(0.65, -H * 0.5 - 0.18, 0);
    this.rearHousing.add(acTrunk);

    this.assemblyGroup.add(this.rearHousing);
    this.group.add(this.assemblyGroup);
  }

  setExplodeProgress(val) {
    this.targetExplodeProgress = Math.max(0, Math.min(1.0, val));
  }

  toggleExplode() {
    this.targetExplodeProgress = this.targetExplodeProgress > 0.5 ? 0 : 1.0;
  }

  selectComponent(name) {
    this.selectedComponent = name;
    // Dispatch event to UI controller with full reconciled sourcing dataset
    document.dispatchEvent(new CustomEvent('engine:componentselected', {
      detail: { component: name }
    }));
  }

  update(delta, time) {
    // Smooth lerp for exploded assembly
    const lerpSpeed = 0.08;
    this.explodeProgress += (this.targetExplodeProgress - this.explodeProgress) * lerpSpeed;

    // Explode offsets
    this.frontHousing.position.z = this.explodeProgress * 1.6;
    this.rearHousing.position.z = -this.explodeProgress * 1.1;
    this.pcbaGroup.position.z = this.explodeProgress * 0.25;

    // Gentle orbital drift when viewing assembly
    this.assemblyGroup.rotation.y = Math.sin(time * 0.6) * 0.12;
    this.assemblyGroup.rotation.x = Math.sin(time * 0.4) * 0.06;

    // Pulse LED
    const ledIntensity = (Math.sin(time * 3.5) + 1.0) * 0.5;
    this.ledMat.color.setRGB(0.06 + ledIntensity * 0.1, 0.72 + ledIntensity * 0.28, 0.5);
  }
}
