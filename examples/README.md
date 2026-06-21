# Example output

`sample_shop/` is what the skill produces when you ask for a basic shop. Every
server event resolves `source` server-side, validates its input, rate-limits,
locks against dupes, reads the price from config (never the client), checks
proximity, and cleans up on `playerDropped`. The client thread is two-tier so it
costs nothing while you are away from the shop.

It is meant to be read, not deployed as-is. Generate your own with:

```
/fivem-resource-builder
```
