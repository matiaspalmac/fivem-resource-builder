# Changelog

## [1.0.0] — 2026-06-21

First release. Claude Code skill that scaffolds secure-by-default FiveM/RedM resources. Optimized for Opus 4.8.

- Modular templates: manifest, framework bridge, server, client, NUI, security checklist
- Auto-detect ESX / QBCore / QBox(ox_core) / ND_Core / standalone; RedM VORP/RSG/RedEM
- Security baked into every generated event (source, validation, rate limit, mutex, proximity, cleanup)
- NUI scaffold: XSS-safe, intent-only callbacks, CSP, browser preview mode
- Pairs with fivem-security-audit — generated code is designed to score 100 on the audit
