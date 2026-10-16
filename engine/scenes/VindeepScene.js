/**
 * CHAPTER 03: VINDEEP EXPO ENGINEERS // ASME HEAVY FABRICATION ASSEMBLY
 * 3D ASME Section VIII pressure vessel, 2:1 ellipsoidal heads, nozzle flanges,
 * saddle plinths, longitudinal weld seams, and multi-site compliance tracking.
 */

import * as THREE from '../../assets/three.module.min.js';

export class VindeepScene {
  constructor(rendererInstance) {
    this.rendererInstance = rendererInstance;
    this.group = new THREE.Group();
    this.group.name = 'VindeepScene';
    this.group.position.set(0, 0, -28);

    this.initPressureVessel();
  }

  initPressureVessel() {
    this.vesselGroup = new THREE.Group();

    const steelMat = this.rendererInstance.materials.darkSteel || new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.88,
      roughness: 0.3
    });

    const weldMat = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      emissive: 0x0284c7,
      emissiveIntensity: 0.35,
      metalness: 0.9,
      roughness: 0.2
    });

    const flangeMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.85,
      roughness: 0.25
    });

    // 1. Cylindrical Vessel Shell (2.6m length, 1.3m diameter)
    const shellGeo = new THREE.CylinderGeometry(0.75, 0.75, 2.6, 32, 1, true);
    const shell = new THREE.Mesh(shellGeo, steelMat);
    shell.rotation.z = Math.PI / 2;
    this.vesselGroup.add(shell);

    // 2. 2:1 Ellipsoidal Dished Heads (Left & Right)
    const headGeo = new THREE.SphereGeometry(0.75, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);

    const headL = new THREE.Mesh(headGeo, steelMat);
    headL.position.x = -1.3;
    headL.rotation.z = -Math.PI / 2;
    headL.scale.set(1, 0.6, 1);
    this.vesselGroup.add(headL);

    const headR = new THREE.Mesh(headGeo, steelMat);
    headR.position.x = 1.3;
    headR.rotation.z = Math.PI / 2;
    headR.scale.set(1, 0.6, 1);
    this.vesselGroup.add(headR);

    // 3. Circumferential & Longitudinal Weld Seams
    const circWeldGeo = new THREE.TorusGeometry(0.76, 0.025, 8, 32);

    const seam1 = new THREE.Mesh(circWeldGeo, weldMat);
    seam1.position.x = -1.3;
    seam1.rotation.y = Math.PI / 2;
    this.vesselGroup.add(seam1);

    const seam2 = new THREE.Mesh(circWeldGeo, weldMat);
    seam2.position.x = 1.3;
    seam2.rotation.y = Math.PI / 2;
    this.vesselGroup.add(seam2);

    // 4. Nozzle Necks & Bolted Flanges (Top Inlets & Manway)
    const nozzlePositions = [-0.6, 0.2, 0.8];
    nozzlePositions.forEach((xPos, idx) => {
      const nozzleGroup = new THREE.Group();
      nozzleGroup.position.set(xPos, 0.75, 0);

      const pipeGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.35, 16);
      const pipe = new THREE.Mesh(pipeGeo, steelMat);
      pipe.position.y = 0.175;
      nozzleGroup.add(pipe);

      const flangeGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.08, 24);
      const flange = new THREE.Mesh(flangeGeo, flangeMat);
      flange.position.y = 0.35;
      nozzleGroup.add(flange);

      this.vesselGroup.add(nozzleGroup);
    });

    // 5. Structural Saddle Supports
    const saddleGeo = new THREE.BoxGeometry(0.25, 0.55, 1.6);
    const saddleL = new THREE.Mesh(saddleGeo, steelMat);
    saddleL.position.set(-0.8, -0.65, 0);
    this.vesselGroup.add(saddleL);

    const saddleR = new THREE.Mesh(saddleGeo, steelMat);
    saddleR.position.set(0.8, -0.65, 0);
    this.vesselGroup.add(saddleR);

    this.group.add(this.vesselGroup);
  }

  update(delta, time) {
    this.vesselGroup.rotation.y = Math.sin(time * 0.4) * 0.15;
  }
}
