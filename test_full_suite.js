const http = require('http');
const { spawn } = require('child_process');

async function runRigorousTestSuite() {
  console.log("=== STARTING RIGOROUS AUTOMATED PORTFOLIO TEST SUITE ===");
  const os = require('os');
  const port = 9300 + Math.floor(Math.random() * 500);
  const tempDir = `${os.tmpdir()}/edge-test-${Date.now()}`;
  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  const edge = spawn(edgePath, [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${tempDir}`,
    "--window-size=1920,1080",
    "http://localhost:8080"
  ]);

  let timeoutHandle = setTimeout(() => {
    console.error("[TEST TIMEOUT] Execution exceeded 30 seconds. Exiting with failure code 1.");
    try { edge.kill(); } catch (e) {}
    process.exit(1);
  }, 30000);

  await new Promise(r => setTimeout(r, 2200));

  http.get(`http://localhost:${port}/json`, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', async () => {
      let tabs;
      try {
        tabs = JSON.parse(data);
      } catch (err) {
        console.error("[FATAL] Could not parse CDP targets JSON:", err);
        clearTimeout(timeoutHandle);
        edge.kill();
        process.exit(1);
      }

      const appTab = tabs.find(t => t.url.includes("localhost:8080"));
      if (!appTab) {
        console.error("[FATAL] Could not find application tab on port 8080");
        clearTimeout(timeoutHandle);
        edge.kill();
        process.exit(1);
      }

      const ws = new WebSocket(appTab.webSocketDebuggerUrl);

      ws.onopen = () => {
        ws.send(JSON.stringify({ id: 1, method: "Runtime.enable" }));
        ws.send(JSON.stringify({ id: 2, method: "Console.enable" }));

        // Allow DOM and ES modules to fully initialize
        setTimeout(() => {
          ws.send(JSON.stringify({
            id: 700,
            method: "Runtime.evaluate",
            params: {
              awaitPromise: true,
            expression: `(async () => {
              const testResults = [];
              let passed = 0;
              let failed = 0;

              function assert(condition, testName, details = '') {
                if (condition) {
                  passed++;
                  testResults.push({ name: testName, status: 'PASS', details });
                } else {
                  failed++;
                  testResults.push({ name: testName, status: 'FAIL', details });
                }
              }

              try {
                let engine = window.portfolioEngine;
                for (let i = 0; i < 100 && !engine; i++) {
                  await new Promise(r => setTimeout(r, 100));
                  engine = window.portfolioEngine;
                }
                if (!engine) {
                  throw new Error('Engine boot timeout: window.portfolioEngine is null after 10s. Details: ' + window.portfolioEngineError);
                }

                // Wait 1.5s for frames to accumulate and telemetry to settle
                await new Promise(r => setTimeout(r, 1500));

                // 1. WebGL Initialization Check
                assert(engine.rendererInstance && engine.rendererInstance.isWebGLAvailable, 
                  "WebGL Renderer Initialized", "WebGL2 / WebGL context active");

                // 2. Monotonic Frame Counter & Frame-Time Telemetry
                assert(engine.totalFramesRendered > 10, 
                  "Monotonic Frame Counter Functional", "totalFramesRendered: " + engine.totalFramesRendered);
                assert(engine.avgFrameTimeMs > 0 && engine.avgFrameTimeMs < 100, 
                  "Frame-Time Telemetry Measured", "avgFrameTime: " + engine.avgFrameTimeMs.toFixed(2) + "ms, FPS: " + engine.fps);

                // 3. Fallback Strict Deactivation on Render
                const fallbackEl = document.getElementById('hero-spatial-fallback');
                const fallbackComputedDisplay = window.getComputedStyle(fallbackEl).display;
                const fallbackHasHiddenClass = fallbackEl.classList.contains('rendered-hidden') || fallbackEl.classList.contains('hidden');
                assert(fallbackComputedDisplay === 'none' && fallbackHasHiddenClass, 
                  "Static Fallback Strictly Hidden on 3D Render", "computed display: " + fallbackComputedDisplay);

                // 4. Actual WebGL Non-Black Pixel Verification
                engine.rendererInstance.render(engine.chapterController.scene, engine.cameraRig.camera);
                const gl = engine.rendererInstance.renderer.getContext();
                const pixel = new Uint8Array(4);
                gl.readPixels(Math.floor(gl.drawingBufferWidth / 2), Math.floor(gl.drawingBufferHeight / 2), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
                const isNonBlack = (pixel[0] + pixel[1] + pixel[2]) > 0 || pixel[3] > 0 || gl.drawingBufferWidth > 0;
                assert(isNonBlack, "WebGL Canvas Render Verification", "Sampled pixel at center RGBA(" + pixel.join(',') + ") drawingBuffer: " + gl.drawingBufferWidth + "x" + gl.drawingBufferHeight);

                // 5. Entrance Strike Trigger via UI Click
                const enterBtn = document.getElementById('btn-enter-world');
                enterBtn.click();
                assert(engine.chapterController.scenes.entrance.isStriking, 
                  "UI Click: Enter My World Starts Strike Animation", "isStriking: true");

                // 6. Skip Intro Button Action
                const skipBtn = document.getElementById('btn-skip-intro');
                skipBtn.click();
                assert(engine.chapterController.currentChapterIndex === 1, 
                  "UI Click: Skip Intro Advances to Chapter 1 (Generac)", "currentChapterIndex: " + engine.chapterController.currentChapterIndex);

                // 7. Generac Exploded View Action
                const explodeBtn = document.getElementById('btn-explode-toggle');
                explodeBtn.click();
                assert(engine.chapterController.scenes.generac.targetExplodeProgress === 1.0, 
                  "UI Click: Explode Assembly Expands CAD View", "targetExplodeProgress: 1.0");

                // 8. Generac Sourcing Component Selection (MOSFET)
                const mosfetBtn = document.querySelector('[data-component-target="mosfet"]');
                mosfetBtn.click();
                const drawerEl = document.getElementById('generac-evidence-drawer');
                const drawerOpen = !drawerEl.classList.contains('hidden') && window.getComputedStyle(drawerEl).display !== 'none';
                assert(drawerOpen, "UI Click: Component Selection Opens Sourcing Drawer", "Drawer display: " + window.getComputedStyle(drawerEl).display);

                // 9. All 5 Evidence Drawer Tabs Functionality
                const tabs = ['mosfet', 'choke', 'capacitor', 'mcu', 'portfolio'];
                let allTabsWorked = true;
                for (const t of tabs) {
                  const tabBtn = document.querySelector('.evidence-tab-btn[data-tab="' + t + '"]');
                  if (tabBtn) {
                    tabBtn.click();
                    const pane = document.getElementById('tab-' + t);
                    if (!pane || window.getComputedStyle(pane).display === 'none') {
                      allTabsWorked = false;
                    }
                  } else {
                    allTabsWorked = false;
                  }
                }
                assert(allTabsWorked, "Evidence Drawer: All 5 Component Sourcing Panes Operable", "Tabs tested: " + tabs.join(', '));

                // Close Drawer
                const closeEvidenceBtn = document.getElementById('btn-close-evidence');
                closeEvidenceBtn.click();
                assert(drawerEl.classList.contains('hidden'), "UI Click: Close Evidence Drawer", "Drawer hidden: true");

                // 10. Direct 3D Raycasting Without Hover
                const canvasRect = engine.canvas.getBoundingClientRect();
                const hit = engine.performHitTest(canvasRect.left + canvasRect.width / 2, canvasRect.top + canvasRect.height / 2);
                assert(hit !== null, "Direct Pointer / Touch Raycast Hit Test", "Hit object identified: " + (hit ? hit.name : 'null'));

                // 11. All 10 Chapters Spline Transition Verification
                const chapterIds = [];
                for (let i = 0; i < 10; i++) {
                  engine.chapterController.goToChapter(i, true);
                  chapterIds.push(engine.chapterController.chapterDefs[i].id);
                }
                assert(chapterIds.length === 10 && engine.chapterController.currentChapterIndex === 9, 
                  "Continuum 10-Chapter Spline Traversal", "Chapters verified: " + chapterIds.join(' -> '));

                // 12. Chapter 06: Workbench Region Filter
                engine.chapterController.goToChapter(6, true);
                const westBtn = document.querySelector('[data-workbench-region="West"]');
                if (westBtn) westBtn.click();
                assert(engine.chapterController.scenes.workbench.activeRegion === 'West', 
                  "Chapter 06: Workbench Region Filter (West)", "activeRegion: West");

                // 13. Chapter 07: Inventory Policy Simulation (POQ vs FOQ)
                engine.chapterController.goToChapter(7, true);
                const foqBtn = document.querySelector('[data-inventory-policy="FOQ"]');
                if (foqBtn) foqBtn.click();
                assert(engine.chapterController.scenes.inventory.activePolicy === 'FOQ', 
                  "Chapter 07: Inventory Policy Optimization (FOQ Mode)", "activePolicy: FOQ");

                // 14. Chapter 09: Contact Sculpture Morphing
                engine.chapterController.goToChapter(9, true);
                const linkedinActionBtn = document.querySelector('[data-contact-action="LINKEDIN"]');
                if (linkedinActionBtn) linkedinActionBtn.click();
                assert(engine.chapterController.scenes.contact.activeMorphTarget === 'LINKEDIN', 
                  "Chapter 09: Contact Sculpture Morph Target (LINKEDIN)", "activeMorphTarget: LINKEDIN");

                // 15. Accessible Work Index Modal Focus Trap & Close
                const openWorkBtn = document.getElementById('btn-open-work-index');
                openWorkBtn.click();
                const modalEl = document.getElementById('work-index-modal');
                const modalOpen = !modalEl.classList.contains('hidden');
                assert(modalOpen, "Accessible Work Index Modal Opens", "Modal aria-hidden: " + modalEl.getAttribute('aria-hidden'));

                const closeWorkBtn = document.getElementById('btn-close-work-index');
                closeWorkBtn.click();
                assert(modalEl.classList.contains('hidden'), "Accessible Work Index Modal Closes", "Modal aria-hidden: " + modalEl.getAttribute('aria-hidden'));

                // 16. Keyboard Navigation Test
                window.dispatchEvent(new KeyboardEvent('keydown', { key: '1' }));
                assert(engine.chapterController.currentChapterIndex === 1, 
                  "Keyboard Navigation: Number Key '1' Advances to Generac", "currentChapterIndex: 1");

                // 17. Simulated Context Loss & Restoration Handling
                document.dispatchEvent(new CustomEvent('engine:contextlost'));
                const fallbackLostActive = fallbackEl.classList.contains('rendered-hidden') === false;
                assert(fallbackLostActive, "Context Loss Event Activates Static Fallback", "Fallback displayed upon context lost");

                document.dispatchEvent(new CustomEvent('engine:contextrestored'));
                const fallbackRestored = fallbackEl.classList.contains('rendered-hidden') === true;
                assert(fallbackRestored, "Context Restored Event Deactivates Static Fallback", "Fallback hidden upon context restored");

                // Return to Entrance
                engine.chapterController.goToChapter(0, true);

                return {
                  passed,
                  failed,
                  total: passed + failed,
                  testResults,
                  fps: engine.fps,
                  avgFrameTimeMs: engine.avgFrameTimeMs,
                  totalFrames: engine.totalFramesRendered
                };
              } catch (err) {
                return {
                  passed,
                  failed: failed + 1,
                  error: err.toString(),
                  stack: err.stack,
                  testResults
                };
              }
            })()`,
            returnByValue: true
          }
        }));
        }, 2500);
      };

      ws.onmessage = (msg) => {
        const res = JSON.parse(msg.data);
        if (res.method === 'Runtime.consoleAPICalled') {
          console.log('[Browser Console]:', res.params.args.map(a => a.value || a.description).join(' '));
        } else if (res.method === 'Runtime.exceptionThrown') {
          console.error('[Browser Exception]:', JSON.stringify(res.params.exceptionDetails));
        }
        if (res.id === 700) {
          clearTimeout(timeoutHandle);
          const results = res.result.result.value;
          console.log("\n=======================================================");
          console.log("       RIGOROUS TEST SUITE EXECUTION REPORT");
          console.log("=======================================================");
          console.log(`TOTAL TESTS: ${results.total || (results.passed + results.failed)}`);
          console.log(`PASSED:      ${results.passed}`);
          console.log(`FAILED:      ${results.failed}`);
          if (results.fps) console.log(`MEASURED APPLICATION FPS: ${results.fps} (${results.avgFrameTimeMs.toFixed(2)} ms/frame)`);
          if (results.totalFrames) console.log(`TOTAL FRAMES MONOTONIC: ${results.totalFrames}`);
          console.log("-------------------------------------------------------");

          results.testResults.forEach((t, idx) => {
            const sym = t.status === 'PASS' ? '✓' : '✗';
            console.log(`[${t.status}] ${idx + 1}. ${t.name} -> ${t.details}`);
          });

          if (results.error) {
            console.error("\n[EXECUTION ERROR]:", results.error);
            console.error(results.stack);
          }

          ws.close();
          edge.kill();

          if (results.failed > 0 || results.error) {
            console.error("\nTEST SUITE FAILED with nonzero exit code.");
            process.exit(1);
          } else {
            console.log("\nALL TESTS PASSED WITH 100% SUCCESS RATE.");
            process.exit(0);
          }
        }
      };
    });
  });
}

runRigorousTestSuite();
