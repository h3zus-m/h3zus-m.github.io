/**
 * ENGINE RENDERER & ASSET ENVIRONMENT CONTROLLER
 * Manages Three.js WebGLRenderer, PMREM HDR environment map, PBR texture library,
 * tone-mapping, color space, device-pixel-ratio throttling, and WebGL lifecycle.
 */

import * as THREE from '../assets/three.module.min.js';
import { RGBELoader } from '../assets/addons/RGBELoader.js';

export class EngineRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.isWebGLAvailable = this.checkWebGLSupport();

    if (!this.isWebGLAvailable) {
      console.warn('[EngineRenderer] WebGL is not available on this device/browser.');
      return;
    }

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x060911, 0.055);

    // High performance renderer with ACESFilmic tone mapping
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true
    });

    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.18;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    this.renderer.setSize(this.width, this.height, false);
    this.renderer.setPixelRatio(this.pixelRatio);

    this.textures = {};
    this.materials = {};
    this.isContextLost = false;

    this.setupContextListeners();
    this.initLighting();
    this.loadEnvironmentMap();
    this.loadPbrTextures();
  }

  checkWebGLSupport() {
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      return !!gl;
    } catch (e) {
      return false;
    }
  }

  setupContextListeners() {
    this.canvas.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      this.isContextLost = true;
      console.warn('[EngineRenderer] WebGL Context Lost.');
      document.dispatchEvent(new CustomEvent('engine:contextlost'));
    }, false);

    this.canvas.addEventListener('webglcontextrestored', () => {
      this.isContextLost = false;
      console.info('[EngineRenderer] WebGL Context Restored.');
      this.loadEnvironmentMap();
      this.loadPbrTextures();
      document.dispatchEvent(new CustomEvent('engine:contextrestored'));
    }, false);
  }

  initLighting() {
    // Ambient fill
    this.ambientLight = new THREE.AmbientLight(0xced8e6, 0.7);
    this.scene.add(this.ambientLight);

    // Primary industrial key light
    this.keyLight = new THREE.DirectionalLight(0xf4f7fb, 2.4);
    this.keyLight.position.set(6, 9, 7);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 1024;
    this.keyLight.shadow.mapSize.height = 1024;
    this.keyLight.shadow.camera.near = 0.5;
    this.keyLight.shadow.camera.far = 30;
    this.keyLight.shadow.bias = -0.0005;
    this.scene.add(this.keyLight);

    // Cool cyan industrial rim light
    this.rimLight = new THREE.DirectionalLight(0x0284c7, 1.8);
    this.rimLight.position.set(-7, -1, -5);
    this.scene.add(this.rimLight);

    // Warm amber foundry reflection light
    this.forgeLight = new THREE.PointLight(0xf59e0b, 1.4, 15);
    this.forgeLight.position.set(0, 0.4, 1.8);
    this.scene.add(this.forgeLight);
  }

  loadEnvironmentMap() {
    const loader = new RGBELoader();
    const hdrPath = 'assets/industrial_workshop_foundry_1k.hdr';

    loader.load(
      hdrPath,
      (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
        pmremGenerator.compileEquirectangularShader();
        const envMap = pmremGenerator.fromEquirectangular(texture).texture;
        
        this.scene.environment = envMap;
        this.envMap = envMap;
        texture.dispose();
        pmremGenerator.dispose();
      },
      undefined,
      (err) => {
        console.warn('[EngineRenderer] Failed loading HDRI, using fallback gradient environment:', err);
        // Fallback cube/gradient
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createLinearGradient(0, 0, 0, 64);
        grad.addColorStop(0, '#1a2233');
        grad.addColorStop(0.5, '#0d131f');
        grad.addColorStop(1, '#05080e');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 128, 64);
        const tex = new THREE.CanvasTexture(canvas);
        tex.mapping = THREE.EquirectangularReflectionMapping;
        this.scene.environment = tex;
      }
    );
  }

  loadPbrTextures() {
    const loader = new THREE.TextureLoader();
    const basePath = 'assets/textures/metal_plate_02/metal_plate_02_';

    const loadTex = (type, isSRGB = false) => {
      return loader.load(
        `${basePath}${type}_1k.jpg`,
        (t) => {
          t.wrapS = THREE.RepeatWrapping;
          t.wrapT = THREE.RepeatWrapping;
          t.repeat.set(2, 2);
          if (isSRGB) t.colorSpace = THREE.SRGBColorSpace;
        },
        undefined,
        () => console.warn(`[EngineRenderer] Missing texture ${type}`)
      );
    };

    this.textures.metalDiff = loadTex('diff', true);
    this.textures.metalRough = loadTex('rough', false);
    this.textures.metalMetal = loadTex('metal', false);
    this.textures.metalNor = loadTex('nor', false);

    // Common PBR Materials
    this.materials.darkSteel = new THREE.MeshStandardMaterial({
      color: 0x18202c,
      metalness: 0.88,
      roughness: 0.28,
      roughnessMap: this.textures.metalRough,
      metalnessMap: this.textures.metalMetal,
      normalMap: this.textures.metalNor,
      normalScale: new THREE.Vector2(0.65, 0.65)
    });

    this.materials.brushedAluminum = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.82,
      roughness: 0.22,
      roughnessMap: this.textures.metalRough,
      normalMap: this.textures.metalNor,
      normalScale: new THREE.Vector2(0.4, 0.4)
    });

    this.materials.bladeSteel = new THREE.MeshStandardMaterial({
      color: 0xdde6ed,
      metalness: 0.95,
      roughness: 0.14
    });

    this.materials.obsidian = new THREE.MeshStandardMaterial({
      color: 0x090c12,
      metalness: 0.3,
      roughness: 0.18
    });
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    if (this.renderer) {
      this.renderer.setSize(width, height, false);
      this.renderer.setPixelRatio(this.pixelRatio);
    }
  }

  render(camera) {
    if (this.renderer && !this.isContextLost) {
      this.renderer.render(this.scene, camera);
    }
  }
}
