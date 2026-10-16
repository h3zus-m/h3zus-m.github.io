# Harsh Mistry: Inside the Systems

Current portfolio: https://h3zus-m.github.io/

Published from the same runtime files as https://harsh-mistry-inside-systems.hearty-lamp-6320.chatgpt.site/ (Sites version 1, source commit 139de313546fce32577483c6aef9b79abfc5651d). The static files are at the repository root for GitHub Pages. All runtime assets are local.

## Development

Edit `content.js`, `index.html`, `style.css`, `app.js`, `world.js`, and `models.js` as appropriate. No build or dependency installation is required.

```sh
npm test
npm run check
python -m http.server 8080
```

The existing GitHub Pages workflow publishes pushes to `main`. The previous portfolio is retained in Git history and the `backup/before-inside-systems-2026-10-16` branch.

## Rendering and verification

The ten WebP scene images are offline renders of the geometry, not browser screenshots. WebGL enhances the page; written content and contact links remain accessible without it. Rendering errors are retained in the browser console and `globalThis.__portfolioRenderError`.

Source tests and syntax checks passed before transfer. A 9.5/10 visual audit has not been established.

## Asset attribution

- Three.js and its loader/utilities: https://github.com/mrdoob/three.js, MIT license.
- Manrope: see `assets/Manrope-OFL.txt`.
- Industrial Workshop Foundry HDRI: Poly Haven, CC0, https://polyhaven.com/a/industrial_workshop_foundry.
- Scene geometry and scene posters: project-authored conceptual illustrations. Internal assemblies and sample datasets are explanatory, as labeled in the portfolio.
