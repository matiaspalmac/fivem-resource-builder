Framework, FW = nil, nil

CreateThread(function()
    if GetResourceState('es_extended') == 'started' then
        FW = 'esx'
        Framework = exports['es_extended']:getSharedObject()
    elseif GetResourceState('qb-core') == 'started' then
        FW = 'qb'
        Framework = exports['qb-core']:GetCoreObject()
    else
        FW = 'standalone'
    end
end)

function GetPlayer(src)
    if FW == 'esx' then return Framework.GetPlayerFromId(src)
    elseif FW == 'qb' then return Framework.Functions.GetPlayer(src) end
    return nil
end

-- Returns true on success; checks balance, server-side.
function RemoveMoney(src, amount)
    if type(amount) ~= 'number' or amount <= 0 then return false end
    local p = GetPlayer(src)
    if not p then return false end
    if FW == 'esx' then
        if p.getMoney() < amount then return false end
        p.removeMoney(amount); return true
    elseif FW == 'qb' then
        return p.Functions.RemoveMoney('cash', amount)
    end
    return false
end

function GiveItem(src, item, qty)
    local p = GetPlayer(src)
    if not p then return end
    if FW == 'esx' then p.addInventoryItem(item, qty)
    elseif FW == 'qb' then p.Functions.AddItem(item, qty) end
end
