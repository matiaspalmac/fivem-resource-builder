Framework, FW = nil, nil

CreateThread(function()
    if GetResourceState('es_extended') == 'started' then
        FW = 'esx'; Framework = exports['es_extended']:getSharedObject()
    elseif GetResourceState('qb-core') == 'started' then
        FW = 'qb'; Framework = exports['qb-core']:GetCoreObject()
    end
end)
