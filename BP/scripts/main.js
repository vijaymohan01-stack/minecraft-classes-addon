// ============================================================
// FFA Class System — Main Entry Point (v3)
// Minecraft Bedrock Edition Behavior Pack Script
// ============================================================
import { world, system, ItemStack } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";

// ══════════════════════════════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════════════════════════════

const CLASS_KEYS = ["dwarf", "wizard", "warrior"];

const CLASS_INFO = {
    dwarf: {
        name: "§6⛏ The Dwarf",
        desc: [
            "§7Role: §eMiner / Resource Gatherer",
            "",
            "§fPassive: §aHaste I §7+ §cSlowness I",
            "§fTool: §6Dwarf Pickaxe §7(3×3×3 mining, Fortune III, ∞ durability)",
            "§fUpgrades: §7Iron → Gold → Diamond → Netherite (faster mining)",
            "",
            "§7Only Dwarves can use Dwarf Pickaxes."
        ].join("\n")
    },
    wizard: {
        name: "§5✦ The Wizard",
        desc: [
            "§7Role: §eRanged / Utility",
            "",
            "§fPassive: §aSlow Falling §7+ §bSpeed I",
            "§fWeapon: §5Basic Wand §7(4♥ projectile, 1.5s CD)",
            "§fSpell Upgrades:",
            "  §d• Teleport Wand §7(Ender Pearl ×8) — 5s CD",
            "  §9• Storm Wand §7(Amethyst ×8) — 8s CD",
            "  §c• Fire Wand §7(Blaze Powder ×8) — 3s CD",
            "  §d• Nova Wand §7(Ghast Tear ×8) — 12s CD",
            "",
            "§7Only Wizards can wield wands."
        ].join("\n")
    },
    warrior: {
        name: "§c⚔ The Warrior",
        desc: [
            "§7Role: §eFrontline / Melee Brawler",
            "",
            "§fPassive: §aResistance I §7+ §c+4 Extra Hearts",
            "§fWeapon: §cHeavy Broadsword §7(6♥, cleave)",
            "§fBlade Upgrades:",
            "  §f• Knockback §7(Iron Block ×8)",
            "  §6• Fire Aspect §7(Magma Cream ×8)",
            "  §a• Dash Blade §7(Phantom Membrane ×8)",
            "  §4• Leech Blade §7(Wither Skull ×1)",
            "",
            "§7Only Warriors can wield Broadswords."
        ].join("\n")
    }
};

// Item → class mapping for restriction
const ITEM_CLASS_MAP = {
    "classes:dwarf_pickaxe_base": "dwarf",
    "classes:dwarf_pickaxe_iron": "dwarf",
    "classes:dwarf_pickaxe_gold": "dwarf",
    "classes:dwarf_pickaxe_diamond": "dwarf",
    "classes:dwarf_pickaxe_netherite": "dwarf",
    "classes:basic_wand": "wizard",
    "classes:teleport_wand": "wizard",
    "classes:storm_wand": "wizard",
    "classes:fire_wand": "wizard",
    "classes:nova_wand": "wizard",
    "classes:heavy_broadsword": "warrior",
    "classes:broadsword_knockback": "warrior",
    "classes:broadsword_fire": "warrior",
    "classes:broadsword_dash": "warrior",
    "classes:broadsword_leech": "warrior"
};

// Class tool IDs for death/respawn preservation
const CLASS_TOOL_IDS = {
    dwarf: [
        "classes:dwarf_pickaxe_base", "classes:dwarf_pickaxe_iron",
        "classes:dwarf_pickaxe_gold", "classes:dwarf_pickaxe_diamond",
        "classes:dwarf_pickaxe_netherite"
    ],
    wizard: [
        "classes:basic_wand", "classes:teleport_wand",
        "classes:storm_wand", "classes:fire_wand", "classes:nova_wand"
    ],
    warrior: [
        "classes:heavy_broadsword", "classes:broadsword_knockback",
        "classes:broadsword_fire", "classes:broadsword_dash",
        "classes:broadsword_leech"
    ]
};

const CLASS_STARTER_GEAR = {
    dwarf: [{ item: "classes:dwarf_pickaxe_base", slot: 0 }],
    wizard: [{ item: "classes:basic_wand", slot: 0 }],
    warrior: [
        { item: "classes:heavy_broadsword", slot: 0 }
    ]
};

// Pickaxe tiers
const PICKAXE_TIERS = {
    "classes:dwarf_pickaxe_base": { tier: 0 },
    "classes:dwarf_pickaxe_iron": { tier: 1 },
    "classes:dwarf_pickaxe_gold": { tier: 2 },
    "classes:dwarf_pickaxe_diamond": { tier: 3 },
    "classes:dwarf_pickaxe_netherite": { tier: 4 }
};

// Fortune ores
const FORTUNE_ORES = {
    "minecraft:diamond_ore": { drop: "minecraft:diamond", min: 1, max: 3 },
    "minecraft:deepslate_diamond_ore": { drop: "minecraft:diamond", min: 1, max: 3 },
    "minecraft:coal_ore": { drop: "minecraft:coal", min: 1, max: 3 },
    "minecraft:deepslate_coal_ore": { drop: "minecraft:coal", min: 1, max: 3 },
    "minecraft:iron_ore": { drop: "minecraft:raw_iron", min: 1, max: 2 },
    "minecraft:deepslate_iron_ore": { drop: "minecraft:raw_iron", min: 1, max: 2 },
    "minecraft:gold_ore": { drop: "minecraft:raw_gold", min: 1, max: 2 },
    "minecraft:deepslate_gold_ore": { drop: "minecraft:raw_gold", min: 1, max: 2 },
    "minecraft:copper_ore": { drop: "minecraft:raw_copper", min: 2, max: 4 },
    "minecraft:deepslate_copper_ore": { drop: "minecraft:raw_copper", min: 2, max: 4 },
    "minecraft:lapis_lazuli_ore": { drop: "minecraft:lapis_lazuli", min: 2, max: 6 },
    "minecraft:deepslate_lapis_lazuli_ore": { drop: "minecraft:lapis_lazuli", min: 2, max: 6 },
    "minecraft:redstone_ore": { drop: "minecraft:redstone", min: 1, max: 4 },
    "minecraft:deepslate_redstone_ore": { drop: "minecraft:redstone", min: 1, max: 4 },
    "minecraft:emerald_ore": { drop: "minecraft:emerald", min: 1, max: 2 },
    "minecraft:deepslate_emerald_ore": { drop: "minecraft:emerald", min: 1, max: 2 },
    "minecraft:nether_quartz_ore": { drop: "minecraft:quartz", min: 1, max: 3 },
    "minecraft:nether_gold_ore": { drop: "minecraft:gold_nugget", min: 2, max: 5 }
};

const PROTECTED_BLOCKS = new Set([
    "minecraft:bedrock", "minecraft:barrier", "minecraft:command_block",
    "minecraft:chain_command_block", "minecraft:repeating_command_block",
    "minecraft:structure_block", "minecraft:structure_void", "minecraft:air"
]);

const WAND_TYPES = {
    "classes:basic_wand": "basic",
    "classes:teleport_wand": "teleport",
    "classes:storm_wand": "storm",
    "classes:fire_wand": "fire",
    "classes:nova_wand": "nova"
};

const BROADSWORD_TYPES = {
    "classes:heavy_broadsword": "base",
    "classes:broadsword_knockback": "knockback",
    "classes:broadsword_fire": "fire",
    "classes:broadsword_dash": "dash",
    "classes:broadsword_leech": "leech"
};

// ══════════════════════════════════════════════════════════════
// CLASS SELECTION UI
// ══════════════════════════════════════════════════════════════

function showClassMenu(player, isRespawn) {
    // Must run outside of read-only callback context
    system.run(() => {
        const form = new ActionFormData()
            .title("§l§b⚔ Choose Your Class ⚔")
            .body(isRespawn
                ? "§eYou have fallen!\n§7Pick a class.\n§a(Same class = keep your tool)"
                : "§eWelcome!\n§7Choose your class.");

        for (const key of CLASS_KEYS) {
            form.button(CLASS_INFO[key].name);
        }

        form.show(player).then((response) => {
            if (response.cancelationReason === "UserBusy") {
                // Player is in another UI or not ready — retry
                system.runTimeout(() => showClassMenu(player, isRespawn), 20);
                return;
            }
            if (response.canceled) {
                // Player dismissed — force re-show after delay
                system.runTimeout(() => showClassMenu(player, isRespawn), 40);
                return;
            }
            const selected = CLASS_KEYS[response.selection];
            showClassConfirm(player, selected, isRespawn);
        }).catch((err) => {
            console.warn(`[ClassMenu] Error: ${err}`);
            system.runTimeout(() => showClassMenu(player, isRespawn), 60);
        });
    });
}

function showClassConfirm(player, selectedClass, isRespawn) {
    system.run(() => {
        const info = CLASS_INFO[selectedClass];
        const form = new ActionFormData()
            .title(info.name)
            .body(info.desc)
            .button("§a✓ Confirm")
            .button("§c✗ Go Back");

        form.show(player).then((response) => {
            if (response.cancelationReason === "UserBusy") {
                system.runTimeout(() => showClassConfirm(player, selectedClass, isRespawn), 20);
                return;
            }
            if (response.canceled || response.selection === 1) {
                system.runTimeout(() => showClassMenu(player, isRespawn), 5);
                return;
            }
            applyClass(player, selectedClass, isRespawn);
        }).catch((err) => {
            console.warn(`[ClassConfirm] Error: ${err}`);
            system.runTimeout(() => showClassMenu(player, isRespawn), 40);
        });
    });
}

function applyClass(player, selectedClass, isRespawn) {
    const previousClass = player.getDynamicProperty("playerClass");

    // Clear old effects
    clearEffects(player);

    // Store new class
    player.setDynamicProperty("playerClass", selectedClass);

    // Give gear
    giveClassGear(player, selectedClass, previousClass, isRespawn);

    // Apply effects
    applyEffects(player, selectedClass);

    // Announce
    player.sendMessage(`§aYou are now ${CLASS_INFO[selectedClass].name}§a!`);
    world.sendMessage(`§7${player.name} §bis now ${CLASS_INFO[selectedClass].name}§b!`);
}

// ══════════════════════════════════════════════════════════════
// EFFECTS SYSTEM
// ══════════════════════════════════════════════════════════════

function applyEffects(player, className) {
    try {
        switch (className) {
            case "dwarf":
                player.addEffect("haste", 600, { amplifier: 0, showParticles: false });
                player.addEffect("slowness", 600, { amplifier: 0, showParticles: false });
                break;
            case "wizard":
                player.addEffect("slow_falling", 600, { amplifier: 0, showParticles: false });
                player.addEffect("speed", 600, { amplifier: 0, showParticles: false });
                break;
            case "warrior":
                player.addEffect("resistance", 600, { amplifier: 0, showParticles: false });
                try {
                    player.runCommandAsync("attribute @s minecraft:health.max base set 28");
                } catch (e) {
                    // Fallback: use effect for extra health
                    player.addEffect("health_boost", 600, { amplifier: 1, showParticles: false });
                }
                break;
        }
    } catch (e) {
        console.warn(`[Effects] ${e}`);
    }
}

function clearEffects(player) {
    try {
        const effectsToRemove = ["haste", "slowness", "slow_falling", "speed", "resistance", "health_boost"];
        for (const effect of effectsToRemove) {
            try { player.removeEffect(effect); } catch (e) {}
        }
        try {
            player.runCommandAsync("attribute @s minecraft:health.max base set 20");
        } catch (e) {}
    } catch (e) {}
}

// ══════════════════════════════════════════════════════════════
// GEAR SYSTEM
// ══════════════════════════════════════════════════════════════

function giveClassGear(player, newClass, previousClass, isRespawn) {
    try {
        const inventory = player.getComponent("minecraft:inventory");
        if (!inventory) return;
        const container = inventory.container;

        // If same class on respawn, try to restore upgraded tool
        if (isRespawn && newClass === previousClass) {
            const savedToolId = player.getDynamicProperty("savedClassTool");
            if (savedToolId) {
                try {
                    container.setItem(0, new ItemStack(savedToolId, 1));
                    if (newClass === "warrior") {
                        container.setItem(1, new ItemStack("classes:warrior_shield", 1));
                    }
                    player.sendMessage("§a[Class] §7Your upgraded tool has been restored!");
                    return;
                } catch (e) {
                    console.warn(`[Gear] Restore error: ${e}`);
                }
            }
        }

        // Clear saved tool on class switch
        player.setDynamicProperty("savedClassTool", undefined);

        // Strip any existing class items first
        if (container) {
            for (let i = 0; i < container.size; i++) {
                const item = container.getItem(i);
                if (item && ITEM_CLASS_MAP[item.typeId]) {
                    container.setItem(i, undefined);
                }
            }
        }

        // Give starter gear
        const gear = CLASS_STARTER_GEAR[newClass];
        if (gear) {
            for (const g of gear) {
                try {
                    container.setItem(g.slot, new ItemStack(g.item, 1));
                } catch (e) {
                    // Fallback: give via commands
                    player.runCommandAsync(`give @s ${g.item} 1`);
                }
            }
        }
    } catch (e) {
        console.warn(`[Gear] ${e}`);
        // Fallback: give via commands
        const gear = CLASS_STARTER_GEAR[newClass];
        if (gear) {
            for (const g of gear) {
                player.runCommandAsync(`give @s ${g.item} 1`);
            }
        }
    }
}

// ══════════════════════════════════════════════════════════════
// ITEM RESTRICTION (fixes issue #4)
// ══════════════════════════════════════════════════════════════

function enforceItemRestrictions(player) {
    const playerClass = player.getDynamicProperty("playerClass");

    try {
        const inventory = player.getComponent("minecraft:inventory");
        if (!inventory || !inventory.container) return;
        const container = inventory.container;

        for (let i = 0; i < container.size; i++) {
            const item = container.getItem(i);
            if (!item) continue;

            const requiredClass = ITEM_CLASS_MAP[item.typeId];
            if (!requiredClass) continue; // Not a class item

            // No class yet — remove ALL class items
            if (!playerClass) {
                container.setItem(i, undefined);
                player.sendMessage(`§c[Class Lock] §7Choose a class first!`);
                continue;
            }

            // Wrong class — remove the item
            if (requiredClass !== playerClass) {
                container.setItem(i, undefined);
                player.sendMessage(`§c[Class Lock] §7${item.typeId.split(":")[1]} belongs to §e${requiredClass}§7!`);
            }
        }
    } catch (e) {}
}

// ══════════════════════════════════════════════════════════════
// DWARF MECHANICS — 3×3×3 Mining + Fortune III
// ══════════════════════════════════════════════════════════════

let _isMining = false;

function mine3x3x3(player, blockLocation, dimension, tier) {
    if (_isMining) return;
    _isMining = true;

    const cx = blockLocation.x, cy = blockLocation.y, cz = blockLocation.z;
    let blocks = [];

    for (let dx = -1; dx <= 1; dx++)
        for (let dy = -1; dy <= 1; dy++)
            for (let dz = -1; dz <= 1; dz++) {
                if (dx === 0 && dy === 0 && dz === 0) continue;
                blocks.push({ x: cx + dx, y: cy + dy, z: cz + dz });
            }

    const ticksPerBatch = Math.max(1, 5 - tier);
    const perBatch = Math.ceil(blocks.length / Math.max(1, ticksPerBatch));

    let idx = 0;
    function breakBatch() {
        const end = Math.min(idx + perBatch, blocks.length);
        for (let i = idx; i < end; i++) {
            const pos = blocks[i];
            try {
                const block = dimension.getBlock(pos);
                if (!block || PROTECTED_BLOCKS.has(block.typeId) || block.typeId === "minecraft:air") continue;

                const fortune = FORTUNE_ORES[block.typeId];
                if (fortune) applyFortune(dimension, pos, fortune);

                dimension.runCommand(`setblock ${pos.x} ${pos.y} ${pos.z} air destroy`);
            } catch (e) {}
        }
        idx = end;
        if (idx < blocks.length) system.runTimeout(breakBatch, 1);
        else _isMining = false;
    }
    system.runTimeout(breakBatch, 1);
}

function applyFortune(dimension, pos, fortune) {
    const extra = Math.floor(Math.random() * (fortune.max - fortune.min + 1)) + fortune.min;
    if (extra > 0) {
        try {
            // Give items to nearby players
            for (let i = 0; i < extra; i++) {
                dimension.runCommand(
                    `give @a[r=5,x=${pos.x},y=${pos.y},z=${pos.z}] ${fortune.drop} 1`
                );
            }
        } catch (e) {}
    }
}

// ══════════════════════════════════════════════════════════════
// WIZARD MECHANICS — Wand Spells
// ══════════════════════════════════════════════════════════════

const wandCooldowns = new Map();

function isWandOnCooldown(player, wandType) {
    const key = player.name;
    if (!wandCooldowns.has(key)) wandCooldowns.set(key, {});
    const cds = wandCooldowns.get(key);
    const now = system.currentTick;
    const cdTicks = { basic: 30, teleport: 100, storm: 160, fire: 60, nova: 240 }[wandType] || 40;

    if (cds[wandType] && (now - cds[wandType]) < cdTicks) {
        const remain = ((cdTicks - (now - cds[wandType])) / 20).toFixed(1);
        player.sendMessage(`§c[CD] §7Wait §e${remain}s`);
        return true;
    }
    cds[wandType] = now;
    return false;
}

function castBasicWand(player) {
    if (isWandOnCooldown(player, "basic")) return;
    try {
        const hd = player.getHeadLocation();
        const vd = player.getViewDirection();
        const speed = 2.0;

        // Spawn position slightly ahead of player
        const spawnPos = {
            x: hd.x + vd.x * 2,
            y: hd.y + vd.y * 2,
            z: hd.z + vd.z * 2
        };

        // Spawn a real projectile entity and give it velocity
        try {
            const projectile = player.dimension.spawnEntity("minecraft:arrow", spawnPos);
            projectile.applyImpulse({
                x: vd.x * speed,
                y: vd.y * speed,
                z: vd.z * speed
            });
        } catch (e) {
            // Fallback: just use particles
            console.warn(`[Wand] Projectile spawn failed: ${e}`);
        }

        // Hitscan damage as backup (instant hit)
        const entities = player.getEntitiesFromViewDirection({ maxDistance: 50 });
        if (entities && entities.length > 0) {
            const target = entities[0].entity;
            if (target.id !== player.id) {
                target.applyDamage(8, { cause: "magic" });
                player.sendMessage("§5✦ §7Magic bolt hits!");
            }
        }

        // Particle trail along the path
        for (let i = 1; i <= 5; i++) {
            const px = hd.x + vd.x * i * 3;
            const py = hd.y + vd.y * i * 3;
            const pz = hd.z + vd.z * i * 3;
            player.dimension.runCommand(
                `particle minecraft:dragon_breath_trail ${px} ${py} ${pz}`
            );
        }

        player.playSound("mob.evocation_illager.cast_spell");
    } catch (e) { console.warn(`[Wand] ${e}`); }
}

function castTeleportWand(player) {
    if (isWandOnCooldown(player, "teleport")) return;
    try {
        const block = player.getBlockFromViewDirection({ maxDistance: 100 });
        if (!block) {
            player.sendMessage("§c[Wand] §7No block in range!");
            wandCooldowns.get(player.name)["teleport"] = 0;
            return;
        }
        const tp = block.block.location;
        player.teleport({ x: tp.x + 0.5, y: tp.y + 1, z: tp.z + 0.5 });
        player.playSound("mob.endermen.portal");
        player.sendMessage("§d✦ §7Teleported!");
    } catch (e) { console.warn(`[Wand] ${e}`); }
}

function castStormWand(player) {
    if (isWandOnCooldown(player, "storm")) return;
    try {
        const block = player.getBlockFromViewDirection({ maxDistance: 80 });
        if (!block) {
            player.sendMessage("§c[Wand] §7No target!");
            wandCooldowns.get(player.name)["storm"] = 0;
            return;
        }
        const tp = block.block.location;
        player.dimension.runCommand(`summon lightning_bolt ${tp.x} ${tp.y + 1} ${tp.z}`);
        player.playSound("ambient.weather.thunder");
        player.sendMessage("§9⚡ §7Lightning strikes!");
    } catch (e) { console.warn(`[Wand] ${e}`); }
}

function castFireWand(player) {
    if (isWandOnCooldown(player, "fire")) return;
    try {
        const hd = player.getHeadLocation();
        const vd = player.getViewDirection();
        const sp = { x: hd.x + vd.x * 2, y: hd.y + vd.y * 2, z: hd.z + vd.z * 2 };
        player.dimension.runCommand(`summon small_fireball ${sp.x} ${sp.y} ${sp.z}`);

        const entities = player.getEntitiesFromViewDirection({ maxDistance: 60 });
        if (entities && entities.length > 0) {
            const target = entities[0].entity;
            if (target.id !== player.id) {
                target.setOnFire(8, true);
                target.applyDamage(4, { cause: "fire" });
            }
        }
        player.playSound("mob.blaze.shoot");
        player.sendMessage("§c🔥 §7Fireball!");
    } catch (e) { console.warn(`[Wand] ${e}`); }
}

function castNovaWand(player) {
    if (isWandOnCooldown(player, "nova")) return;
    try {
        const pos = player.location;

        // Heal self
        player.runCommandAsync("effect @s instant_health 1 0 true");

        // Damage nearby
        const nearby = player.dimension.getEntities({
            location: pos, maxDistance: 8, excludeNames: [player.name]
        });
        for (const entity of nearby) {
            try {
                entity.applyDamage(8, { cause: "magic" });
            } catch (e) {}
        }

        player.dimension.runCommand(`particle minecraft:totem_particle ${pos.x} ${pos.y + 1} ${pos.z}`);
        player.playSound("mob.guardian.elder.curse");
        player.sendMessage(`§d✦ §7Nova! Healed §a2♥§7, hit §c${nearby.length}§7 targets!`);
    } catch (e) { console.warn(`[Wand] ${e}`); }
}

// ══════════════════════════════════════════════════════════════
// WARRIOR MECHANICS — Cleave + Upgrades
// ══════════════════════════════════════════════════════════════

function handleBroadswordHit(attacker, target, swordType) {
    // Apply 12 damage (6 hearts) total — base hit + extra
    try { target.applyDamage(11); } catch (e) {}

    // Cleave — damage nearby enemies
    try {
        const nearby = attacker.dimension.getEntities({
            location: target.location, maxDistance: 3,
            excludeNames: [attacker.name]
        });
        for (const ent of nearby) {
            if (ent.id === target.id) continue;
            try { ent.applyDamage(8); } catch (e) {}
        }

        attacker.dimension.runCommand(
            `particle minecraft:crit_emitter ${target.location.x} ${target.location.y + 0.5} ${target.location.z}`
        );
    } catch (e) {}

    // Upgrade effects
    switch (swordType) {
        case "knockback":
            try {
                const dx = target.location.x - attacker.location.x;
                const dz = target.location.z - attacker.location.z;
                const dist = Math.sqrt(dx * dx + dz * dz) || 1;
                target.applyKnockback(dx / dist, dz / dist, 2.5, 0.4);
            } catch (e) {}
            break;
        case "fire":
            try { target.setOnFire(8, true); } catch (e) {}
            break;
        case "dash":
            try { attacker.addEffect("speed", 60, { amplifier: 1, showParticles: true }); } catch (e) {}
            break;
        case "leech":
            try { attacker.runCommandAsync("effect @s instant_health 1 0 true"); } catch (e) {}
            break;
    }
}

// ══════════════════════════════════════════════════════════════
// DEATH HANDLER
// ══════════════════════════════════════════════════════════════

function saveClassToolOnDeath(player) {
    const playerClass = player.getDynamicProperty("playerClass");
    if (!playerClass) return;
    const toolIds = CLASS_TOOL_IDS[playerClass] || [];

    try {
        const inventory = player.getComponent("minecraft:inventory");
        if (!inventory || !inventory.container) return;
        const container = inventory.container;

        let bestId = null, bestIdx = -1;
        for (let i = 0; i < container.size; i++) {
            const item = container.getItem(i);
            if (!item) continue;
            const idx = toolIds.indexOf(item.typeId);
            if (idx > bestIdx) { bestIdx = idx; bestId = item.typeId; }
        }

        if (bestId) {
            player.setDynamicProperty("savedClassTool", bestId);
            player.setDynamicProperty("previousClass", playerClass);
            // Remove class tools so they don't drop
            for (let i = 0; i < container.size; i++) {
                const item = container.getItem(i);
                if (item && toolIds.includes(item.typeId)) {
                    container.setItem(i, undefined);
                }
            }
        }
    } catch (e) {
        console.warn(`[Death] ${e}`);
    }
}

// ══════════════════════════════════════════════════════════════
// EVENT SUBSCRIPTIONS
// ══════════════════════════════════════════════════════════════

console.warn("[ClassSystem] Initializing FFA Class System v3...");

// Player spawn (join + respawn)
world.afterEvents.playerSpawn.subscribe((event) => {
    const player = event.player;

    if (event.initialSpawn) {
        // First join — show class menu after a delay for iPad reliability
        player.sendMessage("§b⚔ §eWelcome to FFA Classes! §b⚔");
        player.sendMessage("§7Class selection will appear shortly...");
        system.runTimeout(() => {
            const hasClass = player.getDynamicProperty("playerClass");
            if (!hasClass) {
                showClassMenu(player, false);
            }
        }, 100); // 5 seconds delay for iPad
    } else {
        // Respawn after death
        player.setDynamicProperty("classLocked", false);
        system.runTimeout(() => {
            showClassMenu(player, true);
        }, 40); // 2 seconds after respawn
    }
});

// Player death
world.afterEvents.entityDie.subscribe((event) => {
    if (event.deadEntity.typeId === "minecraft:player") {
        try { saveClassToolOnDeath(event.deadEntity); } catch (e) {}
    }
});

// Periodic effects re-application (every 20 seconds = 400 ticks)
system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        const cls = player.getDynamicProperty("playerClass");
        if (cls) applyEffects(player, cls);
    }
}, 400);

// Item restriction check (every 1 second = 20 ticks)
system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        try { enforceItemRestrictions(player); } catch (e) {}
    }
}, 20);

// Block break — Dwarf 3x3x3
world.afterEvents.playerBreakBlock.subscribe((event) => {
    const player = event.player;
    if (player.getDynamicProperty("playerClass") !== "dwarf") return;

    try {
        const inv = player.getComponent("minecraft:inventory");
        if (!inv) return;
        const held = inv.container.getItem(player.selectedSlotIndex);
        if (!held || !PICKAXE_TIERS[held.typeId]) return;

        const tier = PICKAXE_TIERS[held.typeId].tier;
        const fortune = FORTUNE_ORES[event.brokenBlockPermutation.type.id];
        if (fortune) applyFortune(event.dimension, event.block.location, fortune);

        mine3x3x3(player, event.block.location, event.dimension, tier);
    } catch (e) {}
});

// Item use — Wizard wands
world.afterEvents.itemUse.subscribe((event) => {
    const player = event.source;
    const item = event.itemStack;
    if (!item || !player) return;

    const playerClass = player.getDynamicProperty("playerClass");

    // Wizard wand spells
    if (playerClass !== "wizard") return;

    const wt = WAND_TYPES[item.typeId];
    if (!wt) return;

    switch (wt) {
        case "basic": castBasicWand(player); break;
        case "teleport": castTeleportWand(player); break;
        case "storm": castStormWand(player); break;
        case "fire": castFireWand(player); break;
        case "nova": castNovaWand(player); break;
    }
});

// Entity hit — Warrior broadsword
world.afterEvents.entityHitEntity.subscribe((event) => {
    const attacker = event.damagingEntity;
    const target = event.hitEntity;
    if (attacker.typeId !== "minecraft:player") return;
    if (attacker.getDynamicProperty("playerClass") !== "warrior") return;

    try {
        const inv = attacker.getComponent("minecraft:inventory");
        if (!inv) return;
        const held = inv.container.getItem(attacker.selectedSlotIndex);
        if (!held) return;
        const st = BROADSWORD_TYPES[held.typeId];
        if (!st) return;
        handleBroadswordHit(attacker, target, st);
    } catch (e) {}
});

console.warn("[ClassSystem] All systems loaded v3!");
