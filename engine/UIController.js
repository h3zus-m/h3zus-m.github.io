/**
 * UI CONTROLLER & ACCESSIBLE INTERACTION ARCHITECT
 * Coordinates HTML overlays, floating navigation, 10-chapter waypoints,
 * the Generac Sourcing Evidence Drawer with reconciled calculations,
 * Workbench region filters, Inventory policy comparisons, Contact particle morphing,
 * Work Index modal, keyboard accessibility, and dependable fallback interaction.
 */

import { CHAPTER_DEFINITIONS } from './ChapterController.js';

export class UIController {
  constructor(chapterController) {
    this.chapterController = chapterController;
    this.activeEvidenceTab = 'mosfet';
    this.lastFocusedElement = null;

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

    this.workbenchControls = document.getElementById('workbench-scene-controls');
    this.inventoryControls = document.getElementById('inventory-scene-controls');
    this.contactControls = document.getElementById('contact-scene-controls');

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

    // Chapter 06: Workbench Region Filter Buttons
    document.querySelectorAll('[data-workbench-region]').forEach(btn => {
      btn.addEventListener('click', () => {
        const region = btn.getAttribute('data-workbench-region');
        document.querySelectorAll('[data-workbench-region]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.chapterController.scenes.workbench?.filterRegion(region);
      });
    });

    // Chapter 07: Inventory Policy Simulation Buttons
    document.querySelectorAll('[data-inventory-policy]').forEach(btn => {
      btn.addEventListener('click', () => {
        const policy = btn.getAttribute('data-inventory-policy');
        document.querySelectorAll('[data-inventory-policy]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.chapterController.scenes.inventory?.setPolicy(policy);
      });
    });

    // Evidence Drawer Tabs (All 5 Panes: mosfet, choke, capacitor, mcu, portfolio)
    document.querySelectorAll('.evidence-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        if (tab) {
          this.onComponentSelected(tab);
        }
      });
    });

    // Chapter 09: Contact Sculpture Actions
    document.querySelectorAll('[data-contact-action]').forEach(btn => {
      const action = btn.getAttribute('data-contact-action');
      const trigger = () => {
        document.querySelectorAll('[data-contact-action]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.chapterController.scenes.contact?.setMorphTarget(action);
      };
      btn.addEventListener('click', trigger);
      btn.addEventListener('mouseenter', trigger);
      btn.addEventListener('focus', trigger);
    });

    // Global Contact Link Hover Binding (Email, LinkedIn, Resume)
    document.querySelectorAll('a[href^="mailto:"]').forEach(a => {
      a.addEventListener('mouseenter', () => this.chapterController.scenes.contact?.setMorphTarget('ENVELOPE'));
      a.addEventListener('focus', () => this.chapterController.scenes.contact?.setMorphTarget('ENVELOPE'));
    });
    document.querySelectorAll('a[href*="linkedin.com"]').forEach(a => {
      a.addEventListener('mouseenter', () => this.chapterController.scenes.contact?.setMorphTarget('LINKEDIN'));
      a.addEventListener('focus', () => this.chapterController.scenes.contact?.setMorphTarget('LINKEDIN'));
    });
    document.querySelectorAll('a[href*="Resume"], a[href*="resume"]').forEach(a => {
      a.addEventListener('mouseenter', () => this.chapterController.scenes.contact?.setMorphTarget('RESUME'));
      a.addEventListener('focus', () => this.chapterController.scenes.contact?.setMorphTarget('RESUME'));
    });

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

    // Timeline Prev / Next Arrow Controls
    const btnPrev = document.getElementById('btn-prev-chapter');
    const btnNext = document.getElementById('btn-next-chapter');
    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        const prev = Math.max(0, this.chapterController.currentChapterIndex - 1);
        this.chapterController.goToChapter(prev);
      });
    }
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        const next = Math.min(CHAPTER_DEFINITIONS.length - 1, this.chapterController.currentChapterIndex + 1);
        this.chapterController.goToChapter(next);
      });
    }

    // Direct Jump to Contact
    const btnContact = document.getElementById('btn-contact-jump');
    if (btnContact) {
      btnContact.addEventListener('click', () => {
        this.chapterController.goToChapter(9);
      });
    }

    // Reduced Motion Force Toggle
    const btnMotion = document.getElementById('btn-motion-toggle');
    if (btnMotion) {
      btnMotion.addEventListener('click', () => {
        const isReduced = document.body.classList.toggle('force-reduced-motion');
        const icon = document.getElementById('motion-icon');
        if (icon) icon.textContent = isReduced ? '🛑' : '⚡';
      });
    }

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
      } else if (e.key >= '0' && e.key <= '9') {
        this.chapterController.goToChapter(parseInt(e.key, 10));
      }
    });
  }

  onChapterChanged(index, id, def) {
    // Update top station indicator badge
    const indicator = document.getElementById('hud-station-indicator');
    if (indicator && def) {
      indicator.textContent = `${def.number} / 09 · ${def.title.toUpperCase()}`;
    }

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
    if (this.workbenchControls) {
      this.workbenchControls.classList.toggle('hidden', index !== 6);
    }
    if (this.inventoryControls) {
      this.inventoryControls.classList.toggle('hidden', index !== 7);
    }
    if (this.contactControls) {
      this.contactControls.classList.toggle('hidden', index !== 9);
    }

    // Update HUD Cards with verified problem & result statements
    const dataMap = {
      0: {
        kicker: 'CHAPTER 00 // THRESHOLD',
        title: 'The Berserker Entrance',
        problem: 'Complex industrial and global supply chain systems operate behind heavy friction.',
        impact: 'Guts Berserker Armor avatar strikes the monolithic threshold with the 2.2m Dragon Slayer, opening the continuum.',
        showEvidence: false
      },
      1: {
        kicker: 'CHAPTER 01 // STRATEGIC SOURCING',
        title: 'Generac Power Systems',
        problem: 'PWRmicro NPI single-source risks, drawing/quote mismatches, and uncompetitive component tiering.',
        impact: 'Reconciled engineering BOMs/CBOMs across 20+ priority components; identified $1.2M annualized sourcing opportunity in Arena PLM.',
        showEvidence: true,
        evidenceLabel: 'View $1.2M Sourcing Breakdown'
      },
      2: {
        kicker: 'CHAPTER 02 // WAREHOUSE OPERATIONS',
        title: 'USC Bookstore & Distribution Center',
        problem: 'End-to-end inventory variances and fulfillment bottlenecks across 1,000+ SKUs.',
        impact: 'Introduced ERP-driven cycle counting and Pareto ABC slotting; improved accuracy above 98%, cut cycle time by 15%, reduced errors by 10%.',
        showEvidence: false
      },
      3: {
        kicker: 'CHAPTER 03 // STATUTORY TESTING OPERATIONS',
        title: 'Vindeep Expo Engineers',
        problem: 'Multi-site testing coordination for pressure vessels and lifting equipment under strict regulatory compliance.',
        impact: 'Engineered centralized reporting dashboard (MS Project + Excel), cutting audit prep by 15% and sustaining 100% regulatory adherence.',
        showEvidence: false
      },
      4: {
        kicker: 'CHAPTER 04 // AUTOMATION ENGINEERING',
        title: 'Larsen & Toubro',
        problem: 'Welding defect latency and post-process rework exposure in heavy industrial fabrication.',
        impact: 'Engineered portable robotic welding seam-monitoring system integrating SolidWorks prototypes and Python automation; defect detection +20%.',
        showEvidence: false
      },
      5: {
        kicker: 'CHAPTER 05 // QUALITY ASSURANCE',
        title: 'Banco Products (India) Ltd.',
        problem: 'Welding-related defect rates and process bottlenecks in automotive heat exchanger manufacturing.',
        impact: 'Executed RCA, FMEA, SPC, and Lean audits; identified 10+ bottlenecks and led Kaizen/5S initiative reducing welding costs by 12%.',
        showEvidence: false
      },
      6: {
        kicker: 'CHAPTER 06 // AGENTIC OPERATIONS WORKBENCH',
        title: 'AI Supply Chain Decision Workbench',
        problem: 'Operating unit visibility gaps across multi-facility manufacturing networks.',
        impact: 'Built Python Model Context Protocol (MCP) server with four governed tools for KPI segmentation, evidence retrieval, opportunity sizing, and brief generation over 12 plants.',
        showEvidence: false
      },
      7: {
        kicker: 'CHAPTER 07 // INVENTORY OPTIMIZATION',
        title: 'Inventory Policy Optimization (FOQ vs LFL vs POQ)',
        problem: 'Demand volatility and cost-to-serve trade-offs across holding, ordering, and stockout penalty parameters.',
        impact: 'Modeled total operational cost across FOQ, LFL, and POQ replenishment rules; identified POQ strategy delivering 8–15% overall cost reduction.',
        showEvidence: false
      },
      8: {
        kicker: 'CHAPTER 08 // ACADEMIC FOUNDATION',
        title: 'Academic Background & Coursework',
        problem: 'Bridging engineering mechanics, spreadsheet modeling, and operations management.',
        impact: 'USC M.S. in Engineering Management (Expected Dec 2026) & Pandit Deendayal Petroleum University B.Tech in Mechanical Engineering (May 2023).',
        showEvidence: false
      },
      9: {
        kicker: 'CHAPTER 09 // CONTACT DESTINATION',
        title: 'Contact & Executive Reach-Out',
        problem: 'Connecting with Harsh Mistry for Full-Time Supply Chain, Sourcing & Operations Roles (Available Jan 2027).',
        impact: 'Interactive particle sculpture morphing between Envelope, LinkedIn, and Résumé with zero dead clicks.',
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
      const matches = pane.id === `tab-${name}`;
      pane.classList.toggle('active', matches);
      pane.style.display = matches ? 'block' : 'none';
    });
  }

  openWorkIndex() {
    if (this.workIndexModal) {
      this.lastFocusedElement = document.activeElement;
      this.workIndexModal.classList.remove('hidden');
      this.workIndexModal.setAttribute('aria-hidden', 'false');
      const firstBtn = this.workIndexModal.querySelector('button, a');
      if (firstBtn) firstBtn.focus();
    }
  }

  closeWorkIndex() {
    if (this.workIndexModal) {
      this.workIndexModal.classList.add('hidden');
      this.workIndexModal.setAttribute('aria-hidden', 'true');
      if (this.lastFocusedElement) this.lastFocusedElement.focus();
    }
  }

  openEvidenceDrawer() {
    if (this.evidenceDrawer) {
      this.lastFocusedElement = document.activeElement;
      this.evidenceDrawer.classList.remove('hidden');
      this.evidenceDrawer.setAttribute('aria-hidden', 'false');
      if (this.btnCloseEvidence) this.btnCloseEvidence.focus();
    }
  }

  closeEvidenceDrawer() {
    if (this.evidenceDrawer) {
      this.evidenceDrawer.classList.add('hidden');
      this.evidenceDrawer.setAttribute('aria-hidden', 'true');
      if (this.lastFocusedElement) this.lastFocusedElement.focus();
    }
  }
}
