# Secure Server Patterns (modules + callbacks + secure-by-default)

Server code is organized as modules (`return` their API, loaded from `server/init.lua`).
Every event/callback is validated, rate-limited, and server-authoritative. Async uses
promises, never `while not done`.

> **Callbacks:** the `callback` API below comes from ox_lib (`lib.callback`) when the
> project has it. **Standalone**, ship a tiny equivalent (`shared/callback.lua`, ~40 lines:
> client `TriggerServerEvent` + a pending-promise table keyed by a random id, server
> responds via `TriggerClientEvent`) exposing the same `callback.register` / `callback.await`.
> Same shape either way. A plain `RegisterNetEvent` is fine for true fire-and-forget.

## Module + callback skeleton (the default)

```lua
-- server/shop.lua
local Framework = require 'shared.bridge'    -- only if targeting a framework
local callback  = require 'shared.callback'  -- standalone util, or ox_lib's lib.callback
local locks, cooldowns = {}, {}

local function rateLimit(src, action, seconds)
    local key = ('%s:%s'):format(src, action)
    local now = os.time()
    if cooldowns[key] and now - cooldowns[key] < seconds then return false end
    cooldowns[key] = now
    return true
end

-- callback: `source` is injected server-side; never trust a client id
callback.register('shop:buy', function(source, itemId, qty)
    local src = source
    if not rateLimit(src, 'buy', 1) then return false end
    if type(itemId) ~= 'string' or #itemId > 32 then return false end
    if type(qty) ~= 'number' or qty ~= qty or qty < 1 or qty > Config.MaxQty then return false end
    qty = math.floor(qty)

    if locks[src] then return false end                 -- mutex (anti race/dupe)
    locks[src] = true

    local item = Config.Items[itemId]                   -- server-authoritative price
    if not item then locks[src] = nil return false end

    local ped = GetPlayerPed(src)                       -- proximity (never trust client coords)
    if ped == 0 or #(GetEntityCoords(ped) - Config.ShopCoords) > 5.0 then
        locks[src] = nil return false
    end

    local total = item.price * qty
    if not Framework.removeMoney(src, 'bank', total) then locks[src] = nil return false end
    Framework.giveItem(src, itemId, qty)                -- atomic: deduct then give
    locks[src] = nil
    return true
end)

AddEventHandler('playerDropped', function()
    local src = source
    locks[src] = nil
    for key in pairs(cooldowns) do
        if key:find('^' .. src .. ':') then cooldowns[key] = nil end
    end
end)

return true
```

Why callbacks over net events here: a callback is promise-based, validated (unregistered
names rejected), `pcall`-wrapped (a handler error won't crash), and the client gets a typed
response. Use a plain `RegisterNetEvent` only for true fire-and-forget; still
`local src = source` + validate.

Server-only internal events: guard `if source ~= 65535 then return end`.

## DB layer (module, parameterized, non-blocking)

```lua
-- server/storage.lua
local storage = {}

---@param identifier string
---@return table[]
function storage.getBills(identifier)
    -- .await suspends THIS coroutine, not the main thread (oxmysql = promises)
    return MySQL.query.await('SELECT * FROM bills WHERE target_id = ? ORDER BY created_at DESC',
        { identifier }) or {}
end

function storage.addBill(bill)
    return MySQL.insert.await('INSERT INTO bills (target_id, amount) VALUES (?, ?)',
        { bill.target, bill.amount })
end

return storage
```
- Parameterized always (`?`/`:named`) — never concatenation (SQLi).
- No N+1 (`WHERE id IN (?)` / JOIN). `LIMIT` clamped from input. Index filter columns.
- Business logic calls `storage.*`; no inline SQL scattered around.

## Permissions / admin (server-side, ACE/bridge)
```lua
if not Framework.hasGroup(src, { admin = 0 }) then return end
-- or: if not IsPlayerAceAllowed(src, 'command.myadmin') then return end
```

## Startup
```lua
CreateThread(function()
    if not lib.checkDependency('oxmysql', '2.4.0') then return end
    local v = GetResourceMetadata(cache.resource, 'version', 0) or '1.0'
    lib.print.info(('%s v%s started'):format(cache.resource, v))
end)
```

Hard rules: `source` server-resolved; validate every param (type/range/length/NaN);
rate-limit every event/callback; mutex every money/item op; prices server-side; proximity
for world actions; clean source-keyed tables in `playerDropped`; parameterized SQL only.
