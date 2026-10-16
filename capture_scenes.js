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

        const scenesToCapture = [
          { name: "scene_00_entrance", chapter: 0, setup: "" },
          { name: "scene_01_generac_exploded", chapter: 1, setup: "window.portfolioEngine.chapterController.scenes.generac.setExplodeProgress(1.0);" },
          { name: "scene_01_generac_drawer", chapter: 1, setup: "document.getElementById('generac-evidence-drawer').classList.remove('hidden');" },
          { name: "scene_02_uscdc", chapter: 2, setup: "document.getElementById('generac-evidence-drawer').classList.add('hidden');" },
          { name: "scene_03_vindeep", chapter: 3, setup: "" },
          { name: "scene_04_lt", chapter: 4, setup: "" },
          { name: "scene_05_banco", chapter: 5, setup: "" },
          { name: "scene_06_projects", chapter: 6, setup: "" },
          { name: "scene_07_education", chapter: 7, setup: "" },
          { name: "scene_08_contact", chapter: 8, setup: "" }
        ];

        let idx = 0;
        let msgIdCounter = 1000;

        function captureNext() {
          if (idx >= scenesToCapture.length) {
            console.log("All scene captures completed!");
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
                const mod = await import('./engine/Engine.js');
                const engine = window.portfolioEngine || new mod.PortfolioSpatialEngine();
                engine.chapterController.goToChapter(${sc.chapter});
                ${sc.setup}
                await new Promise(r => setTimeout(r, 1200)); // Wait for lerp to settle
                return true;
              })()`
            }
          }));

          // Handler for eval response
          const onEvalResp = (m) => {
            const r = JSON.parse(m.data);
            if (r.id === evalId) {
              ws.removeEventListener('message', onEvalResp);
              
              // 2. Request Page Screenshot
              const shotId = ++msgIdCounter;
              ws.send(JSON.stringify({
                id: shotId,
                method: "Page.captureScreenshot",
                params: { format: "png", quality: 100 }
              }));

              const onShotResp = (sm) => {
                const sr = JSON.parse(sm.data);
                if (sr.id === shotId) {
                  ws.removeEventListener('message', onShotResp);
                  const buf = Buffer.from(sr.result.data, 'base64');
                  const outPath = path.join(__dirname, `${sc.name}.png`);
                  fs.writeFileSync(outPath, buf);
                  console.log(`Saved screenshot: ${sc.name}.png (${buf.length} bytes)`);
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
