/**
 * CHAPTER 07: EDUCATION CONTINUUM // USC VITERBI & PDEU
 * Sculptural bronze Tommy Trojan heraldic shield, cardinal & gold ambient illumination,
 * PDEU mechanical engineering compass, and academic credential verification.
 */

import * as THREE from '../../assets/three.module.min.js';

export class EducationScene {
  constructor(rendererInstance) {
    this.rendererInstance = rendererInstance;
    this.group = new THREE.Group();
    this.group.name = 'EducationScene';
    this.group.position.set(0, 0, -68);

    this.initAcademicCrests();
  }

  initAcademicCrests() {
    this.crestGroup = new THREE.Group();

    // Patinated Bronze material
    const bronzeMat = new THREE.MeshStandardMaterial({
      color: 0x92400e, // Rich antique bronze
      metalness: 0.85,
      roughness: 0.3
    });

    const goldAccentMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // USC Gold
      metalness: 0.92,
      roughness: 0.18
    });

    const cardinalMat = new THREE.MeshStandardMaterial({
      color: 0x991b1b, // USC Cardinal Red
      roughness: 0.5
    });

    // 1. Classical Heraldic Shield Body
    const shieldShape = new THREE.Shape();
    shieldShape.moveTo(-0.9, 1.2);
    shieldShape.lineTo(0.9, 1.2);
    shieldShape.lineTo(0.9, 0.1);
    shieldShape.quadraticCurveTo(0.9, -1.1, 0, -1.6);
    shieldShape.quadraticCurveTo(-0.9, -1.1, -0.9, 0.1);
    shieldShape.closePath();

    const extrudeSettings = { depth: 0.14, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.04, bevelThickness: 0.04 };
    const shieldGeo = new THREE.ExtrudeGeometry(shieldShape, extrudeSettings);
    const shield = new THREE.Mesh(shieldGeo, bronzeMat);
    shield.position.z = -0.07;
    this.crestGroup.add(shield);

    // Inner Cardinal Inset Panel
    const innerShieldShape = new THREE.Shape();
    innerShieldShape.moveTo(-0.75, 1.05);
    innerShieldShape.lineTo(0.75, 1.05);
    innerShieldShape.lineTo(0.75, 0.1);
    innerShieldShape.quadraticCurveTo(0.75, -0.95, 0, -1.4);
    innerShieldShape.quadraticCurveTo(-0.75, -0.95, -0.75, 0.1);
    innerShieldShape.closePath();

    const innerGeo = new THREE.ShapeGeometry(innerShieldShape);
    const innerPanel = new THREE.Mesh(innerGeo, cardinalMat);
    innerPanel.position.z = 0.08;
    this.crestGroup.add(innerPanel);

    // 2. Sculpted Tommy Trojan Crossed Swords & Chevron
    const chevronGeo = new THREE.BoxGeometry(0.9, 0.12, 0.06);
    const chevron = new THREE.Mesh(chevronGeo, goldAccentMat);
    chevron.position.set(0, 0.15, 0.12);
    this.crestGroup.add(chevron);

    // 3. PDEU Mechanical Engineering Draft Compass Emblem
    const compassGroup = new THREE.Group();
    compassGroup.position.set(0, -0.45, 0.14);

    const legGeo = new THREE.CylinderGeometry(0.02, 0.015, 0.7, 8);
    const legL = new THREE.Mesh(legGeo, goldAccentMat);
    legL.rotation.z = Math.PI / 8;
    legL.position.x = -0.12;
    compassGroup.add(legL);

    const legR = new THREE.Mesh(legGeo, goldAccentMat);
    legR.rotation.z = -Math.PI / 8;
    legR.position.x = 0.12;
    compassGroup.add(legR);

    const hingeGeo = new THREE.SphereGeometry(0.045, 12, 12);
    const hinge = new THREE.Mesh(hingeGeo, goldAccentMat);
    hinge.position.y = 0.32;
    compassGroup.add(hinge);

    this.crestGroup.add(compassGroup);

    // Ambient Cardinal & Gold Illumination
    const goldLight = new THREE.PointLight(0xf59e0b, 1.2, 5);
    goldLight.position.set(1.2, 1.2, 1.5);
    this.crestGroup.add(goldLight);

    const cardinalLight = new THREE.PointLight(0x991b1b, 1.4, 5);
    cardinalLight.position.set(-1.2, -0.5, 1.5);
    this.crestGroup.add(cardinalLight);

    this.group.add(this.crestGroup);
  }

  update(delta, time) {
    this.crestGroup.rotation.y = Math.sin(time * 0.45) * 0.14;
    this.crestGroup.rotation.x = Math.sin(time * 0.3) * 0.06;
  }
}
