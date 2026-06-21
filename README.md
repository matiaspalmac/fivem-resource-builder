# FiveM Resource Builder Skill for Claude Code

[![npm version](https://img.shields.io/npm/v/fivem-resource-builder)](https://www.npmjs.com/package/fivem-resource-builder)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Scaffold and build complete, **secure-by-default** FiveM/RedM resources. The counterpart to [fivem-security-audit](https://github.com/matiaspalmac/fivem-security-audit): one builds, the other verifies. Optimized for Claude Opus 4.8.

## Install

```bash
npx fivem-resource-builder
```

Restart Claude Code, then `/fivem-resource-builder` or just ask: "create a QBCore shop resource".

**Uninstall:** `npx fivem-resource-builder --uninstall`

## What it does

Generates full resources where security is the template, not an afterthought. Every server event ships with `local src = source`, input validation, rate limiting, anti-dupe mutex, server-authoritative prices, proximity checks, and `playerDropped` cleanup. Every client thread is conditional. Every NUI is XSS-safe with a preview mode.

### Layers generated
- **Manifest & structure** — `cerulean`, `lua54`, no wildcards, declared deps
- **Framework bridge** — auto-detect ESX / QBCore / QBox(ox_core) / ND_Core / standalone (RedM: VORP / RSG / RedEM)
- **Server logic** — secure event skeletons, parameterized DB, ACE permissions
- **Client logic** — two-tier threads, native caching, full `onResourceStop`
- **NUI** — `textContent` XSS-safe, intent-only callbacks, CSP, `IS_BROWSER` preview
- **ox ecosystem** — `lib.callback`, `ox_target`, `ox_inventory` hooks, `lib.points`, `lib.addCommand`, `lib.locale`
- **TypeScript option** — esbuild/Vite build, typed natives, HMR for NUI

### Live reference lookup (no guessing)
Fetches current natives from `docs.fivem.net`, framework APIs (ESX/QBCore/QBox/ox), and model/prop hashes (PlebMasters Forge) instead of hallucinating signatures. Uses Context7 for library docs.

### Resource types
shop / economy · job · garage · inventory · HUD / menu · minigame · admin

## Pairs with fivem-security-audit

| | |
|---|---|
| `fivem-resource-builder` | **create** — scaffold secure resources |
| `fivem-security-audit` | **verify** — audit before deploy |

Build with one, confirm with the other. Generated code is designed to score 100 on the audit.

## Frameworks

ESX Legacy · QBCore · QBox (ox_core) · ND_Core · ox_lib helpers · Standalone · RedM (VORP / RSG / RedEM)

## License

MIT — Dei
