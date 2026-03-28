# Minecraft FFA Classes Add-on

A Minecraft Bedrock Edition add-on that adds a 3-class FFA (Free For All) system with custom items, abilities, and upgrade paths.

## Classes

### ⛏ The Dwarf
- **Role:** Miner / Resource Gatherer
- **Passive:** Haste I + Slowness I
- **Tool:** Dwarf Pickaxe (3×3×3 mining, Fortune III, infinite durability)
- **Upgrades:** Base → Iron → Gold → Diamond → Netherite

### ✦ The Wizard
- **Role:** Ranged / Utility
- **Passive:** Slow Falling + Speed I
- **Weapon:** Basic Wand (4♥ magic projectile, 1.5s CD)
- **Spells:** Teleport, Storm, Fire, Nova

### ⚔ The Warrior
- **Role:** Frontline / Melee Brawler
- **Passive:** Resistance I + 4 Extra Hearts
- **Weapons:** Heavy Broadsword (6♥, cleave) + Warrior Shield (damage absorb)
- **Blades:** Knockback, Fire, Dash, Leech

## Installation

1. Run `python3 package_addon.py` to create the `.mcaddon` file
2. Transfer to your device and open with Minecraft
3. Create or edit a world → Add-Ons → Activate both packs
4. **Enable Beta APIs** in world settings (Experiments)
5. Join the world — class selection appears on spawn

## Development

```bash
# Generate item textures
python3 generate_textures.py

# Package for distribution
python3 package_addon.py
```

## Structure

```
BP/                     # Behavior Pack
├── manifest.json
├── scripts/main.js     # All game logic
├── items/              # 16 custom item definitions
└── recipes/            # Upgrade crafting recipes
RP/                     # Resource Pack
├── manifest.json
├── textures/           # Item textures (16×16 pixel art)
└── texts/en_US.lang    # Item display names
```
