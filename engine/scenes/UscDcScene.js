/**
 * CHAPTER 02: USC DISTRIBUTION CENTER & BOOKSTORE // KINETIC WAREHOUSE TOPOLOGY
 * 3D multi-tier pallet racking bays, inventory aisles, receiving staging dock,
 * dynamic pick-route vectors (Baseline vs Optimized Pareto ABC slotting), and discrepancy flag.
 */

import * as THREE from '../../assets/three.module.min.js';

export class UscDcScene {
  constructor(rendererInstance) {
    this.rendererInstance = rendererInstance;
    this.group = new THREE.Group();
    this.group.name = 'UscDcScene';
    this.group.position.set(0, 0, -18);

    this.routeMode = 'PARETO'; // 'BASELINE' or 'PARETO'
    this.pickerParticles = [];

    this.initWarehouseRacks();
    this.initPickRoutes();
    this.initDiscrepancyFlag();
  }

  initWarehouseRacks() {
    this.racksGroup = new THREE.Group();

    const rackMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Industrial warehouse blue rack uprights
      metalness: 0.6,
      roughness: 0.35
    });

    const beamMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Safety amber load beams
      metalness: 0.5,
      roughness: 0.4
    });

    const palletMat = new THREE.MeshStandardMaterial({
      color: 0x92400e, // Wood pallet
      roughness: 0.8
    });

    const cargoMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1, // Shrink-wrapped carton inventory
      roughness: 0.6
    });

    // 4 Aisle Racks, 3 tiers high
    for (let aisle = -2; aisle <= 2; aisle += 1.6) {
      for (let bay = -3; bay <= 3; bay += 1.4) {
        // Upright columns
        const uprightGeo = new THREE.BoxGeometry(0.06, 2.8, 0.06);
        const u1 = new THREE.Mesh(uprightGeo, rackMat);
        u1.position.set(aisle - 0.4, 0.5, bay - 0.4);
        const u2 = new THREE.Mesh(uprightGeo, rackMat);
        u2.position.set(aisle + 0.4, 0.5, bay - 0.4);
        const u3 = new THREE.Mesh(uprightGeo, rackMat);
        u3.position.set(aisle - 0.4, 0.5, bay + 0.4);
        const u4 = new THREE.Mesh(uprightGeo, rackMat);
        u4.position.set(aisle + 0.4, 0.5, bay + 0.4);
        this.racksGroup.add(u1, u2, u3, u4);

        // 3 Shelf Beam Levels
        for (let tier = 0; tier < 3; tier++) {
          const tierY = -0.4 + tier * 0.9;
          const beamGeo = new THREE.BoxGeometry(0.86, 0.05, 0.86);
          const beam = new THREE.Mesh(beamGeo, beamMat);
          beam.position.set(aisle, tierY, bay);
          this.racksGroup.add(beam);

          // Pallet & Cargo Box
          const palletGeo = new THREE.BoxGeometry(0.7, 0.08, 0.7);
          const pallet = new THREE.Mesh(palletGeo, palletMat);
          pallet.position.set(aisle, tierY + 0.06, bay);
          this.racksGroup.add(pallet);

          const boxGeo = new THREE.BoxGeometry(0.62, 0.55, 0.62);
          const box = new THREE.Mesh(boxGeo, cargoMat);
          box.position.set(aisle, tierY + 0.38, bay);
          this.racksGroup.add(box);
        }
      }
    }

    // Concrete polished DC Floor
    const floorGeo = new THREE.PlaneGeometry(16, 16);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.3,
      metalness: 0.4
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.9;
    floor.receiveShadow = true;
    this.racksGroup.add(floor);

    this.group.add(this.racksGroup);
  }

  initPickRoutes() {
    this.routeLinesGroup = new THREE.Group();

    // Baseline route: Serpentine zigzag traversal across all bays
    const baselinePts = [
      new THREE.Vector3(-3.5, -0.85, 3.5),
      new THREE.Vector3(-2.0, -0.85, 3.5),
      new THREE.Vector3(-2.0, -0.85, -3.5),
      new THREE.Vector3(-0.4, -0.85, -3.5),
      new THREE.Vector3(-0.4, -0.85, 3.5),
      new THREE.Vector3(1.2, -0.85, 3.5),
      new THREE.Vector3(1.2, -0.85, -3.5),
      new THREE.Vector3(2.8, -0.85, -3.5),
      new THREE.Vector3(2.8, -0.85, 3.5),
      new THREE.Vector3(3.5, -0.85, 3.5)
    ];

    const baselineGeo = new THREE.BufferGeometry().setFromPoints(baselinePts);
    this.baselineLine = new THREE.Line(baselineGeo, new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 2 }));
    this.routeLinesGroup.add(this.baselineLine);

    // Optimized Pareto ABC route: Direct golden-zone consolidation (18% travel reduction)
    const paretoPts = [
      new THREE.Vector3(-3.5, -0.85, 3.5),
      new THREE.Vector3(-2.0, -0.85, 3.2),
      new THREE.Vector3(-0.4, -0.85, 2.8),
      new THREE.Vector3(1.2, -0.85, 2.5),
      new THREE.Vector3(2.8, -0.85, 2.8),
      new THREE.Vector3(3.5, -0.85, 3.5)
    ];

    const paretoGeo = new THREE.BufferGeometry().setFromPoints(paretoPts);
    this.paretoLine = new THREE.Line(paretoGeo, new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 3 }));
    this.routeLinesGroup.add(this.paretoLine);

    this.group.add(this.routeLinesGroup);
    this.setRouteMode('PARETO');
  }

  initDiscrepancyFlag() {
    this.flagGroup = new THREE.Group();
    this.flagGroup.position.set(-0.4, 1.4, 0);

    const beaconGeo = new THREE.SphereGeometry(0.12, 12, 12);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    this.flagGroup.add(beacon);

    const ringGeo = new THREE.RingGeometry(0.18, 0.24, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
    this.pulseRing = new THREE.Mesh(ringGeo, ringMat);
    this.pulseRing.rotation.x = Math.PI / 2;
    this.flagGroup.add(this.pulseRing);

    this.group.add(this.flagGroup);
  }

  setRouteMode(mode) {
    this.routeMode = mode;
    if (mode === 'BASELINE') {
      this.baselineLine.visible = true;
      this.paretoLine.visible = false;
    } else {
      this.baselineLine.visible = false;
      this.paretoLine.visible = true;
    }
  }

  update(delta, time) {
    // Pulse discrepancy marker
    const s = 1.0 + Math.sin(time * 4.0) * 0.35;
    this.pulseRing.scale.set(s, s, s);
    this.pulseRing.material.opacity = Math.max(0, 1.0 - (s - 0.65) * 1.5);
  }
}
