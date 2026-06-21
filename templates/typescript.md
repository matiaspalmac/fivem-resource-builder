# TypeScript / Build Pipeline (optional)

Use this only when the user wants TypeScript or a bundled NUI (React/Vue/Svelte). Default stays plain Lua. Security rules are identical — TS does not change the trust model; the server is still authoritative.

## Structure

```
resource_name/
  fxmanifest.lua
  package.json
  tsconfig.json
  src/
    client/index.ts
    server/index.ts
  web/                 -- NUI app (Vite)
    src/...
  dist/                -- built output (gitignored)
    client.js
    server.js
```

## fxmanifest.lua (points at built output)

```lua
fx_version 'cerulean'
game 'gta5'
lua54 'yes'
author 'Dei'
version '1.0.0'

client_scripts { 'dist/client.js' }
server_scripts { 'dist/server.js' }

ui_page 'web/dist/index.html'
files { 'web/dist/index.html', 'web/dist/assets/*' }
```

## Build (esbuild — fast, zero-config) or Vite for NUI HMR

```jsonc
// package.json (scripts)
{
  "scripts": {
    "build": "esbuild src/client/index.ts src/server/index.ts --bundle --platform=node --outdir=dist",
    "watch": "npm run build -- --watch",
    "web:dev": "vite",            // serves NUI with HMR
    "web:build": "vite build"
  }
}
```

For NUI dev HMR: during `vite`, set `ui_page` to the dev server URL so the in-game CEF reloads instantly.

## Typed natives

Use `@citizenfx/client` / `@citizenfx/server` type packages, or `@nativewrappers/fivem`. Confirm a native exists before calling it (Reference Lookup).

## Notes

- Ship only `dist/` + `web/dist/` (gitignore `node_modules`, `dist`, `web/dist` in dev but include built output in the resource).
- Keep the same secure server skeleton (`templates/server.md`) — TS gives types, not safety.
- Smart logging: a small typed logger beats scattered `print`; tag with resource name + level.
