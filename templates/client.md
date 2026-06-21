# Client Patterns (modules, cache, proximity without per-frame loops)

Client code is modules loaded from `client/init.lua`. Never an unconditional
`while true do Wait(0) end`. Do proximity with a two-tier conditional thread (standalone)
or a points helper (when the project has ox_lib) — both shown below.

## client/init.lua (entrypoint)
```lua
local config = require 'config'
if not config then return end

local state = require 'client.state'
require 'client.nui'
require 'client.main'
```

## Standalone: two-tier conditional thread (baseline, zero deps)
```lua
local ped = PlayerPedId()          -- cache; refresh on a slow tick, not every frame
CreateThread(function()
    while true do
        local sleep = 1000
        local coords = GetEntityCoords(ped)
        if #(coords - Config.ShopCoords) < 20.0 then
            sleep = 0
            DrawMarker(1, Config.ShopCoords.x, Config.ShopCoords.y, Config.ShopCoords.z - 1.0,
                0,0,0, 0,0,0, 1.0,1.0,1.0, 255,0,0,100, false,false,2)
            if IsControlJustPressed(0, 38) then openShop() end
        end
        Wait(sleep)
    end
end)
CreateThread(function() while true do ped = PlayerPedId(); Wait(1000) end end)  -- refresh cache
```

## On ox_lib: points helper (single coarse loop + spatial grid + on-demand interval)
```lua
local point = lib.points.new({
    coords = Config.ShopCoords, distance = 20.0,
    onEnter = function() lib.showTextUI('[E] Shop') end,
    onExit  = function() lib.hideTextUI() end,
    nearby  = function(self)
        if self.currentDistance < 2.0 and IsControlJustPressed(0, 38) then openShop() end
    end,
})
-- point:remove() on cleanup
```

## Async data: callback await (no `while not done`)
```lua
-- standalone shared/callback util, or ox_lib's lib.callback — same API
local shop = callback.await('shop:getData', false, shopId)   -- suspends the coroutine
```

## NUI open/close + throttle
```lua
local function openUI(data)
    SetNuiFocus(true, true)
    SendNUIMessage({ action = 'setVisible', data = true })
    SendNUIMessage({ action = 'setShop', data = data })
end

local last
local function pushHud(state)                 -- change detection
    local enc = json.encode(state)
    if enc == last then return end
    last = enc
    SendNUIMessage({ action = 'hud', state = state })
end
```

## onResourceStop cleanup (MANDATORY when client mutates game state)
```lua
AddEventHandler('onResourceStop', function(res)
    if res ~= cache.resource then return end
    SetNuiFocus(false, false)
    local ped = PlayerPedId()
    FreezeEntityPosition(ped, false)
    RenderScriptCams(false, false, 0, true, true)
    ClearPedTasks(ped)
    for _, e in pairs(spawnedEntities or {}) do
        if DoesEntityExist(e) then DeleteEntity(e) end
    end
    for _, z in pairs(zones or {}) do if z.remove then z:remove() end end
end)
```
