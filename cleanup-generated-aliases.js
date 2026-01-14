#!/usr/bin/env node

/**
 * Cleanup Generated Aliases
 * 
 * Intelligently identifies and deletes aliases created by this script
 * based on themed word bundle patterns. Preserves manually created aliases.
 * 
 * @requires Node.js 18+
 */

import { readFile } from 'fs/promises';
import https from 'https';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================================================
// WORD BUNDLES (from create script - used to identify generated aliases)
// ============================================================================

const WORD_BUNDLES = {
    'privacy-guardian': {
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
            'summit', 'trail', 'tree', 'tundra', 'vale', 'valley', 'view', 'water',
            'wave', 'wild', 'wood', 'woods'
        ]
    },
    'urban-legend': {
        prefixes: [
            'metro', 'urban', 'city', 'civic', 'town', 'local', 'central', 'downtown',
            'uptown', 'midtown', 'subway', 'street', 'avenue', 'lane', 'alley',
            'road', 'route', 'path', 'block', 'square', 'market', 'plaza', 'mall',
            'shop', 'store', 'cafe', 'club', 'pub', 'bar', 'hotel', 'motel',
            'inn', 'hostel', 'house', 'home', 'flat', 'apt', 'loft', 'studio',
            'room', 'floor', 'level', 'zone', 'area', 'region', 'district', 'ward',
            'sector', 'quarter', 'part', 'side', 'end', 'edge', 'limit', 'bound'
        ],
        suffixes: [
            'city', 'town', 'ville', 'burg', 'pol', 'port', 'haven', 'beach',
            'side', 'view', 'land', 'world', 'globe', 'sphere', 'orb', 'zone',
            'area', 'region', 'place', 'spot', 'site', 'net', 'web', 'link',
            'hub', 'node', 'point', 'base', 'camp', 'post', 'station', 'stop',
            'depot', 'yard', 'park', 'garden', 'field', 'ground', 'lot', 'plot',
            'space', 'room', 'hall', 'center', 'core', 'heart', 'soul', 'mind',
            'life', 'style', 'way', 'mode', 'form', 'type', 'kind', 'sort'
        ]
    },
    'cosmic-explorer': {
        prefixes: [
            'alpha', 'astro', 'atom', 'aurora', 'beta', 'binary', 'black', 'blue',
            'comet', 'cosmic', 'dark', 'delta', 'dust', 'dwarf', 'eclipse', 'energy',
            'event', 'field', 'flare', 'force', 'gamma', 'giant', 'gravity', 'halo',
            'hyper', 'ion', 'light', 'lunar', 'magnet', 'mars', 'mass', 'matter',
            'mega', 'meteor', 'moon', 'nebula', 'neutron', 'nova', 'orbit', 'phase',
            'planet', 'plasma', 'polar', 'probe', 'proton', 'pulse', 'quasar', 'radio',
            'ray', 'red', 'ring', 'rocket', 'rover', 'scan', 'scope', 'sector',
            'shift', 'sky', 'solar', 'sonic', 'space', 'star', 'sun', 'super',
            'terra', 'time', 'void', 'warp', 'white', 'zero'
        ],
        suffixes: [
            'belt', 'body', 'cloud', 'core', 'disk', 'dust', 'field', 'flare',
            'force', 'form', 'gas', 'glow', 'halo', 'hole', 'jet', 'light',
            'line', 'loop', 'mass', 'mode', 'node', 'path', 'phase', 'plane',
            'point', 'pole', 'pulse', 'ray', 'ring', 'scan', 'scope', 'shock',
            'side', 'sign', 'site', 'sky', 'space', 'spot', 'star', 'storm',
            'tail', 'time', 'view', 'void', 'wake', 'wave', 'wind', 'zone',
            'base', 'deck', 'dock', 'gate', 'helm', 'lock', 'port', 'post'
        ]
    },
    'mystic-shadow': {
        prefixes: [
            'arcane', 'astral', 'aura', 'bane', 'blood', 'bone', 'chaos', 'charm',
            'cipher', 'curse', 'dark', 'demon', 'doom', 'dragon', 'dream', 'dusk',
            'dust', 'elder', 'ember', 'fate', 'fear', 'fire', 'flame', 'ghost',
            'gloom', 'grim', 'hazel', 'hex', 'hollow', 'honor', 'hope', 'ice',
            'iron', 'jade', 'karma', 'light', 'lord', 'lore', 'luck', 'mage',
            'magic', 'mana', 'mind', 'moon', 'myth', 'night', 'null', 'omen',
            'oracle', 'pain', 'pale', 'rune', 'shade', 'shadow', 'soul', 'spell'
        ],
        suffixes: [
            'bane', 'bind', 'blade', 'blood', 'bone', 'born', 'bound', 'breath',
            'caller', 'caster', 'chant', 'charm', 'claw', 'cloak', 'code', 'core',
            'craft', 'crest', 'crown', 'curse', 'dancer', 'doom', 'dream', 'drinker',
            'dust', 'eater', 'edge', 'eye', 'fang', 'fire', 'flame', 'forge',
            'gaze', 'ghost', 'guard', 'guide', 'hand', 'heart', 'helm', 'horn',
            'host', 'hunter', 'keeper', 'knight', 'lord', 'lore', 'mage', 'mark',
            'mask', 'mind', 'mist', 'moon', 'moth', 'night', 'path', 'paw'
        ]
    }
};

// ============================================================================
// CLOUDFLARE API
// ============================================================================

function apiRequest(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.cloudflare.com',
            port: 443,
            path: `/client/v4${path}`,
            method: method,
            headers: {
                'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => responseData += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(responseData);
                    if (parsed.success) {
                        resolve(parsed.result);
                    } else {
                        reject(new Error(parsed.errors?.[0]?.message || 'API request failed'));
                    }
                } catch (err) {
                    reject(new Error(`Failed to parse response: ${err.message}`));
                }
            });
        });

        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

// ============================================================================
// PATTERN MATCHING
// ============================================================================

/**
 * Check if an alias was generated by our script
 */
function isGeneratedAlias(alias) {
    // Extract local part (before @)
    const localPart = alias.split('@')[0];

    // Check if it matches pattern: prefix.suffix
    if (!localPart.includes('.')) return false;

    const [prefix, suffix] = localPart.split('.');

    // Check if prefix and suffix exist in any of our word bundles
    for (const bundle of Object.values(WORD_BUNDLES)) {
        const hasPrefix = bundle.prefixes.includes(prefix);
        const hasSuffix = bundle.suffixes.includes(suffix);

        if (hasPrefix && hasSuffix) {
            return true;
        }
    }

    return false;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
    console.log('🧹 Cleanup Generated Aliases\n');

    // Load environment variables first to populate process.env if not set
    try {
        const envContent = await readFile(join(__dirname, '.env'), 'utf-8');
        envContent.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match && !process.env[match[1].trim()]) { // Only set if not already defined
                process.env[match[1].trim()] = match[2].trim();
            }
        });
    } catch (error) {
        // .env might be optional if variables are passed via shell
    }

    // 1. Get target domain: Env var (from parent) > Arg > Fallback
    const targetDomain = process.env.EMAIL_DOMAIN || process.argv[2] || 'sdad.pro';

    console.log(`📍 Target domain: ${targetDomain}`);
    console.log('🔍 Scanning for generated aliases...\n');

    if (!process.env.CLOUDFLARE_API_TOKEN) {
        console.error('❌ Error: Missing CLOUDFLARE_API_TOKEN in .env or environment\n');
        process.exit(1);
    }

    /**
     * Automatically fetches the Zone ID from Cloudflare based on the domain name.
     */
    async function fetchZoneIdByName(domain) {
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

    // Auto-detect zone ID based on domain
    let zoneId = process.env.CLOUDFLARE_ZONE_ID;

    if (!zoneId || targetDomain !== process.env.EMAIL_DOMAIN) {
        process.stdout.write(`🔍 Resolving Zone ID for ${targetDomain}... `);
        const autoId = await fetchZoneIdByName(targetDomain);
        if (autoId) {
            zoneId = autoId;
            console.log(`✅ Found: ${zoneId.substring(0, 8)}...`);
        } else {
            console.log('❌ Failed');
        }
    }

    if (!zoneId) {
        console.error(`❌ Error: No zone ID found for ${targetDomain}`);
        console.error('   Please set CLOUDFLARE_ZONE_ID in .env or ensure your token has Zone:Read permissions.\n');
        process.exit(1);
    }

    console.log(`🔑 Using zone ID: ${zoneId.substring(0, 8)}...`);

    try {
        // Fetch all email routing rules for the zone
        const rules = await apiRequest(`/zones/${zoneId}/email/routing/rules`);

        // Filter for target domain and generated aliases
        const generatedAliases = rules
            .filter(rule => {
                const email = rule.matchers?.[0]?.value;
                if (!email) return false;

                const domain = email.split('@')[1];
                return domain === targetDomain && isGeneratedAlias(email);
            })
            .map(rule => ({
                id: rule.id,
                email: rule.matchers[0].value
            }));

        if (generatedAliases.length === 0) {
            console.log(`✅ No generated aliases found for ${targetDomain}`);
            console.log('   All aliases appear to be manually created or from another source.\n');
            return;
        }

        console.log(`Found ${generatedAliases.length} generated aliases:\n`);
        generatedAliases.slice(0, 5).forEach(a => console.log(`  📧 ${a.email}`));
        if (generatedAliases.length > 5) {
            console.log(`  ... and ${generatedAliases.length - 5} more\n`);
        } else {
            console.log('');
        }

        // Confirm deletion
        console.log(`⚠️  This will DELETE ${generatedAliases.length} aliases from ${targetDomain}`);
        console.log('   Manually created aliases will NOT be affected.\n');

        // Delete aliases
        console.log('🗑️  Deleting aliases...\n');
        let deleted = 0;
        let failed = 0;

        for (const alias of generatedAliases) {
            try {
                await apiRequest(
                    `/zones/${zoneId}/email/routing/rules/${alias.id}`,
                    'DELETE'
                );
                deleted++;
                process.stdout.write(`\rProgress: ${deleted + failed}/${generatedAliases.length}`);
                await new Promise(resolve => setTimeout(resolve, 100)); // Rate limiting
            } catch (error) {
                failed++;
                console.error(`\n❌ Failed to delete ${alias.email}: ${error.message}`);
            }
        }

        console.log('\n');
        console.log('═══════════════════════════════════════════════════════');
        console.log('📊 CLEANUP SUMMARY');
        console.log('═══════════════════════════════════════════════════════');
        console.log(`✅ Successfully deleted: ${deleted}`);
        if (failed > 0) console.log(`❌ Failed: ${failed}`);
        console.log(`📧 Domain: ${targetDomain}`);
        console.log('═══════════════════════════════════════════════════════\n');

        if (deleted > 0) {
            console.log('🎉 Cleanup complete! Generated aliases removed.\n');
        }

    } catch (error) {
        console.error(`\n❌ Error: ${error.message}\n`);
        process.exit(1);
    }
}

main().catch(error => {
    console.error(`\n💥 Fatal error: ${error.message}\n`);
    process.exit(1);
});
