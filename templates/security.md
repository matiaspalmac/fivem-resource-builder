# Secure-by-Default Checklist

Run this before declaring a generated resource done. It mirrors `fivem-security-audit` — pass it and the audit scores 100.

## Server
- [ ] `local src = source` in every net event (never client-sent id)
- [ ] Every param validated: type, range, length, NaN (`v ~= v`)
- [ ] Rate limit on every net event; cleaned in `playerDropped`
- [ ] Mutex/lock on every money/item/transfer op; released in `playerDropped`
- [ ] Prices/amounts from server config/DB, never from client/NUI
- [ ] Negative amounts rejected
- [ ] Proximity check for world/shop/door actions
- [ ] Permissions checked server-side (ACE / framework job+grade)
- [ ] SQL parameterized (`?`), never concatenated
- [ ] Server-only events use `AddEventHandler` or `source ~= 65535`
- [ ] Every source-keyed table cleaned in `playerDropped`

## Client
- [ ] No unconditional `Wait(0)`; conditional/two-tier sleep
- [ ] Natives cached per frame (`cache.ped`)
- [ ] `onResourceStop` restores focus/freeze/cam/tasks, deletes entities, removes zones
- [ ] `SendNUIMessage` throttled with change detection

## NUI
- [ ] `textContent` / escape helper — never `innerHTML` with data
- [ ] Callbacks send intent only; server authoritative
- [ ] `message` listener validates shape
- [ ] `IS_BROWSER` preview present
- [ ] CSP meta + `nui_callback_strict_mode 'true'`

## Manifest / hygiene
- [ ] `fx_version 'cerulean'`, `lua54 'yes'`, `version`/`author`/`description`
- [ ] No wildcard script includes
- [ ] Dependencies declared; sensitive config in `server_scripts` only
- [ ] No deprecated patterns (`RegisterServerEvent`, `Citizen.*`, `__resource.lua`, `mysql-async` if oxmysql present)
- [ ] Config has only used values (no dead options)

## Anti-pattern reminders (do NOT generate these)
- Client sending prices/amounts/coords the server then trusts
- `ExecuteCommand` with concatenated user input
- `PerformHttpRequest` + `load()` (that is the backdoor shape)
- `os.execute` / `io.popen` (no legitimate FiveM use)
- Storing money as floats — use integer cents
