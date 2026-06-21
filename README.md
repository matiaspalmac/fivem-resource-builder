# FiveM Resource Builder

[![npm](https://img.shields.io/npm/v/fivem-resource-builder)](https://www.npmjs.com/package/fivem-resource-builder)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A Claude Code skill that scaffolds full FiveM and RedM resources with the security already in place. Ask for a shop, a garage, a job, a HUD; you get a working resource where every server event validates input, every price lives on the server, and nothing trusts the client.

```bash
npx fivem-resource-builder
```

Restart Claude Code, then `/fivem-resource-builder` or just say what you want:

> "create a QBCore shop with a NUI"
> "scaffold an ESX garage"
> "add a secure buy event to this resource"

## Why it's different

Most generators hand you an empty skeleton and wish you luck. This one writes the parts people get wrong:

- `source` resolved on the server, never sent by the client
- Input validated for type, range, length and NaN
- Rate limits and anti-dupe mutexes on money and item events
- Prices read from server config, not from the NUI
- Proximity checks on world actions
- `playerDropped` and `onResourceStop` cleanup, every time
- NUI that escapes user text and ships a browser preview mode

The output is built to pass the audit (below) on the first run.

## What you get

| Layer | What it generates |
|-------|-------------------|
| Manifest | `cerulean`, `lua54`, explicit file list, declared dependencies |
| Framework | auto-detect bridge for ESX, QBCore, QBox (ox_core), ND_Core, standalone |
| Server | validated events, parameterized SQL, ACE permissions |
| Client | two-tier threads, cached natives, full cleanup |
| NUI | XSS-safe rendering, intent-only callbacks, CSP, preview mode |
| ox | `lib.callback`, `ox_target`, `ox_inventory` hooks, `lib.points`, `lib.locale` |
| TypeScript | optional esbuild/Vite build with typed natives and NUI hot reload |
| CI | luacheck GitHub Action and `.luacheckrc` tuned for Cfx globals |

It looks up real natives, framework exports and model hashes instead of guessing them.

Frameworks: ESX Legacy, QBCore, QBox (ox_core), ND_Core, ox_lib, standalone, and RedM (VORP, RSG, RedEM).

## The toolkit

Three tools, one workflow.

| Stage | Tool |
|-------|------|
| Build | **fivem-resource-builder** |
| Audit | [fivem-security-audit](https://github.com/matiaspalmac/fivem-security-audit) |
| Protect | [dei_security_scanner](https://github.com/matiaspalmac/dei_security_scanner) |

Build it secure, audit the diff before you deploy, run the scanner so anything injected later gets caught.

## License

MIT
