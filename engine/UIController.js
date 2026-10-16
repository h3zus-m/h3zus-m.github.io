/**
 * UI CONTROLLER & ACCESSIBLE INTERACTION ARCHITECT
 * Coordinates HTML overlays, floating navigation, chapter waypoints,
 * the Generac Sourcing Evidence Drawer with reconciled calculations,
 * Work Index modal, keyboard accessibility, and dependable fallback interaction.
 */

import { CHAPTER_DEFINITIONS } from './ChapterController.js';

export class UIController {
  constructor(chapterController) {
    this.chapterController = chapterController;
    this.activeEvidenceTab = 'mosfet';

    this.cacheDomElements();
    this.setupEventListeners();
    this.setupKeyboardNavigation();
  }

  cacheDomElements() {
    this.hudKicker = document.getElementById('hud-phase-kicker');
    this.hudTitle = document.getElementById('hud-phase-title');
    this.hudProblem = document.getElementById('hud-phase-problem');
    this.hudImpact = document.getElementById('hud-phase-impact');
    this.hudContextBtn = document.getElementById('btn-open-evidence');

    this.entranceOverlay = document.getElementById('entrance-controls-overlay');
    this.enterBtn = document.getElementById('btn-enter-world');
    this.skipBtn = document.getElementById('btn-skip-intro');

    this.generacControls = document.getElementById('generac-scene-controls');
    this.explodeBtn = document.getElementById('btn-explode-toggle');

    this.uscDcControls = document.getElementById('uscdc-scene-controls');
    this.btnPareto = document.getElementById('btn-route-pareto');
    this.btnBaseline = document.getElementById('btn-route-baseline');

    this.workIndexModal = document.getElementById('work-index-modal');
    this.btnOpenWorkIndex = document.getElementById('btn-open-work-index');
    this.btnCloseWorkIndex = document.getElementById('btn-close-work-index');

    this.evidenceDrawer = document.getElementById('generac-evidence-drawer');
    this.btnCloseEvidence = document.getElementById('btn-close-evidence');

    this.fallbackContainer = document.getElementById('hero-spatial-fallback');
    this.waypointButtons = document.querySelectorAll('.chapter-waypoint-btn');
  }

  setupEventListeners() {
    // Entrance: Enter button -> Starts strike animation
    if (this.enterBtn) {
      this.enterBtn.addEventListener('click', () => {
        if (this.chapterController.scenes.entrance) {
          this.enterBtn.classList.add('striking');
          this.chapterController.scenes.entrance.startStrike();
        }
      });
    }

    // Entrance: Skip Intro -> Instantly bypasses to Generac scene
    if (this.skipBtn) {
      this.skipBtn.addEventListener('click', () => {
        if (this.chapterController.scenes.entrance) {
          this.chapterController.scenes.entrance.skipStrike();
        }
        this.chapterController.goToChapter(1);
      });
    }

    // Generac: Explode toggle
    if (this.explodeBtn) {
      this.explodeBtn.addEventListener('click', () => {
        const genScene = this.chapterController.scenes.generac;
        if (genScene) {
          genScene.toggleExplode();
          this.explodeBtn.classList.toggle('active', genScene.targetExplodeProgress > 0.5);
          this.explodeBtn.textContent = genScene.targetExplodeProgress > 0.5 ? 'Collapse Assembly' : 'Explode Assembly';
        }
      });
    }

    // Generac: Component Hotspot Buttons
    document.querySelectorAll('[data-component-target]').forEach(btn => {
      btn.addEventListener('click', () => {
        const comp = btn.getAttribute('data-component-target');
        const genScene = this.chapterController.scenes.generac;
        if (genScene) genScene.selectComponent(comp);
      });
    });

    // USC DC: Route toggles
    if (this.btnPareto && this.btnBaseline) {
      this.btnPareto.addEventListener('click', () => {
        this.chapterController.scenes['usc-dc']?.setRouteMode('PARETO');
        this.btnPareto.classList.add('active');
        this.btnBaseline.classList.remove('active');
      });
      this.btnBaseline.addEventListener('click', () => {
        this.chapterController.scenes['usc-dc']?.setRouteMode('BASELINE');
        this.btnBaseline.classList.add('active');
        this.btnPareto.classList.remove('active');
      });
    }

    // Work Index Modal
    if (this.btnOpenWorkIndex && this.workIndexModal) {
      this.btnOpenWorkIndex.addEventListener('click', () => this.openWorkIndex());
    }
    if (this.btnCloseWorkIndex && this.workIndexModal) {
      this.btnCloseWorkIndex.addEventListener('click', () => this.closeWorkIndex());
    }

    // Evidence Drawer
    if (this.hudContextBtn && this.evidenceDrawer) {
      this.hudContextBtn.addEventListener('click', () => this.openEvidenceDrawer());
    }
    if (this.btnCloseEvidence && this.evidenceDrawer) {
      this.btnCloseEvidence.addEventListener('click', () => this.closeEvidenceDrawer());
    }

    // Chapter Waypoint Navigation Buttons
    this.waypointButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-chapter');
        if (target !== null) {
          this.chapterController.goToChapter(isNaN(target) ? target : parseInt(target, 10));
        }
      });
    });

    // Listen to Engine Chapter Changes
    document.addEventListener('engine:chapterchange', (e) => {
      this.onChapterChanged(e.detail.index, e.detail.id, e.detail.definition);
    });

    // Listen to Component Selection Events
    document.addEventListener('engine:componentselected', (e) => {
      this.onComponentSelected(e.detail.component);
    });
  }

  setupKeyboardNavigation() {
    window.addEventListener('keydown', (e) => {
      // Escape closes open modals
      if (e.key === 'Escape') {
        this.closeWorkIndex();
        this.closeEvidenceDrawer();
        return;
      }

      // Arrow keys advance / regress chapter if not inside input
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        const next = Math.min(CHAPTER_DEFINITIONS.length - 1, this.chapterController.currentChapterIndex + 1);
        this.chapterController.goToChapter(next);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        const prev = Math.max(0, this.chapterController.currentChapterIndex - 1);
        this.chapterController.goToChapter(prev);
      } else if (e.key >= '0' && e.key <= '8') {
        this.chapterController.goToChapter(parseInt(e.key, 10));
      }
    });
  }

  onChapterChanged(index, id, def) {
    // Update waypoint button active states
    this.waypointButtons.forEach((btn, i) => {
      const target = btn.getAttribute('data-chapter');
      const isActive = target === id || parseInt(target, 10) === index;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-current', isActive ? 'step' : 'false');
    });

    // Toggle Chapter Controls Visibility
    if (this.entranceOverlay) {
      this.entranceOverlay.classList.toggle('hidden', index !== 0);
    }
    if (this.generacControls) {
      this.generacControls.classList.toggle('hidden', index !== 1);
    }
    if (this.uscDcControls) {
      this.uscDcControls.classList.toggle('hidden', index !== 2);
    }

    // Update HUD Cards with verified problem & result statements
    const dataMap = {
      0: {
        kicker: 'CHAPTER 00 // THRESHOLD',
        title: 'The Berserker Entrance',
        problem: 'Complex industrial systems operate behind heavy organizational and physical friction.',
        impact: 'Guts Berserker Armor avatar strikes the obsidian threshold with the 2.2m Dragon Slayer, opening the continuum.',
        showEvidence: false
      },
      1: {
        kicker: 'CHAPTER 01 // STRATEGIC SOURCING',
        title: 'Generac Power Systems',
        problem: 'Single-source microinverter BOM dependencies, supply constraints, and uncompetitive component tier pricing.',
        impact: 'Analyzed 20+ electrical BOM components; identified $1.2M annualized sourcing leverage and dual-source ramp.',
        showEvidence: true,
        evidenceLabel: 'View $1.2M Sourcing Breakdown'
      },
      2: {
        kicker: 'CHAPTER 02 // WAREHOUSE OPERATIONS',
        title: 'USC Bookstore & Distribution Center',
        problem: 'Sub-optimal SKU slotting creating excessive picker transit miles and cycle-count variances across 1,000+ SKUs.',
        impact: 'Redesigned stock-flow layouts and Pareto ABC slotting; improved inventory accuracy above 98% and cut cycle time by 15%.',
        showEvidence: false
      },
      3: {
        kicker: 'CHAPTER 03 // STATUTORY COMPLIANCE',
        title: 'Vindeep Expo Engineers',
        problem: 'Multi-site fabrication scheduling bottlenecks and strict ASME Section VIII compliance verification.',
        impact: 'Centralized project dashboards, resolved welder & material bottlenecks, and sustained 100% regulatory adherence.',
        showEvidence: false
      },
      4: {
        kicker: 'CHAPTER 04 // AUTOMATION ENGINEERING',
        title: 'Larsen & Toubro',
        problem: 'Manual weld inspection latency and post-process defect detection delays in heavy fabrication.',
        impact: 'Coordinated robotic welding monitoring system with optical laser profilometry, lifting defect detection speed by 20%.',
        showEvidence: false
      },
      5: {
        kicker: 'CHAPTER 05 // QUALITY ASSURANCE',
        title: 'Banco Products (India) Ltd.',
        problem: 'Welding-related defect rates and workstation cycle inefficiencies in heat exchanger manufacturing.',
        impact: 'Executed RCA, FMEA, and Kaizen 5S audits, identifying 10+ bottlenecks and reducing welding-related costs by 12%.',
        showEvidence: false
      },
      6: {
        kicker: 'CHAPTER 06 // DECISION SYSTEMS',
        title: 'Supply Network Decision Workbench',
        problem: 'Heuristic-based multi-echelon inventory planning unable to absorb stochastic regional demand shocks.',
        impact: 'Constructed Python & MCP decision workbench over 12 simulated manufacturing plants with traceable policy recommendations.',
        showEvidence: false
      },
      7: {
        kicker: 'CHAPTER 07 // ACADEMIC FOUNDATION',
        title: 'USC Viterbi & PDEU',
        problem: 'Bridging theoretical operations research with physical manufacturing and supply chain execution.',
        impact: 'M.S. in Engineering Management at USC Viterbi (GPA 3.73 / 4.00) & B.Tech in Mechanical Engineering at PDEU (CGPA 9.06 / 10.00).',
        showEvidence: false
      },
      8: {
        kicker: 'CHAPTER 08 // DESTINATION',
        title: 'Contact & Executive Reach-Out',
        problem: 'Connecting with Harsh Mistry for Full-Time Supply Chain, Sourcing & Operations Roles (Starting Jan 2027).',
        impact: 'Dynamic particle sculpture morphing between Envelope, LinkedIn, and Résumé. Immediate zero-friction direct links.',
        showEvidence: false
      }
    };

    const info = dataMap[index] || dataMap[0];
    if (this.hudKicker) this.hudKicker.textContent = info.kicker;
    if (this.hudTitle) this.hudTitle.textContent = info.title;
    if (this.hudProblem) this.hudProblem.textContent = info.problem;
    if (this.hudImpact) this.hudImpact.textContent = info.impact;

    if (this.hudContextBtn) {
      this.hudContextBtn.classList.toggle('hidden', !info.showEvidence);
      if (info.evidenceLabel) this.hudContextBtn.textContent = info.evidenceLabel;
    }
  }

  onComponentSelected(name) {
    this.activeEvidenceTab = name;
    this.openEvidenceDrawer();

    // Activate corresponding tab in drawer
    document.querySelectorAll('.evidence-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === name);
    });

    document.querySelectorAll('.evidence-tab-pane').forEach(pane => {
      pane.classList.toggle('active', pane.id === `tab-${name}`);
    });
  }

  openWorkIndex() {
    if (this.workIndexModal) {
      this.workIndexModal.classList.remove('hidden');
      this.workIndexModal.setAttribute('aria-hidden', 'false');
    }
  }

  closeWorkIndex() {
    if (this.workIndexModal) {
      this.workIndexModal.classList.add('hidden');
      this.workIndexModal.setAttribute('aria-hidden', 'true');
    }
  }

  openEvidenceDrawer() {
    if (this.evidenceDrawer) {
      this.evidenceDrawer.classList.remove('hidden');
      this.evidenceDrawer.setAttribute('aria-hidden', 'false');
    }
  }

  closeEvidenceDrawer() {
    if (this.evidenceDrawer) {
      this.evidenceDrawer.classList.add('hidden');
      this.evidenceDrawer.setAttribute('aria-hidden', 'true');
    }
  }
}
