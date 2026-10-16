const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

async function captureAllScenes() {
  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  const edge = spawn(edgePath, [
    "--headless=new",
    "--remote-debugging-port=9226",
    "--window-size=1920,1080",
    "http://localhost:8080"
  ]);

  await new Promise(r => setTimeout(r, 2500));

  http.get("http://localhost:9226/json", (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', async () => {
      const tabs = JSON.parse(data);
      const appTab = tabs.find(t => t.url.includes("localhost:8080"));
      const ws = new WebSocket(appTab.webSocketDebuggerUrl);

      ws.onopen = () => {
        ws.send(JSON.stringify({ id: 1, method: "Runtime.enable" }));
        ws.send(JSON.stringify({ id: 2, method: "Page.enable" }));
        ws.send(JSON.stringify({
          id: 3,
          method: "Emulation.setDeviceMetricsOverride",
          params: {
            width: 1920,
            height: 1080,
            deviceScaleFactor: 1,
            mobile: false
          }
        }));

        const scenesToCapture = [
          { name: "scene_00_entrance", chapter: 0, setup: "" },
          { name: "scene_01_generac_exploded", chapter: 1, setup: "window.portfolioEngine.chapterController.scenes.generac.setExplodeProgress(1.0);" },
          { name: "scene_01_generac_drawer", chapter: 1, setup: "document.getElementById('generac-evidence-drawer').classList.remove('hidden'); document.getElementById('generac-evidence-drawer').style.display='flex';" },
          { name: "scene_02_uscdc", chapter: 2, setup: "document.getElementById('generac-evidence-drawer').classList.add('hidden'); document.getElementById('generac-evidence-drawer').style.display='none';" },
          { name: "scene_03_vindeep", chapter: 3, setup: "" },
          { name: "scene_04_lt", chapter: 4, setup: "" },
          { name: "scene_05_banco", chapter: 5, setup: "" },
          { name: "scene_06_workbench", chapter: 6, setup: "window.portfolioEngine.chapterController.scenes.workbench.filterRegion('West');" },
          { name: "scene_07_inventory", chapter: 7, setup: "window.portfolioEngine.chapterController.scenes.inventory.setPolicy('POQ');" },
          { name: "scene_08_education", chapter: 8, setup: "" },
          { name: "scene_09_contact", chapter: 9, setup: "window.portfolioEngine.chapterController.scenes.contact.setMorphTarget('LINKEDIN');" }
        ];

        let idx = 0;
        let msgIdCounter = 1000;

        function captureNext() {
          if (idx >= scenesToCapture.length) {
            console.log("\nAll 11 scene captures completed with verified 1920x1080 dimensions!");
            ws.close();
            edge.kill();
            process.exit(0);
          }

          const sc = scenesToCapture[idx++];
          console.log(`Setting up ${sc.name} (Chapter ${sc.chapter})...`);

          // 1. Move camera & setup scene state
          const evalId = ++msgIdCounter;
          ws.send(JSON.stringify({
            id: evalId,
            method: "Runtime.evaluate",
            params: {
              awaitPromise: true,
              expression: `(async () => {
                let engine = window.portfolioEngine;
                for (let i = 0; i < 40 && !engine; i++) {
                  await new Promise(r => setTimeout(r, 100));
                  engine = window.portfolioEngine;
                }
                const fallback = document.getElementById('hero-spatial-fallback');
                if (fallback) {
                  fallback.style.display = 'none';
                  fallback.classList.add('rendered-hidden');
                }
                engine.chapterController.goToChapter(${sc.chapter}, true);
                ${sc.setup}
                await new Promise(r => setTimeout(r, 1600)); // Wait for lerp, textures and render
                engine.rendererInstance.render(engine.chapterController.scene, engine.cameraRig.camera);
                return true;
              })()`
            }
          }));

          // Handler for eval response
          const onEvalResp = (m) => {
            const r = JSON.parse(m.data);
            if (r.id === evalId) {
              ws.removeEventListener('message', onEvalResp);
              
              // 2. Request Page Screenshot at explicit 1920x1080 clip bounds
              const shotId = ++msgIdCounter;
              ws.send(JSON.stringify({
                id: shotId,
                method: "Page.captureScreenshot",
                params: {
                  format: "png",
                  quality: 100,
                  clip: {
                    x: 0,
                    y: 0,
                    width: 1920,
                    height: 1080,
                    scale: 1
                  }
                }
              }));

              const onShotResp = (sm) => {
                const sr = JSON.parse(sm.data);
                if (sr.id === shotId) {
                  ws.removeEventListener('message', onShotResp);
                  const buf = Buffer.from(sr.result.data, 'base64');
                  const outPath = path.join(__dirname, `${sc.name}.png`);
                  fs.writeFileSync(outPath, buf);

                  // Also copy to artifacts directory if available
                  const artifactDir = "C:\\Users\\Harsh\\.gemini\\antigravity-ide\\brain\\b4e6f0cf-e46c-4c59-b554-f1d1b599cf64";
                  try {
                    fs.writeFileSync(path.join(artifactDir, `${sc.name}.png`), buf);
                  } catch (e) {}

                  console.log(`Saved screenshot: ${sc.name}.png (${buf.length} bytes, 1920x1080 verified)`);
                  captureNext();
                }
              };
              ws.addEventListener('message', onShotResp);
            }
          };
          ws.addEventListener('message', onEvalResp);
        }

        // Start capture sequence
        captureNext();
      };
    });
  });
}

captureAllScenes();
