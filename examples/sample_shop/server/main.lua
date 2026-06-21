-- Secure buy handler: server source, validation, rate limit, mutex,
-- server-authoritative price, proximity check, cleanup on drop.
local locks = {}
local cooldowns = {}

local function rateLimit(src, seconds)
    local now = os.time()
    if cooldowns[src] and now - cooldowns[src] < seconds then return false end
    cooldowns[src] = now
    return true
end

RegisterNetEvent('sample_shop:buy', function(itemId, qty)
    local src = source

    if not rateLimit(src, Config.BuyCooldown) then return end
    if type(itemId) ~= 'string' or #itemId > 32 then return end
    if type(qty) ~= 'number' or qty ~= qty then return end
    qty = math.floor(qty)
    if qty < 1 or qty > Config.MaxQty then return end

    if locks[src] then return end
    locks[src] = true

    local item = Config.Items[itemId]
    if not item then locks[src] = nil return end

    local ped = GetPlayerPed(src)
    if ped == 0 or #(GetEntityCoords(ped) - Config.ShopCoords) > 5.0 then
        locks[src] = nil return
    end

    local total = item.price * qty
    if not RemoveMoney(src, total) then locks[src] = nil return end
    GiveItem(src, itemId, qty)
    locks[src] = nil
end)

AddEventHandler('playerDropped', function()
    local src = source
    locks[src] = nil
    cooldowns[src] = nil
end)

CreateThread(function()
    Wait(500)
    print('^4[Dei]^0 sample_shop v1.0.0 - ^2Iniciado^0')
end)
