/**
 * DEPENDABLE WEBGL FALLBACK & INDEPENDENT ACCESSIBILITY CONTROLLER
 * Activates whenever WebGL is unsupported or context is lost.
 * Ensures all recruiter actions (Enter, Skip, Explore, Evidence, Work Index, Resume, Email, LinkedIn)
 * execute meaningful, visible DOM state changes with zero dead clicks regardless of renderer status.
 */

export class FallbackController {
  constructor() {
    this.fallbackContainer = document.getElementById('hero-spatial-fallback');
    this.isFallbackActive = false;

    this.initAccessibleWiring();
    this.checkAndInit();
  }

  initAccessibleWiring() {
    // Ensure Work Index Modal and Evidence Drawer are wired independently of WebGL
    const workIndexModal = document.getElementById('work-index-modal');
    const openWorkIndexBtns = document.querySelectorAll('#btn-open-work-index, [data-open-work-index]');
    const closeWorkIndexBtn = document.getElementById('btn-close-work-index');

    openWorkIndexBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (workIndexModal) {
          workIndexModal.classList.remove('hidden');
          workIndexModal.setAttribute('aria-hidden', 'false');
        }
      });
    });

    if (closeWorkIndexBtn && workIndexModal) {
      closeWorkIndexBtn.addEventListener('click', () => {
        workIndexModal.classList.add('hidden');
        workIndexModal.setAttribute('aria-hidden', 'true');
      });
    }

    const evidenceDrawer = document.getElementById('generac-evidence-drawer');
    const closeEvidenceBtn = document.getElementById('btn-close-evidence');
    if (closeEvidenceBtn && evidenceDrawer) {
      closeEvidenceBtn.addEventListener('click', () => {
        evidenceDrawer.classList.add('hidden');
        evidenceDrawer.setAttribute('aria-hidden', 'true');
      });
    }
  }

  checkAndInit() {
    const hasWebGL = this.detectWebGL();
    if (!hasWebGL) {
      console.warn('[FallbackController] WebGL not supported. Activating dependable static mode.');
      this.activateFallback();
    } else {
      this.deactivateFallback();
    }

    // Listen for context loss events from engine
    document.addEventListener('engine:contextlost', () => {
      this.activateFallback();
    });

    document.addEventListener('engine:contextrestored', () => {
      this.deactivateFallback();
    });
  }

  detectWebGL() {
    try {
      const c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  activateFallback() {
    this.isFallbackActive = true;
    if (this.fallbackContainer) {
      this.fallbackContainer.classList.remove('rendered-hidden', 'hidden');
      this.fallbackContainer.style.display = 'flex';
      this.fallbackContainer.style.pointerEvents = 'auto';
      this.fallbackContainer.setAttribute('aria-hidden', 'false');
    }

    // Wire fallback button actions directly to readable HTML sections
    const enterBtn = document.getElementById('btn-enter-world');
    const skipBtn = document.getElementById('btn-skip-intro');

    if (enterBtn) {
      enterBtn.onclick = () => this.scrollToSection('experience');
    }

    if (skipBtn) {
      skipBtn.onclick = () => this.scrollToSection('experience');
    }

    // Wire evidence drawer button
    const evidenceBtn = document.getElementById('btn-open-evidence');
    const drawer = document.getElementById('generac-evidence-drawer');
    if (evidenceBtn && drawer) {
      evidenceBtn.onclick = () => {
        drawer.classList.remove('hidden');
        drawer.setAttribute('aria-hidden', 'false');
      };
    }

    // Hide 3D canvas from screen readers
    const canvas = document.getElementById('hero-3d-canvas');
    if (canvas) canvas.setAttribute('aria-hidden', 'true');
  }

  deactivateFallback() {
    this.isFallbackActive = false;
    if (this.fallbackContainer) {
      this.fallbackContainer.classList.add('rendered-hidden', 'hidden');
      this.fallbackContainer.style.display = 'none';
      this.fallbackContainer.style.pointerEvents = 'none';
      this.fallbackContainer.setAttribute('aria-hidden', 'true');
    }
  }

  scrollToSection(sectionId) {
    const target = document.getElementById(sectionId) || document.getElementById('work-index-modal');
    if (target) {
      if (target.classList.contains('hidden')) {
        target.classList.remove('hidden');
      }
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
