/**
 * CHAPTER CONTROLLER & LIFECYCLE COORDINATOR
 * Manages the 9 discrete chapter destinations, camera waypoints, scene visibility culling,
 * smooth continuous spatial transitions, and deep linking.
 */

import * as THREE from '../assets/three.module.min.js';
import { EntranceScene } from './scenes/EntranceScene.js';
import { GeneracScene } from './scenes/GeneracScene.js';
import { UscDcScene } from './scenes/UscDcScene.js';
import { VindeepScene } from './scenes/VindeepScene.js';
import { LtScene } from './scenes/LtScene.js';
import { BancoScene } from './scenes/BancoScene.js';
import { ProjectsScene } from './scenes/ProjectsScene.js';
import { EducationScene } from './scenes/EducationScene.js';
import { ContactScene } from './scenes/ContactScene.js';

export const CHAPTER_DEFINITIONS = [
  { id: 'entrance', number: '00', title: 'The Entrance', subtitle: 'Berserker Avatar & Greatsword Monolith Cleave' },
  { id: 'generac', number: '01', title: 'Generac Power Systems', subtitle: 'PWRmicro Microinverter & $1.2M Sourcing BOM' },
  { id: 'usc-dc', number: '02', title: 'USC Bookstore DC', subtitle: 'Kinetic Warehouse Topology & Pareto Slotting' },
  { id: 'vindeep', number: '03', title: 'Vindeep Expo Engineers', subtitle: 'ASME Section VIII Pressure Vessel Assembly' },
  { id: 'lt', number: '04', title: 'Larsen & Toubro', subtitle: 'Automated 6-Axis Robotic Welding Cell' },
  { id: 'banco', number: '05', title: 'Banco Products', subtitle: 'Brazed Heat Exchanger & Quality Assurance' },
  { id: 'projects', number: '06', title: 'Selected Projects', subtitle: 'Supply Network Decision Workbench (12 Plants)' },
  { id: 'education', number: '07', title: 'Education Continuum', subtitle: 'USC Viterbi (M.S. GPA 3.73) & PDEU (B.Tech 9.06)' },
  { id: 'contact', number: '08', title: 'Contact Destination', subtitle: 'Dynamic Particle-Link Interactive Sculpture' }
];

export class ChapterController {
  constructor(rendererInstance, cameraRig) {
    this.rendererInstance = rendererInstance;
    this.cameraRig = cameraRig;
    this.scene = rendererInstance.scene;

    this.currentChapterIndex = 0;
    this.chapterDefs = CHAPTER_DEFINITIONS;
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Instantiate all 9 discrete scenes
    this.scenes = {
      entrance: new EntranceScene(rendererInstance, cameraRig),
      generac: new GeneracScene(rendererInstance),
      'usc-dc': new UscDcScene(rendererInstance),
      vindeep: new VindeepScene(rendererInstance),
      lt: new LtScene(rendererInstance),
      banco: new BancoScene(rendererInstance),
      projects: new ProjectsScene(rendererInstance),
      education: new EducationScene(rendererInstance),
      contact: new ContactScene(rendererInstance)
    };

    // Add scene groups to master scene
    Object.values(this.scenes).forEach(s => {
      this.scene.add(s.group);
    });

    // Camera Waypoints for each chapter [CameraPos, LookAtPos]
    this.waypoints = [
      [new THREE.Vector3(0, 1.35, 5.2), new THREE.Vector3(0, 0.45, 0)],         // 00 Entrance
      [new THREE.Vector3(0, 0.4, -4.2), new THREE.Vector3(0, 0, -8)],           // 01 Generac
      [new THREE.Vector3(0, 3.8, -13.0), new THREE.Vector3(0, -0.4, -18)],       // 02 USC DC
      [new THREE.Vector3(0, 1.1, -23.5), new THREE.Vector3(0, 0, -28)],          // 03 Vindeep
      [new THREE.Vector3(0, 1.1, -33.5), new THREE.Vector3(0, 0, -38)],          // 04 L&T
      [new THREE.Vector3(0, 0.8, -43.5), new THREE.Vector3(0, 0, -48)],          // 05 Banco
      [new THREE.Vector3(0, 1.2, -53.2), new THREE.Vector3(0, 0, -58)],          // 06 Projects
      [new THREE.Vector3(0, 0.6, -63.5), new THREE.Vector3(0, 0, -68)],          // 07 Education
      [new THREE.Vector3(0, 0.2, -73.5), new THREE.Vector3(0, 0, -78)]           // 08 Contact
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
      'projects': 6,
      'education': 7,
      'usc': 7,
      'contact': 8
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
    const [camPos, lookAt] = this.waypoints[index];

    // If reduced motion is active or entrance was skipped
    if (this.prefersReducedMotion && index > 0 && !this.scenes.entrance.isFinished) {
      this.scenes.entrance.skipStrike();
    }

    this.cameraRig.setDestination(camPos, lookAt, immediate || this.prefersReducedMotion);

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
    // Update active scenes
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
