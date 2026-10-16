/**
 * CAMERA RIG & CONTINUOUS 3D SPLINE CONTROLLER
 * CatmullRomCurve3 spline path spanning all 10 chapters, scroll-to-path interpolation,
 * drag-to-orbit inspection, and seismic impact shake.
 */

import * as THREE from '../assets/three.module.min.js';

export class CameraRig {
  constructor(container) {
    this.container = container;
    const rect = container ? container.getBoundingClientRect() : null;
    this.aspect = (rect && rect.width > 0 && rect.height > 0) ? rect.width / rect.height : window.innerWidth / window.innerHeight;
    this.isPortrait = this.aspect < 1.0;

    const initialFov = this.isPortrait ? 56 : 42;
    this.camera = new THREE.PerspectiveCamera(initialFov, this.aspect, 0.1, 140);

    // 10 Chapter Key Station Waypoints [CameraPos, LookAtPos]
    this.keyStations = [
      { pos: new THREE.Vector3(0, 1.4, 5.2),   look: new THREE.Vector3(0, 0.45, 0) },      // 00 Entrance
      { pos: new THREE.Vector3(0, 0.4, -4.2),  look: new THREE.Vector3(0, 0, -8) },       // 01 Generac
      { pos: new THREE.Vector3(0, 3.8, -13.0), look: new THREE.Vector3(0, -0.4, -18) },   // 02 USC DC
      { pos: new THREE.Vector3(0, 1.1, -23.5), look: new THREE.Vector3(0, 0, -28) },      // 03 Vindeep
      { pos: new THREE.Vector3(0, 1.1, -33.5), look: new THREE.Vector3(0, 0, -38) },      // 04 L&T
      { pos: new THREE.Vector3(0, 0.8, -43.5), look: new THREE.Vector3(0, 0, -48) },      // 05 Banco
      { pos: new THREE.Vector3(0, 1.4, -53.2), look: new THREE.Vector3(0, 0, -58) },      // 06 Workbench
      { pos: new THREE.Vector3(0, 1.2, -63.5), look: new THREE.Vector3(0, 0, -68) },      // 07 Inventory
      { pos: new THREE.Vector3(0, 0.6, -73.5), look: new THREE.Vector3(0, 0, -78) },      // 08 Education
      { pos: new THREE.Vector3(0, 0.2, -83.5), look: new THREE.Vector3(0, 0, -88) }       // 09 Contact
    ];

    // Build CatmullRomCurve3 3D Splines
    const posPoints = this.keyStations.map(s => s.pos);
    const lookPoints = this.keyStations.map(s => s.look);

    this.cameraSpline = new THREE.CatmullRomCurve3(posPoints, false, 'catmullrom', 0.25);
    this.lookAtSpline = new THREE.CatmullRomCurve3(lookPoints, false, 'catmullrom', 0.25);

    // Continuous Spline Progress (0.0 to 1.0)
    this.progress = 0.0;
    this.targetProgress = 0.0;

    this.currentPosition = new THREE.Vector3().copy(this.keyStations[0].pos);
    this.currentLookAt = new THREE.Vector3().copy(this.keyStations[0].look);
    this.targetPosition = new THREE.Vector3().copy(this.keyStations[0].pos);
    this.targetLookAt = new THREE.Vector3().copy(this.keyStations[0].look);
    this.camera.position.copy(this.currentPosition);
    this.camera.lookAt(this.currentLookAt);

    // Controlled inspection orbit offsets
    this.orbitOffset = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.isDragging = false;
    this.pointerStart = { x: 0, y: 0 };

    // Seismic shake parameters
    this.shakeIntensity = 0;
    this.shakeDecay = 0.90;

    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.prefersReducedMotion = e.matches;
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Subtle Mouse Parallax Hover (Clamped, non-intrusive)
    window.addEventListener('mousemove', (e) => {
      if (this.prefersReducedMotion) return;
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      this.orbitOffset.targetX = nx * 0.35;
      this.orbitOffset.targetY = -ny * 0.20;
    }, { passive: true });

    // Drag-to-Orbit Pointer Events (Properly attached!)
    const onStart = (clientX, clientY) => {
      this.isDragging = true;
      this.pointerStart.x = clientX;
      this.pointerStart.y = clientY;
    };

    const onMove = (clientX, clientY) => {
      if (!this.isDragging || this.prefersReducedMotion) return;
      const dx = (clientX - this.pointerStart.x) / window.innerWidth;
      const dy = (clientY - this.pointerStart.y) / window.innerHeight;
      this.orbitOffset.targetX += dx * 1.8;
      this.orbitOffset.targetY -= dy * 1.8;
      // Clamp inspection angles
      this.orbitOffset.targetX = Math.max(-0.75, Math.min(0.75, this.orbitOffset.targetX));
      this.orbitOffset.targetY = Math.max(-0.45, Math.min(0.45, this.orbitOffset.targetY));
      this.pointerStart.x = clientX;
      this.pointerStart.y = clientY;
    };

    const onEnd = () => {
      this.isDragging = false;
    };

    if (this.container) {
      this.container.addEventListener('mousedown', (e) => onStart(e.clientX, e.clientY));
      this.container.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) onStart(e.touches[0].clientX, e.touches[0].clientY);
      }, { passive: true });
    }

    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) onMove(e.clientX, e.clientY);
    });

    window.addEventListener('touchmove', (e) => {
      if (this.isDragging && e.touches.length === 1) onMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchend', onEnd);

    // Scroll Wheel Controller (Drives 3D Spline Progress)
    window.addEventListener('wheel', (e) => {
      // Don't intercept scroll if inside a scrollable modal/drawer
      if (e.target.closest('#work-index-modal') || e.target.closest('#generac-evidence-drawer')) return;

      const delta = Math.sign(e.deltaY) * 0.055;
      this.targetProgress = Math.max(0.0, Math.min(1.0, this.targetProgress + delta));
      this.notifyChapterFromProgress();
    }, { passive: true });
  }

  notifyChapterFromProgress() {
    const numChapters = this.keyStations.length;
    const estimatedChapter = Math.round(this.targetProgress * (numChapters - 1));
    document.dispatchEvent(new CustomEvent('camera:progresschange', {
      detail: { progress: this.targetProgress, chapterIndex: estimatedChapter }
    }));
  }

  setChapterProgress(index, immediate = false) {
    const numChapters = this.keyStations.length;
    const clampedIdx = Math.max(0, Math.min(numChapters - 1, index));
    this.targetProgress = clampedIdx / (numChapters - 1);
    this.targetPosition.copy(this.keyStations[clampedIdx].pos);
    this.targetLookAt.copy(this.keyStations[clampedIdx].look);

    if (immediate || this.prefersReducedMotion) {
      this.progress = this.targetProgress;
      this.currentPosition.copy(this.targetPosition);
      this.currentLookAt.copy(this.targetLookAt);
      this.camera.position.copy(this.currentPosition);
      this.camera.lookAt(this.currentLookAt);
    }
  }

  setDestination(pos, look, immediate = false) {
    if (pos) this.targetPosition.copy(pos);
    if (look) this.targetLookAt.copy(look);
    if (immediate || this.prefersReducedMotion) {
      this.currentPosition.copy(this.targetPosition);
      this.currentLookAt.copy(this.targetLookAt);
      this.camera.position.copy(this.currentPosition);
      this.camera.lookAt(this.currentLookAt);
    }
  }

  triggerShake(intensity = 0.085) {
    if (this.prefersReducedMotion) return;
    this.shakeIntensity = intensity;
  }

  resize(width, height) {
    this.aspect = width / height;
    this.isPortrait = this.aspect < 1.0;
    this.camera.fov = this.isPortrait ? 56 : 42;
    this.camera.aspect = this.aspect;
    this.camera.updateProjectionMatrix();
  }

  update(delta) {
    // Smooth Lerp along Spline
    const lerpRate = this.prefersReducedMotion ? 1.0 : Math.min(delta * 7.5, 1.0);
    this.progress += (this.targetProgress - this.progress) * lerpRate;

    // Sample Spline Points
    const splinePos = this.cameraSpline.getPointAt(this.progress);
    const splineLook = this.lookAtSpline.getPointAt(this.progress);

    // Smooth Orbit Offsets
    this.orbitOffset.x += (this.orbitOffset.targetX - this.orbitOffset.x) * 0.1;
    this.orbitOffset.y += (this.orbitOffset.targetY - this.orbitOffset.y) * 0.1;

    // Seismic Impact Shake
    let shakeX = 0, shakeY = 0, shakeZ = 0;
    if (this.shakeIntensity > 0.001) {
      shakeX = (Math.random() - 0.5) * this.shakeIntensity * 2;
      shakeY = (Math.random() - 0.5) * this.shakeIntensity * 2;
      shakeZ = (Math.random() - 0.5) * this.shakeIntensity * 2;
      this.shakeIntensity *= this.shakeDecay;
    } else {
      this.shakeIntensity = 0;
    }

    // Apply Position with Offsets and Shake
    this.currentPosition.set(
      splinePos.x + this.orbitOffset.x * 1.5 + shakeX,
      splinePos.y + this.orbitOffset.y * 1.2 + shakeY + (this.isPortrait ? 0.35 : 0),
      splinePos.z + shakeZ + (this.isPortrait ? 1.6 : 0)
    );

    this.currentLookAt.set(
      splineLook.x + this.orbitOffset.x * 0.3,
      splineLook.y + this.orbitOffset.y * 0.2,
      splineLook.z
    );

    this.camera.position.copy(this.currentPosition);
    this.camera.lookAt(this.currentLookAt);
  }
}
