const http = require('http');
const { spawn } = require('child_process');

async function testFullSuite() {
  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  const edge = spawn(edgePath, [
    "--headless=new",
    "--remote-debugging-port=9225",
    "--window-size=1920,1080",
    "http://localhost:8080"
  ]);

  await new Promise(r => setTimeout(r, 2500));

  http.get("http://localhost:9225/json", (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', async () => {
      const tabs = JSON.parse(data);
      const appTab = tabs.find(t => t.url.includes("localhost:8080"));
      const ws = new WebSocket(appTab.webSocketDebuggerUrl);

      ws.onopen = () => {
        ws.send(JSON.stringify({ id: 1, method: "Runtime.enable" }));

        // Test comprehensive engine operations
        ws.send(JSON.stringify({
          id: 500,
          method: "Runtime.evaluate",
          params: {
            awaitPromise: true,
            expression: `(async () => {
              try {
                const mod = await import('./engine/Engine.js');
                const engine = window.portfolioEngine || new mod.PortfolioSpatialEngine();
                
                // 1. Initial State Check
                const initialChapter = engine.chapterController.currentChapterIndex;
                const hasWebGL = engine.rendererInstance.isWebGLAvailable;
                
                // Wait 1 second to measure actual rendering frames
                const initialFrames = engine.frameCount;
                await new Promise(r => setTimeout(r, 1000));
                const deltaFrames = engine.frameCount - initialFrames;
                const measuredFps = deltaFrames > 0 ? deltaFrames : engine.fps;

                // 2. Functional Check: Entrance Strike
                const entranceScene = engine.chapterController.scenes.entrance;
                entranceScene.startStrike();
                const isStriking = entranceScene.isStriking;

                // 3. Functional Check: Transition to Chapter 1 (Generac)
                engine.chapterController.goToChapter(1);
                const chapter1Active = engine.chapterController.currentChapterIndex === 1;

                // 4. Functional Check: Explode Assembly
                const genScene = engine.chapterController.scenes.generac;
                genScene.toggleExplode();
                const targetExplode = genScene.targetExplodeProgress;

                // 5. Functional Check: Component Sourcing Selection
                genScene.selectComponent('mosfet');
                const drawerOpen = !document.getElementById('generac-evidence-drawer').classList.contains('hidden');
                const hudKicker = document.getElementById('hud-phase-kicker')?.textContent;
                const hudTitle = document.getElementById('hud-phase-title')?.textContent;

                // 6. Functional Check: All 9 Chapters Transition Test
                const chapterResults = [];
                for (let i = 0; i <= 8; i++) {
                  engine.chapterController.goToChapter(i);
                  chapterResults.push({
                    index: i,
                    id: engine.chapterController.chapterDefs[i].id,
                    title: engine.chapterController.chapterDefs[i].title,
                    cameraTargetZ: engine.cameraRig.targetPosition.z
                  });
                }

                // Return back to Entrance
                engine.chapterController.goToChapter(0);

                return {
                  hasWebGL,
                  initialChapter,
                  measuredFps,
                  isStriking,
                  chapter1Active,
                  targetExplode,
                  drawerOpen,
                  hudKicker,
                  hudTitle,
                  chapterResults
                };
              } catch (err) {
                return { error: err.toString(), stack: err.stack };
              }
            })()`,
            returnByValue: true
          }
        }));
      };

      ws.onmessage = (msg) => {
        const res = JSON.parse(msg.data);
        if (res.id === 500) {
          console.log("=== COMPREHENSIVE ENGINE FUNCTIONAL TEST RESULTS ===");
          console.log(JSON.stringify(res.result.result.value, null, 2));
          ws.close();
          edge.kill();
          process.exit(0);
        }
      };
    });
  });
}

testFullSuite();
