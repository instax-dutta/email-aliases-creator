#!/usr/bin/env node

/**
 * Cloudflare Email Routing Alias Deletion Script
 * 
 * Deletes email routing aliases created by create-email-aliases.js
 * Reads the exported JSON file and removes rules by their IDs
 * 
 * @requires Node.js 18+ (for native fetch)
 */

import { readFile } from 'fs/promises';

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
    apiToken: process.env.CLOUDFLARE_API_TOKEN,
    zoneId: process.env.CLOUDFLARE_ZONE_ID,
    requestDelayMs: parseInt(process.env.REQUEST_DELAY_MS || '100', 10),
    dryRun: process.argv.includes('--dry-run'),
    maxRetries: 3,
    baseRetryDelayMs: 1000,
};

// ============================================================================
// UTILITIES
// ============================================================================

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// CLOUDFLARE API
// ============================================================================

/**
 * Deletes an email routing rule by ID
 * @param {string} ruleId - Rule ID to delete
 * @param {number} retryCount - Current retry attempt
 * @returns {Promise<object>} Deletion result
 */
async function deleteEmailRoutingRule(ruleId, retryCount = 0) {
    const url = `https://api.cloudflare.com/client/v4/zones/${CONFIG.zoneId}/email/routing/rules/${ruleId}`;

    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${CONFIG.apiToken}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        // Handle rate limiting
        if (response.status === 429) {
            if (retryCount >= CONFIG.maxRetries) {
                throw new Error(`Rate limited after ${CONFIG.maxRetries} retries`);
            }
            const retryDelay = CONFIG.baseRetryDelayMs * Math.pow(2, retryCount);
            console.warn(`⚠️  Rate limited. Retrying in ${retryDelay}ms...`);
            await delay(retryDelay);
            return deleteEmailRoutingRule(ruleId, retryCount + 1);
        }

        // Handle server errors
        if (response.status >= 500) {
            if (retryCount >= CONFIG.maxRetries) {
                throw new Error(`Server error after ${CONFIG.maxRetries} retries`);
            }
            const retryDelay = CONFIG.baseRetryDelayMs * Math.pow(2, retryCount);
            console.warn(`⚠️  Server error. Retrying in ${retryDelay}ms...`);
            await delay(retryDelay);
            return deleteEmailRoutingRule(ruleId, retryCount + 1);
        }

        // Handle client errors
        if (!response.ok) {
            const errorMsg = data.errors?.[0]?.message || `HTTP ${response.status}`;
            throw new Error(errorMsg);
        }

        return { success: true };

    } catch (error) {
        if (retryCount < CONFIG.maxRetries && (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT')) {
            const retryDelay = CONFIG.baseRetryDelayMs * Math.pow(2, retryCount);
            console.warn(`⚠️  Network error. Retrying in ${retryDelay}ms...`);
            await delay(retryDelay);
            return deleteEmailRoutingRule(ruleId, retryCount + 1);
        }
        throw error;
    }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
    console.log('🗑️  Cloudflare Email Routing Alias Deletion Script\n');

    // Get input file from command line
    const inputFile = process.argv.find(arg => arg.endsWith('.json') && !arg.startsWith('--'));

    if (!inputFile) {
        console.error('❌ Error: No input file specified\n');
        console.error('Usage:');
        console.error('  node delete-email-aliases.js <json-file> [--dry-run]\n');
        console.error('Example:');
        console.error('  node delete-email-aliases.js email-aliases-2025-12-31.json');
        console.error('  node delete-email-aliases.js email-aliases-2025-12-31.json --dry-run\n');
        process.exit(1);
    }

    // Validate config
    if (!CONFIG.apiToken || !CONFIG.zoneId) {
        console.error('❌ Error: Missing required environment variables\n');
        console.error('Required:');
        console.error('  - CLOUDFLARE_API_TOKEN');
        console.error('  - CLOUDFLARE_ZONE_ID\n');
        process.exit(1);
    }

    // Read aliases from JSON file
    let aliases;
    try {
        const fileContent = await readFile(inputFile, 'utf-8');
        aliases = JSON.parse(fileContent);
    } catch (error) {
        console.error(`❌ Error reading file: ${error.message}\n`);
        process.exit(1);
    }

    // Filter successful aliases with rule IDs
    const deletableAliases = aliases.filter(a => a.status === 'success' && a.ruleId);

    if (deletableAliases.length === 0) {
        console.log('⚠️  No aliases to delete (no successful entries found in file)\n');
        return;
    }

    console.log(`📋 Found ${deletableAliases.length} aliases to delete`);
    console.log(`   Dry run: ${CONFIG.dryRun ? 'YES' : 'NO'}\n`);

    if (CONFIG.dryRun) {
        console.log('🔍 DRY RUN MODE - Aliases that would be deleted:\n');
        deletableAliases.forEach((alias, index) => {
            console.log(`   ${index + 1}. ${alias.alias} (ID: ${alias.ruleId})`);
        });
        console.log('\n✅ Dry run complete. No aliases were deleted.\n');
        return;
    }

    // Delete aliases
    console.log('🗑️  Deleting email routing rules...\n');
    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < deletableAliases.length; i++) {
        const alias = deletableAliases[i];

        try {
            console.log(`[${i + 1}/${deletableAliases.length}] Deleting: ${alias.alias}`);

            await deleteEmailRoutingRule(alias.ruleId);

            successCount++;
            console.log(`✅ Deleted successfully\n`);

        } catch (error) {
            failureCount++;
            console.error(`❌ Failed: ${error.message}\n`);
        }

        // Rate limiting delay
        if (i < deletableAliases.length - 1) {
            await delay(CONFIG.requestDelayMs);
        }
    }

    // Summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 SUMMARY');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`✅ Deleted: ${successCount}`);
    console.log(`❌ Failed: ${failureCount}`);
    console.log(`📧 Total: ${deletableAliases.length}`);
    console.log('═══════════════════════════════════════════════════════\n');

    process.exit(failureCount > 0 ? 1 : 0);
}

// ============================================================================
// ENTRY POINT
// ============================================================================

main().catch(error => {
    console.error(`\n💥 Fatal error: ${error.message}\n`);
    process.exit(1);
});
