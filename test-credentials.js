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
const emailDomain = process.env.EMAIL_DOMAIN;
let zoneId = process.env.CLOUDFLARE_ZONE_ID;

console.log('🔍 Testing Cloudflare Credentials\n');

if (!apiToken) {
    console.error('❌ Missing CLOUDFLARE_API_TOKEN in .env file\n');
    process.exit(1);
}

// Helper for API calls
async function apiCall(url) {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
        }
    });
    return { status: response.status, data: await response.json() };
}

// Test 1: Verify API token
console.log('Test 1: Verifying API token...');
try {
    const { status, data } = await apiCall('https://api.cloudflare.com/client/v4/user/tokens/verify');

    if (data.success) {
        console.log('✅ API token is valid');
        console.log(`   Status: ${data.result.status}`);
    } else {
        console.log('❌ API token verification failed');
        console.log('   Errors:', JSON.stringify(data.errors, null, 2));
        process.exit(1);
    }
} catch (error) {
    console.log(`❌ Failed to verify token: ${error.message}`);
    process.exit(1);
}

console.log();

// Test 2: Auto-resolve Zone ID or Verify if manually set
if (!zoneId && emailDomain) {
    console.log(`Test 2: Auto-resolving Zone ID for ${emailDomain}...`);
    try {
        const { status, data } = await apiCall(`https://api.cloudflare.com/client/v4/zones?name=${emailDomain}`);
        if (data.success && data.result.length > 0) {
            zoneId = data.result[0].id;
            console.log(`✅ Automatically found Zone ID: ${zoneId}`);
        } else {
            console.log('❌ Failed to resolve Zone ID automatically.');
            console.log('   Make sure you have "Zone:Read" permission and the domain exists in your account.');
            process.exit(1);
        }
    } catch (error) {
        console.log(`❌ Failed to resolve zone: ${error.message}`);
        process.exit(1);
    }
} else if (zoneId) {
    console.log(`Test 2: Verifying manual Zone ID ${zoneId}...`);
    try {
        const { status, data } = await apiCall(`https://api.cloudflare.com/client/v4/zones/${zoneId}`);
        if (data.success) {
            console.log(`✅ Zone access is valid (${data.result.name})`);
        } else {
            console.log('❌ Manual Zone ID verification failed.');
            console.log('   Errors:', JSON.stringify(data.errors, null, 2));
            process.exit(1);
        }
    } catch (error) {
        console.log(`❌ Failed to verify zone ID: ${error.message}`);
        process.exit(1);
    }
} else {
    console.error('❌ Error: Set either CLOUDFLARE_ZONE_ID or EMAIL_DOMAIN in .env\n');
    process.exit(1);
}

console.log();

// Test 3: Check Email Routing permissions
console.log('Test 3: Checking Email Routing permissions...');
try {
    const { status, data } = await apiCall(`https://api.cloudflare.com/client/v4/zones/${zoneId}/email/routing/rules`);

    if (data.success) {
        console.log('✅ Email Routing access is valid');
        console.log(`   Existing rules: ${data.result?.length || 0}`);
    } else {
        console.log('❌ Email Routing access failed');
        console.log('   Status:', status);
        console.log('   Errors:', JSON.stringify(data.errors, null, 2));

        if (status === 403) {
            console.log('\n⚠️  PERMISSION ISSUE:');
            console.log('   Your API token does not have Email Routing permissions.');
            console.log('   Please check your token permissions in Cloudflare dashboard.');
        }
    }
} catch (error) {
    console.log(`❌ Failed to check Email Routing: ${error.message}`);
}

console.log('\n' + '='.repeat(60));
console.log('📝 SUMMARY\n');
console.log('If all tests passed, your credentials are ready for use!');
console.log('Automatic Zone Discovery is working ✅');
console.log('='.repeat(60) + '\n');
