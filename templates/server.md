# Secure Server Patterns

Every server event you generate uses this skeleton. Do not emit a "naked" event.

## Event skeleton (validation + rate limit)

```lua
local cooldowns = {}
local function rateLimit(src, action, seconds)
    local key = src .. ':' .. action
    local now = os.time()
    if cooldowns[key] and now - cooldowns[key] < seconds then return false end
    cooldowns[key] = now
    return true
end

RegisterNetEvent('resource:action', function(arg)
    local src = source                                   -- ALWAYS server source
    if not rateLimit(src, 'action', 2) then return end
    if type(arg) ~= 'string' or #arg > 32 then return end -- type + length guard
    -- ... logic
end)

AddEventHandler('playerDropped', function()
    local src = source
    for key in pairs(cooldowns) do
        if key:find('^' .. src .. ':') then cooldowns[key] = nil end
    end
end)
```

Server-only internal events: use `AddEventHandler`, or guard `if source ~= 65535 then return end`.

## Money/item op (mutex + server-authoritative price)

```lua
local locks = {}

RegisterNetEvent('shop:buy', function(itemId, qty)
    local src = source
    if not rateLimit(src, 'buy', 1) then return end
    if type(itemId) ~= 'string' then return end
    if type(qty) ~= 'number' or qty ~= qty then return end
    qty = math.floor(qty)
    if qty < 1 or qty > Config.MaxQty then return end     -- range + negative reject

    if locks[src] then return end                          -- mutex (anti race/dupe)
    locks[src] = true

    local item = Config.Items[itemId]                      -- price from server config
    if not item then locks[src] = nil return end

    -- proximity (never trust client coords)
    local ped = GetPlayerPed(src)
    if ped == 0 or #(GetEntityCoords(ped) - Config.ShopCoords) > 5.0 then
        locks[src] = nil return
    end

    local total = item.price * qty
    if not RemoveMoney(src, total, 'cash') then locks[src] = nil return end  -- balance checked inside
    GivePlayerItem(src, itemId, qty)                       -- atomic: deduct then give
    locks[src] = nil
end)

AddEventHandler('playerDropped', function() locks[source] = nil end)
```

## DB access (parameterized only)

```lua
-- GOOD
exports.oxmysql:execute('SELECT * FROM owned_vehicles WHERE owner = ?', { identifier }, cb)
-- NEVER: string concatenation / string.format into SQL
```

## Permissions / admin

```lua
local function isAdmin(src)
    return IsPlayerAceAllowed(src, 'command.myadmin')  -- ACE, server-side
end
-- check isAdmin(src) BEFORE any privileged action; never trust a client "isAdmin" flag
```

## Startup message

```lua
CreateThread(function()
    Wait(500)
    local v = GetResourceMetadata(GetCurrentResourceName(), 'version', 0) or '1.0'
    print(('^4[Dei]^0 %s v%s - ^2Iniciado^0'):format(GetCurrentResourceName(), v))
end)
```

Hard rules: source from `source`, validate every param (type/range/length/NaN), rate limit every net event, mutex every money/item op, prices server-side, proximity for world actions, clean every source-keyed table in `playerDropped`.
