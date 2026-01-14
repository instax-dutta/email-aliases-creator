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
        prefixes: ['quantum', 'cyber', 'nano', 'micro', 'mega', 'giga', 'tera', 'ultra', 'hyper', 'super', 'meta', 'proto', 'neo', 'next', 'future', 'smart', 'intel', 'logic', 'data', 'info', 'net', 'web', 'digital', 'virtual', 'cloud', 'matrix', 'binary', 'code', 'pixel', 'byte', 'bit', 'cache', 'buffer', 'stream', 'flow', 'flux', 'pulse', 'wave', 'signal', 'beacon', 'radar', 'sonar', 'laser', 'photon', 'electron', 'neutron', 'proton', 'atom', 'nucleus', 'core', 'chip', 'circuit', 'node', 'network', 'system', 'protocol', 'algorithm', 'function', 'method', 'process', 'thread', 'stack', 'queue', 'array', 'vector', 'matrix', 'tensor', 'graph', 'tree'],
        suffixes: ['tech', 'lab', 'core', 'hub', 'net', 'web', 'cloud', 'node', 'link', 'port', 'gate', 'zone', 'realm', 'space', 'sphere', 'domain', 'field', 'matrix', 'grid', 'mesh', 'network', 'system', 'platform', 'engine', 'drive', 'force', 'power', 'energy', 'flux', 'flow', 'stream', 'wave', 'pulse', 'signal', 'beacon', 'tower', 'station', 'terminal', 'interface', 'dashboard', 'console', 'panel', 'screen', 'display', 'monitor', 'scanner', 'sensor', 'detector', 'analyzer', 'processor', 'compiler', 'parser', 'interpreter', 'debugger', 'optimizer', 'enhancer', 'booster', 'accelerator', 'amplifier', 'multiplier', 'generator', 'creator', 'builder', 'maker', 'forge', 'factory', 'workshop', 'studio']
    },
    'nature-zen': {
        prefixes: ['zen', 'calm', 'peace', 'quiet', 'still', 'gentle', 'soft', 'mild', 'light', 'clear', 'pure', 'fresh', 'clean', 'natural', 'organic', 'green', 'eco', 'wild', 'forest', 'wood', 'tree', 'leaf', 'branch', 'root', 'seed', 'bloom', 'flower', 'petal', 'garden', 'meadow', 'grove', 'glade', 'clearing', 'valley', 'canyon', 'ravine', 'gorge', 'cliff', 'peak', 'summit', 'mountain', 'hill', 'ridge', 'slope', 'mesa', 'butte', 'plateau', 'plain', 'prairie', 'savanna', 'tundra', 'desert', 'oasis', 'spring', 'stream', 'creek', 'brook', 'river', 'lake', 'pond', 'pool', 'waterfall', 'cascade', 'rapids', 'ocean', 'sea', 'bay', 'cove', 'inlet', 'fjord'],
        suffixes: ['zen', 'calm', 'peace', 'harmony', 'balance', 'flow', 'stream', 'creek', 'river', 'lake', 'pond', 'pool', 'spring', 'falls', 'cascade', 'rapids', 'wave', 'tide', 'shore', 'beach', 'coast', 'bay', 'cove', 'island', 'reef', 'coral', 'shell', 'pearl', 'sand', 'pebble', 'stone', 'rock', 'boulder', 'cliff', 'cave', 'grotto', 'canyon', 'valley', 'meadow', 'field', 'plain', 'prairie', 'savanna', 'tundra', 'desert', 'dune', 'oasis', 'grove', 'forest', 'woods', 'jungle', 'rainforest', 'canopy', 'understory', 'floor', 'trail', 'path', 'way', 'route', 'passage', 'bridge', 'crossing', 'ford', 'summit', 'peak', 'ridge', 'slope', 'hill']
    },
    'urban-legend': {
        prefixes: ['neon', 'metro', 'urban', 'city', 'street', 'avenue', 'boulevard', 'plaza', 'square', 'district', 'quarter', 'block', 'corner', 'junction', 'intersection', 'crossing', 'station', 'terminal', 'depot', 'hub', 'center', 'core', 'downtown', 'uptown', 'midtown', 'downtown', 'subway', 'underground', 'tunnel', 'bridge', 'overpass', 'underpass', 'highway', 'freeway', 'expressway', 'parkway', 'boulevard', 'strip', 'row', 'alley', 'lane', 'drive', 'road', 'route', 'path', 'way', 'walk', 'promenade', 'pier', 'dock', 'wharf', 'port', 'harbor', 'marina', 'bay', 'waterfront', 'riverside', 'lakefront', 'beachfront', 'boardwalk', 'esplanade', 'arcade', 'gallery', 'passage', 'corridor', 'concourse', 'atrium', 'lobby', 'foyer'],
        suffixes: ['street', 'avenue', 'boulevard', 'plaza', 'square', 'circle', 'court', 'place', 'terrace', 'drive', 'lane', 'road', 'way', 'walk', 'path', 'trail', 'route', 'alley', 'row', 'strip', 'block', 'district', 'quarter', 'zone', 'sector', 'area', 'region', 'precinct', 'ward', 'borough', 'neighborhood', 'community', 'village', 'town', 'city', 'metro', 'urban', 'downtown', 'uptown', 'midtown', 'central', 'north', 'south', 'east', 'west', 'station', 'terminal', 'depot', 'hub', 'center', 'point', 'node', 'nexus', 'junction', 'crossing', 'intersection', 'corner', 'edge', 'border', 'boundary', 'limit', 'frontier', 'outpost', 'enclave', 'haven', 'refuge', 'sanctuary', 'shelter', 'safe', 'house']
    },
    'cosmic-explorer': {
        prefixes: ['star', 'solar', 'lunar', 'cosmic', 'astro', 'celestial', 'stellar', 'galactic', 'nebula', 'nova', 'super', 'hyper', 'ultra', 'mega', 'giga', 'quantum', 'infinity', 'eternal', 'immortal', 'infinite', 'endless', 'boundless', 'limitless', 'timeless', 'ageless', 'ancient', 'primordial', 'primal', 'original', 'first', 'alpha', 'omega', 'zenith', 'apex', 'peak', 'summit', 'pinnacle', 'acme', 'climax', 'culmination', 'meridian', 'equinox', 'solstice', 'eclipse', 'transit', 'conjunction', 'opposition', 'alignment', 'syzygy', 'occultation', 'perihelion', 'aphelion', 'perigee', 'apogee', 'ascending', 'descending', 'retrograde', 'prograde', 'direct', 'stationary', 'conjunction', 'opposition', 'square', 'trine', 'sextile', 'quincunx', 'semisextile', 'semisquare'],
        suffixes: ['star', 'sun', 'moon', 'planet', 'comet', 'asteroid', 'meteor', 'meteorite', 'galaxy', 'nebula', 'cluster', 'constellation', 'orbit', 'trajectory', 'path', 'course', 'route', 'way', 'trail', 'journey', 'voyage', 'expedition', 'mission', 'quest', 'search', 'exploration', 'discovery', 'finding', 'revelation', 'unveiling', 'disclosure', 'exposure', 'manifestation', 'appearance', 'emergence', 'arising', 'dawn', 'sunrise', 'daybreak', 'morning', 'noon', 'afternoon', 'evening', 'dusk', 'twilight', 'sunset', 'nightfall', 'night', 'midnight', 'darkness', 'shadow', 'eclipse', 'occultation', 'transit', 'passage', 'crossing', 'intersection', 'junction', 'nexus', 'node', 'point', 'spot', 'place', 'location', 'position', 'site', 'station', 'base']
    },
    'mystic-shadow': {
        prefixes: ['mystic', 'magic', 'arcane', 'occult', 'esoteric', 'hidden', 'secret', 'cryptic', 'mysterious', 'enigmatic', 'obscure', 'veiled', 'shrouded', 'cloaked', 'masked', 'concealed', 'covert', 'furtive', 'stealthy', 'surreptitious', 'clandestine', 'undercover', 'underground', 'subterranean', 'depths', 'abyss', 'void', 'chasm', 'gulf', 'pit', 'crater', 'cavern', 'cave', 'grotto', 'hollow', 'den', 'lair', 'nest', 'burrow', 'warren', 'maze', 'labyrinth', 'puzzle', 'riddle', 'enigma', 'mystery', 'conundrum', 'paradox', 'anomaly', 'aberration', 'deviation', 'divergence', 'departure', 'digression', 'tangent', 'offshoot', 'branch', 'fork', 'split', 'divide', 'rift', 'breach', 'gap', 'opening', 'aperture', 'portal', 'gateway', 'door'],
        suffixes: ['shadow', 'shade', 'phantom', 'ghost', 'specter', 'wraith', 'spirit', 'soul', 'essence', 'aura', 'presence', 'being', 'entity', 'creature', 'form', 'shape', 'figure', 'silhouette', 'outline', 'contour', 'profile', 'aspect', 'facet', 'feature', 'trait', 'quality', 'attribute', 'property', 'characteristic', 'mark', 'sign', 'symbol', 'token', 'emblem', 'badge', 'crest', 'seal', 'sigil', 'glyph', 'rune', 'cipher', 'code', 'key', 'lock', 'ward', 'charm', 'spell', 'hex', 'curse', 'blessing', 'boon', 'gift', 'power', 'force', 'energy', 'magic', 'mana', 'chi', 'prana', 'vitality', 'life', 'breath', 'wind', 'air', 'ether', 'void', 'abyss']
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

    // Get target domain from command line or use sdad.pro as default
    const targetDomain = process.argv[2] || 'sdad.pro';

    console.log(`📍 Target domain: ${targetDomain}`);
    console.log('🔍 Scanning for generated aliases...\n');

    // Load environment variables
    try {
        const envContent = await readFile(join(__dirname, '.env'), 'utf-8');
        envContent.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                process.env[match[1].trim()] = match[2].trim();
            }
        });
    } catch (error) {
        console.error('❌ Error: .env file not found');
        process.exit(1);
    }

    if (!process.env.CLOUDFLARE_API_TOKEN) {
        console.error('❌ Error: Missing CLOUDFLARE_API_TOKEN in .env file\n');
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
