const http = require('http');
const { spawn } = require('child_process');

async function testImports() {
  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  const edge = spawn(edgePath, [
    "--headless=new",
    "--remote-debugging-port=9224",
    "http://localhost:8080"
  ]);

  await new Promise(r => setTimeout(r, 2000));

  http.get("http://localhost:9224/json", (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', async () => {
      const tabs = JSON.parse(data);
      const appTab = tabs.find(t => t.url.includes("localhost:8080"));
      const ws = new WebSocket(appTab.webSocketDebuggerUrl);

      ws.onopen = () => {
        ws.send(JSON.stringify({ id: 1, method: "Runtime.enable" }));
        ws.send(JSON.stringify({ id: 2, method: "Log.enable" }));
        ws.send(JSON.stringify({ id: 3, method: "Console.enable" }));

        const files = [
          './assets/three.module.min.js',
          './engine/Renderer.js',
          './engine/CameraRig.js',
          './engine/UIController.js',
          './engine/FallbackController.js',
          './engine/scenes/EntranceScene.js',
          './engine/scenes/GeneracScene.js',
          './engine/scenes/UscDcScene.js',
          './engine/scenes/VindeepScene.js',
          './engine/scenes/LtScene.js',
          './engine/scenes/BancoScene.js',
          './engine/scenes/WorkbenchScene.js',
          './engine/scenes/InventoryScene.js',
          './engine/scenes/EducationScene.js',
          './engine/scenes/ContactScene.js',
          './engine/ChapterController.js',
          './engine/Engine.js'
        ];

        let idx = 0;
        function testNext() {
          if (idx >= files.length) {
            console.log("All imports tested! Testing instantiation...");
            ws.send(JSON.stringify({
              id: 999,
              method: "Runtime.evaluate",
              params: {
                awaitPromise: true,
                expression: `(async () => {
                  try {
                    const mod = await import('./engine/Engine.js');
                    const inst = new mod.PortfolioSpatialEngine();
                    return {
                      status: 'INSTANTIATED',
                      isWebGL: inst.rendererInstance ? inst.rendererInstance.isWebGLAvailable : false,
                      fps: inst.fps,
                      frameCount: inst.frameCount
                    };
                  } catch (e) {
                    return { status: 'INSTANTIATE_ERROR', error: e.toString(), stack: e.stack };
                  }
                })()`,
                returnByValue: true
              }
            }));
            return;
          }
          const file = files[idx++];
          ws.send(JSON.stringify({
            id: 100 + idx,
            method: "Runtime.evaluate",
            params: {
              awaitPromise: true,
              expression: `(async () => {
                try {
                  await import('${file}');
                  return { file: '${file}', status: 'OK' };
                } catch (e) {
                  return { file: '${file}', status: 'FAIL', error: e.toString() };
                }
              })()`,
              returnByValue: true
            }
          }));
        }

        ws.onmessage = (msg) => {
          const res = JSON.parse(msg.data);
          if (res.method === 'Runtime.exceptionThrown') {
            console.error('[Browser Exception]:', JSON.stringify(res.params.exceptionDetails));
          } else if (res.method === 'Runtime.consoleAPICalled') {
            console.log('[Browser Console]:', res.params.type, res.params.args.map(a => a.value || a.description).join(' '));
          }
          if (res.id >= 101 && res.id <= 100 + files.length) {
            console.log(JSON.stringify(res.result.result.value));
            testNext();
          } else if (res.id === 999) {
            console.log("=== FINAL INSTANTIATION RESULT ===");
            console.log(JSON.stringify(res.result.result.value, null, 2));
            ws.close();
            edge.kill();
            process.exit(0);
          }
        };

        testNext();
      };
    });
  });
}

testImports();
