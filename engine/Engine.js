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

    // 3. Monotonic Performance & Frame-Time Telemetry
    this.clock = new Date();
    this.lastTime = performance.now();
    this.totalFramesRendered = 0; // Strictly monotonic, never resets
    this.frameCount = 0;
    this.fps = 60;
    this.fpsTimer = performance.now();
    this.frameTimeBuffer = []; // Rolling frame duration buffer (ms)
    this.avgFrameTimeMs = 16.6;
    this.isRunning = false;
    this.hasRenderedFirstFrame = false;

    // Expose engine instance globally for telemetry and verification
    window.portfolioEngine = this;

    // 4. Interactive 3D Raycasting Controller with Direct Touch & Pointer Support
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-999, -999);
    this.hoveredHotspot = null;
    this.setupInteractiveRaycasting();

    this.setupLifecycleObservers();
    this.start();
  }

  performHitTest(clientX, clientY) {
    if (!this.canvas) return null;
    const rect = this.canvas.getBoundingClientRect();
    const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -((clientY - rect.top) / rect.height) * 2 + 1;

    this.mouse.set(nx, ny);
    this.raycaster.setFromCamera(this.mouse, this.cameraRig.camera);

    const activeIdx = this.chapterController.currentChapterIndex;

    // Generac Chapter (1): Hit-test PCBA components
    if (activeIdx === 1) {
      const genScene = this.chapterController.scenes.generac;
      if (genScene && genScene.interactiveHotspots) {
        const objects = genScene.interactiveHotspots.map(h => h.object);
        const intersects = this.raycaster.intersectObjects(objects, true);
        if (intersects.length > 0) {
          let topObj = intersects[0].object;
          while (topObj.parent && !genScene.interactiveHotspots.some(h => h.object === topObj)) {
            topObj = topObj.parent;
          }
          const found = genScene.interactiveHotspots.find(h => h.object === topObj);
          if (found) return found;
        }
      }
    }

    // Workbench Chapter (6): Hit-test Plant nodes
    if (activeIdx === 6) {
      const wbScene = this.chapterController.scenes.workbench;
      if (wbScene && wbScene.plantNodes) {
        const objects = wbScene.plantNodes.map(n => n.group);
        const intersects = this.raycaster.intersectObjects(objects, true);
        if (intersects.length > 0) {
          let topObj = intersects[0].object;
          while (topObj.parent && !wbScene.plantNodes.some(n => n.group === topObj)) {
            topObj = topObj.parent;
          }
          const found = wbScene.plantNodes.find(n => n.group === topObj);
          if (found) return { type: 'plant', data: found.plant };
        }
      }
    }

    return null;
  }

  setupInteractiveRaycasting() {
    if (!this.canvas) return;

    // Hover pointer cursor update
    this.canvas.addEventListener('mousemove', (e) => {
      const hit = this.performHitTest(e.clientX, e.clientY);
      if (hit) {
        this.canvas.style.cursor = 'pointer';
        this.hoveredHotspot = hit;
      } else {
        this.canvas.style.cursor = 'grab';
        this.hoveredHotspot = null;
      }
    }, { passive: true });

    // Direct Click Selection (Does not rely on prior hover state)
    this.canvas.addEventListener('click', (e) => {
      const hit = this.performHitTest(e.clientX, e.clientY);
      if (hit) {
        if (hit.name && this.chapterController.currentChapterIndex === 1) {
          this.chapterController.scenes.generac?.selectComponent(hit.name);
        } else if (hit.type === 'plant' && this.chapterController.currentChapterIndex === 6) {
          this.chapterController.scenes.workbench?.selectPlant(hit.data);
        }
      }
    });

    // Direct Touch Selection for mobile / tablet
    this.canvas.addEventListener('touchend', (e) => {
      if (e.changedTouches.length === 1) {
        const touch = e.changedTouches[0];
        const hit = this.performHitTest(touch.clientX, touch.clientY);
        if (hit) {
          if (hit.name && this.chapterController.currentChapterIndex === 1) {
            this.chapterController.scenes.generac?.selectComponent(hit.name);
          } else if (hit.type === 'plant' && this.chapterController.currentChapterIndex === 6) {
            this.chapterController.scenes.workbench?.selectPlant(hit.data);
          }
        }
      }
    }, { passive: true });
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
      }, 80);
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

      const frameDurationMs = Math.max(0.5, currentTime - this.lastTime);
      const delta = Math.min(frameDurationMs / 1000, 0.1);
      this.lastTime = currentTime;
      const totalTime = currentTime * 0.001;

      // Track high-resolution frame times
      this.frameTimeBuffer.push(frameDurationMs);
      if (this.frameTimeBuffer.length > 60) {
        this.frameTimeBuffer.shift();
      }
      const sum = this.frameTimeBuffer.reduce((a, b) => a + b, 0);
      this.avgFrameTimeMs = sum / this.frameTimeBuffer.length;
      this.fps = Math.round(1000 / this.avgFrameTimeMs);

      // Monotonic frame counter
      this.totalFramesRendered++;

      // Update Camera & Active Scenes
      this.cameraRig.update(delta);
      this.chapterController.update(delta, totalTime);

      // Render Active View
      this.rendererInstance.render(this.cameraRig.camera);

      // Deactivate static fallback strictly once real 3D frame renders
      if (!this.hasRenderedFirstFrame && this.totalFramesRendered >= 2) {
        this.hasRenderedFirstFrame = true;
        this.fallbackController.deactivateFallback();
      }
    };
    requestAnimationFrame(this.loop);
  }

  stop() {
    this.isRunning = false;
  }
}

// Auto-boot immediately when script executes
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
