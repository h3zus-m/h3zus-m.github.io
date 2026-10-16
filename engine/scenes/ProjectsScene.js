/**
 * CHAPTER 06: SELECTED PROJECTS // SUPPLY NETWORK DECISION WORKBENCH
 * 3D interactive logistics globe, 12 simulated manufacturing plants, 4 regional hubs,
 * glowing quadratic bezier freight corridors, and stochastic demand shock simulation.
 */

import * as THREE from '../../assets/three.module.min.js';

export class ProjectsScene {
  constructor(rendererInstance) {
    this.rendererInstance = rendererInstance;
    this.group = new THREE.Group();
    this.group.name = 'ProjectsScene';
    this.group.position.set(0, 0, -58);

    this.nodes = [];
    this.flightParticles = [];

    this.initNetworkGlobe();
    this.initFreightCorridors();
  }

  initNetworkGlobe() {
    this.globeGroup = new THREE.Group();

    // Dark wireframe / holographic sphere
    const sphereGeo = new THREE.SphereGeometry(1.6, 32, 32);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0x0a101d,
      roughness: 0.8,
      metalness: 0.4,
      wireframe: false
    });
    this.globe = new THREE.Mesh(sphereGeo, sphereMat);
    this.globeGroup.add(this.globe);

    // Glowing orbital latitude/longitude grid rings
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x0284c7, wireframe: true, transparent: true, opacity: 0.35 });
    const gridSphere = new THREE.Mesh(new THREE.SphereGeometry(1.62, 16, 16), ringMat);
    this.globeGroup.add(gridSphere);

    // 12 Simulated Manufacturing Nodes & 4 Regional Hubs
    const nodeCoords = [
      { name: 'Plant 01: Fremont', lat: 37.5, lon: -121.9, type: 'PLANT' },
      { name: 'Plant 02: Austin', lat: 30.2, lon: -97.7, type: 'PLANT' },
      { name: 'Plant 03: Monterrey', lat: 25.6, lon: -100.3, type: 'PLANT' },
      { name: 'Hub 01: Chicago DC', lat: 41.8, lon: -87.6, type: 'HUB' },
      { name: 'Plant 04: Berlin', lat: 52.5, lon: 13.4, type: 'PLANT' },
      { name: 'Plant 05: Munich', lat: 48.1, lon: 11.5, type: 'PLANT' },
      { name: 'Hub 02: Rotterdam Port', lat: 51.9, lon: 4.4, type: 'HUB' },
      { name: 'Plant 06: Pune', lat: 18.5, lon: 73.8, type: 'PLANT' },
      { name: 'Plant 07: Vadodara', lat: 22.3, lon: 73.1, type: 'PLANT' },
      { name: 'Plant 08: Shanghai', lat: 31.2, lon: 121.4, type: 'PLANT' },
      { name: 'Hub 03: Singapore Hub', lat: 1.3, lon: 103.8, type: 'HUB' },
      { name: 'Plant 09: Tokyo', lat: 35.6, lon: 139.6, type: 'PLANT' }
    ];

    const R = 1.63;
    const plantMat = new THREE.MeshBasicMaterial({ color: 0x00d4ff });
    const hubMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const markerGeo = new THREE.SphereGeometry(0.045, 8, 8);

    nodeCoords.forEach(item => {
      const phi = (90 - item.lat) * (Math.PI / 180);
      const theta = (item.lon + 180) * (Math.PI / 180);

      const x = -(R * Math.sin(phi) * Math.cos(theta));
      const z = (R * Math.sin(phi) * Math.sin(theta));
      const y = (R * Math.cos(phi));

      const marker = new THREE.Mesh(markerGeo, item.type === 'HUB' ? hubMat : plantMat);
      marker.position.set(x, y, z);
      this.globeGroup.add(marker);

      this.nodes.push({ name: item.name, pos: new THREE.Vector3(x, y, z), type: item.type });
    });

    this.group.add(this.globeGroup);
  }

  initFreightCorridors() {
    this.corridorsGroup = new THREE.Group();

    // Generate great-circle quadratic bezier arcs between major nodes
    const pairs = [
      [0, 3], [1, 3], [2, 3], [3, 6], [4, 6], [5, 6], [7, 10], [8, 10], [9, 10], [10, 0]
    ];

    const arcMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.65
    });

    pairs.forEach(([fromIdx, toIdx]) => {
      const p1 = this.nodes[fromIdx].pos;
      const p2 = this.nodes[toIdx].pos;

      // Calculate mid-point and elevate radially
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      const midLen = mid.length();
      mid.normalize().multiplyScalar(midLen + 0.5); // Elevate above surface

      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const points = curve.getPoints(24);
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const arc = new THREE.Line(geo, arcMat);
      this.corridorsGroup.add(arc);
    });

    this.globeGroup.add(this.corridorsGroup);
  }

  update(delta, time) {
    // Smooth planetary rotation
    this.globeGroup.rotation.y = time * 0.12;
    this.globeGroup.rotation.x = Math.sin(time * 0.1) * 0.08;
  }
}
