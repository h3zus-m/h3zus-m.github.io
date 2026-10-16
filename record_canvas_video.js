const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

async function recordCanvas() {
  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  const edge = spawn(edgePath, [
    "--headless=new",
    "--remote-debugging-port=9230",
    "--window-size=1920,1080",
    "http://localhost:8080"
  ]);

  console.log("Launched Edge for full 10-chapter real-time video recording...");
  await new Promise(r => setTimeout(r, 2500));

  http.get("http://localhost:9230/json", (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', async () => {
      const tabs = JSON.parse(data);
      const appTab = tabs.find(t => t.url.includes("localhost:8080"));
      const ws = new WebSocket(appTab.webSocketDebuggerUrl);

      ws.onopen = () => {
        ws.send(JSON.stringify({ id: 1, method: "Runtime.enable" }));
        ws.send(JSON.stringify({
          id: 2,
          method: "Emulation.setDeviceMetricsOverride",
          params: { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false }
        }));

        console.log("Starting canvas MediaRecorder for entrance strike and full continuum walkthrough...");
        ws.send(JSON.stringify({
          id: 50,
          method: "Runtime.evaluate",
          params: {
            awaitPromise: true,
            expression: `(async () => {
              let engine = window.portfolioEngine;
              for (let i = 0; i < 40 && !engine; i++) {
                await new Promise(r => setTimeout(r, 100));
                engine = window.portfolioEngine;
              }
              const canvas = document.getElementById('hero-3d-canvas');
              
              if (!canvas || !canvas.captureStream) {
                return { error: "captureStream not supported" };
              }

              const stream = canvas.captureStream(30);
              const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
              const chunks = [];

              recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
              };

              const recordingPromise = new Promise((resolve) => {
                recorder.onstop = async () => {
                  const blob = new Blob(chunks, { type: 'video/webm' });
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    resolve(reader.result.split(',')[1]); // return base64
                  };
                  reader.readAsDataURL(blob);
                };
              });

              recorder.start(100);

              // 1. Initial framing at Entrance
              engine.chapterController.goToChapter(0, true);
              await new Promise(r => setTimeout(r, 800));

              // 2. Trigger Berserker Monolith Strike
              engine.chapterController.scenes.entrance.startStrike();
              await new Promise(r => setTimeout(r, 4200));

              // 3. Move into Generac Exploded Assembly
              engine.chapterController.goToChapter(1, true);
              await new Promise(r => setTimeout(r, 1200));
              engine.chapterController.scenes.generac.setExplodeProgress(1.0);
              await new Promise(r => setTimeout(r, 1800));

              // 4. Select MOSFET component
              engine.chapterController.scenes.generac.selectComponent('mosfet');
              await new Promise(r => setTimeout(r, 1200));

              // 5. Chapter 02: USC Bookstore DC (Warehouse Layout & Pareto Route)
              engine.chapterController.goToChapter(2, true);
              await new Promise(r => setTimeout(r, 1500));

              // 6. Chapter 03: Vindeep Expo (Statutory Testing Framework)
              engine.chapterController.goToChapter(3, true);
              await new Promise(r => setTimeout(r, 1500));

              // 7. Chapter 04: Larsen & Toubro (Robotic Welding Monitoring)
              engine.chapterController.goToChapter(4, true);
              await new Promise(r => setTimeout(r, 1500));

              // 8. Chapter 05: Banco Products (Heat Exchanger QA)
              engine.chapterController.goToChapter(5, true);
              await new Promise(r => setTimeout(r, 1500));

              // 9. Chapter 06: Python MCP Decision Workbench (12-Plant Globe)
              engine.chapterController.goToChapter(6, true);
              engine.chapterController.scenes.workbench.filterRegion('West');
              await new Promise(r => setTimeout(r, 1800));

              // 10. Chapter 07: Inventory Policy Optimization (POQ vs FOQ vs LFL)
              engine.chapterController.goToChapter(7, true);
              engine.chapterController.scenes.inventory.setPolicy('POQ');
              await new Promise(r => setTimeout(r, 1800));

              // 11. Chapter 08: Academic Foundation (USC & PDEU)
              engine.chapterController.goToChapter(8, true);
              await new Promise(r => setTimeout(r, 1400));

              // 12. Chapter 09: Contact Sculpture (Particle Morphing)
              engine.chapterController.goToChapter(9, true);
              engine.chapterController.scenes.contact.setMorphTarget('LINKEDIN');
              await new Promise(r => setTimeout(r, 2000));

              recorder.stop();
              const base64Data = await recordingPromise;
              return { success: true, base64Data };
            })()`,
            returnByValue: true
          }
        }));
      };

      ws.onmessage = (msg) => {
        const res = JSON.parse(msg.data);
        if (res.id === 50) {
          const val = res.result.result.value;
          if (val && val.success && val.base64Data) {
            const buf = Buffer.from(val.base64Data, 'base64');
            const outPath = path.join(__dirname, 'entrance_to_generac_walkthrough.webm');
            fs.writeFileSync(outPath, buf);
            console.log(`Successfully recorded WebM video: entrance_to_generac_walkthrough.webm (${buf.length} bytes)`);

            // Also copy to artifacts directory
            const artPath = "C:\\Users\\Harsh\\.gemini\\antigravity-ide\\brain\\b4e6f0cf-e46c-4c59-b554-f1d1b599cf64\\entrance_to_generac_walkthrough.webm";
            try {
              fs.writeFileSync(artPath, buf);
              console.log("Copied video to artifacts directory.");
            } catch (e) {
              console.warn("Could not copy to artifacts:", e);
            }
          } else {
            console.error("Recording failed:", val);
          }
          ws.close();
          edge.kill();
          process.exit(0);
        }
      };
    });
  });
}

recordCanvas();
