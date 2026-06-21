# Client Patterns

## Conditional thread (never unconditional Wait(0))

```lua
local function nearShop()
    return #(GetEntityCoords(cache and cache.ped or PlayerPedId()) - Config.ShopCoords) < 20.0
end

CreateThread(function()
    while true do
        local sleep = 1000
        if nearShop() then
            sleep = 0
            DrawMarker(1, Config.ShopCoords.x, Config.ShopCoords.y, Config.ShopCoords.z - 1.0,
                0,0,0, 0,0,0, 1.0,1.0,1.0, 255,0,0,100, false,false,2)
            if IsControlJustPressed(0, 38) then  -- E
                TriggerServerEvent('shop:buy', 'water', 1)  -- intent only
            end
        end
        Wait(sleep)
    end
end)
```

Prefer `ox_target` / `lib.zones` / `RegisterKeyMapping` over DrawMarker polling when available.

## Native caching

```lua
local hasOxLib = GetResourceState('ox_lib') == 'started'
-- inside frame: local ped = cache.ped or PlayerPedId()  (cache once, reuse)
```

## NUI open/close

```lua
local nuiOpen = false
local function openUI(data)
    if nuiOpen then return end
    nuiOpen = true
    SetNuiFocus(true, true)
    SendNUIMessage({ action = 'open', data = data })
end
local function closeUI()
    nuiOpen = false
    SetNuiFocus(false, false)
    SendNUIMessage({ action = 'close' })
end
```

## SendNUIMessage throttle (change detection)

```lua
local last
local function pushHud(state)
    local enc = json.encode(state)
    if enc == last then return end   -- skip if unchanged
    last = enc
    SendNUIMessage({ action = 'hud', state = state })
end
```

## onResourceStop cleanup (MANDATORY when client mutates game state)

```lua
AddEventHandler('onResourceStop', function(res)
    if res ~= GetCurrentResourceName() then return end
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
