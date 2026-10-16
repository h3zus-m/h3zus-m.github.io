/**
 * HARSH MISTRY 3D SPATIAL ENGINE // MASTER ENTRY POINT
 * Coordinates the shared WebGLRenderer, CameraRig, ChapterController,
 * UIController, and FallbackController into a unified high-performance runtime.
 */

import { EngineRenderer } from './Renderer.js';
import { CameraRig } from './CameraRig.js';
import { ChapterController } from './ChapterController.js';
import { UIController } from './UIController.js';
import { FallbackController } from './FallbackController.js';

export class PortfolioSpatialEngine {
  constructor() {
    this.canvas = document.getElementById('hero-3d-canvas');
    this.container = document.getElementById('hero-spatial-viewport');

    // 1. Initialize Fallback Controller first (ensures dependable buttons even if WebGL fails)
    this.fallbackController = new FallbackController();

    if (!this.canvas || !this.fallbackController.detectWebGL()) {
      console.warn('[Engine] WebGL canvas missing or unsupported. Fallback mode operational.');
      return;
    }

    // 2. Initialize Core Subsystems
    this.rendererInstance = new EngineRenderer(this.canvas);
    this.cameraRig = new CameraRig(this.container);
    this.chapterController = new ChapterController(this.rendererInstance, this.cameraRig);
    this.uiController = new UIController(this.chapterController);

    // 3. Performance & Timing State
    this.clock = new Date();
    this.lastTime = performance.now();
    this.fps = 60;
    this.frameCount = 0;
    this.fpsTimer = performance.now();
    this.isRunning = false;

    this.setupLifecycleObservers();
    this.start();
  }

  setupLifecycleObservers() {
    // Window Resize with debounce
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        this.rendererInstance.resize(w, h);
        this.cameraRig.resize(w, h);
      }, 100);
    }, { passive: true });

    // Page Visibility API: Pause loop when tab is hidden to save battery & GPU
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stop();
      } else {
        this.start();
      }
    });

    // IntersectionObserver: Pause rendering when 3D canvas is scrolled offscreen
    if ('IntersectionObserver' in window && this.container) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.start();
          } else {
            this.stop();
          }
        });
      }, { threshold: 0.05 });
      observer.observe(this.container);
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop = (currentTime) => {
      if (!this.isRunning) return;
      requestAnimationFrame(this.loop);

      const delta = Math.min((currentTime - this.lastTime) / 1000, 0.1);
      this.lastTime = currentTime;
      const totalTime = currentTime * 0.001;

      // Update Camera & Active Scenes
      this.cameraRig.update(delta);
      this.chapterController.update(delta, totalTime);

      // Render Active View
      this.rendererInstance.render(this.cameraRig.camera);

      // Measure Real FPS
      this.frameCount++;
      if (currentTime - this.fpsTimer > 1000) {
        this.fps = this.frameCount;
        this.frameCount = 0;
        this.fpsTimer = currentTime;
      }
    };
    requestAnimationFrame(this.loop);
  }

  stop() {
    this.isRunning = false;
  }
}

// Auto-boot on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new PortfolioSpatialEngine());
} else {
  new PortfolioSpatialEngine();
}
