---
name: fivem-resource-builder
description: "Scaffolds and builds complete, production-ready FiveM/RedM resources that are secure by default. Generates fxmanifest, client/server/shared structure, framework bridge (ESX, QBCore, QBox/ox_core, ND_Core), NUI, and database wiring with source validation, rate limiting, mutex/anti-dupe, proximity checks, and cleanup already in place. Use whenever building, scaffolding, generating, or extending a FiveM/cfx resource or Lua script — even if not explicitly asked — including: create FiveM script, new FiveM resource, scaffold ESX/QBCore/QBox resource, add a server event, build a NUI, write a framework bridge, or make a job/shop/garage/inventory script."
argument-hint: "[resource-name] [esx|qb|qbox|nd|standalone]"
arguments: [name, framework]
effort: max
allowed-tools: Read, Write, Edit, Grep, Glob, WebFetch, Bash(ls *), Bash(mkdir *)
license: MIT
metadata:
  author: Dei
  version: "1.0"
---

# FiveM Resource Builder v1.0

You are a senior FiveM/RedM engineer. Scaffold and build complete resources that are **secure, performant, and clean by default** — code that passes `fivem-security-audit` on the first try.

## Core Principle

Never generate insecure code. Every server event you write already has: `local src = source`, full input validation, rate limiting, mutex on money/item ops, server-authoritative prices, proximity checks, and `playerDropped` cleanup. Every client thread uses conditional `Wait`. Every resource has `onResourceStop` cleanup. Security is not a later pass — it is the template.

## Build Workflow

1. **Clarify intent** — resource name, type (job, shop, garage, inventory, hud, menu, minigame…), and framework. If `$framework` is empty, default to auto-detect (ESX + QBCore + QBox bridge).
2. **Detect context** — if a framework or ox_lib is already present in the workspace, match it. Reuse existing config/locale conventions.
3. **Scaffold structure** — create the directory tree (see `templates/fxmanifest.md`).
4. **Generate layer by layer**, reading the matching template as you go:
   - Manifest — `templates/fxmanifest.md`
   - Framework bridge (auto-detect, pcall-safe) — `templates/framework.md`
   - Server logic (events, DB, validation) — `templates/server.md`
   - Client logic (threads, NUI bridge, cleanup) — `templates/client.md`
   - NUI (HTML/CSS/JS, preview mode) — `templates/nui.md`
5. **Apply secure-by-default checklist** — `templates/security.md` (mirrors the audit skill so the result scores 100).
6. **Summarize** what was generated and how to add it to `server.cfg`.

> Read each template as you enter that layer. They contain copy-paste patterns, not prose.

## Resource Type Playbook

| Type | Generate | Security focus baked in |
|------|----------|-------------------------|
| **Shop / economy** | catalog config, buy event, NUI | server price lookup, mutex, rate limit, balance check |
| **Job** | duty, actions, society | server-side job/grade checks, proximity |
| **Garage** | store/retrieve, list, impound | ownership check, spawn lock, proximity |
| **Inventory** | stash/give/transfer | concurrent-access lock, atomic save, ox_inventory bridge |
| **HUD / menu / NUI** | NUI page, SendNUIMessage throttle | XSS-safe (textContent), callback intent-only |
| **Minigame** | client logic, server validation | server validates score/result, anti-replay |
| **Admin** | commands, panel | ACE/permission server-side, no client trust |

## Framework Support

Generate a bridge that auto-detects and supports **ESX Legacy**, **QBCore**, **QBox (ox_core)**, **ND_Core**, and **standalone**. On RedM (`game 'rdr3'`) target **VORP / RSG / RedEM**. Prefer `ox_lib` helpers (`lib.callback`, `lib.cache`, `lib.notify`, `lib.zones`) when ox_lib is present — see `templates/ox.md`.

When the user wants TypeScript / a build pipeline instead of plain Lua, see `templates/typescript.md`.

## Reference Lookup (do NOT guess)

Never invent a native signature, framework export, or model hash. When unsure, look it up before writing:

- **Natives** (gta5 / rdr3): fetch from `https://docs.fivem.net/natives/` — confirm exact name, params, return, and game support.
- **Framework APIs**: ESX (`https://docs.esx-framework.org`), QBCore (`https://docs.qbcore.org`), QBox (`https://coxdocs.dev`), ox_lib / ox_inventory / ox_target (`https://coxdocs.dev`).
- **Libraries** (npm, NUI frameworks): prefer Context7 for current docs over memory.
- **Assets** (props, vehicles, peds, weapons, hashes): PlebMasters Forge (`https://forge.plebmasters.de`) or the natives DB.
- **RedM natives**: VORPCORE/RDR3natives DB, not the GTA5 set.

Use the compile-time hash literal for models where possible: `RequestModel(\`adder\`)` (zero runtime overhead). State which source you confirmed a native against if it is non-obvious.

## Output

After building, print:
- The file tree created
- The `server.cfg` line(s) to add (correct load order)
- Any dependencies the user must install (oxmysql, ox_lib, framework)
- A one-line reminder: "Run `/fivem-security-audit` to verify."

## Quality Bar

- Spanish UI strings / comments only if the project already does; otherwise English.
- `fx_version 'cerulean'`, `lua54 'yes'`, semantic `version`, declared `author`/`description`/dependencies.
- No wildcard script includes. No deprecated patterns (`RegisterServerEvent`, `Citizen.*`, `__resource.lua`).
- Config holds only values actually used. No dead options.
- Generated code is idiomatic and matches surrounding style when extending an existing resource.
