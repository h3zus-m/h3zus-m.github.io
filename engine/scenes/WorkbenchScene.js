/**
 * CHAPTER 06: AI SUPPLY CHAIN DECISION WORKBENCH (PYTHON, MCP)
 * Real 12-Plant Manufacturing Dataset (Plant Alpha to Plant Lima across West, Central, East, South)
 * Exposes 4 governed Model Context Protocol tools:
 * 1. KPI Segmentation
 * 2. Evidence Retrieval
 * 3. Opportunity Sizing
 * 4. Recommendation Brief Generation
 */

import * as THREE from '../../assets/three.module.min.js';

export const OPERATING_UNITS_DATA = [
  { unit: "Plant Alpha", region: "West", revenue: 48200000, cogs: 34900000, defect_pct: 4.8, otif_pct: 86.0, lead_time_days: 31, util_pct: 71, manual_hrs_wk: 620, lat: 37.7, lon: -122.4 },
  { unit: "Plant Bravo", region: "West", revenue: 41700000, cogs: 29800000, defect_pct: 3.9, otif_pct: 89.0, lead_time_days: 27, util_pct: 75, manual_hrs_wk: 510, lat: 34.0, lon: -118.2 },
  { unit: "Plant Charlie", region: "West", revenue: 36500000, cogs: 25400000, defect_pct: 2.7, otif_pct: 94.0, lead_time_days: 22, util_pct: 82, manual_hrs_wk: 390, lat: 45.5, lon: -122.6 },
  { unit: "Plant Delta", region: "Central", revenue: 52900000, cogs: 39200000, defect_pct: 5.4, otif_pct: 82.0, lead_time_days: 35, util_pct: 68, manual_hrs_wk: 710, lat: 41.8, lon: -87.6 },
  { unit: "Plant Echo", region: "Central", revenue: 44600000, cogs: 31900000, defect_pct: 4.5, otif_pct: 87.0, lead_time_days: 30, util_pct: 73, manual_hrs_wk: 590, lat: 39.7, lon: -104.9 },
  { unit: "Plant Foxtrot", region: "Central", revenue: 39800000, cogs: 27800000, defect_pct: 3.1, otif_pct: 92.0, lead_time_days: 24, util_pct: 79, manual_hrs_wk: 440, lat: 38.6, lon: -90.2 },
  { unit: "Plant Golf", region: "East", revenue: 57100000, cogs: 40100000, defect_pct: 2.4, otif_pct: 95.0, lead_time_days: 20, util_pct: 85, manual_hrs_wk: 360, lat: 40.7, lon: -74.0 },
  { unit: "Plant Hotel", region: "East", revenue: 46800000, cogs: 33700000, defect_pct: 3.6, otif_pct: 91.0, lead_time_days: 25, util_pct: 78, manual_hrs_wk: 470, lat: 42.3, lon: -71.0 },
  { unit: "Plant India", region: "East", revenue: 43300000, cogs: 30700000, defect_pct: 3.0, otif_pct: 93.0, lead_time_days: 23, util_pct: 81, manual_hrs_wk: 410, lat: 39.9, lon: -75.1 },
  { unit: "Plant Juliet", region: "South", revenue: 50400000, cogs: 37600000, defect_pct: 5.1, otif_pct: 84.0, lead_time_days: 33, util_pct: 69, manual_hrs_wk: 680, lat: 29.7, lon: -95.3 },
  { unit: "Plant Kilo", region: "South", revenue: 42100000, cogs: 30400000, defect_pct: 4.2, otif_pct: 88.0, lead_time_days: 29, util_pct: 74, manual_hrs_wk: 560, lat: 33.7, lon: -84.3 },
  { unit: "Plant Lima", region: "South", revenue: 37900000, cogs: 26400000, defect_pct: 2.9, otif_pct: 93.0, lead_time_days: 23, util_pct: 80, manual_hrs_wk: 420, lat: 25.7, lon: -80.2 }
];

export class WorkbenchScene {
  constructor(rendererInstance) {
    this.rendererInstance = rendererInstance;
    this.group = new THREE.Group();
    this.group.name = 'WorkbenchScene';
    this.group.position.set(0, 0, -58);

    this.activeRegion = 'All';
    this.selectedPlant = OPERATING_UNITS_DATA[0];
    this.plantNodes = [];

    this.initManufacturingNetworkGlobe();
    this.initNetworkCorridors();
  }

  initManufacturingNetworkGlobe() {
    this.globeGroup = new THREE.Group();

    // Dark Matte Tactical Globe
    const sphereGeo = new THREE.SphereGeometry(1.65, 32, 32);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0x08101e,
      roughness: 0.85,
      metalness: 0.3
    });
    this.globe = new THREE.Mesh(sphereGeo, sphereMat);
    this.globeGroup.add(this.globe);

    // Coordinate Grid Cage
    const gridMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      wireframe: true,
      transparent: true,
      opacity: 0.22
    });
    const gridSphere = new THREE.Mesh(new THREE.SphereGeometry(1.67, 18, 18), gridMat);
    this.globeGroup.add(gridSphere);

    // 12 Authentic Plant Nodes
    const R = 1.68;
    const plantGeo = new THREE.SphereGeometry(0.045, 12, 12);
    const glowGeo = new THREE.RingGeometry(0.06, 0.09, 16);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x00d4ff, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });

    OPERATING_UNITS_DATA.forEach(plant => {
      // Convert Lat/Lon to 3D Cartesian Coordinates
      const phi = (90 - plant.lat) * (Math.PI / 180);
      const theta = (plant.lon + 180) * (Math.PI / 180);
      const x = -R * Math.sin(phi) * Math.cos(theta);
      const z = R * Math.sin(phi) * Math.sin(theta);
      const y = R * Math.cos(phi);

      const nodeGroup = new THREE.Group();
      nodeGroup.position.set(x, y, z);
      nodeGroup.lookAt(0, 0, 0);

      // Node color coded by defect rate (high defect = amber/red alert)
      const isPriority = plant.defect_pct > 4.0 || plant.otif_pct < 85.0;
      const nodeMat = new THREE.MeshBasicMaterial({
        color: isPriority ? 0xf59e0b : 0x10b981
      });

      const dot = new THREE.Mesh(plantGeo, nodeMat);
      nodeGroup.add(dot);

      const beacon = new THREE.Mesh(glowGeo, glowMat);
      beacon.position.z = 0.02;
      nodeGroup.add(beacon);

      nodeGroup.userData = { plant };
      this.globeGroup.add(nodeGroup);
      this.plantNodes.push({ plant, group: nodeGroup, isPriority });
    });

    this.group.add(this.globeGroup);
  }

  initNetworkCorridors() {
    this.corridorsGroup = new THREE.Group();

    // Inter-plant distribution flow arcs
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35
    });

    // Connect regional plants to central coordinator
    for (let i = 0; i < OPERATING_UNITS_DATA.length - 1; i += 2) {
      const p1 = this.plantNodes[i].group.position;
      const p2 = this.plantNodes[i + 1].group.position;

      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      mid.normalize().multiplyScalar(2.15); // Elevation arc

      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const points = curve.getPoints(24);
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geo, lineMat);
      this.corridorsGroup.add(line);
    }

    this.globeGroup.add(this.corridorsGroup);
  }

  filterRegion(region) {
    this.activeRegion = region;
    this.plantNodes.forEach(({ plant, group }) => {
      const isVisible = region === 'All' || plant.region === region;
      group.visible = isVisible;
    });

    // Notify UI of active region summary
    const filtered = region === 'All' ? OPERATING_UNITS_DATA : OPERATING_UNITS_DATA.filter(p => p.region === region);
    document.dispatchEvent(new CustomEvent('engine:regionfiltered', {
      detail: { region, plants: filtered }
    }));
  }

  selectPlant(plantName) {
    const found = OPERATING_UNITS_DATA.find(p => p.unit === plantName) || OPERATING_UNITS_DATA[0];
    this.selectedPlant = found;

    document.dispatchEvent(new CustomEvent('engine:plantselected', {
      detail: { plant: found }
    }));
  }

  update(delta, time) {
    // Gentle tactical globe rotation
    this.globeGroup.rotation.y = time * 0.12;
  }
}
