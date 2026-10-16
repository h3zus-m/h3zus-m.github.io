/**
 * CHAPTER CONTROLLER & LIFECYCLE COORDINATOR
 * Manages the 10 discrete chapter destinations, CatmullRomCurve3 waypoints,
 * scene visibility culling, smooth continuous spatial transitions, and deep linking.
 */

import * as THREE from '../assets/three.module.min.js';
import { EntranceScene } from './scenes/EntranceScene.js';
import { GeneracScene } from './scenes/GeneracScene.js';
import { UscDcScene } from './scenes/UscDcScene.js';
import { VindeepScene } from './scenes/VindeepScene.js';
import { LtScene } from './scenes/LtScene.js';
import { BancoScene } from './scenes/BancoScene.js';
import { WorkbenchScene } from './scenes/WorkbenchScene.js';
import { InventoryScene } from './scenes/InventoryScene.js';
import { EducationScene } from './scenes/EducationScene.js';
import { ContactScene } from './scenes/ContactScene.js';

export const CHAPTER_DEFINITIONS = [
  { id: 'entrance', number: '00', title: 'The Entrance', subtitle: 'Berserker Avatar & Greatsword Monolith Cleave' },
  { id: 'generac', number: '01', title: 'Generac Power Systems', subtitle: 'PWRmicro Microinverter & Sourcing BOM Reconciliation' },
  { id: 'usc-dc', number: '02', title: 'USC Bookstore DC', subtitle: 'Kinetic Warehouse Topology & Pareto Slotting' },
  { id: 'vindeep', number: '03', title: 'Vindeep Expo Engineers', subtitle: 'Statutory Testing Operations & Compliance Framework' },
  { id: 'lt', number: '04', title: 'Larsen & Toubro', subtitle: 'Automated Robotic Welding Seam Monitoring' },
  { id: 'banco', number: '05', title: 'Banco Products', subtitle: 'Brazed Heat Exchanger & Quality Assurance' },
  { id: 'workbench', number: '06', title: 'AI Decision Workbench', subtitle: 'Governed Python MCP Server (12 Plants)' },
  { id: 'inventory', number: '07', title: 'Inventory Policy Optimization', subtitle: 'FOQ vs LFL vs POQ Demand Simulation' },
  { id: 'education', number: '08', title: 'Academic Foundation', subtitle: 'USC (M.S. Engineering Management) & PDEU (B.Tech)' },
  { id: 'contact', number: '09', title: 'Contact Destination', subtitle: 'Dynamic Particle-Link Interactive Sculpture' }
];

export class ChapterController {
  constructor(rendererInstance, cameraRig) {
    this.rendererInstance = rendererInstance;
    this.cameraRig = cameraRig;
    this.scene = rendererInstance.scene;

    this.currentChapterIndex = 0;
    this.chapterDefs = CHAPTER_DEFINITIONS;
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Instantiate all 10 discrete scenes
    this.scenes = {
      entrance: new EntranceScene(rendererInstance, cameraRig),
      generac: new GeneracScene(rendererInstance),
      'usc-dc': new UscDcScene(rendererInstance),
      vindeep: new VindeepScene(rendererInstance),
      lt: new LtScene(rendererInstance),
      banco: new BancoScene(rendererInstance),
      workbench: new WorkbenchScene(rendererInstance),
      inventory: new InventoryScene(rendererInstance),
      education: new EducationScene(rendererInstance),
      contact: new ContactScene(rendererInstance)
    };

    // Add scene groups to master scene
    Object.values(this.scenes).forEach(s => {
      this.scene.add(s.group);
    });

    // Camera Waypoints for each chapter [CameraPos, LookAtPos]
    this.waypoints = [
      [new THREE.Vector3(0, 1.4, 5.2),   new THREE.Vector3(0, 0.45, 0)],      // 00 Entrance
      [new THREE.Vector3(0, 0.4, -4.2),  new THREE.Vector3(0, 0, -8)],       // 01 Generac
      [new THREE.Vector3(0, 3.8, -13.0), new THREE.Vector3(0, -0.4, -18)],   // 02 USC DC
      [new THREE.Vector3(0, 1.1, -23.5), new THREE.Vector3(0, 0, -28)],      // 03 Vindeep
      [new THREE.Vector3(0, 1.1, -33.5), new THREE.Vector3(0, 0, -38)],      // 04 L&T
      [new THREE.Vector3(0, 0.8, -43.5), new THREE.Vector3(0, 0, -48)],      // 05 Banco
      [new THREE.Vector3(0, 1.4, -53.2), new THREE.Vector3(0, 0, -58)],      // 06 Workbench
      [new THREE.Vector3(0, 1.2, -63.5), new THREE.Vector3(0, 0, -68)],      // 07 Inventory
      [new THREE.Vector3(0, 0.6, -73.5), new THREE.Vector3(0, 0, -78)],      // 08 Education
      [new THREE.Vector3(0, 0.2, -83.5), new THREE.Vector3(0, 0, -88)]       // 09 Contact
    ];

    this.setupListeners();
    this.handleInitialRouting();
  }

  setupListeners() {
    // Listen for strike completion from EntranceScene
    document.addEventListener('engine:strikecomplete', () => {
      this.goToChapter(1); // Advance seamlessly into Generac scene
    });

    // Listen for hash changes
    window.addEventListener('hashchange', () => {
      this.handleHashRoute(window.location.hash);
    });

    // Listen for scroll progress from CameraRig
    document.addEventListener('camera:progresschange', (e) => {
      const idx = e.detail.chapterIndex;
      if (idx !== this.currentChapterIndex && idx >= 0 && idx < CHAPTER_DEFINITIONS.length) {
        this.currentChapterIndex = idx;
        this.updateSceneVisibility(idx);
        document.dispatchEvent(new CustomEvent('engine:chapterchange', {
          detail: {
            index: idx,
            id: CHAPTER_DEFINITIONS[idx].id,
            definition: CHAPTER_DEFINITIONS[idx]
          }
        }));
      }
    });

    // Reduced motion listener
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.prefersReducedMotion = e.matches;
      if (this.prefersReducedMotion && this.currentChapterIndex === 0) {
        this.scenes.entrance.skipStrike();
      }
    });
  }

  handleInitialRouting() {
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();

    if (hash) {
      this.handleHashRoute(hash);
    } else if (search.includes('chapter=')) {
      const match = search.match(/chapter=([a-z0-9_-]+)/);
      if (match && match[1]) {
        this.goToChapter(match[1], true);
      }
    } else {
      this.goToChapter(0, true);
    }
  }

  handleHashRoute(hash) {
    const clean = hash.replace(/^#/, '');
    const map = {
      'hero': 0,
      'entrance': 0,
      'generac': 1,
      'usc-dc': 2,
      'warehouse': 2,
      'vindeep': 3,
      'lt': 4,
      'larsen-toubro': 4,
      'banco': 5,
      'workbench': 6,
      'projects': 6,
      'project-a': 6,
      'inventory': 7,
      'project-b': 7,
      'education': 8,
      'usc': 8,
      'contact': 9
    };

    if (map[clean] !== undefined) {
      this.goToChapter(map[clean], this.prefersReducedMotion);
    }
  }

  goToChapter(target, immediate = false) {
    let index = 0;
    if (typeof target === 'number') {
      index = Math.max(0, Math.min(CHAPTER_DEFINITIONS.length - 1, target));
    } else if (typeof target === 'string') {
      const found = CHAPTER_DEFINITIONS.findIndex(c => c.id === target);
      if (found !== -1) index = found;
    }

    this.currentChapterIndex = index;
    const def = CHAPTER_DEFINITIONS[index];

    // If reduced motion is active or entrance was skipped
    if (this.prefersReducedMotion && index > 0 && !this.scenes.entrance.isFinished) {
      this.scenes.entrance.skipStrike();
    }

    // Drive camera rig along 3D CatmullRomCurve3 spline
    if (this.cameraRig) {
      this.cameraRig.setChapterProgress(index, immediate || this.prefersReducedMotion);
    }

    // Update scene visibility for rendering performance
    this.updateSceneVisibility(index);

    // Dispatch chapter change event for UI
    document.dispatchEvent(new CustomEvent('engine:chapterchange', {
      detail: {
        index,
        id: def.id,
        definition: def
      }
    }));
  }

  updateSceneVisibility(activeIdx) {
    // Only keep active and immediately adjacent scenes visible to optimize GPU draw calls
    const ids = CHAPTER_DEFINITIONS.map(c => c.id);
    ids.forEach((id, i) => {
      const isNear = Math.abs(i - activeIdx) <= 1;
      if (this.scenes[id]) {
        this.scenes[id].group.visible = isNear;
      }
    });
  }

  update(delta, time) {
    // Update active scene
    const activeId = CHAPTER_DEFINITIONS[this.currentChapterIndex].id;
    if (this.scenes[activeId] && typeof this.scenes[activeId].update === 'function') {
      this.scenes[activeId].update(delta, time);
    }

    // Always keep entrance updating if strike is in flight
    if (this.scenes.entrance.isStriking && activeId !== 'entrance') {
      this.scenes.entrance.update(delta, time);
    }
  }
}
