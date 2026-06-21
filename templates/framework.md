# Framework Bridge (one file per framework, unified API)

Use this only when the resource targets a framework (ESX/QBCore/Qbox). A pure standalone
resource has no framework bridge — it uses native APIs and its own data.

Pattern: detect the framework ONCE, load the matching module, expose ONE unified API. No
`if FW == 'esx' then … elseif` scattered across every function. Lives in `shared/bridge/`.

## Detection (once)

```lua
-- shared/bridge/init.lua
local framework =
    GetResourceState('es_extended') == 'started' and 'esx' or
    GetResourceState('qb-core') == 'started' and 'qb' or
    GetResourceState('ox_core') == 'started' and 'qbox' or
    GetResourceState('ND_Core') == 'started' and 'nd' or 'standalone'

if framework == 'standalone' then
    lib.print.warn('no framework detected; running standalone')
end

shared.framework = framework
return require(('shared.bridge.%s'):format(framework))
```

## Unified contract (every framework implements it)

```lua
---@class Bridge
---@field getPlayer fun(src: number): table?
---@field getIdentifier fun(src: number): string?
---@field getMoney fun(src: number, account: 'cash'|'bank'): number
---@field addMoney fun(src: number, account: string, amount: number): boolean
---@field removeMoney fun(src: number, account: string, amount: number): boolean
---@field getJob fun(src: number): string, number
---@field hasGroup fun(src: number, group: string|table): string?, number?
---@field giveItem fun(src: number, item: string, count: number): boolean
```

## One impl per framework (isolated)

```lua
-- shared/bridge/esx.lua
local ESX = exports.es_extended:getSharedObject()
local bridge = {}

function bridge.getMoney(src, account)
    local x = ESX.GetPlayerFromId(src)
    if not x then return 0 end
    return account == 'bank' and (x.getAccount('bank').money or 0) or x.getMoney()
end

function bridge.removeMoney(src, account, amount)
    if type(amount) ~= 'number' or amount ~= amount or amount <= 0 then return false end
    local x = ESX.GetPlayerFromId(src); if not x then return false end
    if account == 'bank' then
        if (x.getAccount('bank').money or 0) < amount then return false end
        x.removeAccountMoney('bank', amount)
    else
        if x.getMoney() < amount then return false end
        x.removeMoney(amount)
    end
    return true
end
-- ... rest of the contract
return bridge
```

`shared/bridge/qb.lua`, `qbox.lua`, `nd.lua` implement the same contract.

## Usage from anywhere

```lua
local Framework = require 'shared.bridge'
Framework.removeMoney(src, 'bank', total)     -- identical across ESX/QB/qbox
```

Why: framework logic in ONE file each; adding a framework = one new file matching the
contract, zero changes in resources; every signature takes `src` (server-resolved) — the
bridge never accepts a client-sent id.

## Notify
One helper, not per-framework notify code. Use `lib.notify` if the project has ox_lib,
the framework's notify (`ESX.ShowNotification`, `QBCore ... Notify`) on a framework, or a
native `BeginTextCommandThefeedPost` fallback when standalone.
