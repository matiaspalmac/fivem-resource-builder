# CI Quality Gate (optional, recommended)

Generate this when the resource lives in a git repo. It makes security and correctness a merge gate, the suite's "audit" stage in automation.

## .github/workflows/lint.yml

```yaml
name: Lint
on: [push, pull_request]
jobs:
  luacheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: FiveM Lua lint
        uses: GoatG33k/fivem-lua-lint-action@master
```

## .luacheckrc (FiveM globals so luacheck doesn't false-positive)

```lua
std = 'lua54'
max_line_length = false
ignore = { '212', '213', '631' }   -- unused args/loop vars, long lines

read_globals = {
    -- Cfx core
    'Citizen', 'PerformHttpRequest', 'exports', 'GetCurrentResourceName',
    'GetResourceState', 'GetResourceMetadata', 'GetGameTimer', 'GetHashKey',
    'RegisterNetEvent', 'AddEventHandler', 'TriggerEvent', 'TriggerServerEvent',
    'TriggerClientEvent', 'RegisterCommand', 'RegisterKeyMapping', 'CreateThread', 'Wait',
    'source', 'GetPlayerPed', 'GetEntityCoords', 'PlayerPedId', 'PlayerId',
    'GetPlayerServerId', 'IsPlayerAceAllowed', 'SetNuiFocus', 'SendNUIMessage',
    'RegisterNUICallback', 'DoesEntityExist', 'DeleteEntity', 'json', 'cache', 'lib',
    'MySQL', 'vector3', 'vec3', 'GivePlayerItem', 'GetPlayerFromStateBagName',
}
```

Notes:
- The FiveM backtick hash syntax (`` `adder` ``) is NOT understood by luacheck — use `GetHashKey('adder')` in code that is linted, or add the file to `exclude_files`.
- Commit built NUI output (or build in CI) so `files {}` always references existing chunks — a missing hashed chunk after a bundler upgrade is the classic "white screen in prod".

## Suite gate (recommended PR checklist)

1. luacheck passes (this workflow)
2. Run `/fivem-security-audit` on the diff — 0 CRITICAL before merge
3. On the server, `dei_security_scanner` is ensured (runtime layer)
