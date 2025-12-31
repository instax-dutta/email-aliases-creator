#!/usr/bin/env node

/**
 * Cloudflare Credentials Test Script
 * Tests your API token and Zone ID validity
 */

import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env file
async function loadEnvFile() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const envPath = join(__dirname, '.env');

    if (existsSync(envPath)) {
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
    }
}

await loadEnvFile();

const apiToken = process.env.CLOUDFLARE_API_TOKEN;
const zoneId = process.env.CLOUDFLARE_ZONE_ID;

console.log('🔍 Testing Cloudflare Credentials\n');

if (!apiToken || !zoneId) {
    console.error('❌ Missing credentials in .env file\n');
    process.exit(1);
}

console.log(`🔑 API Token: ${apiToken.substring(0, 10)}...${apiToken.substring(apiToken.length - 4)}`);
console.log(`🆔 Zone ID: ${zoneId}\n`);

// Test 1: Verify API token
console.log('Test 1: Verifying API token...');
try {
    const response = await fetch('https://api.cloudflare.com/client/v4/user/tokens/verify', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();

    if (data.success) {
        console.log('✅ API token is valid');
        console.log(`   Status: ${data.result.status}`);
    } else {
        console.log('❌ API token verification failed');
        console.log('   Errors:', JSON.stringify(data.errors, null, 2));
    }
} catch (error) {
    console.log(`❌ Failed to verify token: ${error.message}`);
}

console.log();

// Test 2: Check zone access
console.log('Test 2: Checking zone access...');
try {
    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();

    if (data.success) {
        console.log('✅ Zone access is valid');
        console.log(`   Zone Name: ${data.result.name}`);
        console.log(`   Status: ${data.result.status}`);
    } else {
        console.log('❌ Zone access failed');
        console.log('   Errors:', JSON.stringify(data.errors, null, 2));
    }
} catch (error) {
    console.log(`❌ Failed to access zone: ${error.message}`);
}

console.log();

// Test 3: Check Email Routing permissions
console.log('Test 3: Checking Email Routing permissions...');
try {
    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/email/routing/rules`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();

    if (data.success) {
        console.log('✅ Email Routing access is valid');
        console.log(`   Existing rules: ${data.result?.length || 0}`);
    } else {
        console.log('❌ Email Routing access failed');
        console.log('   Status:', response.status);
        console.log('   Errors:', JSON.stringify(data.errors, null, 2));

        if (response.status === 403) {
            console.log('\n⚠️  PERMISSION ISSUE:');
            console.log('   Your API token does not have Email Routing permissions.');
            console.log('   Please create a new token with "Email Routing Rules" edit permissions.');
        }
    }
} catch (error) {
    console.log(`❌ Failed to check Email Routing: ${error.message}`);
}

console.log('\n' + '='.repeat(60));
console.log('📝 SUMMARY\n');
console.log('If all tests passed, your credentials are correct.');
console.log('If Test 3 failed with a 403 error, you need to:');
console.log('  1. Go to https://dash.cloudflare.com/profile/api-tokens');
console.log('  2. Create Token → Use "Edit zone email routing" template');
console.log('  3. OR create custom token with these permissions:');
console.log('     - Zone > Email Routing Rules > Edit');
console.log('  4. Update CLOUDFLARE_API_TOKEN in your .env file');
console.log('='.repeat(60) + '\n');
