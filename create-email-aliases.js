#!/usr/bin/env node

/**
 * Cloudflare Email Routing Bulk Alias Creator
 * 
 * A production-grade script for creating email routing aliases programmatically.
 * Generates human-readable random aliases and creates Cloudflare Email Routing rules.
 * 
 * @requires Node.js 18+ (for native fetch)
 */

import { writeFile, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ============================================================================
// ENVIRONMENT LOADER
// ============================================================================

/**
 * Loads environment variables from .env file if it exists
 * Simple parser that handles basic KEY=value format
 */
async function loadEnvFile() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const envPath = join(__dirname, '.env');

    if (!existsSync(envPath)) {
        return; // .env file doesn't exist, use system env vars
    }

    try {
        const envContent = await readFile(envPath, 'utf-8');
        const lines = envContent.split('\n');

        for (const line of lines) {
            // Skip empty lines and comments
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;

            // Parse KEY=value
            const match = trimmed.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                let value = match[2].trim();

                // Remove quotes if present
                if ((value.startsWith('"') && value.endsWith('"')) ||
                    (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }

                // Only set if not already in environment (system env takes precedence)
                if (!process.env[key]) {
                    process.env[key] = value;
                }
            }
        }
    } catch (error) {
        console.warn(`⚠️  Could not load .env file: ${error.message}`);
    }
}

// Load .env file before configuration
await loadEnvFile();

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
    apiToken: process.env.CLOUDFLARE_API_TOKEN,
    zoneId: process.env.CLOUDFLARE_ZONE_ID,
    emailDomain: process.env.EMAIL_DOMAIN,
    destinationEmail: process.env.DESTINATION_EMAIL,
    aliasCount: parseInt(process.env.ALIAS_COUNT || '100', 10),
    requestDelayMs: parseInt(process.env.REQUEST_DELAY_MS || '100', 10),
    randomSeed: process.env.RANDOM_SEED ? parseInt(process.env.RANDOM_SEED, 10) : Date.now(),
    dryRun: process.argv.includes('--dry-run'),
    maxRetries: 3,
    baseRetryDelayMs: 1000,
};

// ============================================================================
// WORD LISTS FOR NAME GENERATION
// ============================================================================

const ADJECTIVES = [
    'amber', 'azure', 'bright', 'calm', 'cosmic', 'crystal', 'echo', 'ember',
    'frost', 'jade', 'lunar', 'misty', 'nova', 'ocean', 'pearl', 'quest',
    'ruby', 'sage', 'shadow', 'silver', 'sky', 'solar', 'spark', 'star',
    'storm', 'swift', 'thunder', 'velvet', 'violet', 'wild'
];

const FIRST_NAMES = [
    'alex', 'aria', 'ash', 'avery', 'blake', 'casey', 'charlie', 'dakota',
    'eden', 'ellis', 'finn', 'harper', 'jade', 'jordan', 'kai', 'leo',
    'luna', 'max', 'morgan', 'neo', 'nova', 'ocean', 'parker', 'quinn',
    'river', 'rowan', 'sage', 'sawyer', 'taylor', 'winter'
];

const NOUNS = [
    'bear', 'dove', 'eagle', 'falcon', 'fox', 'hawk', 'lion', 'lynx',
    'orca', 'otter', 'owl', 'panda', 'phoenix', 'raven', 'shark', 'tiger',
    'whale', 'wolf', 'aurora', 'bay', 'breeze', 'canyon', 'cliff', 'cloud',
    'comet', 'creek', 'delta', 'dune', 'echo', 'falls', 'forest', 'glacier',
    'harbor', 'haven', 'horizon', 'meadow', 'mesa', 'moon', 'mountain', 'oasis',
    'peak', 'pine', 'ridge', 'shore', 'star', 'stone', 'summit', 'tide',
    'valley', 'wave'
];

// ============================================================================
// SEEDED PSEUDO-RANDOM NUMBER GENERATOR
// ============================================================================

/**
 * Mulberry32 PRNG - Simple, fast, and deterministic seeded random number generator
 * @param {number} seed - Initial seed value
 * @returns {function(): number} Random number generator function (0-1)
 */
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

/**
 * Generates a unique human-readable email alias name
 * @param {Set<string>} usedNames - Set of already generated names
 * @param {function} random - Random number generator function
 * @returns {string} Generated name in format "word1.word2"
 */
function generateUniqueName(usedNames, random) {
    const maxAttempts = 1000;
    let attempts = 0;

    while (attempts < maxAttempts) {
        const useAdjective = random() > 0.5;
        const firstPart = useAdjective
            ? ADJECTIVES[Math.floor(random() * ADJECTIVES.length)]
            : FIRST_NAMES[Math.floor(random() * FIRST_NAMES.length)];

        const secondPart = NOUNS[Math.floor(random() * NOUNS.length)];
        const name = `${firstPart}.${secondPart}`;

        if (!usedNames.has(name)) {
            usedNames.add(name);
            return name;
        }

        attempts++;
    }

    throw new Error('Failed to generate unique name after 1000 attempts. Consider expanding word lists.');
}

/**
 * Generates multiple unique email alias names
 * @param {number} count - Number of names to generate
 * @param {number} seed - Random seed for reproducibility
 * @returns {string[]} Array of unique alias names
 */
function generateAliasNames(count, seed) {
    const random = createSeededRandom(seed);
    const usedNames = new Set();
    const names = [];

    for (let i = 0; i < count; i++) {
        names.push(generateUniqueName(usedNames, random));
    }

    return names;
}

// ============================================================================
// CLOUDFLARE API CLIENT
// ============================================================================

/**
 * Delays execution for specified milliseconds
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>}
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Creates an email routing rule in Cloudflare with retry logic
 * @param {string} aliasEmail - Full email address (local@domain.com)
 * @param {string} destinationEmail - Email to forward to
 * @param {number} retryCount - Current retry attempt
 * @returns {Promise<object>} API response with rule details
 */
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

        // Handle rate limiting
        if (response.status === 429) {
            if (retryCount >= CONFIG.maxRetries) {
                throw new Error(`Rate limited after ${CONFIG.maxRetries} retries`);
            }
            const retryDelay = CONFIG.baseRetryDelayMs * Math.pow(2, retryCount);
            console.warn(`⚠️  Rate limited. Retrying in ${retryDelay}ms... (attempt ${retryCount + 1}/${CONFIG.maxRetries})`);
            await delay(retryDelay);
            return createEmailRoutingRule(aliasEmail, destinationEmail, retryCount + 1);
        }

        // Handle server errors with retry
        if (response.status >= 500) {
            if (retryCount >= CONFIG.maxRetries) {
                throw new Error(`Server error after ${CONFIG.maxRetries} retries: ${data.errors?.[0]?.message || 'Unknown error'}`);
            }
            const retryDelay = CONFIG.baseRetryDelayMs * Math.pow(2, retryCount);
            console.warn(`⚠️  Server error (${response.status}). Retrying in ${retryDelay}ms... (attempt ${retryCount + 1}/${CONFIG.maxRetries})`);
            await delay(retryDelay);
            return createEmailRoutingRule(aliasEmail, destinationEmail, retryCount + 1);
        }

        // Handle client errors (no retry)
        if (!response.ok) {
            const errorMsg = data.errors?.[0]?.message || `HTTP ${response.status}`;
            throw new Error(errorMsg);
        }

        // Validate response
        if (!data.success || !data.result?.id) {
            throw new Error('Invalid API response structure');
        }

        return {
            success: true,
            ruleId: data.result.id,
            priority: data.result.priority
        };

    } catch (error) {
        // Network errors - retry
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
// MAIN ORCHESTRATION
// ============================================================================

/**
 * Validates required environment variables
 * @throws {Error} If validation fails
 */
function validateConfig() {
    const required = ['apiToken', 'zoneId', 'emailDomain', 'destinationEmail'];
    const missing = required.filter(key => !CONFIG[key]);

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.map(k => k.toUpperCase().replace(/([A-Z])/g, '_$1')).join(', ')}`);
    }

    if (CONFIG.aliasCount < 1 || CONFIG.aliasCount > 10000) {
        throw new Error('ALIAS_COUNT must be between 1 and 10000');
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(CONFIG.destinationEmail)) {
        throw new Error('Invalid DESTINATION_EMAIL format');
    }
}

/**
 * Main execution function
 */
async function main() {
    console.log('🚀 Cloudflare Email Routing Bulk Alias Creator\n');

    // Validate configuration
    try {
        validateConfig();
    } catch (error) {
        console.error(`❌ Configuration error: ${error.message}\n`);
        console.error('Required environment variables:');
        console.error('  - CLOUDFLARE_API_TOKEN');
        console.error('  - CLOUDFLARE_ZONE_ID');
        console.error('  - EMAIL_DOMAIN');
        console.error('  - DESTINATION_EMAIL');
        console.error('\nOptional environment variables:');
        console.error('  - ALIAS_COUNT (default: 100)');
        console.error('  - REQUEST_DELAY_MS (default: 100)');
        console.error('  - RANDOM_SEED (default: current timestamp)');
        process.exit(1);
    }

    // Display configuration
    console.log('📋 Configuration:');
    console.log(`   Domain: ${CONFIG.emailDomain}`);
    console.log(`   Destination: ${CONFIG.destinationEmail}`);
    console.log(`   Aliases to create: ${CONFIG.aliasCount}`);
    console.log(`   Request delay: ${CONFIG.requestDelayMs}ms`);
    console.log(`   Random seed: ${CONFIG.randomSeed}`);
    console.log(`   Dry run: ${CONFIG.dryRun ? 'YES' : 'NO'}\n`);

    // Generate alias names
    console.log('🎲 Generating random alias names...');
    const aliasNames = generateAliasNames(CONFIG.aliasCount, CONFIG.randomSeed);
    console.log(`✅ Generated ${aliasNames.length} unique names\n`);

    if (CONFIG.dryRun) {
        console.log('🔍 DRY RUN MODE - Showing first 10 aliases that would be created:\n');
        aliasNames.slice(0, 10).forEach((name, index) => {
            console.log(`   ${index + 1}. ${name}@${CONFIG.emailDomain} → ${CONFIG.destinationEmail}`);
        });
        if (aliasNames.length > 10) {
            console.log(`   ... and ${aliasNames.length - 10} more\n`);
        }
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
            status: 'pending'
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

        // Rate limiting delay (except for last item)
        if (i < aliasNames.length - 1) {
            await delay(CONFIG.requestDelayMs);
        }
    }

    // Export results to JSON
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const outputFileName = `email-aliases-${timestamp}.json`;

    try {
        await writeFile(outputFileName, JSON.stringify(results, null, 2), 'utf-8');
        console.log(`\n💾 Results exported to: ${outputFileName}\n`);
    } catch (error) {
        console.error(`\n❌ Failed to write output file: ${error.message}\n`);
    }

    // Summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 SUMMARY');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${failureCount}`);
    console.log(`📧 Total: ${results.length}`);
    console.log('═══════════════════════════════════════════════════════\n');

    // Exit with appropriate code
    process.exit(failureCount > 0 ? 1 : 0);
}

// ============================================================================
// ENTRY POINT
// ============================================================================

main().catch(error => {
    console.error(`\n💥 Fatal error: ${error.message}\n`);
    process.exit(1);
});
