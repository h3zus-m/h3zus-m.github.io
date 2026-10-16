/**
 * HARSH MISTRY 3D SPATIAL ENGINE // MASTER ENTRY POINT
 * Coordinates the shared WebGLRenderer, CameraRig, ChapterController,
 * UIController, and FallbackController into a unified high-performance runtime.
 */

import * as THREE from '../assets/three.module.min.js';
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

    // Expose engine instance globally for telemetry and verification
    window.portfolioEngine = this;

    // 4. Interactive 3D Raycasting Controller
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-999, -999);
    this.hoveredHotspot = null;
    this.setupInteractiveRaycasting();

    this.setupLifecycleObservers();
    this.start();
  }

  setupInteractiveRaycasting() {
    if (!this.canvas) return;

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Generac Chapter (1): Raycast against 3D PCBA components
      const activeIdx = this.chapterController.currentChapterIndex;
      if (activeIdx === 1) {
        const genScene = this.chapterController.scenes.generac;
        if (genScene && genScene.interactiveHotspots) {
          const objects = genScene.interactiveHotspots.map(h => h.object);
          this.raycaster.setFromCamera(this.mouse, this.cameraRig.camera);
          const intersects = this.raycaster.intersectObjects(objects, true);

          if (intersects.length > 0) {
            let topObj = intersects[0].object;
            while (topObj.parent && !genScene.interactiveHotspots.some(h => h.object === topObj)) {
              topObj = topObj.parent;
            }
            const found = genScene.interactiveHotspots.find(h => h.object === topObj);
            if (found) {
              this.canvas.style.cursor = 'pointer';
              this.hoveredHotspot = found;
              return;
            }
          }
        }
      }
      this.canvas.style.cursor = 'grab';
      this.hoveredHotspot = null;
    });

    this.canvas.addEventListener('click', () => {
      if (this.hoveredHotspot) {
        const genScene = this.chapterController.scenes.generac;
        if (genScene) {
          genScene.selectComponent(this.hoveredHotspot.name);
        }
      }
    });
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

      // Deactivate static fallback once real 3D frame renders
      if (!this.hasRenderedFirstFrame) {
        this.hasRenderedFirstFrame = true;
        this.fallbackController.deactivateFallback();
      }

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

// Auto-boot immediately when script executes (DOM already parsed before </body>)
function bootEngine() {
  if (window.portfolioEngine) return;
  try {
    window.portfolioEngine = new PortfolioSpatialEngine();
  } catch (err) {
    console.error('[Engine Boot Error]', err);
    window.portfolioEngineError = err.toString() + '\n' + (err.stack || '');
  }
}

bootEngine();
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootEngine);
}
