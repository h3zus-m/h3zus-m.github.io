// Test Edge CDP connection and evaluate runtime engine state
const http = require('http');
const { spawn } = require('child_process');

async function run() {
  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  const edge = spawn(edgePath, [
    "--headless=new",
    "--remote-debugging-port=9223",
    "--window-size=1920,1080",
    "http://localhost:8080"
  ]);

  console.log("Launched Edge process with PID:", edge.pid);
  await new Promise(r => setTimeout(r, 2500));

  // Get tabs
  http.get("http://localhost:9223/json", (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const tabs = JSON.parse(data);
        const appTab = tabs.find(t => t.url.includes("localhost:8080"));
        if (!appTab) {
          console.error("Could not find localhost:8080 tab! Found:", tabs.map(t => t.url));
          edge.kill();
          process.exit(1);
        }
        console.log("Found tab:", appTab.title, appTab.webSocketDebuggerUrl);

        const ws = new WebSocket(appTab.webSocketDebuggerUrl);
        ws.onopen = () => {
          console.log("Connected to DevTools WebSocket");
          // Enable Console & Runtime & Network
          ws.send(JSON.stringify({ id: 1, method: "Runtime.enable" }));
          ws.send(JSON.stringify({ id: 2, method: "Console.enable" }));
          ws.send(JSON.stringify({ id: 3, method: "Network.enable" }));

          // Evaluate engine state after 2 seconds
          setTimeout(() => {
            ws.send(JSON.stringify({
              id: 10,
              method: "Runtime.evaluate",
              params: {
                awaitPromise: true,
                expression: `(async () => {
                  const eng = window.portfolioEngine;
                  if (!eng) {
                    return JSON.stringify({ error: "portfolioEngine is null", errVar: window.portfolioEngineError });
                  }
                  const scenes = Object.keys(eng.chapterController.scenes);
                  const gl = eng.rendererInstance.renderer.getContext();
                  const pixel = new Uint8Array(4);
                  gl.readPixels(Math.floor(gl.drawingBufferWidth / 2), Math.floor(gl.drawingBufferHeight / 2), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
                  
                  return JSON.stringify({
                    isWebGL: eng.rendererInstance.isWebGLAvailable,
                    scenesCount: scenes.length,
                    scenes: scenes,
                    totalFrames: eng.totalFramesRendered,
                    fps: eng.fps,
                    avgFrameTimeMs: eng.avgFrameTimeMs,
                    centerPixel: Array.from(pixel),
                    currentChapter: eng.chapterController.currentChapterIndex
                  }, null, 2);
                })()`
              }
            }));
          }, 2000);
        };

        ws.onmessage = (msg) => {
          const res = JSON.parse(msg.data);
          if (res.method === "Network.responseReceived") {
            const resp = res.params.response;
            if (resp.status >= 400 || resp.url.includes('.js')) {
              console.log(`[NETWORK ${resp.status}]:`, resp.url, resp.mimeType);
            }
          } else if (res.method === "Network.loadingFailed") {
            console.error(`[NETWORK LOADING FAILED]:`, res.params.errorText, res.params);
          } else if (res.method === "Runtime.consoleAPICalled") {
            const args = res.params.args.map(a => a.value || a.description).join(' ');
            console.log(`[BROWSER CONSOLE ${res.params.type.toUpperCase()}]:`, args);
          } else if (res.method === "Runtime.exceptionThrown") {
            console.error(`[BROWSER UNCAUGHT EXCEPTION]:`, res.params.exceptionDetails.text, res.params.exceptionDetails.exception);
          } else if (res.id === 10) {
            console.log("=== EVALUATION RESULT ===");
            console.log(res.result.result.value);
            ws.close();
            edge.kill();
            process.exit(0);
          }
        };

        ws.onerror = (err) => {
          console.error("WS error:", err);
          edge.kill();
          process.exit(1);
        };
      } catch (err) {
        console.error("Parse error:", err);
        edge.kill();
        process.exit(1);
      }
    });
  }).on('error', (err) => {
    console.error("HTTP error:", err);
    edge.kill();
    process.exit(1);
  });
}

run();
