const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

async function recordCanvas() {
  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  const edge = spawn(edgePath, [
    "--headless=new",
    "--remote-debugging-port=9227",
    "--window-size=1280,720",
    "http://localhost:8080"
  ]);

  console.log("Launched Edge for real-time video recording...");
  await new Promise(r => setTimeout(r, 2500));

  http.get("http://localhost:9227/json", (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', async () => {
      const tabs = JSON.parse(data);
      const appTab = tabs.find(t => t.url.includes("localhost:8080"));
      const ws = new WebSocket(appTab.webSocketDebuggerUrl);

      ws.onopen = () => {
        ws.send(JSON.stringify({ id: 1, method: "Runtime.enable" }));

        console.log("Starting canvas MediaRecorder for entrance strike and transition...");
        ws.send(JSON.stringify({
          id: 50,
          method: "Runtime.evaluate",
          params: {
            awaitPromise: true,
            expression: `(async () => {
              const mod = await import('./engine/Engine.js');
              const engine = window.portfolioEngine || new mod.PortfolioSpatialEngine();
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
              engine.chapterController.goToChapter(0);
              await new Promise(r => setTimeout(r, 600));

              // 2. Trigger Berserker Monolith Strike
              engine.chapterController.scenes.entrance.startStrike();
              await new Promise(r => setTimeout(r, 4200));

              // 3. Move into Generac Exploded Assembly
              engine.chapterController.goToChapter(1);
              await new Promise(r => setTimeout(r, 1000));
              engine.chapterController.scenes.generac.setExplodeProgress(1.0);
              await new Promise(r => setTimeout(r, 2000));

              // 4. Select MOSFET component
              engine.chapterController.scenes.generac.selectComponent('mosfet');
              await new Promise(r => setTimeout(r, 1200));

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
            const artPath = "C:\\Users\\Harsh\\.gemini\antigravity-ide\\brain\\b4e6f0cf-e46c-4c59-b554-f1d1b599cf64\\entrance_to_generac_walkthrough.webm";
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
