
// Global Cyber Security & Application Resilience Error Boundary
window.addEventListener('error', (event) => {
  console.warn('[RECOVERY] Caught uncaught application error:', event.message);
});
window.addEventListener('unhandledrejection', (event) => {
  console.warn('[RECOVERY] Handled unhandled promise rejection safely:', event.reason);
});

// ==========================================================================
// HARSH MISTRY // CINEMATIC PORTFOLIO ENGINE
// The Wire × Breaking Bad × The Matrix × Pulp Fiction × Interstellar
// No external frameworks. Pure performance.
// ==========================================================================


// ==========================================================================
// 1. CUSTOM CURSOR TRACKING
// ==========================================================================
const cursorDot  = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');

let mouseX = 0, mouseY = 0;
let mouseNormX = 0, mouseNormY = 0;

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  mouseNormX = (e.clientX / window.innerWidth  - 0.5) * 2;
  mouseNormY = (e.clientY / window.innerHeight - 0.5) * 2;

  if (cursorDot)  { cursorDot.style.left  = `${mouseX}px`; cursorDot.style.top  = `${mouseY}px`; }
  if (cursorRing) { cursorRing.style.left = `${mouseX}px`; cursorRing.style.top = `${mouseY}px`; }
});

document.querySelectorAll('a, button, input, .sim-btn, .signal-pill').forEach((el) => {
  el.addEventListener('mouseenter', () => cursorRing?.classList.add('active'));
  el.addEventListener('mouseleave', () => cursorRing?.classList.remove('active'));
});

// ==========================================================================
// 2. CIPHER DECODE ANIMATION (Hero Headline)
//    Characters scramble from cipher text → real text on load
// ==========================================================================
const CIPHER_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';

function cipherDecode(element, finalText, delay = 0, duration = 1200) {
  const totalFrames = Math.floor(duration / 40);
  let frame = 0;
  let started = false;

  element.classList.add('decoding');

  setTimeout(() => {
    started = true;
    const interval = setInterval(() => {
      if (frame >= totalFrames) {
        element.textContent = finalText;
        element.classList.remove('decoding');
        element.classList.add('decoded');
        clearInterval(interval);
        return;
      }

      const progress = frame / totalFrames;
      const solvedCount = Math.floor(progress * finalText.length);
      let display = '';

      for (let i = 0; i < finalText.length; i++) {
        if (finalText[i] === ' ') {
          display += ' ';
        } else if (i < solvedCount) {
          display += finalText[i];
        } else {
          display += CIPHER_CHARS[Math.floor(Math.random() * CIPHER_CHARS.length)];
        }
      }

      element.textContent = display;
      frame++;
    }, 40);
  }, delay);
}

function initCipherHeadline() {
  const lines = document.querySelectorAll('.cipher-line');
  if (!lines.length) return;

  lines.forEach((line, i) => {
    const finalText = line.getAttribute('data-final');
    if (finalText) {
      cipherDecode(line, finalText, 800 + i * 500, 1100);
    }
  });

  // Also animate intro overlay cipher text
  const introCipher = document.getElementById('intro-cipher');
  if (introCipher) {
    const messages = [
      'INITIALIZING CHARACTER...',
      'LOADING 3D ASSETS...',
      'CALIBRATING LIGHTING...',
      'SYSTEMS ONLINE.',
    ];
    let msgIdx = 0;
    const msgInterval = setInterval(() => {
      if (msgIdx < messages.length) {
        cipherDecode(introCipher, messages[msgIdx], 0, 400);
        msgIdx++;
      } else {
        clearInterval(msgInterval);
      }
    }, 600);
  }
}

// ==========================================================================
// 3. AVATAR PARALLAX :  Persona Photo Tracks Cursor
//    The cinematic persona image subtly moves with the mouse :  makes the
//    portrait feel alive and present without heavy 3D overhead.
// ==========================================================================

/* ==========================================================================
   HULY COSMIC LIGHT BEAM & HORIZON SHADER (WebGL)
   Deep space obsidian void with vertical laser light fissure,
   cyan/violet volumetric glow, stardust particles, and horizon flare.
   Inspired by Huly.io hero design principles.
   ========================================================================== */
function initHulyLava() {
  const canvas = document.getElementById("huly-lava-canvas");
  if (!canvas) return;
  const gl = canvas.getContext("webgl");
  if (!gl) return;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  window.addEventListener("resize", resize);
  resize();

  const vsSource = `
    attribute vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const fsSource = `
    precision highp float;
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform vec2 u_mouse;

    void main() {
      vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
      vec2 m = (u_mouse - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);

      // Beam position: right behind hero stage / center-right
      float beamX = 0.14 + m.x * 0.045;
      
      // Organic flow wave along the beam
      float wave = sin(uv.y * 4.8 + u_time * 0.5) * 0.012 + sin(uv.y * 9.0 - u_time * 0.8) * 0.005;
      float distBeam = abs(uv.x - beamX + wave);

      // Core razor-sharp white laser fissure
      float core = exp(-distBeam * 165.0);

      // Intense electric cyan volumetric bloom
      float innerCyan = exp(-distBeam * 34.0);

      // Volumetric royal blue and violet aura
      float auraBlue = exp(-distBeam * 9.5);
      float auraViolet = exp(-distBeam * 3.6);

      // Horizon light blossom (at the bottom shelf where the stage sits)
      float horizonY = -0.32 + m.y * 0.025;
      float distHoriz = abs(uv.y - horizonY);
      float horizonFlare = exp(-distHoriz * 6.5) * exp(-abs(uv.x - beamX) * 2.2);
      float horizonGlow = exp(-distHoriz * 2.4) * exp(-abs(uv.x - beamX) * 1.0);

      // Vertical downward stream dynamics
      float stream = 0.88 + 0.12 * sin(uv.y * 28.0 - u_time * 2.0);

      // Subtle micro-stardust particles drifting near the beam
      float p1 = sin(uv.x * 85.0 + u_time * 0.45) * cos(uv.y * 75.0 + u_time * 0.35);
      float sparkles = smoothstep(0.92, 1.0, p1) * exp(-distBeam * 7.5) * 0.35;

      // Base deep obsidian black cosmos (#06070a)
      vec3 col = vec3(0.022, 0.026, 0.038);

      // Colors matching Huly hero
      vec3 colViolet = vec3(0.40, 0.18, 0.82);
      vec3 colBlue   = vec3(0.16, 0.48, 0.98);
      vec3 colCyan   = vec3(0.24, 0.85, 1.0);
      vec3 colWhite  = vec3(1.0, 1.0, 1.0);
      vec3 colAmber  = vec3(1.0, 0.64, 0.28);

      // Layered composite
      col += colViolet * auraViolet * 0.65;
      col += colBlue * auraBlue * 0.85 * stream;
      col += colCyan * innerCyan * 1.25 * stream;
      col += colWhite * core * 1.6;

      // Horizon flare and chromatic edge glow
      col += colBlue * horizonGlow * 0.55;
      col += colCyan * horizonFlare * 0.85;
      col += colAmber * horizonFlare * 0.28;

      // Stardust sparkles
      col += colWhite * sparkles;

      // Protect reading column on left: text sits in deep pure black void
      float leftProtect = smoothstep(-0.65, -0.15, uv.x);
      col = mix(vec3(0.022, 0.026, 0.038), col, 0.30 + 0.70 * leftProtect);

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  }

  const prog = gl.createProgram();
  gl.attachShader(prog, createShader(gl, gl.VERTEX_SHADER, vsSource));
  gl.attachShader(prog, createShader(gl, gl.FRAGMENT_SHADER, fsSource));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const posBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,  1, -1, -1,  1,
    -1,  1,  1, -1,  1,  1
  ]), gl.STATIC_DRAW);

  const posAttr = gl.getAttribLocation(prog, "position");
  gl.enableVertexAttribArray(posAttr);
  gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(prog, "u_resolution");
  const uTime = gl.getUniformLocation(prog, "u_time");
  const uMouse = gl.getUniformLocation(prog, "u_mouse");

  let mouseX = window.innerWidth * 0.5;
  let mouseY = window.innerHeight * 0.5;
  window.addEventListener("mousemove", e => {
    mouseX = e.clientX;
    mouseY = window.innerHeight - e.clientY;
  });

  const startTime = performance.now();
  function render(now) {
    const elapsed = (now - startTime) * 0.001;
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, elapsed);
    gl.uniform2f(uMouse, mouseX, mouseY);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

/* ==========================================================================
   INTERACTIVE 3D SUPPLY CHAIN DIGITAL TWIN CONSOLE
   Modes:
   1. Global SCM Twin: 3D rotating globe, trans-pacific shipping arcs,
      enterprise nodes (USC, Generac, L&T, Vindeep, Banco), freight pulses.
   2. Warehouse Hub: 2D/3D distribution center velocity slotting grid.
   3. Robotics AI: L&T Defense automated weld seam laser telemetry oscilloscope.
   ========================================================================== */
function initDigitalTwin() {
  const canvas = document.getElementById("digital-twin-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let activeMode = "profile";
  let w = 500;
  let h = 560;

  function resize() {
    const parent = canvas.parentElement;
    const parentRect = parent ? parent.getBoundingClientRect() : null;
    const rect = canvas.getBoundingClientRect();
    const targetW = (rect.width > 0) ? rect.width : (parentRect && parentRect.width > 0 ? parentRect.width : 500);
    const targetH = (rect.height > 0) ? rect.height : (parentRect && parentRect.height > 0 ? parentRect.height : 560);
    w = targetW;
    h = targetH;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }
  resize();
  window.addEventListener("resize", resize);

  // Mode Switcher Buttons
  const modeBtns = document.querySelectorAll(".twin-mode-btn");
  const hudName = document.getElementById("twin-hub-name");
  const hudMetric = document.getElementById("twin-hub-metric");
  const orbitLblLeft = document.getElementById("orbit-lbl-left");
  const orbitValLeft = document.getElementById("orbit-val-left");
  const orbitLblRight = document.getElementById("orbit-lbl-right");
  const orbitValRight = document.getElementById("orbit-val-right");

  const modeDescriptions = {
    profile: {
      name: "HARSH MISTRY // INDUSTRIAL SYSTEMS & OPERATIONS ARCHITECT",
      metric: "California Coastline · USC Viterbi '26 · Real Operator Grounding · Zero Synthetic Avatars",
      lblLeft: "OPERATOR:",
      valLeft: "Harsh Mistry (Real Grounding)",
      lblRight: "LOCATION:",
      valRight: "California Coast · 34.02° N, 118.49° W"
    },
    global: {
      name: "TRANS-PACIFIC LOGISTICS PIPELINE // 3D SCM TWIN",
      metric: "USC & Generac (LA) <-> L&T & Banco (India) · $1.2M Sourcing Batch · 3 Enterprise Hubs",
      lblLeft: "NETWORK:",
      valLeft: "Trans-Pacific Logistics Pipeline",
      lblRight: "STATUS:",
      valRight: "Live 3D Digital Twin (Drag to Rotate)"
    },
    warehouse: {
      name: "USC DISTRIBUTION CENTER // HIGH-VELOCITY AUTONOMOUS DC",
      metric: "Dynamic Velocity Slotting · >98% Audit Accuracy · Saved 3.3 km Transit / Shift",
      lblLeft: "FACILITY:",
      valLeft: "USC Distribution Center",
      lblRight: "FLEET:",
      valRight: "6 Autonomous AGVs Active"
    },
    robotics: {
      name: "L&T DEFENSE // ROBOTIC WELD TELEMETRY",
      metric: "Seam-Tracking Laser Sensor · 20% Defect Reduction · Real-Time Arc Telemetry",
      lblLeft: "DEFENSE CELL:",
      valLeft: "L&T Hazira Manufacturing Complex",
      lblRight: "VISION:",
      valRight: "Seam-Tracking Laser Telemetry"
    }
  };

  const profileOverlay = document.getElementById("profile-viewport");

  function updateModeTelemetry(mode) {
    const cfg = modeDescriptions[mode];
    if (!cfg) return;
    if (hudName) hudName.textContent = cfg.name;
    if (hudMetric) hudMetric.textContent = cfg.metric;
    if (orbitLblLeft) orbitLblLeft.textContent = cfg.lblLeft;
    if (orbitValLeft) orbitValLeft.textContent = cfg.valLeft;
    if (orbitLblRight) orbitLblRight.textContent = cfg.lblRight;
    if (orbitValRight) orbitValRight.textContent = cfg.valRight;
  }

  modeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      modeBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeMode = btn.getAttribute("data-mode") || "profile";
      updateModeTelemetry(activeMode);
      
      const citySelector = document.getElementById("twin-city-selector");
      if (citySelector) {
        citySelector.style.display = (activeMode === "global") ? "flex" : "none";
      }

      if (activeMode === "profile") {
        if (profileOverlay) profileOverlay.classList.add("active");
        canvas.style.display = "none";
      } else {
        if (profileOverlay) profileOverlay.classList.remove("active");
        canvas.style.display = "block";
        resize();
      }
    });
  });

  // Initial mode setup
  updateModeTelemetry(activeMode);

  // 3D Globe Parameters & City Focus Targets
  let rotY = 0.8;
  let rotX = 0.35;
  let targetRotY = null;
  let targetRotX = null;
  let dragging = false;
  let lastX = 0, lastY = 0;

  // Cross-Browser Safe Rounded Rect Helper
  function drawRoundedRect(context, x, y, width, height, radius) {
    if (typeof context.roundRect === "function") {
      context.roundRect(x, y, width, height, radius);
      return;
    }
    const r = Math.min(radius, width * 0.5, height * 0.5);
    context.moveTo(x + r, y);
    context.lineTo(x + width - r, y);
    context.quadraticCurveTo(x + width, y, x + width, y + r);
    context.lineTo(x + width, y + height - r);
    context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    context.lineTo(x + r, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - r);
    context.lineTo(x, y + r);
    context.quadraticCurveTo(x, y, x + r, y);
  }

  canvas.addEventListener("mousedown", e => {
    dragging = true;
    targetRotY = null;
    targetRotX = null;
    lastX = e.clientX;
    lastY = e.clientY;
  });
  window.addEventListener("mouseup", () => { dragging = false; });
  window.addEventListener("mousemove", e => {
    if (dragging && activeMode === "global") {
      rotY += (e.clientX - lastX) * 0.008;
      rotX += (e.clientY - lastY) * 0.008;
      rotX = Math.max(-0.8, Math.min(0.8, rotX));
      lastX = e.clientX;
      lastY = e.clientY;
    }
  });

  // Touch support for mobile devices (iOS / Android)
  canvas.addEventListener("touchstart", e => {
    if (e.touches.length === 1) {
      dragging = true;
      targetRotY = null;
      targetRotX = null;
      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
    }
  }, { passive: true });
  window.addEventListener("touchend", () => { dragging = false; });
  window.addEventListener("touchmove", e => {
    if (dragging && activeMode === "global" && e.touches.length === 1) {
      rotY += (e.touches[0].clientX - lastX) * 0.008;
      rotX += (e.touches[0].clientY - lastY) * 0.008;
      rotX = Math.max(-0.8, Math.min(0.8, rotX));
      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
    }
  }, { passive: true });

  // Enterprise Hubs with Direct City Identifiers & Focus Targets
  const enterpriseHubs = [
    {
      id: "la",
      city: "LOS ANGELES, CA",
      name: "Los Angeles Hub (USC & Generac)",
      short: "LOS ANGELES",
      coords: "34.05° N, 118.24° W",
      enterprise: "USC & Generac Grid Operations",
      lat: 34.05,
      lon: -118.24,
      rotY: 1.15,
      rotX: 0.35,
      metric: "$1.2M Sourcing · 45m to 8s ATS Compactor",
      color: "#00d4ff"
    },
    {
      id: "hazira",
      city: "HAZIRA, INDIA",
      name: "Hazira Complex (L&T Defense)",
      short: "HAZIRA",
      coords: "21.17° N, 72.83° E",
      enterprise: "L&T Heavy Defense Submarine Cell",
      lat: 21.17,
      lon: 72.83,
      rotY: -1.75,
      rotX: 0.25,
      metric: "20% Defect Reduction · Robotic Arc Seam",
      color: "#ffb700"
    },
    {
      id: "gujarat",
      city: "GUJARAT, INDIA",
      name: "Gujarat Industrial Hub (Banco & Vindeep)",
      short: "GUJARAT",
      coords: "22.30° N, 73.18° E",
      enterprise: "Banco Products & Vindeep Precision",
      lat: 22.30,
      lon: 73.18,
      rotY: -1.78,
      rotX: 0.28,
      metric: "ASME VIII Code · 12% Cost Lift",
      color: "#00ff88"
    }
  ];

  // City Focus Controller
  function focusCity(cityId) {
    const hub = enterpriseHubs.find(h => h.id === cityId);
    if (!hub) return;
    targetRotY = hub.rotY;
    targetRotX = hub.rotX;

    document.querySelectorAll(".twin-city-btn").forEach(b => {
      b.classList.toggle("active", b.getAttribute("data-city") === cityId);
    });

    if (hudName) hudName.textContent = `${hub.city} // ${hub.enterprise.toUpperCase()}`;
    if (hudMetric) hudMetric.textContent = `${hub.metric} · Telemetry Locked at ${hub.coords}`;
    if (orbitLblLeft) orbitLblLeft.textContent = "CITY HUB:";
    if (orbitValLeft) orbitValLeft.textContent = hub.city;
    if (orbitLblRight) orbitLblRight.textContent = "COORDINATES:";
    if (orbitValRight) orbitValRight.textContent = hub.coords;
  }

  // Wire City Focus Buttons in DOM
  const cityBtns = document.querySelectorAll(".twin-city-btn");
  cityBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const cityId = btn.getAttribute("data-city");
      if (cityId) focusCity(cityId);
    });
  });

  // Continents Landmass Points (for a realistic Earth wireframe)
  const continentDots = [];
  // North America
  for (let lat = 25; lat <= 55; lat += 8) {
    for (let lon = -125; lon <= -75; lon += 10) {
      continentDots.push({ lat, lon });
    }
  }
  // India & South Asia
  for (let lat = 10; lat <= 32; lat += 6) {
    for (let lon = 68; lon <= 88; lon += 7) {
      continentDots.push({ lat, lon });
    }
  }
  // Europe
  for (let lat = 40; lat <= 60; lat += 8) {
    for (let lon = -5; lon <= 35; lon += 10) {
      continentDots.push({ lat, lon });
    }
  }
  // East Asia
  for (let lat = 20; lat <= 45; lat += 8) {
    for (let lon = 100; lon <= 135; lon += 10) {
      continentDots.push({ lat, lon });
    }
  }

  function latLonTo3D(lat, lon, r) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(r * Math.sin(phi) * Math.cos(theta));
    const z = (r * Math.sin(phi) * Math.sin(theta));
    const y = (r * Math.cos(phi));
    return { x, y, z };
  }

  function rotate3D(pt, rx, ry) {
    let x1 = pt.x * Math.cos(ry) + pt.z * Math.sin(ry);
    let z1 = -pt.x * Math.sin(ry) + pt.z * Math.cos(ry);
    let y1 = pt.y;

    let y2 = y1 * Math.cos(rx) - z1 * Math.sin(rx);
    let z2 = y1 * Math.sin(rx) + z1 * Math.cos(rx);
    let x2 = x1;

    return { x: x2, y: y2, z: z2 };
  }

  let pulse = 0;

  // 6-AGV Warehouse Fleet
  const warehouseFleet = [
    { curX: 80, speed: 1.5, color: "#38bdf8", id: "AGV-01", cargo: "Microinverters" },
    { curX: 180, speed: 1.2, color: "#00ff88", id: "AGV-02", cargo: "ASME Flanges" },
    { curX: 100, speed: 1.6, color: "#ffb700", id: "AGV-03", cargo: "Retail SKUs" },
    { curX: 220, speed: 1.3, color: "#b388ff", id: "AGV-04", cargo: "Cooling Cores" },
    { curX: 140, speed: 1.7, color: "#f43f5e", id: "AGV-05", cargo: "PWRcell Batteries" },
    { curX: 200, speed: 1.4, color: "#00d4ff", id: "AGV-06", cargo: "BOM Hardware" }
  ];

  function draw() {
    if (activeMode === "profile") {
      requestAnimationFrame(draw);
      return;
    }

    ctx.clearRect(0, 0, w, h);
    pulse += 0.025;

    const cx = w * 0.5;
    const cy = h * 0.48;

    if (activeMode === "global") {
      // 1. GLOBAL SCM TWIN
      const R = Math.min(w, h) * 0.32;
      
      // Smooth City Rotational Interpolation or Continuous Drift
      if (targetRotY !== null && targetRotX !== null) {
        rotY += (targetRotY - rotY) * 0.08;
        rotX += (targetRotX - rotX) * 0.08;
        if (Math.abs(targetRotY - rotY) < 0.002 && Math.abs(targetRotX - rotX) < 0.002) {
          rotY = targetRotY;
          rotX = targetRotX;
          targetRotY = null;
          targetRotX = null;
        }
      } else if (!dragging) {
        rotY += 0.003;
      }

      // Radial background glow behind globe
      const grad = ctx.createRadialGradient(cx, cy, 30, cx, cy, R * 1.35);
      grad.addColorStop(0, "rgba(0, 212, 255, 0.16)");
      grad.addColorStop(0.6, "rgba(79, 70, 229, 0.06)");
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.35, 0, Math.PI * 2);
      ctx.fill();

      // Outer atmosphere rim
      ctx.strokeStyle = "rgba(0, 212, 255, 0.28)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();

      // Latitude rings
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        for (let lon = 0; lon <= 360; lon += 10) {
          const pt = latLonTo3D(lat, lon, R);
          const rpt = rotate3D(pt, rotX, rotY);
          const px = cx + rpt.x;
          const py = cy - rpt.y;
          if (lon === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      // Longitude rings
      for (let lon = 0; lon < 360; lon += 45) {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        for (let lat = -90; lat <= 90; lat += 8) {
          const pt = latLonTo3D(lat, lon, R);
          const rpt = rotate3D(pt, rotX, rotY);
          const px = cx + rpt.x;
          const py = cy - rpt.y;
          if (lat === -90) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      // Render Earth Continent Dots
      continentDots.forEach(cd => {
        const pt = latLonTo3D(cd.lat, cd.lon, R);
        const rpt = rotate3D(pt, rotX, rotY);
        if (rpt.z > -10) {
          const px = cx + rpt.x;
          const py = cy - rpt.y;
          ctx.fillStyle = "rgba(56, 189, 248, 0.28)";
          ctx.beginPath();
          ctx.arc(px, py, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Trans-Pacific Shipping Arc between LA and Hazira (India)
      const pLA = rotate3D(latLonTo3D(34.05, -118.24, R), rotX, rotY);
      const pHazira = rotate3D(latLonTo3D(21.17, 72.83, R), rotX, rotY);

      ctx.beginPath();
      ctx.strokeStyle = "rgba(0, 212, 255, 0.55)";
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 2;
      const midX = (pLA.x + pHazira.x) * 0.5;
      const midY = (pLA.y + pHazira.y) * 0.5 + 45;
      ctx.moveTo(cx + pLA.x, cy - pLA.y);
      ctx.quadraticCurveTo(cx + midX, cy - midY, cx + pHazira.x, cy - pHazira.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Traveling freight particle along arc
      const tPulse = (pulse * 0.5) % 1;
      const arcPx = (1 - tPulse) * (1 - tPulse) * (cx + pLA.x) + 2 * (1 - tPulse) * tPulse * (cx + midX) + tPulse * tPulse * (cx + pHazira.x);
      const arcPy = (1 - tPulse) * (1 - tPulse) * (cy - pLA.y) + 2 * (1 - tPulse) * tPulse * (cy - midY) + tPulse * tPulse * (cy - pHazira.y);

      ctx.fillStyle = "#00d4ff";
      ctx.shadowColor = "#00d4ff";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(arcPx, arcPy, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw Enterprise Hubs & High-Contrast City Name Badges
      enterpriseHubs.forEach(h => {
        const pt = latLonTo3D(h.lat, h.lon, R);
        const rpt = rotate3D(pt, rotX, rotY);
        const px = cx + rpt.x;
        const py = cy - rpt.y;

        const isFront = rpt.z > -10;
        const alpha = isFront ? 1 : 0.3;

        // Radar ring
        ctx.strokeStyle = h.color;
        ctx.globalAlpha = alpha * 0.9;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        const rRing = 6 + (Math.sin(pulse * 3 + h.lat) + 1) * 6;
        ctx.arc(px, py, rRing, 0, Math.PI * 2);
        ctx.stroke();

        // Tactical 4-corner reticle crosshairs around hub
        ctx.beginPath();
        ctx.moveTo(px - 8, py); ctx.lineTo(px - 3, py);
        ctx.moveTo(px + 3, py); ctx.lineTo(px + 8, py);
        ctx.moveTo(px, py - 8); ctx.lineTo(px, py - 3);
        ctx.moveTo(px, py + 3); ctx.lineTo(px, py + 8);
        ctx.stroke();

        // Core dot
        ctx.fillStyle = h.color;
        ctx.shadowColor = h.color;
        ctx.shadowBlur = 12;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // 1. PERMANENT ON-GLOBE CITY NAME BADGE (Visible whenever facing front or side)
        if (rpt.z > -28) {
          ctx.font = '700 11px "JetBrains Mono", monospace';
          const cityName = h.city;
          const nameMetrics = ctx.measureText(cityName);
          const badgeW = nameMetrics.width + 20;
          const badgeH = 24;

          const toRight = px >= cx;
          const badgeX = toRight ? px + 16 : px - badgeW - 16;
          const badgeY = py - 12;

          // Connector line from reticle to badge
          ctx.strokeStyle = h.color;
          ctx.lineWidth = 1.2;
          ctx.globalAlpha = isFront ? 0.95 : 0.45;
          ctx.beginPath();
          ctx.moveTo(toRight ? px + 6 : px - 6, py);
          ctx.lineTo(toRight ? badgeX : badgeX + badgeW, badgeY + badgeH * 0.5);
          ctx.stroke();

          // High-contrast City Badge Background
          ctx.fillStyle = "rgba(4, 9, 20, 0.94)";
          ctx.beginPath();
          drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 5);
          ctx.fill();
          ctx.strokeStyle = h.color;
          ctx.lineWidth = 1.4;
          ctx.stroke();

          // Color Indicator Dot
          ctx.fillStyle = h.color;
          ctx.beginPath();
          ctx.arc(badgeX + 10, badgeY + 12, 3.5, 0, Math.PI * 2);
          ctx.fill();

          // City Name in Crisp High-Contrast White
          ctx.fillStyle = "#ffffff";
          ctx.fillText(cityName, badgeX + 18, badgeY + 16);

          // 2. EXPANDED TELEMETRY CARD (When clearly facing front)
          if (isFront) {
            const cardW = Math.min(220, w - 30);
            const cardH = 48;
            const cardX = toRight ? Math.min(w - cardW - 12, badgeX) : Math.max(12, badgeX + badgeW - cardW);
            const cardY = badgeY + badgeH + 6;

            ctx.fillStyle = "rgba(6, 12, 24, 0.94)";
            ctx.beginPath();
            drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 6);
            ctx.fill();
            ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
            ctx.lineWidth = 1;
            ctx.stroke();

            // Facility
            ctx.font = '600 9.5px "Manrope", sans-serif';
            ctx.fillStyle = h.color;
            ctx.fillText(h.enterprise, cardX + 8, cardY + 16);

            // Telemetry
            ctx.font = '500 8.5px "Manrope", sans-serif';
            ctx.fillStyle = "#cbd5e1";
            ctx.fillText(h.metric, cardX + 8, cardY + 30);

            // Coords
            ctx.font = '700 8px "JetBrains Mono", monospace';
            ctx.fillStyle = "#64748b";
            ctx.fillText(h.coords, cardX + 8, cardY + 42);
          }
        }
        ctx.globalAlpha = 1;
      });

    } else if (activeMode === "warehouse") {
      // 2. HIGH-VELOCITY AUTONOMOUS WAREHOUSE & FLEET
      ctx.fillStyle = "rgba(7, 10, 18, 0.95)";
      ctx.fillRect(15, 15, w - 30, h - 30);
      ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(15, 15, w - 30, h - 30);

      // INBOUND LOADING DOCK & 2 DELIVERY SEMI-TRUCKS AT TOP
      const dockW = w - 40;
      ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
      ctx.fillRect(20, 20, dockW, 58);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.strokeRect(20, 20, dockW, 58);

      ctx.font = '700 9px "JetBrains Mono", monospace';
      ctx.fillStyle = "#38bdf8";
      ctx.fillText("INBOUND RECEIVING BAY // DOCKED LOGISTICS FLEET", 30, 36);

      const truckW = Math.min(140, Math.floor((dockW - 75) / 2));
      const t1x = 30;
      const t2x = 30 + truckW + 15;

      // Truck 1 Docked (Generac Clean Energy Delivery)
      ctx.fillStyle = "rgba(56, 189, 248, 0.25)";
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 1;
      ctx.fillRect(t1x, 42, truckW, 28);
      ctx.strokeRect(t1x, 42, truckW, 28);
      ctx.font = '700 8px "JetBrains Mono", monospace';
      ctx.fillStyle = "#ffffff";
      ctx.fillText("SEMI 01 [GENERAC]", t1x + 6, 59);
      // Hazard blinker
      ctx.fillStyle = (Math.sin(pulse * 6) > 0) ? "#ffb700" : "rgba(255, 183, 0, 0.2)";
      ctx.fillRect(t1x + truckW - 8, 46, 4, 20);

      // Truck 2 Docked (USC Bookstore Academic Hub)
      if (t2x + truckW < w - 50) {
        ctx.fillStyle = "rgba(255, 183, 0, 0.25)";
        ctx.strokeStyle = "#ffb700";
        ctx.fillRect(t2x, 42, truckW, 28);
        ctx.strokeRect(t2x, 42, truckW, 28);
        ctx.fillStyle = "#ffffff";
        ctx.fillText("SEMI 02 [USC DC]", t2x + 6, 59);
        ctx.fillStyle = (Math.sin(pulse * 6 + 1) > 0) ? "#ffb700" : "rgba(255, 183, 0, 0.2)";
        ctx.fillRect(t2x + truckW - 8, 46, 4, 20);
      }

      // Conveyor belt line on right
      const convX = w - 55;
      const convW = 24;
      ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
      ctx.fillRect(convX, 42, convW, h - 110);
      ctx.strokeStyle = "rgba(0, 212, 255, 0.35)";
      ctx.strokeRect(convX, 42, convW, h - 110);

      // Moving packages on conveyor
      for (let p = 0; p < 5; p++) {
        const py = 50 + ((pulse * 35 + p * 55) % (h - 130));
        ctx.fillStyle = "#ffb700";
        ctx.fillRect(convX + 3, py, convW - 6, 12);
      }

      // 6 HIGH-VELOCITY AISLES WITH DYNAMIC AGV FLEET
      const startAisleY = 92;
      const availableH = h - startAisleY - 60;
      const aisleSpacing = availableH / 6;

      warehouseFleet.forEach((agv, idx) => {
        const ay = startAisleY + idx * aisleSpacing;
        const minX = 45;
        const maxX = convX - 25;

        agv.curX += agv.speed;
        if (agv.curX > maxX) {
          agv.curX = minX;
        }

        // Draw Rack Aisle
        ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctx.fillRect(25, ay - 10, convX - 35, 20);
        ctx.strokeRect(25, ay - 10, convX - 35, 20);

        // Aisle traffic markings
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = "rgba(56, 189, 248, 0.22)";
        ctx.beginPath();
        ctx.moveTo(35, ay);
        ctx.lineTo(convX - 30, ay);
        ctx.stroke();
        ctx.setLineDash([]);

        // Animated Autonomous AGV Vehicle
        ctx.fillStyle = agv.color;
        ctx.shadowColor = agv.color;
        ctx.shadowBlur = 8;
        ctx.fillRect(agv.curX - 12, ay - 7, 24, 14);
        ctx.shadowBlur = 0;

        // Front Headlights
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(agv.curX + 12, ay - 5, 2, 10);

        // Label
        ctx.font = '700 7.5px "JetBrains Mono", monospace';
        ctx.fillStyle = "#ffffff";
        ctx.fillText(agv.id, agv.curX - 10, ay + 3);
      });

      // OUTBOUND DISPATCH TERMINAL AT BOTTOM
      ctx.fillStyle = "rgba(0, 212, 255, 0.12)";
      ctx.strokeStyle = "#00d4ff";
      ctx.fillRect(20, h - 48, dockW, 26);
      ctx.strokeRect(20, h - 48, dockW, 26);

      ctx.font = '700 8.5px "JetBrains Mono", monospace';
      ctx.fillStyle = "#38bdf8";
      ctx.fillText("OUTBOUND DISPATCH // 6/6 AGVS RUNNING // 412 PICKS/HR // >98% ACCURACY", 28, h - 32);

    } else if (activeMode === "robotics") {
      // 3. ROBOTICS AI OSCILLOSCOPE (L&T Defense)
      ctx.fillStyle = "rgba(7, 10, 18, 0.95)";
      ctx.fillRect(25, 45, w - 50, h - 90);
      ctx.strokeStyle = "rgba(0, 212, 255, 0.35)";
      ctx.strokeRect(25, 45, w - 50, h - 90);

      // Grid lines
      ctx.strokeStyle = "rgba(0, 212, 255, 0.08)";
      ctx.lineWidth = 1;
      for (let gy = 60; gy < h - 60; gy += 26) {
        ctx.beginPath();
        ctx.moveTo(25, gy);
        ctx.lineTo(w - 25, gy);
        ctx.stroke();
      }
      for (let gx = 45; gx < w - 25; gx += 35) {
        ctx.beginPath();
        ctx.moveTo(gx, 45);
        ctx.lineTo(gx, h - 45);
        ctx.stroke();
      }

      // Title HUD
      ctx.font = '10.5px "JetBrains Mono", monospace';
      ctx.fillStyle = "#00d4ff";
      ctx.fillText("L&T DEFENSE // SEAM TRACKING LASER TELEMETRY", 35, 68);
      ctx.font = '8.5px "JetBrains Mono", monospace';
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("TOLERANCE: +/-0.05mm * WELD DEFECT LIFT: 20% * ZERO POROSITY", 35, 84);

      // Real-time oscilloscope wave
      const midWaveY = cy + 15;
      ctx.beginPath();
      ctx.strokeStyle = "#00d4ff";
      ctx.lineWidth = 2.2;
      ctx.shadowColor = "#00d4ff";
      ctx.shadowBlur = 10;

      for (let wx = 30; wx < w - 30; wx += 2) {
        const rad = (wx * 0.035) + pulse * 4;
        const wy = midWaveY + Math.sin(rad) * 26 + Math.cos(rad * 2.3) * 10 + (Math.random() - 0.5) * 2.5;
        if (wx === 30) ctx.moveTo(wx, wy);
        else ctx.lineTo(wx, wy);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Arc voltage secondary wave
      ctx.beginPath();
      ctx.strokeStyle = "rgba(245, 158, 11, 0.75)";
      ctx.lineWidth = 1.5;
      for (let wx = 30; wx < w - 30; wx += 2) {
        const rad = (wx * 0.02) - pulse * 3;
        const wy = midWaveY + 55 + Math.sin(rad) * 14;
        if (wx === 30) ctx.moveTo(wx, wy);
        else ctx.lineTo(wx, wy);
      }
      ctx.stroke();

      ctx.fillStyle = "#f59e0b";
      ctx.font = '8.5px "JetBrains Mono", monospace';
      ctx.fillText("ARC CURRENT: 185A // VOLTAGE: 24.2V // LATENCY: <12ms", 35, h - 60);
    }

    requestAnimationFrame(draw);
  }
  draw();
}

/* ==========================================================================
   CHAPTER 01 : THE WIRE // BALTIMORE DOCK SHIPPING TERMINAL
   Gantry cranes, cargo ship silhouettes, moving navigation lights,
   sweeping harbor radar, and Omar whistle audio wave.
   ========================================================================== */
function initWireCanvas() {
  const canvas = document.getElementById("wire-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    t += 0.02;

    const cw = canvas.width;
    const ch = canvas.height;
    const waterY = ch * 0.72;

    // Water horizon line
    ctx.strokeStyle = "rgba(0, 212, 255, 0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, waterY);
    ctx.lineTo(cw, waterY);
    ctx.stroke();

    // Gantry container cranes silhouette
    ctx.fillStyle = "rgba(14, 24, 40, 0.45)";
    ctx.strokeStyle = "rgba(0, 212, 255, 0.18)";
    ctx.lineWidth = 1.5;

    [0.15, 0.45, 0.8].forEach(xRel => {
      const cx = cw * xRel;
      // Crane legs
      ctx.beginPath();
      ctx.moveTo(cx - 30, waterY);
      ctx.lineTo(cx - 15, waterY - 80);
      ctx.lineTo(cx + 15, waterY - 80);
      ctx.lineTo(cx + 30, waterY);
      ctx.stroke();
      // Crane boom arm
      ctx.beginPath();
      ctx.moveTo(cx - 60, waterY - 80);
      ctx.lineTo(cx + 80, waterY - 80);
      ctx.stroke();
      // Flashing warning beacon on top of crane
      ctx.fillStyle = (Math.sin(t * 3 + xRel * 10) > 0) ? "#ff3333" : "rgba(255, 51, 51, 0.2)";
      ctx.beginPath();
      ctx.arc(cx, waterY - 84, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Harbor water wave reflections
    ctx.strokeStyle = "rgba(0, 212, 255, 0.12)";
    ctx.lineWidth = 1;
    for (let wy = waterY + 15; wy < ch; wy += 20) {
      ctx.beginPath();
      for (let wx = 0; wx < cw; wx += 15) {
        const offset = Math.sin(wx * 0.02 + t + wy * 0.05) * 4;
        if (wx === 0) ctx.moveTo(wx, wy + offset);
        else ctx.lineTo(wx, wy + offset);
      }
      ctx.stroke();
    }

    // Omar Whistle Waveform pulse along bottom
    ctx.strokeStyle = "rgba(0, 212, 255, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const waveY = ch - 25;
    for (let wx = 0; wx < cw; wx += 4) {
      const whistle = Math.sin(wx * 0.03 - t * 2) * Math.sin(wx * 0.005) * 12;
      if (wx === 0) ctx.moveTo(wx, waveY + whistle);
      else ctx.lineTo(wx, waveY + whistle);
    }
    ctx.stroke();

    requestAnimationFrame(draw);
  }
  draw();
}

/* ==========================================================================
   CHAPTER 02 : THE WIRE // STRINGER BELL'S CHESSBOARD
   Glowing isometric chessboard grid with piece maneuver vectors
   and Adam Smith supply/demand curves.
   ========================================================================== */
function initChessCanvas() {
  const canvas = document.getElementById("chess-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  let offset = 0;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    offset += 0.015;

    const cw = canvas.width;
    const ch = canvas.height;
    const cx = cw * 0.5;
    const cy = ch * 0.55;

    // Draw 3D Isometric Chessboard grid in warm gold/amber
    const gridRows = 8;
    const gridCols = 8;
    const tileW = 45;
    const tileH = 22;

    ctx.lineWidth = 1;
    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        const isoX = cx + (c - r) * tileW;
        const isoY = cy + (c + r) * tileH * 0.5 - 60;

        const isAlt = (r + c) % 2 === 0;
        ctx.fillStyle = isAlt ? "rgba(240, 165, 0, 0.08)" : "rgba(14, 20, 32, 0.4)";
        ctx.strokeStyle = "rgba(240, 165, 0, 0.22)";

        ctx.beginPath();
        ctx.moveTo(isoX, isoY);
        ctx.lineTo(isoX + tileW, isoY + tileH * 0.5);
        ctx.lineTo(isoX, isoY + tileH);
        ctx.lineTo(isoX - tileW, isoY + tileH * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }

    // Moving Pawn to Queen maneuver vector
    const moveProgress = (offset * 0.6) % 1;
    const pStartX = cx - tileW * 2;
    const pStartY = cy + tileH * 2;
    const pEndX = cx + tileW * 2;
    const pEndY = cy - tileH * 2;

    const curX = pStartX + (pEndX - pStartX) * moveProgress;
    const curY = pStartY + (pEndY - pStartY) * moveProgress;

    ctx.strokeStyle = "rgba(240, 165, 0, 0.6)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(pStartX, pStartY);
    ctx.lineTo(pEndX, pEndY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Chess Piece Head
    ctx.fillStyle = "#f0a500";
    ctx.shadowColor = "#f0a500";
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(curX, curY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Stringer Bell Microeconomics Curve (Supply meets Demand)
    ctx.strokeStyle = "rgba(0, 212, 255, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let x = 60; x < cw - 60; x += 10) {
      const y = ch * 0.35 - Math.sin((x + offset * 80) * 0.01) * 35;
      if (x === 60) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    requestAnimationFrame(draw);
  }
  draw();
}

/* ==========================================================================
   CHAPTER 03 : BREAKING BAD // HEISENBERG 99.1% SUPERLAB
   Distillation reflux tubes, crystal reaction motes, molecular structures,
   and titration purity telemetry.
   ========================================================================== */
function initLabCanvas() {
  const canvas = document.getElementById("lab-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  // Molecular bubbles & vapor particles
  const bubbles = [];
  for (let i = 0; i < 45; i++) {
    bubbles.push({
      x: Math.random() * 800,
      y: Math.random() * 600,
      r: 1 + Math.random() * 3.5,
      speed: 0.4 + Math.random() * 0.8,
      color: Math.random() > 0.4 ? "#00d4ff" : "#ffcc00"
    });
  }

  let t = 0;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    t += 0.02;

    const cw = canvas.width;
    const ch = canvas.height;

    // Distillation tube lines
    ctx.strokeStyle = "rgba(0, 212, 255, 0.2)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(80, ch * 0.3);
    ctx.lineTo(cw * 0.4, ch * 0.3);
    ctx.lineTo(cw * 0.6, ch * 0.7);
    ctx.lineTo(cw - 80, ch * 0.7);
    ctx.stroke();

    // Floating Chemical Formulas
    const formulas = ["C10H15N", "99.1% PURITY", "HCl // TITRATION", "ΔH = -890 kJ", "ASME SEC VIII"];
    ctx.font = '11px "Space Mono", monospace';
    ctx.fillStyle = "rgba(0, 212, 255, 0.35)";
    formulas.forEach((form, idx) => {
      const fx = (cw * 0.2) + (idx * 160) % (cw - 200);
      const fy = ch * 0.25 + Math.sin(t + idx * 2) * 20 + idx * 45;
      ctx.fillText(form, fx, fy);
    });

    // Rising Bubbles
    bubbles.forEach(b => {
      b.y -= b.speed;
      if (b.y < 0) {
        b.y = ch;
        b.x = Math.random() * cw;
      }
      ctx.fillStyle = b.color;
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    requestAnimationFrame(draw);
  }
  draw();
}


/* ==========================================================================
   CHAPTER 05 : PULP FICTION // THE GOLDEN BRIEFCASE
   Radiating volumetric golden rays from the glowing briefcase,
   vintage film dust, and The Wolf's surgical problem solving vectors.
   ========================================================================== */
function initPulpCanvas() {
  const canvas = document.getElementById("pulp-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  let t = 0;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    t += 0.02;

    const cw = canvas.width;
    const ch = canvas.height;
    const originX = cw * 0.5;
    const originY = ch * 0.45;

    // Radiating Volumetric Golden Light Rays (The Briefcase Glow)
    const rayCount = 14;
    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2 + t * 0.1;
      const spread = 0.12;

      ctx.fillStyle = "rgba(255, 183, 0, 0.08)";
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(originX + Math.cos(angle - spread) * cw, originY + Math.sin(angle - spread) * ch);
      ctx.lineTo(originX + Math.cos(angle + spread) * cw, originY + Math.sin(angle + spread) * ch);
      ctx.closePath();
      ctx.fill();
    }

    // Central glowing briefcase halo
    const halo = ctx.createRadialGradient(originX, originY, 10, originX, originY, 180);
    halo.addColorStop(0, "rgba(255, 200, 50, 0.45)");
    halo.addColorStop(0.5, "rgba(255, 160, 0, 0.15)");
    halo.addColorStop(1, "transparent");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(originX, originY, 180, 0, Math.PI * 2);
    ctx.fill();

    // The Wolf's 8-step surgical problem solving nodes
    for (let step = 0; step < 8; step++) {
      const sAngle = (step / 8) * Math.PI * 2 + t * 0.15;
      const sx = originX + Math.cos(sAngle) * 120;
      const sy = originY + Math.sin(sAngle) * 80;

      ctx.fillStyle = "#ffb700";
      ctx.beginPath();
      ctx.arc(sx, sy, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }
  draw();
}

/* ==========================================================================
   CHAPTER 06 : INTERSTELLAR // GARGANTUA & 68 RPM DOCKING
   Relativistic accretion disk in flame amber and gravitational violet,
   event horizon shadow, and 68 RPM docking rotational axes.
   ========================================================================== */
function initStellarCanvas() {
  const canvas = document.getElementById("stellar-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  let rot = 0;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    rot += 0.015;

    const cw = canvas.width;
    const ch = canvas.height;
    const cx = cw * 0.5;
    const cy = ch * 0.5;
    const rHole = 70;

    // Relativistic Accretion Disk (Upper Arch)
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1, 0.38);

    // Accretion disk glow rings
    for (let r = 90; r < 240; r += 15) {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.strokeStyle = r < 140 ? "rgba(255, 140, 0, 0.4)" : "rgba(147, 51, 234, 0.25)";
      ctx.lineWidth = 6;
      ctx.stroke();
    }
    ctx.restore();

    // Central Event Horizon (pure black void)
    ctx.fillStyle = "#020408";
    ctx.shadowColor = "#ff7b00";
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(cx, cy, rHole, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 68 RPM Docking Alignment Crosshair
    ctx.strokeStyle = "rgba(0, 212, 255, 0.6)";
    ctx.lineWidth = 1.5;
    const crossLen = 35;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);

    ctx.beginPath();
    ctx.moveTo(-crossLen, 0); ctx.lineTo(crossLen, 0);
    ctx.moveTo(0, -crossLen); ctx.lineTo(0, crossLen);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, crossLen * 0.7, 0, Math.PI * 2);
    ctx.stroke();

    ctx.font = '10px "Space Mono", monospace';
    ctx.fillStyle = "#00d4ff";
    ctx.fillText("68 RPM SYNC", crossLen + 8, 4);

    ctx.restore();

    requestAnimationFrame(draw);
  }
  draw();
}



/* ==========================================================================
   PROJECT VISUAL 1 : 0.38pt ATS Layout Compactor Interactive Graph
   ========================================================================== */
function initAtsCompactorGraph() {
  const canvas = document.getElementById("ats-convergence-canvas");
  const btnRun = document.getElementById("btn-run-compactor");
  const statVal = document.getElementById("ats-overflow-stat");
  const statusTxt = document.getElementById("ats-compactor-status");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let iteration = 0;
  const maxIterations = 6;
  const heights = [104.2, 103.1, 102.2, 101.4, 100.6, 99.8];
  let animating = false;

  function resize() {
    canvas.width = canvas.parentElement.clientWidth * window.devicePixelRatio;
    canvas.height = 150 * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    drawGraph();
  }
  resize();
  window.addEventListener("resize", resize);

  function drawGraph() {
    const w = canvas.parentElement.clientWidth;
    const h = 150;
    ctx.clearRect(0, 0, w, h);

    const padLeft = 45;
    const padRight = 30;
    const padTop = 25;
    const padBottom = 30;
    const graphW = w - padLeft - padRight;
    const graphH = h - padTop - padBottom;

    // Target 100% line
    const y100 = padTop + graphH * (1 - (100 - 98) / 8);
    ctx.strokeStyle = "rgba(0, 255, 65, 0.4)";
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padLeft, y100);
    ctx.lineTo(w - padRight, y100);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = '9px "Space Mono", monospace';
    ctx.fillStyle = "#00ff41";
    ctx.fillText("TARGET: 100% SINGLE PAGE", w - padRight - 150, y100 - 5);

    // Y Axis Labels
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("105%", 12, padTop + 8);
    ctx.fillText("100%", 12, y100 + 3);
    ctx.fillText("98%", 12, padTop + graphH);

    // X Axis steps
    for (let i = 0; i < maxIterations; i++) {
      const x = padLeft + (i / (maxIterations - 1)) * graphW;
      ctx.fillStyle = i <= iteration ? "#38bdf8" : "rgba(255, 255, 255, 0.2)";
      ctx.fillText(`i-${i}`, x - 8, h - 8);
    }

    // Plot line up to current iteration
    ctx.beginPath();
    ctx.strokeStyle = iteration === maxIterations - 1 ? "#00ff41" : "#00d4ff";
    ctx.lineWidth = 2.5;

    for (let i = 0; i <= iteration; i++) {
      const x = padLeft + (i / (maxIterations - 1)) * graphW;
      const y = padTop + graphH * (1 - (heights[i] - 98) / 8);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Plot Points
    for (let i = 0; i <= iteration; i++) {
      const x = padLeft + (i / (maxIterations - 1)) * graphW;
      const y = padTop + graphH * (1 - (heights[i] - 98) / 8);
      ctx.fillStyle = i === maxIterations - 1 ? "#00ff41" : heights[i] > 100 ? "#ff5252" : "#38bdf8";
      ctx.beginPath();
      ctx.arc(x, y, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Show value label
      ctx.font = '9px "Space Mono", monospace';
      ctx.fillText(`${heights[i]}%`, x - 12, y - 8);
    }
  }

  if (btnRun) {
    btnRun.addEventListener("click", () => {
      if (animating) return;
      animating = true;
      iteration = 0;
      statVal.textContent = "Compacting...";
      statVal.style.color = "#38bdf8";

      const stepInterval = setInterval(() => {
        iteration++;
        drawGraph();

        if (iteration < maxIterations) {
          statVal.textContent = `Iter ${iteration}: ${heights[iteration]}% Height (-${(iteration * 0.38).toFixed(2)}pt delta)`;
          statVal.style.color = heights[iteration] <= 100 ? "#00ff41" : "#ffb700";
          statusTxt.textContent = `Applying geometric AST micro-padding step ${iteration}/5...`;
        } else {
          clearInterval(stepInterval);
          animating = false;
          iteration = maxIterations - 1;
          drawGraph();
          statVal.textContent = "100% Single-Page Verified (99.8% Fit, 0 Overflow)";
          statVal.style.color = "#00ff41";
          statusTxt.textContent = "Compaction complete! Zero second-page spillover achieved.";
        }
      }, 500);
    });
  }

  drawGraph();
}

/* ==========================================================================
   PROJECT VISUAL 2 : USC Warehouse Slotting 2D Heatmap & Picker Routes
   ========================================================================== */
function initWarehouseSlottingVisual() {
  const canvas = document.getElementById("warehouse-slotting-canvas");
  const btnAfter = document.getElementById("btn-view-slotting-after");
  const btnBefore = document.getElementById("btn-view-slotting-before");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let isOptimized = true;

  function resize() {
    canvas.width = canvas.parentElement.clientWidth * window.devicePixelRatio;
    canvas.height = 240 * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }
  resize();
  window.addEventListener("resize", resize);

  if (btnAfter && btnBefore) {
    btnAfter.addEventListener("click", () => {
      isOptimized = true;
      btnAfter.classList.add("active");
      btnBefore.classList.remove("active");
    });
    btnBefore.addEventListener("click", () => {
      isOptimized = false;
      btnBefore.classList.add("active");
      btnAfter.classList.remove("active");
    });
  }

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    t += 0.03;

    const w = canvas.parentElement.clientWidth;
    const h = 240;

    // Dispatch Dock at bottom
    ctx.fillStyle = "rgba(56, 189, 248, 0.12)";
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1.5;
    ctx.fillRect(20, h - 35, w - 40, 24);
    ctx.strokeRect(20, h - 35, w - 40, 24);

    ctx.font = '10px "Space Mono", monospace';
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("OUTBOUND DISPATCH DOCK // HIGH-VELOCITY SORTATION GATE", 30, h - 19);

    // 6 Racking Aisles
    const aisleCount = 6;
    const aisleW = (w - 70) / aisleCount;
    const aisleH = 130;
    const aisleY = 25;

    for (let i = 0; i < aisleCount; i++) {
      const ax = 30 + i * aisleW;

      // Color zone based on optimization
      let zoneColor = "rgba(79, 70, 229, 0.25)";
      let strokeColor = "rgba(79, 70, 229, 0.4)";
      let zoneLabel = "ZONE C (BULK)";

      if (isOptimized) {
        if (i < 2) {
          zoneColor = "rgba(255, 183, 0, 0.28)";
          strokeColor = "#ffb700";
          zoneLabel = "ZONE A (80% PICKS)";
        } else if (i < 4) {
          zoneColor = "rgba(0, 212, 255, 0.22)";
          strokeColor = "#00d4ff";
          zoneLabel = "ZONE B (MEDIUM)";
        }
      } else {
        // Disorganized baseline
        const randSeed = (i * 3) % 3;
        if (randSeed === 0) { zoneColor = "rgba(255, 183, 0, 0.25)"; strokeColor = "#ffb700"; }
        else if (randSeed === 1) { zoneColor = "rgba(0, 212, 255, 0.2)"; strokeColor = "#00d4ff"; }
        zoneLabel = "UNSORTED MIX";
      }

      ctx.fillStyle = zoneColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1;
      ctx.fillRect(ax, aisleY, aisleW - 10, aisleH);
      ctx.strokeRect(ax, aisleY, aisleW - 10, aisleH);

      // Shelf sub-divisions
      for (let s = 1; s < 4; s++) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        ctx.beginPath();
        ctx.moveTo(ax, aisleY + s * 32);
        ctx.lineTo(ax + aisleW - 10, aisleY + s * 32);
        ctx.stroke();
      }

      ctx.font = '8px "Space Mono", monospace';
      ctx.fillStyle = strokeColor;
      ctx.fillText(`AISLE 0${i + 1}`, ax + 4, aisleY + 14);
      ctx.fillText(zoneLabel, ax + 4, aisleY + 28);
    }

    // Picker Travel Path
    ctx.lineWidth = 2;
    if (isOptimized) {
      // Linear streamlined path (Zone A right to dock)
      ctx.strokeStyle = "#00ff41";
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(40, h - 35);
      ctx.lineTo(40, aisleY + 40);
      ctx.lineTo(80, aisleY + 40);
      ctx.lineTo(80, h - 35);
      ctx.stroke();
      ctx.setLineDash([]);

      // Traveling picker dot
      const pickerProg = (t * 0.8) % 1;
      const px = 40 + pickerProg * 40;
      const py = aisleY + 40;
      ctx.fillStyle = "#00ff41";
      ctx.shadowColor = "#00ff41";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.font = '9px "Space Mono", monospace';
      ctx.fillStyle = "#00ff41";
      ctx.fillText("OPTIMIZED TRANSIT: 5.1 KM/SHIFT (-15%)", w - 240, 18);
    } else {
      // Chaotic crisscross path across all aisles
      ctx.strokeStyle = "#ff5252";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(35, h - 35);
      ctx.lineTo(w - 50, aisleY + 30);
      ctx.lineTo(75, aisleY + 110);
      ctx.lineTo(w - 120, aisleY + 80);
      ctx.lineTo(120, h - 35);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = '9px "Space Mono", monospace';
      ctx.fillStyle = "#ff5252";
      ctx.fillText("UNSORTED BOTTLENECK: 8.4 KM/SHIFT", w - 240, 18);
    }

    requestAnimationFrame(draw);
  }
  draw();
}

/* ==========================================================================
   PROJECT VISUAL 3 : L&T Defense Computer Vision Seam Profilometry HUD
   ========================================================================== */
function initWeldVisionVisual() {
  const canvas = document.getElementById("weld-vision-canvas");
  const btnAnomaly = document.getElementById("btn-simulate-weld-anomaly");
  const telemetryTxt = document.getElementById("weld-telemetry-text");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let anomalyActive = false;
  let anomalyTimer = 0;

  function resize() {
    canvas.width = canvas.parentElement.clientWidth * window.devicePixelRatio;
    canvas.height = 200 * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }
  resize();
  window.addEventListener("resize", resize);

  if (btnAnomaly) {
    btnAnomaly.addEventListener("click", () => {
      anomalyActive = true;
      anomalyTimer = 120; // 2 seconds
    });
  }

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    t += 0.04;

    const w = canvas.parentElement.clientWidth;
    const h = 200;
    const midY = h * 0.5;

    if (anomalyTimer > 0) {
      anomalyTimer--;
      if (anomalyTimer === 0) anomalyActive = false;
    }

    // Tolerance Band (±0.05 mm corridor)
    ctx.fillStyle = anomalyActive ? "rgba(255, 82, 82, 0.12)" : "rgba(0, 255, 65, 0.08)";
    ctx.strokeStyle = anomalyActive ? "rgba(255, 82, 82, 0.4)" : "rgba(0, 255, 65, 0.35)";
    ctx.lineWidth = 1;
    ctx.fillRect(20, midY - 25, w - 40, 50);
    ctx.strokeRect(20, midY - 25, w - 40, 50);

    ctx.font = '9px "Space Mono", monospace';
    ctx.fillStyle = anomalyActive ? "#ff5252" : "#00ff41";
    ctx.fillText("+0.05mm UPPER CAD THRESHOLD", 30, midY - 29);
    ctx.fillText("-0.05mm LOWER CAD THRESHOLD", 30, midY + 36);

    // Laser Seam Wave
    ctx.beginPath();
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = anomalyActive ? "#ff5252" : "#00ff41";
    ctx.shadowColor = anomalyActive ? "#ff5252" : "#00ff41";
    ctx.shadowBlur = 10;

    for (let x = 20; x < w - 20; x += 3) {
      let wave = Math.sin(x * 0.04 + t * 3) * 8 + Math.cos(x * 0.08 - t * 2) * 4;

      // Inject anomaly in center if active
      if (anomalyActive && Math.abs(x - w * 0.5) < 60) {
        wave += Math.sin((x - w * 0.5) * 0.1) * 38;
      }

      const y = midY + wave;
      if (x === 20) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Laser Tooling Reticle at scan point
    const scanX = 20 + ((t * 80) % (w - 60));
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(scanX, 10);
    ctx.lineTo(scanX, h - 10);
    ctx.stroke();

    // Reticle circle
    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.arc(scanX, midY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Telemetry Update
    if (telemetryTxt) {
      if (anomalyActive) {
        telemetryTxt.textContent = "ANOMALY FLAGGED: SUB-SURFACE POROSITY DETECTED // PASS 1 // LATENCY: 9ms // REWORK AVERTED";
        telemetryTxt.style.color = "#ff5252";
        telemetryTxt.style.background = "rgba(255, 82, 82, 0.15)";
        telemetryTxt.style.borderColor = "#ff5252";
      } else {
        telemetryTxt.textContent = "STATUS: SYNCHRONOUS TRACKING // ARC VOLTAGE: 24.2V // CURRENT: 185A // POROSITY: 0.00%";
        telemetryTxt.style.color = "#00ff41";
        telemetryTxt.style.background = "rgba(0, 255, 65, 0.08)";
        telemetryTxt.style.borderColor = "rgba(0, 255, 65, 0.2)";
      }
    }

    requestAnimationFrame(draw);
  }
  draw();
}

/* ==========================================================================
   INTERACTIVE SCM TERMINAL SIMULATOR
   ========================================================================== */
function initTerminalSimulator() {
  const screen = document.getElementById("terminal-screen");
  const simBtns = document.querySelectorAll(".sim-btn");
  if (!screen || !simBtns.length) return;

  const simulations = {
    rfq: [
      { text: "> DIRECTIVE: AUDIT VENDOR RFQ BATCH ($1.2M)", type: "prompt" },
      { text: "// Connecting to Claude 3.5 Sonnet SCM Agent via MCP Tooling...", type: "dim" },
      { text: "[INGEST] 24 vendor submittals ingested across 6 tiers. 482 BOM line items.", type: "" },
      { text: "[AST-PARSE] Mechanical tolerances verified: ±0.02 mm across ASME Sec VIII flanges.", type: "" },
      { text: "[FLAGGED] Vendor-04 lead time anomaly: +14 days skew beyond production window.", type: "warn" },
      { text: "[SHOULD-COST] Arbitrage identified: $148,200 potential savings on Tier-2 raw stock.", type: "success" },
      { text: "[SUCCESS] RFQ BATCH AUDIT COMPLETE. 100% Compliance Verified in 7.8 seconds.", type: "prompt" }
    ],
    ats: [
      { text: "> DIRECTIVE: RUN 0.38PT GEOMETRIC LAYOUT COMPACTOR", type: "prompt" },
      { text: "// Initializing AST layout compactor on resume DOM stream...", type: "dim" },
      { text: "[DETECT] Container height overflow: 104.2% (Second-page spill detected).", type: "warn" },
      { text: "[ITER-01] Micro-padding reduction (-0.38pt) -> Container height: 103.1%.", type: "" },
      { text: "[ITER-02] Margins and letter-spacing delta (-0.38pt) -> Container height: 102.0%.", type: "" },
      { text: "[ITER-03] Line-height compaction (-0.38pt) -> Container height: 100.9%.", type: "" },
      { text: "[ITER-04] Final convergence step (-0.38pt) -> Container height: 99.8%.", type: "success" },
      { text: "[SUCCESS] CONVERGENCE ACHIEVED: Single-page boundary locked. Page 2 spill = 0.00%.", type: "prompt" }
    ],
    mcp: [
      { text: "> DIRECTIVE: QUERY REAL-TIME SUPPLIER RISK VIA MCP", type: "prompt" },
      { text: "// Querying enterprise MCP multi-tier supplier graph...", type: "dim" },
      { text: "[ROUTE] Trans-Pacific trade corridor: Port of Los Angeles <-> Port of Hazira.", type: "" },
      { text: "[TELEMETRY] LA container dwell time: 2.4 days (Nominal). Hazira berth: Clear.", type: "" },
      { text: "[SUPPLIER-HEALTH] Tier-1 Defense Supplier Solvency: 98.4 / 100 (Rock Solid).", type: "success" },
      { text: "[CONTINGENCY] Secondary routing standby via Singapore corridor pre-allocated.", type: "" },
      { text: "[SUCCESS] RISK ASSESSMENT COMPLETE. Zero single-point-of-failure vulnerabilities.", type: "prompt" }
    ]
  };

  let isRunning = false;

  simBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      if (isRunning) return;
      const action = btn.getAttribute("data-action");
      const steps = simulations[action];
      if (!steps) return;

      isRunning = true;
      simBtns.forEach(b => b.classList.remove("running"));
      btn.classList.add("running");

      screen.innerHTML = "";

      let stepIndex = 0;
      function printNextStep() {
        if (stepIndex >= steps.length) {
          isRunning = false;
          btn.classList.remove("running");
          return;
        }

        const step = steps[stepIndex];
        const row = document.createElement("div");
        row.className = "terminal-row " + (step.type || "");
        row.textContent = step.text;
        screen.appendChild(row);
        screen.scrollTop = screen.scrollHeight;

        stepIndex++;
        setTimeout(printNextStep, 380);
      }

      printNextStep();
    });
  });
}

/* ==========================================================================
   CYBER DEFENSE INTEGRITY SHIELD (Website Examine Blocker)
   ========================================================================== */
function initCyberDefenseShield() {
  const toast = document.getElementById("cyber-defense-toast");
  const msgEl = document.getElementById("cyber-toast-msg");
  let toastTimer = null;

  function triggerShield(reason) {
    if (!toast) return;
    if (msgEl && reason) msgEl.textContent = reason;
    toast.classList.add("show");

    document.body.classList.add("defense-perimeter-flash");
    setTimeout(() => {
      document.body.classList.remove("defense-perimeter-flash");
    }, 400);

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2800);
  }

  // 1. Intercept Right-Click (Context Menu)
  window.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    triggerShield("SOURCE INSPECTION RESTRICTED // ISO-27001 PROTOCOL");
    console.warn("[SECURITY] Context menu inspection blocked by Cyber Defense Directive.");
  });

  // 2. Intercept DevTools Key Combinations
  window.addEventListener("keydown", (e) => {
    // F12
    if (e.key === "F12") {
      e.preventDefault();
      triggerShield("ACCESS RESTRICTED // F12 DEVTOOLS LOCKED");
      console.warn("[SECURITY] F12 keystroke intercepted.");
      return;
    }

    // Ctrl+Shift+I / Cmd+Option+I (Inspect)
    // Ctrl+Shift+J / Cmd+Option+J (Console)
    // Ctrl+Shift+C / Cmd+Option+C (Inspect Element)
    // Ctrl+U / Cmd+Option+U (View Source)
    // Ctrl+S / Cmd+S (Save Page)
    if (
      (e.ctrlKey || e.metaKey) &&
      (e.key === "I" || e.key === "i" ||
       e.key === "J" || e.key === "j" ||
       e.key === "C" || e.key === "c" ||
       e.key === "U" || e.key === "u" ||
       e.key === "S" || e.key === "s")
    ) {
      if (e.shiftKey || e.key === "u" || e.key === "U" || e.key === "s" || e.key === "S") {
        e.preventDefault();
        triggerShield("SOURCE EXAMINE BLOCKED // CRYPTOGRAPHIC INTEGRITY SHIELD");
        console.warn("[SECURITY] Inspection keystroke blocked: " + e.key);
      }
    }
  });

  // 3. DevTools Detection & Anti-Tamper Shield (Huly-Grade Defense)
  let devToolsOpen = false;
  const checkDevTools = () => {
    const widthThreshold = window.outerWidth - window.innerWidth > 160;
    const heightThreshold = window.outerHeight - window.innerHeight > 160;
    if ((widthThreshold || heightThreshold) && !devToolsOpen) {
      devToolsOpen = true;
      triggerShield("INSPECTION DETECTED // DEVTOOLS DEFENSE ENGAGED");
      console.clear();
      console.warn("[SECURITY] Inspection detected. Harsh Mistry defensive countermeasure active.");
    } else if (!widthThreshold && !heightThreshold) {
      devToolsOpen = false;
    }
  };
  window.addEventListener("resize", checkDevTools);
  setInterval(checkDevTools, 1500);

  // 4. Disable Asset Dragging (Prevents image scraping/extraction)
  document.querySelectorAll("img").forEach(img => {
    img.setAttribute("draggable", "false");
    img.addEventListener("dragstart", e => e.preventDefault());
  });

  // 5. High-Engineering Console Security Banner
  console.log(
    "%c" +
    " [!] CYBER DEFENSE INTEGRITY SHIELD ACTIVE [!]\n" +
    " ========================================================\n" +
    " HARSH MISTRY // INDUSTRIAL SYSTEMS & OPERATIONS ARCHITECT\n" +
    " USC Viterbi School of Engineering '26\n" +
    " Defense Fabrication (L&T) * Supply Chain (Generac, Banco) * Autonomous AI\n" +
    " Security: ISO-27001 Protocol * Zero Vulnerabilities * Zero Half Measures\n" +
    " Contact: harshnil@usc.edu | hnmistry28@gmail.com\n" +
    " ========================================================",
    "color: #00d4ff; font-family: monospace; font-size: 11px; font-weight: bold; line-height: 1.35;"
  );
}

const convergenceData = {
  hardware: {
    badge: "DOMAINS // 01 PHYSICAL ENGINEERING",
    title: "Mechanical Precision & Heavy Fabrication",
    desc: "I was trained as a mechanical engineer on the heavy fabrication shop floor. Long before I ever touched an optimization spreadsheet or an algorithm, I learned engineering with molten weld pools, ASME Section VIII pressure vessel codes, and heavy steel tolerances. I understand physical yield strengths, thermal distortion, and manufacturing bottlenecks before I touch a model.",
    stats: [
      { val: "ASME VIII", lbl: "Pressure Vessel Code" },
      { val: "20%", lbl: "Weld Defect Lift" },
      { val: "5S / Kaizen", lbl: "Shop Floor Method" }
    ],
    tools: ["SolidWorks", "ANSYS FEA", "Robotic Welding", "Computer Vision", "ASME Section VIII", "GD&T", "CNC Machining"]
  },
  supplychain: {
    badge: "DOMAINS // 02 SUPPLY CHAIN & LOGISTICS",
    title: "Omnichannel Velocity & Inventory Orchestration",
    desc: "I architect resilient multi-echelon supply networks and high-throughput distribution facilities. I re-engineered fulfillment operations from the floor geometry to the dispatch dock, deploying ABC velocity slotting, dynamic safety stock formulas, and supplier risk models that eliminated kilometers of wasted transit every single shift.",
    stats: [
      { val: "3.3 km", lbl: "Transit Saved / Shift" },
      { val: ">98%", lbl: "Inventory Accuracy" },
      { val: "15%", lbl: "Pick Cycle Reduction" }
    ],
    tools: ["Warehouse Slotting", "Safety Stock Modeling", "EOQ / ROP Analytics", "SAP / Oracle ERP", "Tableau SCM", "Kanban Buffers", "BOM Optimization"]
  },
  ai: {
    badge: "DOMAINS // 03 AUTONOMOUS AI & DECISION SYSTEMS",
    title: "Deterministic AI Systems & Autonomous Workflows",
    desc: "I design production AI agents that bridge unstructured physical reality with deterministic mathematical execution. I built my proprietary 0.38pt AST geometric layout compactor, MCP multi-tier supplier intelligence crawlers, and real-time computer vision defect pipelines with zero tolerance for failure.",
    stats: [
      { val: "0.38pt", lbl: "Deterministic AST Fit" },
      { val: "45m -> 8s", lbl: "ATS Processing Speed" },
      { val: "100%", lbl: "Deterministic Format" }
    ],
    tools: ["Claude 3.5 Sonnet", "Anthropic MCP", "Vector RAG", "Python / FastAPI", "OpenCV Vision", "AST Parsing", "Autonomous Agents"]
  },
  business: {
    badge: "DOMAINS // 04 STRATEGIC SOURCING & BUSINESS",
    title: "Should-Cost Modeling & Capital Allocation",
    desc: "I combine engineering physics with bottom-up should-cost modeling to break supplier monopolies and protect operating margins. At Generac, I dismantled microinverter BOM economics down to raw silicon, freight tariffs, and supplier yield rates, unlocking six-figure margin expansion in high-inflation environments.",
    stats: [
      { val: "$1.2M", lbl: "Sourcing Capital Analyzed" },
      { val: "12%", lbl: "Target Margin Expansion" },
      { val: "3-Tier", lbl: "Supply Risk Mapping" }
    ],
    tools: ["Should-Cost Engineering", "BOM Teardowns", "Supplier Negotiation", "TCO Analysis", "Tariff Optimization", "NPV / DCF Modeling", "Contract SLA Audits"]
  }
};

function initConvergenceTabs() {
  const tabs     = document.querySelectorAll('.pillar-tab');
  const badgeEl  = document.getElementById('display-badge');
  const titleEl  = document.getElementById('display-title');
  const descEl   = document.getElementById('display-desc');
  const statsEl  = document.getElementById('display-stats');
  const toolsEl  = document.getElementById('display-tools');
  const displayContainer = document.getElementById('convergence-display');

  if (!tabs.length || !badgeEl) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      const key  = tab.getAttribute('data-pillar');
      const data = convergenceData[key];
      if (!data) return;

      if (displayContainer) {
        displayContainer.style.opacity = '0.35';
        displayContainer.style.transform = 'translateY(3px)';
        displayContainer.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
      }

      setTimeout(() => {
        badgeEl.textContent = data.badge;
        titleEl.textContent = data.title;
        descEl.textContent  = data.desc;

        statsEl.innerHTML = data.stats.map((s) => `
          <div class="d-stat-box">
            <span class="d-stat-val">${s.val}</span>
            <span class="d-stat-lbl">${s.lbl}</span>
          </div>
        `).join('');

        toolsEl.innerHTML = data.tools.map((t) =>
          `<span class="tech-pill">${t}</span>`
        ).join('');

        if (displayContainer) {
          displayContainer.style.opacity = '1';
          displayContainer.style.transform = 'translateY(0)';
        }
      }, 120);
    });
  });
}

// ==========================================================================
// 7. OPERATING SYSTEM STEPPER
// ==========================================================================
const osStages = [
  {
    badge: 'PHASE 01 // PROBLEM DEFINITION',
    title: 'Embrace the Raw Ambiguity',
    narrative: 'Real-world operations rarely arrive with a clean problem statement. When lead times inflate or components vanish, I refuse to accept superficial explanations. My first step is stripping away the emotional noise to isolate the underlying mathematical dilemma.',
    checklist: 'What is the symptom versus the root cause? Who is impacted downstream? What unverified assumptions are clouding our judgment?',
    example: 'At Generac, sudden RFQ price spikes on microinverter BOMs were blamed on market scarcity. I dug into the bottom-up cost breakdown and proved the quotes were distorted by unverified should-cost models.'
  },
  {
    badge: 'PHASE 02 // SYSTEM DECONSTRUCTION',
    title: 'Map the Full System Dynamics',
    narrative: 'No component exists in isolation. Before I touch a single process, I map the full system dynamics: tracing material, capital, and latency across upstream suppliers, internal work queues, and final handoffs.',
    checklist: 'Where are buffers accumulating? Which feedback loops govern cycle time? Where does information stall between physical operations and digital databases?',
    example: 'Inside the USC distribution center, I mapped every picker\'s physical transit path. I discovered that 65% of daily walking transit was wasted retrieving just 15% of high-demand SKUs.'
  },
  {
    badge: 'PHASE 03 // CONSTRAINT IDENTIFICATION',
    title: 'Pinpoint the True Bottleneck',
    narrative: 'Goldratt\'s Law: every system has exactly one constraint that dictates total throughput. If you optimize anything other than the true bottleneck, you create the illusion of progress while net output remains flat. I find the bottleneck and break it.',
    checklist: 'Which specific machine, station, or supplier caps our flow rate? Is the constraint physical capacity, material scarcity, or information latency?',
    example: 'At Larsen & Toubro, post-weld NDT radiography was the hidden constraint halting robotic welding cells for up to 3 days. I bypassed it by engineering real-time optical pass-one inspection.'
  },
  {
    badge: 'PHASE 04 // DATA ANALYTICS',
    title: 'Ground Truth in Hard Metrics',
    narrative: 'Intuition is a hypothesis; only empirical telemetry is ground truth. I don\'t argue with opinions. I instrument the process, capture timestamped cycle telemetry, scrap percentages, and standard deviations.',
    checklist: 'What is the statistical variance across shifts? Where are defects clustering geometrically? What is the standard deviation of vendor fulfillment?',
    example: 'I analyzed thousands of weld joint profilometry scans, categorizing porosity versus undercut signatures before training our convolutional vision networks.'
  },
  {
    badge: 'PHASE 05 // SOLUTION DESIGN',
    title: 'Architect Deterministic Fixes',
    narrative: 'I design solutions that eliminate the failure mode permanently. I do not build systems that depend on human willpower or temporary overtime. I engineer fail-safe physical layouts and deterministic algorithmic checks.',
    checklist: 'Can the solution be automated? Is it fail-safe (Poka-Yoke)? How does the architecture respond when an edge-case disruption occurs?',
    example: 'I engineered my 0.38pt AST iterative compactor to deterministically guarantee 1-page document fit regardless of text length variation.'
  },
  {
    badge: 'PHASE 06 // EXECUTION',
    title: 'Deploy Without Disruption',
    narrative: 'A brilliant architecture executed poorly is worthless. When I deploy, I roll out changes incrementally in live staging environments or pilot production cells with fail-safe rollback thresholds.',
    checklist: 'Are line operators aligned with the new SOP? Are rollback triggers automated? Am I monitoring live telemetry during the cutover?',
    example: 'I piloted my optical vision model on a single 6-axis welding arm first, tuning arc filter thresholds under live heat before rolling it out across the defense bay.'
  },
  {
    badge: 'PHASE 07 // MEASUREMENT',
    title: 'Quantify Variance & Cost Lift',
    narrative: 'I hold my work accountable to hard numbers. I compare post-implementation telemetry directly against baseline historical controls, auditing for secondary friction or downstream consequences.',
    checklist: 'Did net throughput accelerate? Did scrap rates drop? Did inventory accuracy sustain through month-end cycle counts?',
    example: 'I verified >98% inventory accuracy and confirmed a 15% pick cycle time reduction sustained over consecutive quarters at the USC facility.'
  },
  {
    badge: 'PHASE 08 // KAIZEN :  CONTINUOUS IMPROVEMENT',
    title: 'Lock the Gains. Iterate.',
    narrative: 'Operational excellence is not a finished state; it is an unyielding loop. Once a gain is locked, I document the SOP, retrain the models, and identify the next emerging constraint.',
    checklist: 'Have standard operating procedures been institutionalized? What trigger starts the next optimization cycle? How can this architecture scale to other business units?',
    example: 'At Banco Products, I institutionalized visual 5S controls to sustain a 12% operational cost reduction year over year.'
  }
];


// ==========================================================================
// OPERATIONAL BLUEPRINT SCHEMATIC RENDERER (Section 05 Graphics Engine)
// ==========================================================================
function getStageBlueprintSvg(idx) {
  const blueprints = [
    // Phase 01: Ishikawa Root-Cause Entropy Decomposition
    `<svg class="blueprint-svg" viewBox="0 0 700 220" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="p1-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.2"/>
          <stop offset="100%" stop-color="#fbbf24" stop-opacity="0.8"/>
        </linearGradient>
      </defs>
      <!-- Grid pattern -->
      <line x1="0" y1="55" x2="700" y2="55" class="blueprint-grid-line" />
      <line x1="0" y1="110" x2="700" y2="110" class="blueprint-grid-line" />
      <line x1="0" y1="165" x2="700" y2="165" class="blueprint-grid-line" />
      
      <!-- Central Spine -->
      <line x1="80" y1="110" x2="520" y2="110" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" />
      <polygon points="530,110 515,103 515,117" fill="#38bdf8" />
      
      <!-- Branch 1: Supplier Volatility -->
      <line x1="140" y1="40" x2="220" y2="110" stroke="#38bdf8" stroke-width="2" stroke-dasharray="3,3" />
      <circle cx="140" cy="40" r="4" fill="#38bdf8" />
      <text x="140" y="30" class="blueprint-text-title">Lead Time Noise</text>
      <text x="140" y="20" class="blueprint-text-sub">VARIANCE: +/- 18%</text>

      <!-- Branch 2: Should-Cost Assumptions -->
      <line x1="280" y1="40" x2="360" y2="110" stroke="#fbbf24" stroke-width="2.5" />
      <circle cx="280" cy="40" r="5" fill="#fbbf24" />
      <text x="280" y="30" class="blueprint-text-title" fill="#fbbf24">Unverified RFQ Quotes</text>
      <text x="280" y="20" class="blueprint-text-sub">ROOT CAUSE IDENTIFIED</text>

      <!-- Branch 3: Inventory Buffers -->
      <line x1="180" y1="180" x2="260" y2="110" stroke="#38bdf8" stroke-width="2" stroke-dasharray="3,3" />
      <circle cx="180" cy="180" r="4" fill="#38bdf8" />
      <text x="180" y="195" class="blueprint-text-title">Safety Stock Creep</text>
      <text x="180" y="208" class="blueprint-text-sub">+24% HOLDING FRICTION</text>

      <!-- Branch 4: BOM Spec Ambiguity -->
      <line x1="320" y1="180" x2="400" y2="110" stroke="#fbbf24" stroke-width="2.5" />
      <circle cx="320" cy="180" r="5" fill="#fbbf24" />
      <text x="320" y="195" class="blueprint-text-title" fill="#fbbf24">Under-specified BOM</text>
      <text x="320" y="208" class="blueprint-text-sub">TOLERANCE OVER-SPEC</text>

      <!-- Outcome Node: Problem Pinpointed -->
      <rect x="540" y="80" width="145" height="60" class="blueprint-node-box highlight" />
      <text x="612" y="105" class="blueprint-text-title" fill="#fbbf24">TRUE ROOT CAUSE</text>
      <text x="612" y="125" class="blueprint-text-sub">BOM Cost Model Misalignment</text>
    </svg>`,

    // Phase 02: Multi-Echelon Topology Graph
    `<svg class="blueprint-svg" viewBox="0 0 700 220" xmlns="http://www.w3.org/2000/svg">
      <!-- Wires -->
      <line x1="90" y1="110" x2="220" y2="70" class="blueprint-wire" />
      <line x1="90" y1="110" x2="220" y2="150" class="blueprint-wire" />
      <line x1="340" y1="70" x2="470" y2="110" class="blueprint-wire" />
      <line x1="340" y1="150" x2="470" y2="110" class="blueprint-wire" />
      <line x1="570" y1="110" x2="650" y2="110" class="blueprint-wire" />

      <!-- Tier 1 Suppliers -->
      <rect x="20" y="80" width="100" height="60" class="blueprint-node-box" />
      <text x="70" y="105" class="blueprint-text-title">Tier-1 Suppliers</text>
      <text x="70" y="123" class="blueprint-metric-badge">20+ AUDITED</text>

      <!-- Inbound Buffers -->
      <rect x="220" y="40" width="120" height="60" class="blueprint-node-box" />
      <text x="280" y="65" class="blueprint-text-title">Inbound Staging</text>
      <text x="280" y="83" class="blueprint-text-sub">Takt: 4.2 min</text>

      <rect x="220" y="120" width="120" height="60" class="blueprint-node-box" />
      <text x="280" y="145" class="blueprint-text-title">WIP Storage</text>
      <text x="280" y="163" class="blueprint-text-sub">Turnover: 18.4x</text>

      <!-- USC Central Fulfillment -->
      <rect x="450" y="75" width="130" height="70" class="blueprint-node-box highlight" />
      <text x="515" y="103" class="blueprint-text-title" fill="#38bdf8">High-Velocity Hub</text>
      <text x="515" y="121" class="blueprint-metric-badge">VELOCITY: 98%</text>

      <!-- Final Dispatch -->
      <circle cx="660" cy="110" r="24" fill="rgba(56, 189, 248, 0.2)" stroke="#38bdf8" stroke-width="2" />
      <text x="660" y="114" class="blueprint-metric-badge">OUT</text>
    </svg>`,

    // Phase 03: Goldratt Constraint Queue Bottleneck
    `<svg class="blueprint-svg" viewBox="0 0 700 220" xmlns="http://www.w3.org/2000/svg">
      <!-- Stations Flow -->
      <rect x="30" y="80" width="120" height="60" class="blueprint-node-box" />
      <text x="90" y="105" class="blueprint-text-title">Machining Cell</text>
      <text x="90" y="124" class="blueprint-text-sub">Capacity: 120 u/h</text>

      <line x1="150" y1="110" x2="230" y2="110" class="blueprint-wire" />

      <!-- Constraint Bottleneck Node -->
      <rect x="230" y="65" width="170" height="90" class="blueprint-node-box highlight" />
      <text x="315" y="93" class="blueprint-text-title" fill="#fbbf24">CRITICAL CONSTRAINT</text>
      <text x="315" y="112" class="blueprint-text-sub">NDT Laser Profilometry</text>
      <text x="315" y="132" class="blueprint-metric-badge" fill="#fbbf24">MAX FLOW: 45 u/h (CHOKE)</text>

      <line x1="400" y1="110" x2="480" y2="110" class="blueprint-wire" />

      <!-- Downstream Assembly -->
      <rect x="480" y="80" width="120" height="60" class="blueprint-node-box" />
      <text x="540" y="105" class="blueprint-text-title">Robotic Welding</text>
      <text x="540" y="124" class="blueprint-text-sub">Capacity: 110 u/h</text>

      <!-- Queue Telemetry Box -->
      <rect x="620" y="70" width="60" height="80" fill="rgba(239, 68, 68, 0.15)" stroke="#ef4444" stroke-width="1.5" rx="4" />
      <text x="650" y="95" class="blueprint-text-sub" fill="#ef4444">QUEUE</text>
      <text x="650" y="118" class="blueprint-text-title" fill="#ef4444">+3d</text>
      <text x="650" y="135" class="blueprint-text-sub">DELAY</text>
    </svg>`,

    // Phase 04: Six Sigma Gaussian Distribution
    `<svg class="blueprint-svg" viewBox="0 0 700 220" xmlns="http://www.w3.org/2000/svg">
      <!-- Axis -->
      <line x1="60" y1="180" x2="640" y2="180" stroke="#38bdf8" stroke-width="2" />
      
      <!-- Bell curve -->
      <path d="M 80 178 Q 250 175 300 130 T 350 40 T 400 130 T 620 178" fill="none" stroke="#38bdf8" stroke-width="3" />
      <path d="M 80 178 Q 250 175 300 130 T 350 40 T 400 130 T 620 178 Z" fill="rgba(56, 189, 248, 0.12)" />

      <!-- Mean Line (μ) -->
      <line x1="350" y1="35" x2="350" y2="180" stroke="#fbbf24" stroke-width="2" stroke-dasharray="4,4" />
      <text x="350" y="25" class="blueprint-metric-badge" fill="#fbbf24">MEAN (Target)</text>

      <!-- -3 Sigma (LSL) -->
      <line x1="210" y1="60" x2="210" y2="180" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="2,2" />
      <text x="210" y="52" class="blueprint-text-sub" fill="#ef4444">LSL (-3 Sigma)</text>

      <!-- +3 Sigma (USL) -->
      <line x1="490" y1="60" x2="490" y2="180" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="2,2" />
      <text x="490" y="52" class="blueprint-text-sub" fill="#ef4444">USL (+3 Sigma)</text>

      <!-- Stats Legend -->
      <rect x="520" y="20" width="160" height="50" class="blueprint-node-box" />
      <text x="600" y="40" class="blueprint-text-title">Cp = 1.67 | Cpk = 1.54</text>
      <text x="600" y="58" class="blueprint-metric-badge">4.8 SIGMA CAPABILITY</text>
    </svg>`,

    // Phase 05: Poka-Yoke State Machine & AST Logic Gate
    `<svg class="blueprint-svg" viewBox="0 0 700 220" xmlns="http://www.w3.org/2000/svg">
      <!-- Input -->
      <rect x="30" y="80" width="110" height="60" class="blueprint-node-box" />
      <text x="85" y="105" class="blueprint-text-title">Raw Content</text>
      <text x="85" y="123" class="blueprint-text-sub">Height Overflow</text>

      <line x1="140" y1="110" x2="220" y2="110" class="blueprint-wire" />

      <!-- Logic Gate Comparator -->
      <polygon points="250,70 330,110 250,150 170,110" fill="rgba(56, 189, 248, 0.2)" stroke="#38bdf8" stroke-width="2" />
      <text x="250" y="107" class="blueprint-text-title">AST Compactor</text>
      <text x="250" y="121" class="blueprint-text-sub">H &lt; 792pt ?</text>

      <!-- False branch -> Iterate -->
      <path d="M 250 70 L 250 30 L 400 30 L 400 90" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="3,3" />
      <text x="325" y="22" class="blueprint-text-sub" fill="#ef4444">NO : Decr 0.38pt</text>

      <!-- True branch -> Pass -->
      <line x1="330" y1="110" x2="440" y2="110" stroke="#10b981" stroke-width="2.5" />
      <text x="385" y="100" class="blueprint-text-sub" fill="#10b981">YES (Pass)</text>

      <!-- Fail-Safe Output -->
      <rect x="440" y="75" width="220" height="70" class="blueprint-node-box highlight" />
      <text x="550" y="103" class="blueprint-text-title" fill="#10b981">POKA-YOKE COMPACTED</text>
      <text x="550" y="124" class="blueprint-metric-badge">EXACTLY 1 PAGE // 0 OVERFLOW</text>
    </svg>`,

    // Phase 06: Phased Canary Deployment Pipeline
    `<svg class="blueprint-svg" viewBox="0 0 700 220" xmlns="http://www.w3.org/2000/svg">
      <!-- Stage 1 -->
      <circle cx="100" cy="110" r="35" class="blueprint-node-box" />
      <text x="100" y="106" class="blueprint-text-title">Digital Twin</text>
      <text x="100" y="122" class="blueprint-text-sub">SIMULATION</text>
      <text x="100" y="136" class="blueprint-metric-badge">PASS</text>

      <line x1="135" y1="110" x2="245" y2="110" class="blueprint-wire" />

      <!-- Stage 2 (Canary) -->
      <circle cx="280" cy="110" r="35" class="blueprint-node-box highlight" />
      <text x="280" y="106" class="blueprint-text-title" fill="#fbbf24">Canary Pilot</text>
      <text x="280" y="122" class="blueprint-text-sub">10% LOAD</text>
      <text x="280" y="136" class="blueprint-metric-badge" fill="#fbbf24">VERIFIED</text>

      <line x1="315" y1="110" x2="425" y2="110" class="blueprint-wire" />

      <!-- Stage 3 (Global) -->
      <circle cx="460" cy="110" r="35" class="blueprint-node-box" />
      <text x="460" y="106" class="blueprint-text-title">Global Fleet</text>
      <text x="460" y="122" class="blueprint-text-sub">100% SCALE</text>
      <text x="460" y="136" class="blueprint-metric-badge">ACTIVE</text>

      <!-- Rollback Guard -->
      <rect x="540" y="70" width="130" height="80" fill="rgba(16, 185, 129, 0.12)" stroke="#10b981" stroke-width="1.5" rx="6" />
      <text x="605" y="98" class="blueprint-text-title" fill="#10b981">ROLLBACK GUARD</text>
      <text x="605" y="118" class="blueprint-text-sub">Threshold: &gt;0.5% var</text>
      <text x="605" y="136" class="blueprint-metric-badge" fill="#10b981">0 INCIDENTS</text>
    </svg>`,

    // Phase 07: Empirical Baseline vs Post-Deployment Telemetry
    `<svg class="blueprint-svg" viewBox="0 0 700 220" xmlns="http://www.w3.org/2000/svg">
      <!-- Metric 1: Cycle Time -->
      <rect x="50" y="140" width="40" height="40" fill="rgba(255,255,255,0.2)" />
      <rect x="95" y="100" width="40" height="80" fill="#38bdf8" />
      <text x="92" y="90" class="blueprint-metric-badge">-15%</text>
      <text x="92" y="200" class="blueprint-text-title">Cycle Time</text>

      <!-- Metric 2: Inventory Accuracy -->
      <rect x="250" y="120" width="40" height="60" fill="rgba(255,255,255,0.2)" />
      <rect x="295" y="60" width="40" height="120" fill="#10b981" />
      <text x="292" y="50" class="blueprint-metric-badge">+98.4%</text>
      <text x="292" y="200" class="blueprint-text-title">Audit Accuracy</text>

      <!-- Metric 3: Scrap Cost Reduction -->
      <rect x="450" y="130" width="40" height="50" fill="rgba(255,255,255,0.2)" />
      <rect x="495" y="85" width="40" height="95" fill="#fbbf24" />
      <text x="492" y="75" class="blueprint-metric-badge">-22%</text>
      <text x="492" y="200" class="blueprint-text-title">Scrap Rate</text>

      <!-- Legend -->
      <rect x="580" y="30" width="100" height="50" class="blueprint-node-box" />
      <text x="630" y="48" class="blueprint-text-sub">White: Baseline</text>
      <text x="630" y="66" class="blueprint-metric-badge">Color: Post-Lift</text>
    </svg>`,

    // Phase 08: Closed-Loop Kaizen Feedback Loop
    `<svg class="blueprint-svg" viewBox="0 0 700 220" xmlns="http://www.w3.org/2000/svg">
      <!-- Spiral/Circle path -->
      <circle cx="350" cy="110" r="75" fill="none" stroke="rgba(56, 189, 248, 0.3)" stroke-width="2" stroke-dasharray="6,6" />
      
      <!-- 4 Loop Nodes -->
      <circle cx="350" cy="35" r="24" fill="#0f172a" stroke="#38bdf8" stroke-width="2" />
      <text x="350" y="39" class="blueprint-metric-badge">PLAN</text>

      <circle cx="425" cy="110" r="24" fill="#0f172a" stroke="#10b981" stroke-width="2" />
      <text x="425" y="114" class="blueprint-metric-badge">DO</text>

      <circle cx="350" cy="185" r="24" fill="#0f172a" stroke="#fbbf24" stroke-width="2" />
      <text x="350" y="189" class="blueprint-metric-badge">CHECK</text>

      <circle cx="275" cy="110" r="24" fill="#0f172a" stroke="#a855f7" stroke-width="2" />
      <text x="275" y="114" class="blueprint-metric-badge">ACT</text>

      <!-- Center Telemetry Node -->
      <circle cx="350" cy="110" r="32" fill="rgba(56, 189, 248, 0.15)" stroke="#38bdf8" stroke-width="2" />
      <text x="350" y="108" class="blueprint-text-title" fill="#38bdf8">KAIZEN</text>
      <text x="350" y="122" class="blueprint-text-sub">LOCKED</text>

      <text x="120" y="110" class="blueprint-text-title">Continuous Feedback</text>
      <text x="120" y="128" class="blueprint-text-sub">Real-Time Telemetry</text>

      <text x="580" y="110" class="blueprint-text-title">Digital SOPs</text>
      <text x="580" y="128" class="blueprint-text-sub">Version v4.2 Enforced</text>
    </svg>`
  ];

  return blueprints[idx] || blueprints[0];
}

function initOperatingSystemStepper() {
  const stepBtns    = document.querySelectorAll('.os-step-btn');
  const pNodes      = document.querySelectorAll('.p-node');
  const badgeEl     = document.getElementById('os-card-badge');
  const titleEl     = document.getElementById('os-card-title');
  const narrativeEl = document.getElementById('os-card-narrative');
  const checklistEl = document.getElementById('os-checklist');
  const exampleEl   = document.getElementById('os-example');
  const diagramEl   = document.getElementById('os-stage-diagram');
  const activeNumEl = document.getElementById('pipeline-active-num');
  const prevBtn     = document.getElementById('os-prev-btn');
  const nextBtn     = document.getElementById('os-next-btn');
  const autoBtn     = document.getElementById('os-auto-btn');

  if (!stepBtns.length || !badgeEl) return;

  let currentIdx = 0;
  let autoTimer = null;

  function renderStage(idx) {
    if (idx < 0) idx = osStages.length - 1;
    if (idx >= osStages.length) idx = 0;
    currentIdx = idx;

    // Update left stepper buttons
    stepBtns.forEach((b) => {
      const bIdx = parseInt(b.getAttribute('data-step'), 10);
      b.classList.toggle('active', bIdx === currentIdx);
    });

    // Update top pipeline nodes
    pNodes.forEach((node) => {
      const nIdx = parseInt(node.getAttribute('data-step'), 10);
      node.classList.toggle('active', nIdx === currentIdx);
    });

    const stage = osStages[currentIdx];
    if (!stage) return;

    badgeEl.textContent     = stage.badge;
    titleEl.textContent     = stage.title;
    narrativeEl.textContent = stage.narrative;
    checklistEl.textContent = stage.checklist;
    exampleEl.textContent   = stage.example;

    if (activeNumEl) {
      activeNumEl.textContent = String(currentIdx + 1).padStart(2, '0');
    }

    // Render dynamic SVG blueprint schematic
    if (diagramEl) {
      diagramEl.innerHTML = getStageBlueprintSvg(currentIdx);
    }
  }

  // Bind left buttons
  stepBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      stopAutoLoop();
      const idx = parseInt(btn.getAttribute('data-step'), 10);
      renderStage(idx);
    });
  });

  // Bind top pipeline nodes
  pNodes.forEach((node) => {
    node.addEventListener('click', () => {
      stopAutoLoop();
      const idx = parseInt(node.getAttribute('data-step'), 10);
      renderStage(idx);
    });
  });

  // Prev / Next controls
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      stopAutoLoop();
      renderStage(currentIdx - 1);
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      stopAutoLoop();
      renderStage(currentIdx + 1);
    });
  }

  function startAutoLoop() {
    if (autoBtn) autoBtn.classList.add('active');
    autoTimer = setInterval(() => {
      renderStage(currentIdx + 1);
    }, 4500);
  }

  function stopAutoLoop() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
    if (autoBtn) autoBtn.classList.remove('active');
  }

  if (autoBtn) {
    autoBtn.addEventListener('click', () => {
      if (autoTimer) {
        stopAutoLoop();
      } else {
        startAutoLoop();
      }
    });
  }

  // Initial stage render
  renderStage(0);
}

// ==========================================================================
// 8. SPOTLIGHT HOVER EFFECT (Huly signature :  light follows cursor inside card)
// ==========================================================================
function initSpotlightCards() {
  document.querySelectorAll('.spotlight-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
      card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    });
    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--mouse-x', '-999px');
      card.style.setProperty('--mouse-y', '-999px');
    });
  });
}

// ==========================================================================
// 9. CONFIDENTIAL DOSSIER GATE
// ==========================================================================
function initConfidentialDossier() {
  const btn   = document.getElementById('submit-dossier-btn');
  const alertEl = document.getElementById('dossier-alert');
  if (!btn) return;

  // Anti-XSS Sanitizer
  function sanitizeInput(str) {
    const rx = new RegExp('[<>&"\\\']', 'g');
    return str.replace(rx, (m) => {
      const map = { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#x27;' };
      return map[m] || m;
    });
  }

  btn.addEventListener('click', (e) => {
    e.preventDefault();

    // 1. Anti-Bot Cyber Trap (Honeypot)
    const trap = document.getElementById('hp_security_trap');
    if (trap && trap.value) {
      console.warn('[SECURITY] Bot trap triggered. Request discarded.');
      return;
    }

    // 2. Client-Side Rate Limiting (CrowdStrike / OWASP flood defense)
    const now = Date.now();
    const lastSub = parseInt(localStorage.getItem('_dossier_last_sub') || '0', 10);
    if (now - lastSub < 45000) {
      if (alertEl) {
        alertEl.textContent = 'Security limit: please wait 45s before submitting another request.';
        alertEl.classList.remove('hidden');
        alertEl.style.color = '#fbbf24';
      }
      return;
    }

    const name    = (document.getElementById('talent-name')?.value || '').trim();
    const company = (document.getElementById('talent-company')?.value || '').trim();
    const email   = (document.getElementById('talent-email')?.value || '').trim();

    // 3. Strict Email Regex Validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!name || !company || !email) {
      if (alertEl) {
        alertEl.textContent = 'Please provide your full name, organization, and corporate email.';
        alertEl.classList.remove('hidden');
        alertEl.style.color = '#ef4444';
      }
      return;
    }

    if (!emailRegex.test(email)) {
      if (alertEl) {
        alertEl.textContent = 'Please enter a valid corporate email format.';
        alertEl.classList.remove('hidden');
        alertEl.style.color = '#ef4444';
      }
      return;
    }

    localStorage.setItem('_dossier_last_sub', String(now));

    if (alertEl) {
      alertEl.textContent = 'Dispatch confirmed. Dossier dispatching to ' + sanitizeInput(email) + '...';
      alertEl.classList.remove('hidden');
      alertEl.style.color = '#10b981';
    }

    const safeName    = encodeURIComponent(name.slice(0, 100));
    const safeCompany = encodeURIComponent(company.slice(0, 100));
    const safeEmail   = encodeURIComponent(email.slice(0, 100));

    const mailto = `mailto:harshnil@usc.edu?subject=Verified%20SCM%20Dossier%20Request%20-%20${safeName}%20(${safeCompany})&body=Hello%20Harsh,%0A%0AWe%20are%20requesting%20your%20confidential%20operations%20dossier%20for%20${safeCompany}.%0A%0AName:%20${safeName}%0AOrganization:%20${safeCompany}%0AEmail:%20${safeEmail}%0A%0ABest%20regards,`;

    setTimeout(() => { window.location.href = mailto; }, 900);
  });
}

// ==========================================================================
// 10. SCROLL SPY NAVIGATION
// ==========================================================================
function initScrollSpy() {
  const sections = document.querySelectorAll('section');
  const navItems = document.querySelectorAll('.nav-item');

  window.addEventListener('scroll', () => {
    let current = 'hero';
    const scrollPos = window.scrollY + window.innerHeight * 0.35;

    sections.forEach((sec) => {
      if (scrollPos >= sec.offsetTop && scrollPos < sec.offsetTop + sec.offsetHeight) {
        current = sec.getAttribute('id');
      }
    });

    navItems.forEach((item) => {
      item.classList.toggle('active', item.getAttribute('data-nav') === current);
    });
  });
}

// ==========================================================================
// 11. SCROLL REVEAL (Elements fade up as they enter viewport)
// ==========================================================================
function initScrollReveal() {
  const targets = document.querySelectorAll(
    '.section-header, .exp-bento-card, .deep-dive-card, .sport-bento-card, .pillar-tab, .bento-metric-card'
  );

  targets.forEach((el) => el.classList.add('reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  targets.forEach((el) => observer.observe(el));
}

// ==========================================================================
// 12. AMBIENT GLOW COLOR SHIFTS BY SECTION
//     Glow colors subtly shift per section to reinforce each cinematic scene
// ==========================================================================
function initGlowShift() {
  const sectionGlows = {
    hero:        { g1: '#4f46e5', g2: '#00d4ff', opacity: 0.2 },
    convergence: { g1: '#00d4ff', g2: '#27ae60', opacity: 0.15 },
    experience:  { g1: '#27ae60', g2: '#f0a500', opacity: 0.15 },
    projects:    { g1: '#00ff41', g2: '#4f46e5', opacity: 0.18 },
    os:          { g1: '#f0a500', g2: '#9b59b6', opacity: 0.15 },
    drive:       { g1: '#9b59b6', g2: '#00d4ff', opacity: 0.2 },
    dossier:     { g1: '#00d4ff', g2: '#4f46e5', opacity: 0.15 }
  };

  const glow1 = document.getElementById('glow-1');
  const glow2 = document.getElementById('glow-2');

  let currentSection = 'hero';

  window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    let newSection = 'hero';

    sections.forEach((sec) => {
      const top = sec.offsetTop - window.innerHeight / 2;
      if (window.scrollY >= top) newSection = sec.getAttribute('id') || 'hero';
    });

    if (newSection !== currentSection) {
      currentSection = newSection;
      const glowConfig = sectionGlows[currentSection] || sectionGlows.hero;

      if (glow1) {
        glow1.style.background = `radial-gradient(circle, ${glowConfig.g1} 0%, transparent 70%)`;
        glow1.style.opacity = glowConfig.opacity;
      }
      if (glow2) {
        glow2.style.background = `radial-gradient(circle, ${glowConfig.g2} 0%, transparent 70%)`;
        glow2.style.opacity = glowConfig.opacity;
      }
    }
  });
}

// ==========================================================================
// 13. BOOT SEQUENCE :  Initialize All Systems
// ==========================================================================
function initAllSystems() {
  // Cipher headline decode
  initCipherHeadline();

  // Huly Molten Lava Background (WebGL)
  initHulyLava();

  // Interactive 3D Supply Chain Digital Twin Console
  initDigitalTwin();

  // Cinematic section canvases
  initWireCanvas();
  initChessCanvas();
  initLabCanvas();
  initPulpCanvas();
  initStellarCanvas();

  // Interactive systems
  initAtsCompactorGraph();
  initWarehouseSlottingVisual();
  initWeldVisionVisual();
  initTerminalSimulator();
  initCyberDefenseShield();
  initConvergenceTabs();
  initOperatingSystemStepper();
  initSpotlightCards();
  initConfidentialDossier();
  initScrollSpy();
  initScrollReveal();
  initGlowShift();

  console.log('[HARSH-PORTFOLIO] All cinematic systems initialized.');
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initAllSystems);
} else {
  initAllSystems();
}
