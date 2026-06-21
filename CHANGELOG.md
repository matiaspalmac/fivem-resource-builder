# Changelog

## [1.0.0] — 2026-06-21

First release. Claude Code skill that scaffolds secure-by-default FiveM/RedM resources. Optimized for Opus 4.8.

- Modular templates: manifest, framework bridge, server, client, NUI, security checklist
- Auto-detect ESX / QBCore / QBox(ox_core) / ND_Core / standalone; RedM VORP/RSG/RedEM
- Security baked into every generated event (source, validation, rate limit, mutex, proximity, cleanup)
- NUI scaffold: XSS-safe, intent-only callbacks, CSP, browser preview mode
- Live reference lookup (docs.fivem.net natives, framework APIs, PlebMasters Forge assets, Context7) — no hallucinated signatures
- ox ecosystem template: lib.callback, ox_target, ox_inventory hooks, lib.points, lib.addCommand, lib.locale i18n
- TypeScript / build pipeline template (esbuild/Vite, typed natives, NUI HMR) — optional
- Pairs with fivem-security-audit — generated code is designed to score 100 on the audit

### Consolidated from the landscape
Surveyed claude-fivem-dev, create-fivem-res, pe-cli, fivem-resource-maker and folded in their best ideas: dynamic native/doc fetching (claude-fivem-dev), TypeScript+build scaffolding and NUI HMR (create-fivem-res/pe-cli), ox-first patterns and asset discovery.
