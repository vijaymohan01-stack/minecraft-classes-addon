# Session Context

## Last Updated
- **Date:** 2026-03-28
- **Tool:** Antigravity (Google Gemini)
- **Session:** Full rebuild and iterative fixes (v2.1 → v6)

## What Was Done
1. **Root cause fix:** API version mismatch (`@minecraft/server-ui` `2.0.0` → `1.3.0`, `@minecraft/server` `1.13.0` → `1.12.0`), removed conflicting `data` module from BP manifest
2. **Class selection UI:** Wrapped forms in `system.run()` with `UserBusy` retry, increased spawn delay for iPad
3. **Item restrictions:** Fixed `enforceItemRestrictions()` to block classless players
4. **Warrior shield:** Removed entirely per user request
5. **Wand projectile:** Changed from `summon` (zero velocity) to `spawnEntity()` + `applyImpulse()` for real flying projectiles (basic wand = arrow, fire wand = small_fireball)
6. **Broadsword damage:** Reduced from ~21 total to ~10 (JSON: 6, script: +4, cleave: 3)
7. **Pickaxe damage:** Scales with tier (3→4→5→6→7), mining-focused
8. **Creative menu:** Items hidden → restored to Equipment category with proper grouping
9. **Crafting:** Added `is_hidden_in_commands: false` so custom items work as recipe ingredients
10. **Versioning:** Bumped through v3→v6 with fresh UUIDs each time to avoid Minecraft duplicate pack issues

## Files Changed
- `BP/manifest.json` — API versions, fresh UUIDs, v6
- `BP/scripts/main.js` — Complete rewrite with all fixes
- `BP/items/*.json` (×15) — Damage, durability, menu category, is_hidden_in_commands
- `BP/items/warrior_shield.json` — Deleted
- `RP/manifest.json` — Fresh UUIDs, v6
- `RP/textures/items/*.png` (×15) — Regenerated pixel art (shield deleted)
- `RP/textures/item_texture.json` — Shield entry removed
- `RP/texts/en_US.lang` — Shield entry removed
- `package_addon.py` — Output filename updated to v6
- `README.md`, `.gitignore`, `context/SESSION_CONTEXT.md` — New

## Current State
- Latest version: **v6** (`FFA_Classes_v6.mcaddon`)
- GitHub repo: https://github.com/vijaymohan01-stack/minecraft-classes-addon
- Pack name in-game: "⚔ FFA Class Wars v6 ⚔"

## Known Issues / Next Steps
- Storm wand uses `summon lightning_bolt` (may need same `spawnEntity` fix if it doesn't work)
- Teleport/Nova wand untested this session
- Pickaxe 3×3×3 mining untested this session
- If crafting still broken, may need to bump recipe `format_version` from `1.20.10` to `1.21.0`
- Textures are functional but minimal (~120 bytes each) — could use hand-drawn or AI-generated art
