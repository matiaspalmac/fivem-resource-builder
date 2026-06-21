-- Two-tier thread: cheap when far, only draws the marker when near.
CreateThread(function()
    while true do
        local sleep = 1000
        local coords = GetEntityCoords(cache and cache.ped or PlayerPedId())
        local dist = #(coords - Config.ShopCoords)
        if dist < 20.0 then
            sleep = 0
            DrawMarker(1, Config.ShopCoords.x, Config.ShopCoords.y, Config.ShopCoords.z - 1.0,
                0,0,0, 0,0,0, 1.0,1.0,1.0, 0,150,255,100, false,false,2)
            if dist < 2.0 and IsControlJustPressed(0, 38) then -- E
                TriggerServerEvent('sample_shop:buy', 'water', 1) -- intent only; server owns the price
            end
        end
        Wait(sleep)
    end
end)
