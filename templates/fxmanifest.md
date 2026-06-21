# Manifest & Structure

## Directory tree

```
resource_name/
  fxmanifest.lua
  config.lua            -- only values actually used
  README.md
  LICENSE
  .gitignore
  client/
    main.lua
    framework.lua       -- auto-detect + theme/notify bridge
    nui.lua             -- NUI callbacks (only if NUI)
  server/
    main.lua            -- events, validation, startup message
    framework.lua       -- auto-detect + DB wrapper
  html/                 -- only if NUI
    index.html
    assets/{css,js,fonts}
  locales/              -- only if localized
    en.lua
    es.lua
```

## fxmanifest.lua

```lua
fx_version 'cerulean'
game 'gta5'            -- 'rdr3' for RedM
lua54 'yes'

author 'Dei'
description '<what it does>'
version '1.0.0'

-- provide 'esx_resourcename'   -- only if replacing an ESX resource

shared_scripts {
    '@ox_lib/init.lua',         -- only if ox_lib used
    'config.lua',
    'locales/*.lua',            -- only if localized
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',   -- only if DB used
    'server/framework.lua',
    'server/main.lua',
}

client_scripts {
    'client/framework.lua',
    'client/nui.lua',           -- only if NUI
    'client/main.lua',
}

ui_page 'html/index.html'       -- only if NUI

files {                         -- only if NUI
    'html/index.html',
    'html/assets/js/*.js',
    'html/assets/css/*.css',
    'html/assets/fonts/*.ttf',
}

dependencies {                  -- declare what you actually require
    'oxmysql',
    -- 'ox_lib',
    -- 'es_extended',
}
```

Rules:
- NEVER wildcard script includes (`server/*.lua`) — list files explicitly (injection surface).
- Order: shared → framework → main; client framework → nui → main.
- Sensitive config (webhooks, keys) only in `server_scripts`, never shared/client.
- Omit any block the resource does not use. No dead manifest entries.
