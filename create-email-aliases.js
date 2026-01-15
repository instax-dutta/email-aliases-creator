#!/usr/bin/env node

/**
 * Cloudflare Email Routing Bulk Alias Creator
 * 
 * Interactive privacy-focused email alias generator with themed word bundles.
 * Generates human-readable random aliases using Cloudflare Email Routing.
 * 
 * @requires Node.js 18+ (for native fetch)
 */

import { writeFile, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import readline from 'readline';
import { randomBytes } from 'crypto';
import { execSync, spawn } from 'child_process';

// ============================================================================
// ENVIRONMENT LOADER
// ============================================================================

/**
 * Loads environment variables from .env file if it exists
 */
async function loadEnvFile() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const envPath = join(__dirname, '.env');

    if (!existsSync(envPath)) {
        return;
    }

    try {
        const envContent = await readFile(envPath, 'utf-8');
        const lines = envContent.split('\n');

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;

            const match = trimmed.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                let value = match[2].trim();

                if ((value.startsWith('"') && value.endsWith('"')) ||
                    (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }

                if (!process.env[key]) {
                    process.env[key] = value;
                }
            }
        }
    } catch (error) {
        console.warn(`⚠️  Could not load .env file: ${error.message}`);
    }
}

await loadEnvFile();

// ============================================================================
// THEMED WORD BUNDLES FOR PRIVACY-FOCUSED ALIASES
// ============================================================================

const WORD_BUNDLES = {
    'privacy-guardian': {
        name: '🛡️  Privacy Guardian',
        description: 'Security & anonymity themed - perfect for maximum privacy',
        prefixes: [
            'anonymous', 'cipher', 'crypt', 'ghost', 'hidden', 'incognito', 'masked',
            'phantom', 'private', 'secret', 'secure', 'shadow', 'shield', 'silent',
            'stealth', 'vault', 'veiled', 'whisper', 'cloak', 'enigma', 'obscure',
            'covert', 'discrete', 'guarded', 'keeper', 'sentinel', 'warden', 'aegis',
            'bastion', 'fortress', 'haven', 'refuge', 'sanctuary', 'guardian', 'protector',
            'defender', 'encrypted', 'locked', 'sealed', 'shielded', 'armored', 'fortified',
            'invisible', 'unseen', 'untraced', 'untraceable', 'nameless', 'faceless', 'void',
            'dark', 'night', 'twilight', 'dusk', 'shade', 'umbra', 'eclipse'
        ],
        suffixes: [
            'vault', 'cipher', 'lock', 'key', 'gate', 'wall', 'shield', 'guard',
            'keeper', 'watcher', 'sentinel', 'proxy', 'mask', 'cloak', 'veil',
            'shadow', 'ghost', 'phantom', 'spirit', 'shade', 'wraith', 'specter',
            'node', 'relay', 'tunnel', 'bridge', 'portal', 'passage', 'path',
            'route', 'channel', 'conduit', 'link', 'nexus', 'hub', 'core',
            'fortress', 'bastion', 'citadel', 'haven', 'refuge', 'sanctuary', 'asylum',
            'den', 'lair', 'cache', 'stash', 'reserve', 'archive', 'repository',
            'sentry', 'lookout', 'observer', 'monitor', 'scanner', 'detector'
        ]
    },

    'tech-wizard': {
        name: '⚡ Tech Wizard',
        description: 'Tech & coding themed - for the digital natives',
        prefixes: [
            'binary', 'quantum', 'neural', 'cyber', 'digital', 'virtual', 'pixel',
            'byte', 'nano', 'micro', 'macro', 'meta', 'proto', 'core', 'kernel',
            'daemon', 'thread', 'async', 'sync', 'parallel', 'vector', 'matrix',
            'logic', 'boolean', 'algorithm', 'regex', 'syntax', 'compile', 'runtime',
            'stack', 'heap', 'cache', 'buffer', 'stream', 'pipeline', 'packet',
            'protocol', 'network', 'mesh', 'grid', 'cloud', 'edge', 'fog',
            'data', 'crypto', 'hash', 'token', 'session', 'instance', 'module',
            'script', 'lambda', 'delta', 'alpha', 'beta', 'gamma', 'omega'
        ],
        suffixes: [
            'bit', 'byte', 'node', 'core', 'chip', 'circuit', 'gate', 'port',
            'socket', 'thread', 'process', 'daemon', 'service', 'worker', 'agent',
            'bot', 'proxy', 'server', 'client', 'host', 'mesh', 'grid',
            'network', 'cluster', 'shard', 'partition', 'segment', 'block', 'chunk',
            'packet', 'frame', 'payload', 'header', 'footer', 'wrapper', 'container',
            'pod', 'instance', 'replica', 'mirror', 'cache', 'buffer', 'queue',
            'stack', 'heap', 'tree', 'graph', 'array', 'vector', 'matrix',
            'tensor', 'scalar', 'pointer', 'reference', 'handle', 'descriptor'
        ]
    },

    'nature-zen': {
        name: '🌿 Nature Zen',
        description: 'Calm & natural themed - peaceful and organic',
        prefixes: [
            'alpine', 'amber', 'arctic', 'autumn', 'azure', 'breeze', 'calm',
            'cascade', 'cedar', 'cloud', 'coral', 'crystal', 'dawn', 'dusk',
            'earth', 'emerald', 'forest', 'frost', 'glacial', 'golden', 'jade',
            'lunar', 'maple', 'marine', 'meadow', 'misty', 'moss', 'mountain',
            'ocean', 'olive', 'opal', 'pacific', 'pearl', 'pebble', 'pine',
            'quartz', 'rain', 'river', 'sage', 'sand', 'sapphire', 'sky',
            'snow', 'solar', 'spring', 'stellar', 'stone', 'summer', 'sunset',
            'thunder', 'tide', 'timber', 'topaz', 'valley', 'verdant', 'wild'
        ],
        suffixes: [
            'bay', 'beach', 'brook', 'canyon', 'cave', 'cliff', 'cloud', 'coast',
            'cove', 'creek', 'delta', 'dune', 'falls', 'field', 'fjord', 'forest',
            'garden', 'glacier', 'grove', 'harbor', 'haven', 'hill', 'hollow', 'island',
            'lake', 'lagoon', 'marsh', 'meadow', 'mesa', 'mist', 'mountain', 'oasis',
            'ocean', 'pass', 'path', 'peak', 'pine', 'plain', 'pond', 'prairie',
            'reef', 'ridge', 'river', 'rock', 'shore', 'spring', 'stone', 'stream',
            'summit', 'terrace', 'trail', 'tree', 'valley', 'vista', 'wave', 'wood'
        ]
    },

    'urban-legend': {
        name: '🏙️  Urban Legend',
        description: 'Modern & city themed - sleek and contemporary',
        prefixes: [
            'apex', 'axis', 'bold', 'bright', 'chrome', 'concrete', 'core', 'edge',
            'electric', 'epic', 'flash', 'flex', 'fusion', 'glitch', 'glow', 'grid',
            'high', 'hyper', 'instant', 'jet', 'kinetic', 'level', 'metro', 'modern',
            'neon', 'neural', 'nexus', 'Night', 'nova', 'omega', 'peak', 'pixel',
            'prime', 'prism', 'pulse', 'quick', 'rapid', 'razor', 'reflex', 'rhythm',
            'rush', 'sharp', 'signal', 'sleek', 'sonic', 'spark', 'speed', 'spike',
            'surge', 'swift', 'sync', 'tempo', 'titan', 'turbo', 'ultra', 'urban'
        ],
        suffixes: [
            'ace', 'arc', 'axis', 'beat', 'blast', 'blaze', 'block', 'bolt',
            'buzz', 'cafe', 'chip', 'city', 'club', 'dash', 'deck', 'district',
            'drive', 'drop', 'edge', 'flash', 'flow', 'flux', 'grid', 'hub',
            'lane', 'level', 'line', 'link', 'loop', 'mall', 'metro', 'mode',
            'node', 'pace', 'park', 'phase', 'pier', 'plaza', 'point', 'pulse',
            'quest', 'rails', 'rise', 'route', 'shift', 'square', 'station', 'street',
            'strip', 'sync', 'tower', 'track', 'trade', 'transit', 'venue', 'zone'
        ]
    },

    'cosmic-explorer': {
        name: '🚀 Cosmic Explorer',
        description: 'Space & sci-fi themed - for the stargazers',
        prefixes: [
            'astral', 'atomic', 'aurora', 'celestial', 'cosmic', 'dark', 'distant',
            'eternal', 'galactic', 'gravity', 'infinite', 'interstellar', 'light', 'lunar',
            'meteor', 'nebula', 'neutron', 'nova', 'orbit', 'photon', 'plasma', 'pulsar',
            'quantum', 'quasar', 'radiant', 'solar', 'space', 'spectral', 'star', 'stellar',
            'super', 'void', 'warp', 'zero', 'andromeda', 'apollo', 'aries', 'atlas',
            'aurora', 'boson', 'comet', 'corona', 'cosmos', 'eclipse', 'event', 'exo',
            'fusion', 'gamma', 'helios', 'horizon', 'ion', 'jupiter', 'kepler', 'laser',
            'lunar', 'mars', 'mercury', 'milky', 'orbit', 'orion', 'phoenix', 'pluto',
            'polaris', 'radiation', 'red', 'saturn', 'sirius', 'titan', 'uranus', 'vega'
        ],
        suffixes: [
            'star', 'nova', 'nebula', 'galaxy', 'cosmos', 'comet', 'meteor', 'orbit',
            'moon', 'planet', 'satellite', 'asteroid', 'sphere', 'void', 'quasar', 'pulsar',
            'photon', 'proton', 'neutron', 'electron', 'particle', 'wave', 'field', 'force',
            'ray', 'beam', 'light', 'dark', 'matter', 'energy', 'space', 'time',
            'dimension', 'portal', 'gate', 'wormhole', 'rift', 'flux', 'drift', 'shift',
            'jump', 'leap', 'warp', 'drive', 'engine', 'reactor', 'core', 'station',
            'base', 'outpost', 'colony', 'ship', 'craft', 'vessel', 'probe', 'explorer'
        ]
    },

    'mystic-shadow': {
        name: '🔮 Mystic Shadow',
        description: 'Fantasy & mysterious themed - enigmatic and magical',
        prefixes: [
            'ancient', 'arcane', 'blessed', 'celestial', 'cryptic', 'cursed', 'dark',
            'divine', 'dragon', 'dream', 'echo', 'elder', 'elven', 'enchanted', 'eternal',
            'fabled', 'fallen', 'forbidden', 'forgotten', 'frost', 'gloom', 'grim', 'hidden',
            'holy', 'lost', 'lunar', 'magic', 'midnight', 'mystic', 'mythic', 'night',
            'obsidian', 'omen', 'oracle', 'phantom', 'primal', 'raven', 'rune', 'sacred',
            'shadow', 'silent', 'silver', 'soul', 'spectral', 'spirit', 'star', 'storm',
            'twilight', 'umbral', 'void', 'wicked', 'wild', 'witch', 'wolf', 'wraith'
        ],
        suffixes: [
            'blade', 'blood', 'bone', 'book', 'cairn', 'chalice', 'circle', 'coven',
            'crown', 'crystal', 'curse', 'dawn', 'dream', 'dusk', 'echo', 'ember',
            'eye', 'flame', 'gate', 'gaze', 'gem', 'glyph', 'grimoire', 'grove',
            'heart', 'keeper', 'key', 'mark', 'mirror', 'moon', 'oath', 'oracle',
            'page', 'pendant', 'portal', 'prophecy', 'relic', 'rite', 'rune', 'scroll',
            'seal', 'seer', 'shade', 'sigil', 'song', 'soul', 'spell', 'spirit',
            'star', 'stone', 'talisman', 'tome', 'veil', 'vessel', 'ward', 'whisper'
        ]
    }
};

// ============================================================================
// INTERACTIVE INPUT HELPERS
// ============================================================================

/**
 * Creates readline interface for user input
 */
function createReadline() {
    return readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
}

/**
 * Prompts user for input with a question
 */
function question(rl, query) {
    return new Promise(resolve => rl.question(query, resolve));
}

/**
 * Displays available word bundles
 */
function displayBundles() {
    console.log('\n📦 Available Name Bundles:\n');
    const bundles = Object.keys(WORD_BUNDLES);
    bundles.forEach((key, index) => {
        const bundle = WORD_BUNDLES[key];
        console.log(`  ${index + 1}. ${bundle.name}`);
        console.log(`     ${bundle.description}`);
        console.log(`     Words: ${bundle.prefixes.length} prefixes × ${bundle.suffixes.length} suffixes = ${bundle.prefixes.length * bundle.suffixes.length} combinations\n`);
    });
}

/**
 * Gets user's bundle selection
 */
async function selectBundle(rl) {
    displayBundles();

    while (true) {
        const answer = await question(rl, '🎯 Select a bundle (1-6): ');
        const selection = parseInt(answer.trim(), 10);

        if (selection >= 1 && selection <= 6) {
            const bundleKey = Object.keys(WORD_BUNDLES)[selection - 1];
            const bundle = WORD_BUNDLES[bundleKey];
            console.log(`\n✅ Selected: ${bundle.name}\n`);
            return bundleKey;
        }

        console.log('❌ Invalid selection. Please enter a number between 1 and 6.\n');
    }
}

/**
 * Gets number of aliases to create
 */
async function getAliasCount(rl) {
    const defaultCount = parseInt(process.env.ALIAS_COUNT || '100', 10);

    while (true) {
        const answer = await question(rl, `📧 How many aliases to create? (1-500, default ${defaultCount}): `);
        const trimmed = answer.trim();

        // Use default if empty
        if (!trimmed) {
            console.log(`\n✅ Creating ${defaultCount} aliases\n`);
            return defaultCount;
        }

        const count = parseInt(trimmed, 10);

        if (count >= 1 && count <= 500) {
            console.log(`\n✅ Creating ${count} aliases\n`);
            return count;
        }

        console.log('❌ Invalid number. Please enter a value between 1 and 500.\n');
    }
}

// ============================================================================
// TOON (Token-Oriented Object Notation) ENCODER
// ============================================================================

/**
 * Generates TOON format output - compact, LLM-friendly format
 * Reduces token count by 30-60% compared to JSON
 * 
 * @param {Array} results - Array of alias objects
 * @param {Object} metadata - Configuration metadata
 * @returns {string} TOON formatted string
 */
function generateToon(results, metadata) {
    const lines = [];

    // Metadata section
    lines.push('# Email Aliases Export (TOON Format)');
    lines.push(`# Generated: ${metadata.timestamp}`);
    lines.push('');
    lines.push('metadata:');
    lines.push(`  bundle_id: ${metadata.bundle}`);
    lines.push(`  bundle_name: ${metadata.bundleName}`);
    lines.push(`  domain: ${metadata.domain}`);
    lines.push(`  destination: ${metadata.destination}`);
    lines.push(`  total_count: ${metadata.totalCount}`);
    lines.push(`  success_count: ${metadata.successCount}`);
    lines.push(`  failure_count: ${metadata.failureCount}`);
    lines.push('');

    // Successful aliases (tabular format - TOON's strength)
    const successful = results.filter(r => r.status === 'success');
    if (successful.length > 0) {
        lines.push(`successful_aliases[${successful.length}]{alias,rule_id,created_at}:`);
        successful.forEach(r => {
            const created = r.createdAt.split('.')[0].replace('T', ' ');
            lines.push(`  ${r.alias},${r.ruleId},${created}`);
        });
        lines.push('');
    }

    // Failed aliases (if any)
    const failed = results.filter(r => r.status === 'failed');
    if (failed.length > 0) {
        lines.push(`failed_aliases[${failed.length}]:`);
        failed.forEach(r => {
            lines.push(`  - alias: ${r.alias}`);
            lines.push(`    error: ${r.error || 'Unknown error'}`);
            lines.push(`    created_at: ${r.createdAt.split('.')[0].replace('T', ' ')}`);
        });
        lines.push('');
    }

    // Summary statistics
    lines.push('summary:');
    lines.push(`  success_rate: ${((metadata.successCount / metadata.totalCount) * 100).toFixed(2)}%`);
    lines.push(`  total_aliases: ${metadata.totalCount}`);
    lines.push(`  bundle_used: ${metadata.bundleName}`);

    return lines.join('\n');
}

// ============================================================================
// AUTOMATIC ZONE DISCOVERY
// ============================================================================

/**
 * Automatically fetches the Zone ID from Cloudflare based on the domain name.
 * Requires an API token with Zone:Read permissions.
 */
async function fetchZoneIdByName(domain) {
    if (!process.env.CLOUDFLARE_API_TOKEN) return null;

    const url = `https://api.cloudflare.com/client/v4/zones?name=${domain}`;
    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if (data.success && data.result.length > 0) {
            return data.result[0].id;
        }
        return null;
    } catch (error) {
        console.warn(`⚠️  Automatic zone discovery failed: ${error.message}`);
        return null;
    }
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
    apiToken: process.env.CLOUDFLARE_API_TOKEN,
    zoneId: process.env.CLOUDFLARE_ZONE_ID,
    emailDomain: process.env.EMAIL_DOMAIN,
    destinationEmail: process.env.DESTINATION_EMAIL,
    requestDelayMs: parseInt(process.env.REQUEST_DELAY_MS || '100', 10),
    randomSeed: process.env.RANDOM_SEED ? parseInt(process.env.RANDOM_SEED, 10) : Date.now(),
    dryRun: process.argv.includes('--dry-run'),
    maxRetries: 3,
    baseRetryDelayMs: 1000,
    // These will be set interactively
    selectedBundle: null,
    aliasCount: null,
};

/**
 * Initializes configuration, resolving Zone ID if necessary.
 */
async function initializeConfig() {
    if (!CONFIG.zoneId && CONFIG.emailDomain) {
        process.stdout.write(`🔍 Resolving Zone ID for ${CONFIG.emailDomain}... `);
        const autoId = await fetchZoneIdByName(CONFIG.emailDomain);
        if (autoId) {
            CONFIG.zoneId = autoId;
            console.log(`✅ Found: ${autoId.substring(0, 8)}...`);
        } else {
            console.log('❌ Failed');
        }
    }
}


// ============================================================================
// SEEDED PSEUDO-RANDOM NUMBER GENERATOR
// ============================================================================

function createSeededRandom(seed) {
    return function () {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

// ============================================================================
// NAME GENERATION
// ============================================================================

function generateUniqueName(usedNames, random, bundle) {
    const maxAttempts = 1000;
    let attempts = 0;

    while (attempts < maxAttempts) {
        const prefix = bundle.prefixes[Math.floor(random() * bundle.prefixes.length)];
        const suffix = bundle.suffixes[Math.floor(random() * bundle.suffixes.length)];
        const name = `${prefix}.${suffix}`;

        if (!usedNames.has(name)) {
            usedNames.add(name);
            return name;
        }

        attempts++;
    }

    throw new Error('Failed to generate unique name after 1000 attempts. Try a different bundle or reduce alias count.');
}

function generateAliasNames(count, seed, bundleKey) {
    const random = createSeededRandom(seed);
    const bundle = WORD_BUNDLES[bundleKey];
    const usedNames = new Set();
    const names = [];

    for (let i = 0; i < count; i++) {
        names.push(generateUniqueName(usedNames, random, bundle));
    }

    return names;
}

// ============================================================================
// PASSWORD GENERATION MODULE
// ============================================================================

const CHARSET = {
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
    special: '!@#$%^&*()-_=+[]{}|;:,.<>?'
};
const ALL_CHARS = CHARSET.lowercase + CHARSET.uppercase + CHARSET.numbers + CHARSET.special;

function generateSecurePassword(length = 12) {
    if (length < 8) throw new Error('Password length must be at least 8 characters');
    const password = [];
    password.push(CHARSET.lowercase[randomBytes(1)[0] % CHARSET.lowercase.length]);
    password.push(CHARSET.uppercase[randomBytes(1)[0] % CHARSET.uppercase.length]);
    password.push(CHARSET.numbers[randomBytes(1)[0] % CHARSET.numbers.length]);
    password.push(CHARSET.special[randomBytes(1)[0] % CHARSET.special.length]);
    for (let i = password.length; i < length; i++) {
        password.push(ALL_CHARS[randomBytes(1)[0] % ALL_CHARS.length]);
    }
    return password.sort(() => 0.5 - Math.random()).join('');
}

function generateUniquePasswords(aliases) {
    const credentials = [];
    const used = new Set();
    for (const alias of aliases) {
        let password;
        do { password = generateSecurePassword(); } while (used.has(password));
        used.add(password);
        credentials.push({ email: alias, password });
    }
    return credentials;
}

async function updateFilesWithPasswords(domainSlug, credentials) {
    const jsonFile = `${domainSlug}.json`;
    const txtFile = `${domainSlug}.txt`;
    const toonFile = `${domainSlug}.toon`;

    try {
        console.log(`\n🔒 Encrypting & Securing Aliases...`);

        // UPDATE TXT (Append/Merge)
        let allTxtLines = [];
        if (existsSync(txtFile)) {
            const existingContent = await readFile(txtFile, 'utf-8');
            // Split, trim, and filter valid lines
            allTxtLines = existingContent.split('\n').map(l => l.trim()).filter(l => l.includes('@'));
        }

        // Create map of existing data to avoid duplicates/overwrite existing passwords if we want
        // But usually we just want to ADD new ones. 
        // If an alias exists in file without password (e.g. from previous step), we update it.
        const txtMap = new Map();
        allTxtLines.forEach(line => {
            const [email, pwd] = line.split(':');
            txtMap.set(email, pwd || ''); // preserve existing password if any
        });

        // Merge new credentials
        credentials.forEach(c => {
            txtMap.set(c.email, c.password);
        });

        const newTxtContent = Array.from(txtMap.entries()).map(([email, pwd]) => `${email}:${pwd}`).join('\n') + '\n';
        await writeFile(txtFile, newTxtContent, 'utf-8');


        // UPDATE JSON (Merge)
        if (existsSync(jsonFile)) {
            const rawContent = await readFile(jsonFile, 'utf-8');
            let jsonData;
            try { jsonData = JSON.parse(rawContent); } catch (e) { jsonData = []; }

            // Normalize to array
            let masterList = [];
            if (Array.isArray(jsonData)) masterList = jsonData;
            else if (jsonData.results || jsonData.aliases) masterList = jsonData.results || jsonData.aliases;

            // Update or Add
            const credMap = new Map(credentials.map(c => [c.email, c.password]));

            // Map existing items, adding passwords if missing and we have them
            masterList = masterList.map(item => {
                if (credMap.has(item.alias)) {
                    const newPwd = credMap.get(item.alias);
                    credMap.delete(item.alias); // Remove from map so we know it's handled
                    return { ...item, password: newPwd };
                }
                return item;
            });

            // If there are leftovers in credMap (aliases not in JSON?? shouldn't happen if flow is correct, but safe to add)
            // Actually, in the main flow, JSON is updated FIRST with all aliases, then this function is called.
            // So we just need to ensure we save the 'masterList' back correctly.

            const finalJson = {
                metadata: {
                    domain: domainSlug.replace(/-/g, '.'),
                    updated_at: new Date().toISOString(),
                    count: masterList.length,
                    secure: true
                },
                results: masterList
            };

            await writeFile(jsonFile, JSON.stringify(finalJson, null, 2));
        }

        // UPDATE TOON (Append)
        if (existsSync(toonFile)) {
            // Check if we already appended this specific block to avoid dupes in TOON? 
            // TOON is a log format, so appending is generally fine.
            const newBlock = `\n\ncredentials_update[${new Date().toISOString()}]:\n` +
                credentials.map(c => `  ${c.email} : ${c.password}`).join('\n');

            await writeFile(toonFile, newBlock, { flag: 'a' });
        }

        console.log(`✅ Passwords generated and files updated successfully!`);
    } catch (e) {
        console.error(`❌ Password update failed: ${e.message}`);
    }
}

// ============================================================================
// CLOUDFLARE API CLIENT
// ============================================================================

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function createEmailRoutingRule(aliasEmail, destinationEmail, retryCount = 0) {
    const url = `https://api.cloudflare.com/client/v4/zones/${CONFIG.zoneId}/email/routing/rules`;

    const payload = {
        matchers: [
            {
                type: 'literal',
                field: 'to',
                value: aliasEmail
            }
        ],
        actions: [
            {
                type: 'forward',
                value: [destinationEmail]
            }
        ],
        enabled: true,
        name: `Auto-generated: ${aliasEmail}`
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CONFIG.apiToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.status === 429) {
            const errorMsg = data.errors?.[0]?.message || 'Rate limited';
            if (retryCount >= CONFIG.maxRetries) {
                throw new Error(`Rate limited after ${CONFIG.maxRetries} retries: ${errorMsg}`);
            }
            const retryDelay = CONFIG.baseRetryDelayMs * Math.pow(2, retryCount);
            console.warn(`⚠️  Cloudflare says: "${errorMsg}". Retrying in ${retryDelay}ms... (attempt ${retryCount + 1}/${CONFIG.maxRetries})`);
            await delay(retryDelay);
            return createEmailRoutingRule(aliasEmail, destinationEmail, retryCount + 1);
        }

        if (response.status >= 500) {
            const errorMsg = data.errors?.[0]?.message || `HTTP ${response.status}`;
            if (retryCount >= CONFIG.maxRetries) {
                throw new Error(`Server error after ${CONFIG.maxRetries} retries: ${errorMsg}`);
            }
            const retryDelay = CONFIG.baseRetryDelayMs * Math.pow(2, retryCount);
            console.warn(`⚠️  Server error (${response.status}). Retrying in ${retryDelay}ms... (attempt ${retryCount + 1}/${CONFIG.maxRetries})`);
            await delay(retryDelay);
            return createEmailRoutingRule(aliasEmail, destinationEmail, retryCount + 1);
        }

        if (!response.ok) {
            const errorMsg = data.errors?.[0]?.message || `HTTP ${response.status}`;
            throw new Error(`Cloudflare API Error: ${errorMsg}`);
        }

        if (!data.success || !data.result?.id) {
            throw new Error('Invalid API response structure');
        }

        return {
            success: true,
            ruleId: data.result.id,
            priority: data.result.priority
        };

    } catch (error) {
        if (retryCount < CONFIG.maxRetries && (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT')) {
            const retryDelay = CONFIG.baseRetryDelayMs * Math.pow(2, retryCount);
            console.warn(`⚠️  Network error: ${error.message}. Retrying in ${retryDelay}ms... (attempt ${retryCount + 1}/${CONFIG.maxRetries})`);
            await delay(retryDelay);
            return createEmailRoutingRule(aliasEmail, destinationEmail, retryCount + 1);
        }

        throw error;
    }
}

// ============================================================================
// UTILITIES: CONVERTERS & TESTS
// ============================================================================

async function runJsonToTxtConverter(rl) {
    console.log('\n📝 JSON to TXT Converter\n');
    let jsonFile = await question(rl, '📂 Enter path to JSON file (or press Enter for current domain): ');

    if (!jsonFile.trim()) {
        const domainSlug = CONFIG.emailDomain.replace(/\./g, '-');
        jsonFile = `${domainSlug}.json`;
    }

    if (!existsSync(jsonFile)) {
        console.error(`❌ Error: File not found: ${jsonFile}`);
        return;
    }

    try {
        const content = await readFile(jsonFile, 'utf-8');
        const aliases = JSON.parse(content);

        let list = [];
        if (Array.isArray(aliases)) list = aliases;
        else if (aliases.results) list = aliases.results;
        else if (aliases.aliases) list = aliases.aliases;

        const emails = list.filter(a => a.status === 'success' || a.email).map(a => a.alias || a.email);

        if (emails.length === 0) {
            console.error('❌ No usable aliases found in file.');
            return;
        }

        const txtFile = jsonFile.replace('.json', '.txt');
        await writeFile(txtFile, emails.join('\n') + '\n', 'utf-8');
        console.log(`✅ Converted ${emails.length} emails to: ${txtFile}`);

    } catch (e) {
        console.error(`❌ Conversion failed: ${e.message}`);
    }
}

async function runCredentialTest() {
    console.log('\n🔍 Testing Cloudflare Credentials...\n');

    // Test 1: Verify Token
    try {
        const response = await fetch('https://api.cloudflare.com/client/v4/user/tokens/verify', {
            headers: { 'Authorization': `Bearer ${CONFIG.apiToken}` }
        });
        const data = await response.json();
        if (data.success) console.log('✅ API token is valid');
        else {
            console.error('❌ API token invalid:', data.errors?.[0]?.message);
            return;
        }
    } catch (e) { console.error(`❌ Token check failed: ${e.message}`); return; }

    // Test 2: Zone ID
    await initializeConfig();
    if (CONFIG.zoneId) console.log(`✅ Zone ID resolved: ${CONFIG.zoneId}`);
    else {
        console.error('❌ Could not resolve Zone ID. Check permissions.');
        return;
    }

    // Test 3: Email Routing Permissions
    try {
        const url = `https://api.cloudflare.com/client/v4/zones/${CONFIG.zoneId}/email/routing/rules`;
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${CONFIG.apiToken}` }
        });
        const data = await response.json();
        if (data.success) console.log('✅ Email Routing permissions confirmed');
        else console.error('❌ Email Routing access failed:', data.errors?.[0]?.message);
    } catch (e) { console.error(`❌ Permission check failed: ${e.message}`); }

    console.log('\n✨ Credential Test Complete\n');
}

// ============================================================================
// MAIN ORCHESTRATION & MENU
// ============================================================================

function validateConfig() {
    const required = ['apiToken', 'zoneId', 'emailDomain', 'destinationEmail'];
    const missing = required.filter(key => !CONFIG[key]);

    // Only throw if strictly creating aliases
    // For general menu usage, we might allow missing Zone ID if auto-discovery works
    if (!CONFIG.apiToken) throw new Error("Missing CLOUDFLARE_API_TOKEN");
    if (!CONFIG.emailDomain) throw new Error("Missing EMAIL_DOMAIN");
}

async function runCreationFlow(rl) {
    try {
        // Select bundle
        CONFIG.selectedBundle = await selectBundle(rl);
        // Get alias count
        CONFIG.aliasCount = await getAliasCount(rl);
    } catch (error) {
        console.error(`\n❌ Input error: ${error.message}\n`);
        return;
    }

    // Display configuration
    const selectedBundle = WORD_BUNDLES[CONFIG.selectedBundle];
    console.log('📋 Configuration:');
    console.log(`   Bundle: ${selectedBundle.name}`);
    console.log(`   Domain: ${CONFIG.emailDomain}`);
    console.log(`   Destination: ${CONFIG.destinationEmail}`);
    console.log(`   Aliases to create: ${CONFIG.aliasCount}`);
    console.log(`   Request delay: ${CONFIG.requestDelayMs}ms`);
    console.log(`   Random seed: ${CONFIG.randomSeed}`);
    console.log(`   Dry run: ${CONFIG.dryRun ? 'YES' : 'NO'}\n`);

    // Generate alias names
    console.log('🎲 Generating random alias names...');
    const aliasNames = generateAliasNames(CONFIG.aliasCount, CONFIG.randomSeed, CONFIG.selectedBundle);
    console.log(`✅ Generated ${aliasNames.length} unique names\n`);

    if (CONFIG.dryRun) {
        console.log('🔍 DRY RUN MODE - Showing first 10 aliases that would be created:\n');
        aliasNames.slice(0, 10).forEach((name, index) => {
            console.log(`   ${index + 1}. ${name}@${CONFIG.emailDomain} → ${CONFIG.destinationEmail}`);
        });
        console.log('✅ Dry run complete. No aliases were created.\n');
        return;
    }

    // Create email routing rules
    console.log('📧 Creating email routing rules...\n');
    const results = [];
    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < aliasNames.length; i++) {
        const name = aliasNames[i];
        const aliasEmail = `${name}@${CONFIG.emailDomain}`;
        const result = {
            alias: aliasEmail,
            ruleId: null,
            createdAt: new Date().toISOString(),
            status: 'pending',
            bundle: CONFIG.selectedBundle
        };

        try {
            console.log(`[${i + 1}/${aliasNames.length}] Creating: ${aliasEmail}`);
            const apiResponse = await createEmailRoutingRule(aliasEmail, CONFIG.destinationEmail);
            result.ruleId = apiResponse.ruleId;
            result.status = 'success';
            successCount++;
            console.log(`✅ Created successfully (ID: ${apiResponse.ruleId})\n`);
        } catch (error) {
            result.status = 'failed';
            result.error = error.message;
            failureCount++;
            console.error(`❌ Failed: ${error.message}\n`);
        }

        results.push(result);
        if (i < aliasNames.length - 1) await delay(CONFIG.requestDelayMs);
    }

    // Export results
    const domainSlug = CONFIG.emailDomain.replace(/\./g, '-');
    const outputFileName = `${domainSlug}.json`;
    const txtFileName = `${domainSlug}.txt`;
    const toonFileName = `${domainSlug}.toon`;

    try {
        let finalResults = results;
        if (existsSync(outputFileName)) {
            const existingContent = await readFile(outputFileName, 'utf-8');
            const existingJson = JSON.parse(existingContent);
            if (Array.isArray(existingJson)) {
                finalResults = [...existingJson, ...results];
            } else if (existingJson.results || existingJson.aliases) {
                // If using the robust object structure
                const prevAliases = existingJson.results || existingJson.aliases;
                finalResults = {
                    ...existingJson,
                    results: [...prevAliases, ...results],
                    metadata: { ...existingJson.metadata, updated_at: new Date().toISOString() }
                };
            }
        } else {
            // For new files, prefer strict array or the object wrapper?
            // Let's stick to array for simplicity unless passwords upgrade it later, 
            // but user seems to have both. Let's output array by default for new files 
            // to keep it simple, or stick to what we had.
            // EDIT: 'updateFilesWithPasswords' converts to object structure. 
            // So if we write array here, it gets upgraded later. That works.
        }

        await writeFile(outputFileName, JSON.stringify(finalResults, null, 2), 'utf-8');
        console.log(`\n💾 Results exported to: ${outputFileName}`);
    } catch (e) {
        console.error(`\n❌ Failed to write JSON file: ${e.message}`);
    }

    try {
        const successfulAliases = results.filter(r => r.status === 'success').map(r => r.alias);

        let writeMode = 'w'; // default write
        let contentToWrite = successfulAliases.join('\n') + '\n';

        if (existsSync(txtFileName)) {
            const existingTxt = await readFile(txtFileName, 'utf-8');
            // Check if last line has newline
            const prefix = existingTxt.endsWith('\n') ? '' : '\n';
            contentToWrite = prefix + contentToWrite;
            writeMode = 'a'; // append
            await writeFile(txtFileName, contentToWrite, { flag: 'a' });
        } else {
            await writeFile(txtFileName, contentToWrite, 'utf-8');
        }

        console.log(`📝 Email list exported/updated: ${txtFileName}`);

        // AUTOMATIC PASSWORD GENERATION
        if (successfulAliases.length > 0) {
            const credentials = generateUniquePasswords(successfulAliases);
            // This function handles the "reading existing + merging" logic internally now
            await updateFilesWithPasswords(domainSlug, credentials);
        }

    } catch (e) {
        console.error(`\n❌ Failed to write TXT/Passwords: ${e.message}`);
    }

    try {
        const toonContent = generateToon(results, {
            bundle: CONFIG.selectedBundle,
            bundleName: selectedBundle.name,
            domain: CONFIG.emailDomain,
            destination: CONFIG.destinationEmail,
            totalCount: results.length,
            successCount,
            failureCount,
            timestamp: new Date().toISOString()
        });

        if (existsSync(toonFileName)) {
            await writeFile(toonFileName, '\n\n' + toonContent, { flag: 'a' });
            console.log(`🤖 TOON appended to: ${toonFileName}\n`);
        } else {
            await writeFile(toonFileName, toonContent, 'utf-8');
            console.log(`🤖 TOON exported to: ${toonFileName}\n`);
        }
    } catch (e) {
        console.error(`\n❌ Failed to write TOON file: ${e.message}\n`);
    }

    // Summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 SUMMARY');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`🎨 Bundle: ${selectedBundle.name}`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${failureCount}`);
    console.log(`📧 Total: ${results.length}`);
    console.log('═══════════════════════════════════════════════════════\n');
}

async function main() {
    console.log('🚀 Cloudflare Email Routing Suite\n');
    console.log('   Interactive Privacy-Focused Edition\n');

    const rl = createReadline();

    // 1. Configure Domain
    const defaultDomain = CONFIG.emailDomain || '';
    const domainInput = await question(rl, `🌐 Target Domain [${defaultDomain}]: `);
    const newDomain = domainInput.trim() || defaultDomain;

    if (newDomain !== CONFIG.emailDomain) {
        CONFIG.emailDomain = newDomain;
        CONFIG.zoneId = null; // Force re-discovery for new domain
    }

    // 2. Configure Destination
    const defaultDest = CONFIG.destinationEmail || '';
    const destInput = await question(rl, `📨 Destination Email [${defaultDest}]: `);
    CONFIG.destinationEmail = destInput.trim() || defaultDest;

    console.log(''); // spacer

    // 3. Auto-resolve Creds
    await initializeConfig();

    try {
        validateConfig();
    } catch (error) {
        console.error(`❌ Configuration error: ${error.message}\n`);
        console.log('Please check your .env file or inputs.');
        process.exit(1);
    }

    // MAIN MENU LOOP
    while (true) {
        console.log('\n🔵 MAIN MENU:');
        console.log(`   (Domain: ${CONFIG.emailDomain})`);
        console.log('1. ✨ Create Aliases (includes Auto-Password Gen)');
        console.log('2. 🔐 Generate Passwords for Existing File');
        console.log('3. 🧹 Cleanup/Delete Aliases');
        console.log('4. 🧪 Test Credentials');
        console.log('5. 📝 Convert JSON to TXT');
        console.log('6. 🚪 Exit');

        const choice = await question(rl, '\n👉 Select an option (1-6): ');

        if (choice.trim() === '1') {
            await runCreationFlow(rl);
            // Don't break here anymore, allow returning to menu
        } else if (choice.trim() === '2') {
            // Internal password generation
            const domainSlug = CONFIG.emailDomain.replace(/\./g, '-');
            const txtFile = `${domainSlug}.txt`;
            if (existsSync(txtFile)) {
                const content = await readFile(txtFile, 'utf-8');
                const emails = content.split('\n').map(l => l.trim()).filter(l => l && l.includes('@'));
                console.log(`Found ${emails.length} aliases in ${txtFile}. Generating passwords...`);
                const creds = generateUniquePasswords(emails);
                await updateFilesWithPasswords(domainSlug, creds);
            } else {
                console.log(`❌ File not found: ${txtFile}`);
            }
        } else if (choice.trim() === '3') {
            console.log('Launching Cleanup Script...');
            // Pass current config to the child process so it uses the selected domain/zone
            const envVars = {
                ...process.env,
                EMAIL_DOMAIN: CONFIG.emailDomain,
                CLOUDFLARE_ZONE_ID: CONFIG.zoneId
            };
            try { execSync('node cleanup-generated-aliases.js', { stdio: 'inherit', env: envVars }); } catch (e) { }
        } else if (choice.trim() === '4') {
            await runCredentialTest();
        } else if (choice.trim() === '5') {
            await runJsonToTxtConverter(rl);
        } else if (choice.trim() === '6') {
            console.log('Bye! 👋');
            process.exit(0);
        } else {
            console.log('❌ Invalid option.');
        }
    }

    rl.close();
}

// ============================================================================
// ENTRY POINT
// ============================================================================

main().catch(error => {
    console.error(`\n💥 Fatal error: ${error.message}\n`);
    process.exit(1);
});
