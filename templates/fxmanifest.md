# Manifest & Structure (module architecture, library-agnostic)

Senior architecture: a module system with single entrypoints, JSON locales, and a built
React UI. Standalone by default (ships its own `shared/require.lua`); if the project uses
ox_lib, swap that for `'@ox_lib/init.lua'` — same structure either way.

## Directory tree

```
resource_name/
  .luarc.json            -- fivem-lls-addon + lib defs (LSP)
  fxmanifest.lua
  config.lua             -- return config
  README.md  LICENSE  .gitignore
  data/                  -- static data, each file returns a table (optional)
    *.lua
  locales/               -- JSON, not lua
    en.json              -- base (required)
    es.json ...
  shared/                -- modules shared client+server (optional)
    *.lua
  client/
    init.lua             -- ENTRYPOINT: requires the rest
    state.lua            -- ---@class State; return state
    *.lua                -- modules (return their API)
  server/
    init.lua             -- ENTRYPOINT
    storage.lua          -- DB layer (only if DB), return storage
    *.lua
  web/                   -- only if UI: React + TS + Vite + Tailwind
    package.json  tsconfig.json  vite.config.ts  tailwind.config.ts
    index.html
    src/{App.tsx, main.tsx, hooks/, utils/, store/, typings/, features/, components/}
    build/               -- vite build output
```

## fxmanifest.lua

```lua
fx_version 'cerulean'
use_experimental_fxv2_oal 'yes'
lua54 'yes'
game 'gta5'                       -- 'rdr3' for RedM

name 'resource_name'
author 'Dei'
version '1.0.0'
license 'MIT'
repository 'https://github.com/.../resource_name'

-- dependencies { 'oxmysql' }     -- declare only what you actually require

shared_scripts {
    'shared/require.lua',         -- standalone module loader (ship it)
    'config.lua',
    -- on ox_lib instead: '@ox_lib/init.lua',
}

client_script 'client/init.lua'   -- ONE entrypoint; it require()s the rest
server_script 'server/init.lua'   -- or server_scripts { '@oxmysql/lib/MySQL.lua', 'server/init.lua' }

ui_page 'web/build/index.html'    -- only if UI

files {
    'web/build/index.html',       -- only if UI
    'web/build/**/*',             -- only if UI
    'locales/*.json',
    'data/*.lua',                 -- exposed for require, NOT auto-executed
    'shared/*.lua',
    'client/*.lua',
    'server/*.lua',
}

-- ox_libs { 'locale', 'table' }  -- only if using ox_lib: list the modules you use
```

## Why this shape (not a flat script list)
- **One entrypoint per side.** `client/init.lua`/`server/init.lua` `require` the rest.
  The manifest is not a fragile ordered list of 10 scripts.
- **`files{}` exposes modules** for `require` (`LoadResourceFile`) **without auto-running
  them** — the dependency graph lives in code, not the manifest.
- **`config.lua` in `shared_scripts`**, ends with `return config`.
- **JSON locales** (`locales/*.json`), loaded by `locale()`.

## Rules
- NEVER wildcard *executable* script blocks (`client_scripts { 'client/*.lua' }`); use
  the single `init.lua` entrypoint + `files{}` (the latter is fine — those are loaded by
  require, not executed).
- Sensitive config (webhooks, keys) only server-side.
- Omit any block the resource does not use.
- `.luarc.json` always present (see `templates/architecture.md`).
