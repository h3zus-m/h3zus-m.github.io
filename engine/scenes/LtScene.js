/**
 * CHAPTER 04: LARSEN & TOUBRO // AUTOMATED ROBOTIC WELDING CELL
 * 6-axis articulated robotic weld arm with hierarchical kinematic joints,
 * rotating fixture table, weld torch, optical laser profilometer, and seam variance curve.
 */

import * as THREE from '../../assets/three.module.min.js';

export class LtScene {
  constructor(rendererInstance) {
    this.rendererInstance = rendererInstance;
    this.group = new THREE.Group();
    this.group.name = 'LtScene';
    this.group.position.set(0, 0, -38);

    this.isWelding = true;
    this.weldCycleTime = 0;

    this.initRobotArm();
    this.initFixtureTable();
    this.initProfilometryLaser();
  }

  initRobotArm() {
    this.robotGroup = new THREE.Group();
    this.robotGroup.position.set(-0.8, -0.6, 0);

    const robotOrangeMat = new THREE.MeshStandardMaterial({
      color: 0xea580c, // ABB / Industrial Robotics High-Visibility Orange
      metalness: 0.55,
      roughness: 0.3
    });

    const darkJointMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.25
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.1
    });

    // 1. Base Pedestal (Axis 1: Azimuth Rotation)
    const baseGeo = new THREE.CylinderGeometry(0.38, 0.44, 0.35, 24);
    const base = new THREE.Mesh(baseGeo, darkJointMat);
    this.robotGroup.add(base);

    this.axis1 = new THREE.Group();
    this.axis1.position.y = 0.18;
    this.robotGroup.add(this.axis1);

    // 2. Shoulder Casting (Axis 2)
    const shoulderGeo = new THREE.BoxGeometry(0.42, 0.45, 0.42);
    const shoulder = new THREE.Mesh(shoulderGeo, robotOrangeMat);
    shoulder.position.y = 0.22;
    this.axis1.add(shoulder);

    this.axis2 = new THREE.Group();
    this.axis2.position.set(0, 0.4, 0);
    this.axis1.add(this.axis2);

    // 3. Upper Arm Casting
    const upperArmGeo = new THREE.BoxGeometry(0.24, 0.95, 0.28);
    const upperArm = new THREE.Mesh(upperArmGeo, robotOrangeMat);
    upperArm.position.set(0.15, 0.45, 0);
    this.axis2.add(upperArm);

    this.axis3 = new THREE.Group();
    this.axis3.position.set(0.15, 0.9, 0);
    this.axis2.add(this.axis3);

    // 4. Elbow & Forearm Casting (Axis 3 & 4)
    const forearmGeo = new THREE.CylinderGeometry(0.11, 0.13, 0.85, 16);
    const forearm = new THREE.Mesh(forearmGeo, robotOrangeMat);
    forearm.rotation.z = Math.PI / 2;
    forearm.position.set(0.42, 0, 0);
    this.axis3.add(forearm);

    this.wrist = new THREE.Group();
    this.wrist.position.set(0.85, 0, 0);
    this.axis3.add(this.wrist);

    // 5. 3-Axis Wrist & Welding Torch Tool (Axis 5 & 6)
    const wristGeo = new THREE.SphereGeometry(0.12, 12, 12);
    const wristMesh = new THREE.Mesh(wristGeo, darkJointMat);
    this.wrist.add(wristMesh);

    // Torch Neck & Nozzle
    const neckGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.35, 12);
    const neck = new THREE.Mesh(neckGeo, chromeMat);
    neck.rotation.x = Math.PI / 3;
    neck.position.set(0, -0.15, 0.12);
    this.wrist.add(neck);

    const tipGeo = new THREE.ConeGeometry(0.035, 0.08, 12);
    const tipMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.9 });
    const tip = new THREE.Mesh(tipGeo, tipMat);
    tip.position.set(0, -0.32, 0.22);
    tip.rotation.x = Math.PI / 3;
    this.wrist.add(tip);

    this.group.add(this.robotGroup);
  }

  initFixtureTable() {
    this.tableGroup = new THREE.Group();
    this.tableGroup.position.set(0.65, -0.6, 0.2);

    const tableGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.12, 24);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3 });
    const table = new THREE.Mesh(tableGeo, tableMat);
    this.tableGroup.add(table);

    // Workpiece Pipe / Joint fixture
    const pipeGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.6, 24);
    const pipeMat = this.rendererInstance.materials.darkSteel || new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 });
    const pipe = new THREE.Mesh(pipeGeo, pipeMat);
    pipe.position.y = 0.35;
    this.tableGroup.add(pipe);

    this.group.add(this.tableGroup);
  }

  initProfilometryLaser() {
    // Optical laser profilometer beam sheet projecting from sensor head onto seam
    const beamGeo = new THREE.ConeGeometry(0.25, 0.6, 4, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x00d4ff,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide
    });
    this.laserBeam = new THREE.Mesh(beamGeo, beamMat);
    this.laserBeam.rotation.x = Math.PI / 1.35;
    this.laserBeam.position.set(0, -0.22, 0.25);
    this.wrist.add(this.laserBeam);
  }

  update(delta, time) {
    // Articulate joints along realistic robotic weld tracking path
    this.weldCycleTime += delta * 1.2;
    const t = Math.sin(this.weldCycleTime);

    this.axis1.rotation.y = t * 0.35 + 0.25;
    this.axis2.rotation.z = Math.cos(this.weldCycleTime) * 0.15 - 0.2;
    this.axis3.rotation.z = Math.sin(this.weldCycleTime * 0.8) * 0.2 + 0.3;
    this.wrist.rotation.x = Math.sin(this.weldCycleTime) * 0.25;

    // Laser beam opacity pulse
    this.laserBeam.material.opacity = 0.35 + Math.sin(time * 12.0) * 0.15;
  }
}
