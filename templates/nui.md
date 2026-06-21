# NUI Scaffold (XSS-safe, preview mode)

## client/nui.lua — callbacks (validate, intent-only)

```lua
RegisterNUICallback('buy', function(data, cb)
    -- send only intent to the server; server owns the price
    if type(data.item) == 'string' then
        TriggerServerEvent('shop:buy', data.item, tonumber(data.qty) or 1)
    end
    cb({ ok = true })
end)

RegisterNUICallback('close', function(_, cb)
    SetNuiFocus(false, false)
    cb({ ok = true })
end)
```

## html/index.html

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta http-equiv="Content-Security-Policy"
        content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'">
  <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
  <div id="app" class="hidden"></div>
  <script src="assets/js/app.js"></script>
</body>
</html>
```

## html/assets/js/app.js — preview mode + XSS-safe render

```js
const IS_BROWSER = !window.invokeNative;          // true when opened directly in a browser
const app = document.getElementById('app');

function escapeText(s) {                            // XSS-safe: textContent, never innerHTML with data
  const d = document.createElement('div');
  d.textContent = String(s);
  return d.textContent;
}

function render(item) {
  app.textContent = '';                            // clear
  const row = document.createElement('div');
  row.className = 'row';
  row.textContent = escapeText(item.label) + ' - $' + Number(item.price);  // safe
  app.appendChild(row);
}

window.addEventListener('message', (e) => {
  const msg = e.data || {};
  if (msg.action === 'open') { app.classList.remove('hidden'); (msg.data?.items || []).forEach(render); }
  if (msg.action === 'close') { app.classList.add('hidden'); }
});

function post(name, body) {
  if (IS_BROWSER) return;                          // no-op in preview
  fetch(`https://${GetParentResourceName()}/${name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {})
  });
}

document.addEventListener('keydown', (e) => { if (e.key === 'Escape') post('close'); });

if (IS_BROWSER) {                                  // mock data for browser testing
  app.classList.remove('hidden');
  render({ label: 'Water', price: 5 });
}
```

NUI rules:
- NEVER `innerHTML` with server/player data — use `textContent` / the `escapeText` helper.
- Callbacks send INTENT (item id, action), never prices/amounts.
- Validate `e.data` shape; ignore unexpected messages.
- Always provide `IS_BROWSER` preview so the UI can be designed without launching the game.
- Recommend `nui_callback_strict_mode 'true'` in the manifest.
