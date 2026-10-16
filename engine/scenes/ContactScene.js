/**
 * CHAPTER 08: CONTACT DESTINATION // DYNAMIC PARTICLE MORPH SCULPTURE
 * 1,200 particle cloud with spatial depth, cursor physics, and real-time morphing
 * between Envelope (Email), Connected Network Glyph (LinkedIn), and Document Crest (Résumé).
 */

import * as THREE from '../../assets/three.module.min.js';

export class ContactScene {
  constructor(rendererInstance) {
    this.rendererInstance = rendererInstance;
    this.group = new THREE.Group();
    this.group.name = 'ContactScene';
    this.group.position.set(0, 0, -78);

    this.particleCount = 1200;
    this.activeMorphTarget = 'ENVELOPE'; // 'ENVELOPE', 'LINKEDIN', 'RESUME'
    this.morphProgress = 1.0;

    this.initParticleCloud();
  }

  initParticleCloud() {
    this.geometry = new THREE.BufferGeometry();
    this.positions = new Float32Array(this.particleCount * 3);
    this.targetPositions = new Float32Array(this.particleCount * 3);
    this.velocities = new Float32Array(this.particleCount * 3);

    // Target shapes
    this.envelopeTargets = new Float32Array(this.particleCount * 3);
    this.linkedinTargets = new Float32Array(this.particleCount * 3);
    this.resumeTargets = new Float32Array(this.particleCount * 3);

    this.generateEnvelopeShape();
    this.generateLinkedinShape();
    this.generateResumeShape();

    // Start with envelope positions
    for (let i = 0; i < this.particleCount * 3; i++) {
      this.positions[i] = this.envelopeTargets[i];
      this.targetPositions[i] = this.envelopeTargets[i];
      this.velocities[i] = 0;
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));

    // Particle Material with additive glow
    const pointMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.055,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(this.geometry, pointMat);
    this.group.add(this.particles);
  }

  generateEnvelopeShape() {
    for (let i = 0; i < this.particleCount; i++) {
      const idx = i * 3;
      const ratio = i / this.particleCount;

      if (ratio < 0.6) {
        // Outer rectangle (width 2.4, height 1.6)
        const u = Math.random();
        const v = Math.random();
        this.envelopeTargets[idx] = (u - 0.5) * 2.4;
        this.envelopeTargets[idx + 1] = (v - 0.5) * 1.6;
        this.envelopeTargets[idx + 2] = (Math.random() - 0.5) * 0.15;
      } else {
        // V-fold flap
        const t = (ratio - 0.6) / 0.4;
        const x = (t - 0.5) * 2.4;
        const y = 0.8 - Math.abs(x) * 0.65;
        this.envelopeTargets[idx] = x + (Math.random() - 0.5) * 0.08;
        this.envelopeTargets[idx + 1] = y + (Math.random() - 0.5) * 0.08;
        this.envelopeTargets[idx + 2] = (Math.random() - 0.5) * 0.15;
      }
    }
  }

  generateLinkedinShape() {
    for (let i = 0; i < this.particleCount; i++) {
      const idx = i * 3;
      // Interconnected Network Mesh: 3 clustered node orbits
      const angle = Math.random() * Math.PI * 2;
      const r = Math.pow(Math.random(), 0.5) * 1.1;
      const cluster = i % 3;

      let cx = 0, cy = 0;
      if (cluster === 0) { cx = -0.7; cy = -0.5; }
      else if (cluster === 1) { cx = 0.7; cy = -0.5; }
      else { cx = 0; cy = 0.7; }

      this.linkedinTargets[idx] = cx + Math.cos(angle) * r * 0.55;
      this.linkedinTargets[idx + 1] = cy + Math.sin(angle) * r * 0.55;
      this.linkedinTargets[idx + 2] = (Math.random() - 0.5) * 0.35;
    }
  }

  generateResumeShape() {
    for (let i = 0; i < this.particleCount; i++) {
      const idx = i * 3;
      // Tall document / sheet shape (width 1.5, height 2.2)
      this.resumeTargets[idx] = (Math.random() - 0.5) * 1.5;
      this.resumeTargets[idx + 1] = (Math.random() - 0.5) * 2.2;
      this.resumeTargets[idx + 2] = (Math.random() - 0.5) * 0.12;
    }
  }

  setMorphTarget(target) {
    if (this.activeMorphTarget === target) return;
    this.activeMorphTarget = target;

    let source = this.envelopeTargets;
    if (target === 'LINKEDIN') source = this.linkedinTargets;
    if (target === 'RESUME') source = this.resumeTargets;

    for (let i = 0; i < this.particleCount * 3; i++) {
      this.targetPositions[i] = source[i];
    }
  }

  update(delta, time) {
    const pos = this.geometry.attributes.position.array;

    // Spring physics pulling particles towards target positions
    const spring = 0.065;
    const friction = 0.88;

    for (let i = 0; i < this.particleCount; i++) {
      const idx = i * 3;

      // X
      let ax = (this.targetPositions[idx] - pos[idx]) * spring;
      this.velocities[idx] = (this.velocities[idx] + ax) * friction;
      pos[idx] += this.velocities[idx];

      // Y
      let ay = (this.targetPositions[idx + 1] - pos[idx + 1]) * spring;
      this.velocities[idx + 1] = (this.velocities[idx + 1] + ay) * friction;
      pos[idx + 1] += this.velocities[idx + 1];

      // Z + ambient float
      let az = (this.targetPositions[idx + 2] - pos[idx + 2]) * spring;
      this.velocities[idx + 2] = (this.velocities[idx + 2] + az) * friction;
      pos[idx + 2] += this.velocities[idx + 2];
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.particles.rotation.y = Math.sin(time * 0.4) * 0.15;
  }
}
