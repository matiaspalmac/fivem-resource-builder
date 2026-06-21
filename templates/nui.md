# NUI Scaffold — React + TypeScript + Vite + Tailwind

Default UI stack: React + TS + Vite, built to `web/build`. Styling is Tailwind, state is
Zustand. The Lua↔NUI contract is typed and there is a browser dev mode (HMR, mock data) so
the UI is built without launching the game.

> For a tiny/no-UI resource, prefer ox_lib menus (`lib.registerContext`,
> `lib.inputDialog`, `lib.alertDialog`) instead of a full React app.

## web/package.json

```json
{
  "private": true,
  "scripts": {
    "start": "vite",
    "build": "tsc && vite build",
    "start:game": "vite build --watch",
    "preview": "vite preview"
  },
  "dependencies": { "react": "^19", "react-dom": "^19", "zustand": "^4" },
  "devDependencies": {
    "@vitejs/plugin-react": "^4", "typescript": "^5", "vite": "^5",
    "tailwindcss": "^3", "postcss": "^8", "autoprefixer": "^10",
    "@types/react": "^19", "@types/react-dom": "^19", "prettier": "^3"
  }
}
```

`vite.config.ts`: `base: './'`, `build: { outDir: 'build' }`, `plugins: [react()]`.

## utils/misc.ts
```ts
export const isEnvBrowser = (): boolean => !(window as any).invokeNative;
export const noop = () => {};
```

## utils/fetchNui.ts (NUI → Lua, typed, browser-safe)
```ts
import { isEnvBrowser } from './misc';

export async function fetchNui<T = unknown>(event: string, data?: unknown, mock?: T): Promise<T> {
  if (isEnvBrowser()) return mock as T;                       // dev in browser
  const resource = (window as any).GetParentResourceName?.() ?? 'resource_name';
  const resp = await fetch(`https://${resource}/${event}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(data ?? {}),
  });
  return resp.json();
}
```

## hooks/useNuiEvent.ts (Lua → NUI, typed, ref-stable)
```ts
import { useEffect, useRef } from 'react';
type Handler<T> = (data: T) => void;
export const useNuiEvent = <T = unknown>(action: string, handler: Handler<T>) => {
  const saved = useRef<Handler<T>>(handler);
  useEffect(() => { saved.current = handler; }, [handler]);
  useEffect(() => {
    const listener = (e: MessageEvent) => {
      if (e.data?.action === action) saved.current(e.data.data);
    };
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }, [action]);
};
```

## hooks/useExitListener.ts (Escape → close)
```ts
import { useEffect } from 'react';
import { fetchNui } from '../utils/fetchNui';
export const useExitListener = (setVisible: (v: boolean) => void) => {
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.code === 'Escape') { setVisible(false); fetchNui('exit'); }
    };
    window.addEventListener('keyup', h);
    return () => window.removeEventListener('keyup', h);
  }, [setVisible]);
};
```

## utils/debugData.ts (dev mock — emulate SendNUIMessage in browser)
```ts
import { isEnvBrowser } from './misc';
interface DebugEvent<T> { action: string; data: T }
export const debugData = <T>(events: DebugEvent<T>[], timer = 500): void => {
  if (import.meta.env.DEV && isEnvBrowser()) {
    events.forEach((ev) => setTimeout(() =>
      window.dispatchEvent(new MessageEvent('message', { data: ev })), timer));
  }
};
```

## App.tsx
```tsx
import { useState } from 'react';
import { useNuiEvent } from './hooks/useNuiEvent';
import { useExitListener } from './hooks/useExitListener';
import { fetchNui } from './utils/fetchNui';
import { debugData } from './utils/debugData';

debugData([{ action: 'setVisible', data: true }]);   // dev-only

export default function App() {
  const [visible, setVisible] = useState(false);
  useNuiEvent<boolean>('setVisible', setVisible);
  useExitListener(setVisible);
  if (!visible) return null;
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="rounded-2xl bg-neutral-900/90 p-6 text-white shadow-xl">
        <button className="rounded-lg bg-blue-600 px-4 py-2"
          onClick={() => fetchNui('buy', { item: 'water', qty: 1 })}>Buy</button>
      </div>
    </div>
  );
}
```

## client/nui.lua (Lua side)
```lua
RegisterNUICallback('buy', function(data, cb)
    -- intent only; server owns price/validation
    -- callback = standalone shared/callback util, or ox_lib's lib.callback
    local ok = callback.await('resource:buy', false, data.item, tonumber(data.qty) or 1)
    cb(ok)
end)
RegisterNUICallback('exit', function(_, cb)
    SetNuiFocus(false, false)
    cb(1)
end)

local function open(data)
    SetNuiFocus(true, true)
    SendNUIMessage({ action = 'setVisible', data = true })
    SendNUIMessage({ action = 'setShop', data = data })
end
```

## server boot guard
```lua
if not LoadResourceFile(cache.resource, 'web/build/index.html') then
    error('UI not built. Run `cd web && npm i && npm run build`.')
end
```

NUI rules:
- JSX/`textContent` auto-escape; `dangerouslySetInnerHTML` only with dompurify.
- Callbacks send INTENT (item id, action), never price/amount; server validates.
- `typings/` holds the interfaces shared with Lua (one contract).
- Always ship `debugData` + `isEnvBrowser` so the UI runs in the browser with HMR.
