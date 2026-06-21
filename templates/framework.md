# Framework Bridge (auto-detect, pcall-safe)

Generate one bridge that supports ESX, QBCore, QBox(ox_core), ND_Core, standalone. Auto-detect by resource state; never hard-fail.

## server/framework.lua

```lua
Framework, FW = nil, nil

CreateThread(function()
    if GetResourceState('es_extended') == 'started' then
        FW = 'esx'
        Framework = exports['es_extended']:getSharedObject()
    elseif GetResourceState('qb-core') == 'started' then
        FW = 'qb'
        Framework = exports['qb-core']:GetCoreObject()
    elseif GetResourceState('ox_core') == 'started' then
        FW = 'ox'
    elseif GetResourceState('ND_Core') == 'started' then
        FW = 'nd'
    else
        FW = 'standalone'
    end
end)

-- Resolve a player object from a SERVER source (never a client-sent id)
function GetPlayer(src)
    if FW == 'esx' then return Framework.GetPlayerFromId(src)
    elseif FW == 'qb' then return Framework.Functions.GetPlayer(src)
    elseif FW == 'ox' then return exports.ox_core:GetPlayer(src) end
    return nil
end

-- Money: returns true on success, server-authoritative amount
function RemoveMoney(src, amount, account)
    if type(amount) ~= 'number' or amount <= 0 or amount ~= amount then return false end
    local p = GetPlayer(src); if not p then return false end
    if FW == 'esx' then
        if p.getMoney() < amount and account ~= 'bank' then return false end
        p.removeMoney(amount); return true
    elseif FW == 'qb' then
        return p.Functions.RemoveMoney(account or 'cash', amount)
    end
    return false
end

function AddMoney(src, amount, account)
    if type(amount) ~= 'number' or amount <= 0 then return false end
    local p = GetPlayer(src); if not p then return false end
    if FW == 'esx' then p.addMoney(amount); return true
    elseif FW == 'qb' then return p.Functions.AddMoney(account or 'cash', amount) end
    return false
end
```

## client/framework.lua

```lua
Framework, FW = nil, nil

CreateThread(function()
    if GetResourceState('es_extended') == 'started' then
        FW = 'esx'; Framework = exports['es_extended']:getSharedObject()
    elseif GetResourceState('qb-core') == 'started' then
        FW = 'qb'; Framework = exports['qb-core']:GetCoreObject()
    end
end)
```

## Notify helper (prefers ox_lib / dei_notifys, falls back per framework)

```lua
function Notify(msg, type)
    if GetResourceState('ox_lib') == 'started' then
        lib.notify({ description = msg, type = type or 'inform' })
    elseif GetResourceState('dei_notifys') == 'started' then
        exports['dei_notifys']:Notify(msg, type or 'info')
    elseif FW == 'qb' and Framework then
        Framework.Functions.Notify(msg, type or 'primary')
    elseif FW == 'esx' and Framework then
        Framework.ShowNotification(msg)
    else
        BeginTextCommandThefeedPost('STRING'); AddTextComponentSubstringPlayerName(msg)
        EndTextCommandThefeedPostTicker(false, true)
    end
end
```

## server/framework.lua — DB wrapper (oxmysql, pcall-safe)

```lua
function dbExecute(query, params, cb)
    local ok = pcall(function() exports.oxmysql:execute(query, params, cb) end)
    if not ok and cb then cb(0) end
end

function dbQuery(query, params, cb)
    local ok = pcall(function() exports.oxmysql:execute(query, params, cb) end)
    if not ok and cb then cb({}) end
end
```

CRITICAL: every wrapper validates input and uses the SERVER source. Never accept a player id from the client.
