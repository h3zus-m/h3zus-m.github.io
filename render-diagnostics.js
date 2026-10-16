// Retain the exact failure for support without placing technical messages in the UI.
export function reportRenderFailure(error, phase) {
 const diagnostic={phase,name:error?.name||'Error',message:error?.message||String(error),stack:error?.stack||null,timestamp:new Date().toISOString()};
 globalThis.__portfolioRenderError=diagnostic;
 console.error(`[Portfolio 3D: ${phase}] ${diagnostic.message}`,error);
 return diagnostic;
}
