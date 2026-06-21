# ox Ecosystem Patterns (ox_lib, ox_target, ox_inventory)

When `ox_lib` (and friends) are present, prefer these over hand-rolled equivalents. Confirm current APIs at https://coxdocs.dev.

## ox_lib callback (typed, server-validated)

```lua
-- server
lib.callback.register('shop:getStock', function(src, itemId)
    if type(itemId) ~= 'string' then return nil end
    local row = MySQL.single.await('SELECT stock FROM shop WHERE item = ?', { itemId })
    return row and row.stock or 0
end)

-- client
local stock = lib.callback.await('shop:getStock', false, 'water')
```

Treat every `lib.callback.register` like a net event: validate `src` and params server-side.

## ox_target (zones / entities, no marker polling)

```lua
exports.ox_target:addBoxZone({
    coords = Config.ShopCoords,
    size = vec3(2, 2, 2),
    rotation = 0,
    options = {
        { name = 'shop_open', icon = 'fa-solid fa-store', label = 'Open Shop',
          onSelect = function() TriggerServerEvent('shop:open') end },
    }
})
```

Remove zones in `onResourceStop`. The server still re-validates the action (target is client-side).

## ox_inventory (hooks are validation-only)

```lua
-- Register a stash bound to an owner (instance prevents cross-player access)
exports.ox_inventory:RegisterStash('shop_'..shopId, 'Shop', 50, 100000, nil, nil, instanceId)

-- Hooks VALIDATE; never mutate state or write the DB inside a hook (race/dirty-save risk)
exports.ox_inventory:registerHook('swapItems', function(payload)
    if not allowed(payload.source) then return false end
    return true
end)
```

## lib.zones / lib.points (proximity without per-frame work)

```lua
local point = lib.points.new({ coords = Config.ShopCoords, distance = 2.0 })
function point:onEnter() showPrompt() end
function point:onExit() hidePrompt() end
```

## lib.addCommand (ACE-gated commands)

```lua
lib.addCommand('giveitem', { help = 'Give item', restricted = 'group.admin',
    params = { { name = 'target', type = 'playerId' }, { name = 'item', type = 'string' } }
}, function(src, args) GivePlayerItem(args.target, args.item, 1) end)
```

## lib.locale (i18n)

```lua
-- locales/en.json + es.json ; fxmanifest: files { 'locales/*.json' }, ox_lib in shared
lib.locale()                 -- loads based on convar ox:locale
Notify(locale('bought', item.label))   -- locale('key', ...fmt)
```

Prefer `lib.notify`, `lib.progressBar`, `lib.inputDialog`, `lib.cache.ped` over framework-specific or hand-rolled versions when ox_lib is available.
