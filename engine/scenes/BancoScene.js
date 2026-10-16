/**
 * CHAPTER 05: BANCO PRODUCTS // BRAZED HEAT EXCHANGER MATRIX & QA INSPECTION
 * 3D automotive aluminum charge air cooler, header tanks, micro-channel tubes,
 * louvered fin matrix, thermal vs pressure drop trade-off, and helium leak testing.
 */

import * as THREE from '../../assets/three.module.min.js';

export class BancoScene {
  constructor(rendererInstance) {
    this.rendererInstance = rendererInstance;
    this.group = new THREE.Group();
    this.group.name = 'BancoScene';
    this.group.position.set(0, 0, -48);

    this.initHeatExchanger();
  }

  initHeatExchanger() {
    this.exchangerGroup = new THREE.Group();

    const aluMat = this.rendererInstance.materials.brushedAluminum || new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.85,
      roughness: 0.25
    });

    const finMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      metalness: 0.8,
      roughness: 0.35
    });

    const portMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.9,
      roughness: 0.2
    });

    // 1. Top & Bottom Cast Aluminum Header Tanks
    const tankGeo = new THREE.BoxGeometry(2.4, 0.35, 0.65);

    const tankTop = new THREE.Mesh(tankGeo, aluMat);
    tankTop.position.y = 1.35;
    this.exchangerGroup.add(tankTop);

    const tankBottom = new THREE.Mesh(tankGeo, aluMat);
    tankBottom.position.y = -1.35;
    this.exchangerGroup.add(tankBottom);

    // Inlet and Outlet Flanged Spigots
    const portGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.45, 24);

    const portIn = new THREE.Mesh(portGeo, portMat);
    portIn.position.set(-0.7, 1.6, 0);
    this.exchangerGroup.add(portIn);

    const portOut = new THREE.Mesh(portGeo, portMat);
    portOut.position.set(0.7, -1.6, 0);
    this.exchangerGroup.add(portOut);

    // 2. Extruded Micro-Channel Flat Tubes & Repeated Louvered Fin Packs
    const tubeGeo = new THREE.BoxGeometry(2.2, 0.04, 0.55);
    const finPackGeo = new THREE.BoxGeometry(2.2, 0.12, 0.52);

    const tubeCount = 14;
    for (let i = 0; i < tubeCount; i++) {
      const y = -1.0 + (i / (tubeCount - 1)) * 2.0;

      // Micro-channel aluminum tube
      const tube = new THREE.Mesh(tubeGeo, aluMat);
      tube.position.set(0, y, 0);
      this.exchangerGroup.add(tube);

      // Louvered fin packs between tubes
      if (i < tubeCount - 1) {
        const finPack = new THREE.Mesh(finPackGeo, finMat);
        finPack.position.set(0, y + 0.08, 0);
        this.exchangerGroup.add(finPack);
      }
    }

    // Side reinforcement side plates
    const sidePlateGeo = new THREE.BoxGeometry(0.08, 2.7, 0.65);
    const sideL = new THREE.Mesh(sidePlateGeo, aluMat);
    sideL.position.x = -1.18;
    this.exchangerGroup.add(sideL);

    const sideR = new THREE.Mesh(sidePlateGeo, aluMat);
    sideR.position.x = 1.18;
    this.exchangerGroup.add(sideR);

    this.group.add(this.exchangerGroup);
  }

  update(delta, time) {
    this.exchangerGroup.rotation.y = Math.sin(time * 0.5) * 0.18;
  }
}
