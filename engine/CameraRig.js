/**
 * CAMERA RIG & VIEWPORT CONTROLLER
 * Handles responsive camera projection, bounds-aware framing, smooth transit paths,
 * pointer drag inspection without fighting vertical scrolling, and seismic impact shake.
 */

import * as THREE from '../assets/three.module.min.js';

export class CameraRig {
  constructor(container) {
    this.container = container;
    this.aspect = window.innerWidth / window.innerHeight;
    this.isPortrait = this.aspect < 1.0;

    const initialFov = this.isPortrait ? 58 : 42;
    this.camera = new THREE.PerspectiveCamera(initialFov, this.aspect, 0.1, 120);

    // Camera positions (current, target, lookAt)
    this.currentPosition = new THREE.Vector3(0, 1.35, 5.2);
    this.targetPosition = new THREE.Vector3(0, 1.35, 5.2);
    this.currentLookAt = new THREE.Vector3(0, 0.45, 0);
    this.targetLookAt = new THREE.Vector3(0, 0.45, 0);

    this.camera.position.copy(this.currentPosition);
    this.camera.lookAt(this.currentLookAt);

    // Controlled inspection orbit offsets
    this.orbitOffset = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.isDragging = false;
    this.pointerStart = { x: 0, y: 0 };

    // Seismic shake parameters
    this.shakeIntensity = 0;
    this.shakeDecay = 0.92;

    this.setupPointerListeners();
  }

  setupPointerListeners() {
    window.addEventListener('mousemove', (e) => {
      // Subtle parallax when hovering (does not trap scroll)
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      this.orbitOffset.targetX = nx * 0.45;
      this.orbitOffset.targetY = -ny * 0.25;
    }, { passive: true });

    // Drag-to-orbit handler on canvas area
    const onStart = (clientX, clientY) => {
      this.isDragging = true;
      this.pointerStart.x = clientX;
      this.pointerStart.y = clientY;
    };

    const onMove = (clientX, clientY) => {
      if (!this.isDragging) return;
      const dx = (clientX - this.pointerStart.x) / window.innerWidth;
      const dy = (clientY - this.pointerStart.y) / window.innerHeight;
      this.orbitOffset.targetX += dx * 1.5;
      this.orbitOffset.targetY -= dy * 1.5;
      // Clamp inspection angles
      this.orbitOffset.targetX = Math.max(-1.2, Math.min(1.2, this.orbitOffset.targetX));
      this.orbitOffset.targetY = Math.max(-0.6, Math.min(0.6, this.orbitOffset.targetY));
      this.pointerStart.x = clientX;
      this.pointerStart.y = clientY;
    };

    const onEnd = () => {
      this.isDragging = false;
    };

    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchend', onEnd);
  }

  triggerShake(intensity = 0.085) {
    this.shakeIntensity = intensity;
  }

  setDestination(pos, lookAt, immediate = false) {
    this.targetPosition.copy(pos);
    this.targetLookAt.copy(lookAt);

    // Adapt for mobile portrait screens
    if (this.isPortrait) {
      this.targetPosition.z += 1.8;
      this.targetPosition.y += 0.3;
    }

    if (immediate) {
      this.currentPosition.copy(this.targetPosition);
      this.currentLookAt.copy(this.targetLookAt);
      this.camera.position.copy(this.currentPosition);
      this.camera.lookAt(this.currentLookAt);
    }
  }

  resize(width, height) {
    this.aspect = width / height;
    this.isPortrait = this.aspect < 1.0;
    this.camera.fov = this.isPortrait ? 58 : 42;
    this.camera.aspect = this.aspect;
    this.camera.updateProjectionMatrix();
  }

  update(delta) {
    // Dampen orbit offset
    this.orbitOffset.x += (this.orbitOffset.targetX - this.orbitOffset.x) * 0.08;
    this.orbitOffset.y += (this.orbitOffset.targetY - this.orbitOffset.y) * 0.08;

    // Smooth lerp to camera destination
    const lerpFactor = 0.055;
    this.currentPosition.lerp(this.targetPosition, lerpFactor);
    this.currentLookAt.lerp(this.targetLookAt, lerpFactor);

    // Apply offset + camera shake
    this.camera.position.copy(this.currentPosition);
    this.camera.position.x += this.orbitOffset.x;
    this.camera.position.y += this.orbitOffset.y;

    if (this.shakeIntensity > 0.001) {
      this.camera.position.x += (Math.random() - 0.5) * this.shakeIntensity;
      this.camera.position.y += (Math.random() - 0.5) * this.shakeIntensity;
      this.camera.position.z += (Math.random() - 0.5) * this.shakeIntensity * 0.5;
      this.shakeIntensity *= this.shakeDecay;
    }

    this.camera.lookAt(this.currentLookAt);
  }
}
