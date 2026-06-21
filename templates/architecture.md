# Architecture — modules, LSP, state sync (library-agnostic)

Senior backbone: a real module system, typed state, LSP, and statebags instead of globals
and manual broadcasts. Works the same standalone or on a framework/library.

> **Standalone** ships the tiny helpers below inside the resource (zero external deps).
> **On ox_lib** use its equivalents instead (`lib.require`, `lib.callback`, `locale()`,
> `lib.points`) — same patterns, don't reinvent. Either is fine; follow the project.

## Module system: one file, one purpose, one `return`

Each file exposes only what it `return`s; load with `require`. **Zero resource globals.**

```lua
-- server/storage.lua
local storage = {}
---@param identifier string
---@return Bill[]
function storage.getBills(identifier) ... end
return storage
```
```lua
-- server/init.lua  (the only server entrypoint)
local config  = require 'config'
if not config then return end
local storage = require 'server.storage'
require 'server.main'
```

### Standalone module loader (ship it; ~20 lines, no dependency)
```lua
-- shared/require.lua  (load FIRST in shared_scripts)
local loaded, resource = {}, GetCurrentResourceName()
function require(name)
    if loaded[name] ~= nil then return loaded[name] end
    local path = name:gsub('%.', '/') .. '.lua'
    local src = LoadResourceFile(resource, path)
    if not src then error(('module not found: %s'):format(name), 2) end
    local chunk = assert(load(src, ('@@%s/%s'):format(resource, path)))
    local result = chunk()
    loaded[name] = result == nil and true or result
    return loaded[name]
end
```
(On ox_lib, `require`/`lib.require` already exists — skip this file.)

## config + typed state modules
```lua
-- config.lua → return config        (---@class Config)
-- client/state.lua
---@class State
---@field open boolean
local state = { open = false }
return state
```

## LSP: .luarc.json + fivem-lls-addon (type defs only, not a runtime dep)
```jsonc
{
  "$schema": "https://raw.githubusercontent.com/LuaLS/vscode-lua/master/setting/schema.json",
  "runtime.version": "Lua 5.4",
  "workspace.library": ["<path>/fivem-lls-addon/library"],
  "diagnostics.disable": ["unbalanced-assignments", "lowercase-global"],
  "diagnostics.globals": ["exports", "Entity", "Player", "GlobalState"]
}
```
Annotate public APIs: `---@class`, `---@param`, `---@return`, string-literal unions.

## State sync: statebags > manual broadcast (native, no library)
```lua
-- server sets (authority); clients react natively — no broadcast loop
Entity(vehicle).state:set('fuel', level, true)
Player(src).state:set('canSteal', true, true)
GlobalState.serverSetting = value

-- client
AddStateBagChangeHandler('fuel', ('entity:%s'):format(netId), function(_, _, value) ... end)
```
Why: native server→client sync, server authority, late-joiners get current state, no
`for _, id in GetPlayers() do TriggerClientEvent(...)` spam.

## Async helpers (standalone) — see `templates/server.md`
Ship a tiny callback util (promise/await) and a JSON `locale()` loader; or use the
framework/ox_lib equivalents when present. Never `while not done do Wait(0) end`.
