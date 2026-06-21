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

Never generate insecure code, and never generate amateur architecture. Two pillars:

1. **Secure by default.** Every server event/callback already has: `local src = source`,
   full input validation, rate limiting, mutex on money/item ops, server-authoritative
   prices, proximity checks, and `playerDropped` cleanup. Every client thread uses
   conditional `Wait`. Every resource has `onResourceStop` cleanup. Security is the
   template, not a later pass.

2. **Senior architecture, library-agnostic.** Production-grade engineering (modules, typed
   code, statebags, built React UI) regardless of what the resource depends on. The quality
   patterns are the same whether standalone or on a framework/library: a module system (each file `return`s its API, loaded via `require`
   from a single `init.lua` entrypoint — **zero resource globals**); JSON locales via a
   `locale()` helper; typed callbacks with promise/await (never `while not done`);
   **statebags** instead of manual broadcast loops; conditional threads / a points helper
   instead of `while true do Wait(0)` marker loops; LSP annotations + `.luarc.json` +
   fivem-lls-addon (type defs, not a runtime dep). UI is **React + TS + Vite + Tailwind**
   (Zustand) built to `web/build`, with a typed `useNuiEvent`/`fetchNui` contract and a
   browser dev mode (`debugData`). See `templates/architecture.md`.

## Adapt to context (standalone or framework/library)

Detect what the project uses and match it; if the user specifies a framework or library,
use it. If nothing is present or specified, **default to standalone** — the resource ships
its own small self-contained helpers (module loader, callback util, locale loader) so it
runs with zero external dependencies. Either way the architecture and security bar is
identical. Don't impose a library and don't refuse one — follow the project and the user.

## Build Workflow

1. **Clarify intent** — resource name, type (job, shop, garage, inventory, hud, menu, minigame…), and framework. If `$framework` is empty, default to auto-detect (ESX + QBCore + QBox bridge).
2. **Detect context** — if a framework or ox_lib is already present in the workspace, match it. Reuse existing config/locale conventions.
3. **Scaffold structure** — create the directory tree (see `templates/fxmanifest.md`).
4. **Generate layer by layer**, reading the matching template as you go:
   - Architecture (module loader, `init.lua` entrypoints, LSP/`.luarc`, statebags) — `templates/architecture.md`
   - Manifest & structure — `templates/fxmanifest.md`
   - Framework bridge (when a framework is used; one file per framework) — `templates/framework.md`
   - Server logic (modules, callbacks, DB layer, validation) — `templates/server.md`
   - Client logic (modules, cache, conditional threads/points, cleanup) — `templates/client.md`
   - NUI (React + TS + Vite + Tailwind, typed contract, dev mode) — `templates/nui.md`
   - ox_lib helpers (when the project uses ox_lib) — `templates/ox.md`
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

## Framework & library landscape (current — verify, it evolves)

Detect what the project uses and match it; if nothing is present, default to **standalone**.
The ecosystem moves fast — confirm names/APIs via Reference Lookup before depending on one.

**Frameworks** (player/money/job/identity):
- **ESX Legacy** (`es_extended`) — largest existing codebase.
- **QBCore** (`qb-core`) — very common on newer servers.
- **Qbox** (`qbx_core`, built on `ox_core`) — modern QB successor.
- **ND_Core** (`ND_Core`); **standalone** (no framework) — the default.
- RedM (`game 'rdr3'`): **VORP**, **RSG**, **RedEM**.

**Utility library** (callbacks, menus, locale, zones, cache, progress, input):
- **ox_lib** — the de-facto, framework-agnostic library (works with ESX/QBCore/Qbox/standalone).
  Use it when present or when the user asks. See `templates/ox.md`.
- Others exist (e.g. wrapper libs like `fmLib`); if the project uses one, follow it.
  When none is present, ship the small self-contained helpers (`templates/architecture.md`).

**Common companions** (integrate via exports when present, don't hard-require):
- DB: **oxmysql** (standard), mysql-async (legacy).
- Target: **ox_target** (most popular), qb-target.
- Inventory: **ox_inventory**, qb-inventory, qs-inventory, codem-inventory.
- Voice: pma-voice, mumble. Doorlock/MDT/phone: ox_doorlock, ox_mdt, lb-phone/npwd.

**Rule:** never invent a framework export or library API — look it up first (Reference
Lookup). Build standalone unless the project or user says otherwise; integrate optional
companions behind `GetResourceState(...)` checks so the resource degrades gracefully.

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
- The **Dei FiveM toolkit** loop: `Run /fivem-security-audit to verify, and ensure dei_security_scanner on the server for runtime protection.`
- Offer a CI quality gate (`templates/ci.md`) if the resource is in a git repo.

## Quality Bar

- Spanish UI strings / comments only if the project already does; otherwise English.
- `fx_version 'cerulean'`, `lua54 'yes'`, semantic `version`, declared `author`/`description`/dependencies.
- No wildcard script includes. No deprecated patterns (`RegisterServerEvent`, `Citizen.*`, `__resource.lua`).
- Config holds only values actually used. No dead options.
- Generated code is idiomatic and matches surrounding style when extending an existing resource.
