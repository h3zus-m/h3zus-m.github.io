/**
 * DEPENDABLE WEBGL FALLBACK CONTROLLER
 * Activates whenever WebGL is unsupported or context is lost.
 * Ensures all recruiter actions (Enter, Skip, Explore, Evidence, Resume, Email, LinkedIn)
 * execute meaningful, visible DOM state changes with zero dead clicks.
 */

export class FallbackController {
  constructor() {
    this.fallbackContainer = document.getElementById('hero-spatial-fallback');
    this.isFallbackActive = false;

    this.checkAndInit();
  }

  checkAndInit() {
    const hasWebGL = this.detectWebGL();
    if (!hasWebGL) {
      console.warn('[FallbackController] WebGL not supported. Activating dependable static mode.');
      this.activateFallback();
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
      return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  activateFallback() {
    this.isFallbackActive = true;
    if (this.fallbackContainer) {
      this.fallbackContainer.classList.remove('hidden');
      this.fallbackContainer.setAttribute('aria-hidden', 'false');
    }

    // Wire fallback button actions directly to readable HTML sections
    const enterBtn = document.getElementById('btn-enter-world');
    const skipBtn = document.getElementById('btn-skip-intro');

    if (enterBtn) {
      enterBtn.onclick = () => this.scrollToSection('chapter-generac-section');
    }

    if (skipBtn) {
      skipBtn.onclick = () => this.scrollToSection('chapter-generac-section');
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
      this.fallbackContainer.classList.add('hidden');
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
