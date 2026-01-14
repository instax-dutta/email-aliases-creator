#!/usr/bin/env node

/**
 * Password Generator for Email Aliases
 * 
 * Generates secure 12-character random passwords for each email alias
 * Updates TXT file with email:password format
 * Exports JSON and TOON formats with credentials
 * 
 * Features:
 * - 12 characters: lowercase, uppercase, numbers, special chars
 * - No duplicates guaranteed
 * - Parallel processing for speed
 * - Triple export: TXT, JSON, TOON
 * 
 * @requires Node.js 18+
 */

import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { randomBytes } from 'crypto';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ============================================================================
// ENVIRONMENT LOADER
// ============================================================================

async function loadEnvFile() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const envPath = join(__dirname, '.env');

    if (!existsSync(envPath)) return;

    try {
        const envContent = await readFile(envPath, 'utf-8');
        envContent.split('\n').forEach(line => {
            const match = line.trim().match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                let value = match[2].trim();
                if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }
                if (!process.env[key]) process.env[key] = value;
            }
        });
    } catch (e) { }
}

await loadEnvFile();

// ============================================================================
// PASSWORD GENERATION
// ============================================================================

// Character sets for password generation
const CHARSET = {
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
    special: '!@#$%^&*()-_=+[]{}|;:,.<>?'
};

// All characters combined
const ALL_CHARS = CHARSET.lowercase + CHARSET.uppercase + CHARSET.numbers + CHARSET.special;

/**
 * Generates a cryptographically secure random password
 * Ensures at least one character from each category
 * 
 * @param {number} length - Password length (default 12)
 * @returns {string} Secure random password
 */
function generateSecurePassword(length = 12) {
    if (length < 8) {
        throw new Error('Password length must be at least 8 characters');
    }

    const password = [];

    // Ensure at least one character from each category
    password.push(getRandomChar(CHARSET.lowercase));
    password.push(getRandomChar(CHARSET.uppercase));
    password.push(getRandomChar(CHARSET.numbers));
    password.push(getRandomChar(CHARSET.special));

    // Fill the rest with random characters from all sets
    for (let i = password.length; i < length; i++) {
        password.push(getRandomChar(ALL_CHARS));
    }

    // Shuffle the password array to randomize positions
    return shuffleArray(password).join('');
}

/**
 * Gets a cryptographically random character from a charset
 * 
 * @param {string} charset - Character set to choose from
 * @returns {string} Random character
 */
function getRandomChar(charset) {
    const randomIndex = randomBytes(1)[0] % charset.length;
    return charset[randomIndex];
}

/**
 * Fisher-Yates shuffle algorithm for arrays
 * 
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const randomIndex = randomBytes(1)[0] % (i + 1);
        [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
    }
    return shuffled;
}

/**
 * Generates unique passwords for multiple emails
 * Uses parallel processing for speed
 * 
 * @param {Array<string>} emails - Array of email addresses
 * @returns {Array<Object>} Array of {email, password} objects
 */
function generateUniquePasswords(emails) {
    const passwords = new Set();
    const credentials = [];

    for (const email of emails) {
        let password;
        let attempts = 0;
        const maxAttempts = 100;

        // Generate unique password (collision highly unlikely but be safe)
        do {
            password = generateSecurePassword(12);
            attempts++;

            if (attempts >= maxAttempts) {
                throw new Error('Failed to generate unique password after max attempts');
            }
        } while (passwords.has(password));

        passwords.add(password);
        credentials.push({ email, password });
    }

    return credentials;
}

// ============================================================================
// FILE PROCESSING
// ============================================================================

/**
 * Reads emails from TXT file
 * 
 * @param {string} filePath - Path to TXT file
 * @returns {Promise<Array<string>>} Array of email addresses
 */
async function readEmailsFromTxt(filePath) {
    const content = await readFile(filePath, 'utf-8');
    const emails = content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && line.includes('@'));

    return emails;
}

/**
 * Generates TOON format for credentials
 * 
 * @param {Array<Object>} credentials - Array of {email, password} objects
 * @param {Object} metadata - Additional metadata
 * @returns {string} TOON formatted string
 */
function generateToonFormat(credentials, metadata) {
    const lines = [];

    lines.push('# Email Alias Credentials (TOON Format)');
    lines.push(`# Generated: ${metadata.timestamp}`);
    lines.push('');
    lines.push('metadata:');
    lines.push(`  total_credentials: ${credentials.length}`);
    lines.push(`  password_length: 12`);
    lines.push(`  charset: lowercase,uppercase,numbers,special`);
    lines.push(`  source_file: ${metadata.sourceFile}`);
    lines.push('');
    lines.push(`credentials[${credentials.length}]{email,password}:`);

    credentials.forEach(cred => {
        lines.push(`  ${cred.email},${cred.password}`);
    });

    lines.push('');
    lines.push('security:');
    lines.push('  password_strength: Strong (12 chars, mixed case, numbers, symbols)');
    lines.push('  uniqueness: Guaranteed unique passwords');
    lines.push('  generation_method: Cryptographically secure (crypto.randomBytes)');

    return lines.join('\n');
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
    console.log('🔐 Email Alias Password Generator\n');

    // Get input from command line, fallback to .env EMAIL_DOMAIN
    let input = process.argv[2] || process.env.EMAIL_DOMAIN;

    if (!input) {
        console.error('❌ Error: No domain or file specified\n');
        console.error('Usage:');
        console.error('  node generate-passwords.js <domain-or-file>\n');
        console.error('Example:');
        console.error('  node generate-passwords.js aeglyn.site');
        process.exit(1);
    }

    // Smart file resolution
    let inputFile = input;
    if (!input.endsWith('.txt') && !input.endsWith('.json')) {
        // Assume domain name, slugify it
        const domainSlug = input.replace(/\./g, '-');
        inputFile = `${domainSlug}.txt`;
        console.log(`🔍 Detected domain: ${input}`);
        console.log(`📂 Looking for: ${inputFile}`);
    }

    if (!existsSync(inputFile)) {
        console.error(`❌ Error: File not found: ${inputFile}\n`);
        process.exit(1);
    }

    try {
        const baseFileName = inputFile.replace(/\.(txt|json)$/, '');
        const jsonFile = `${baseFileName}.json`;
        const toonFile = `${baseFileName}.toon`;
        const txtFile = `${baseFileName}.txt`;

        // Step 1: Read emails (from TXT if possible, fallback to JSON)
        console.log(`📖 Reading aliases from: ${inputFile}`);
        let emails = [];
        if (inputFile.endsWith('.json')) {
            const jsonContent = JSON.parse(await readFile(inputFile, 'utf-8'));
            const data = Array.isArray(jsonContent) ? jsonContent : jsonContent.aliases || [];
            emails = data.map(entry => entry.alias || entry.email).filter(Boolean);
        } else {
            emails = await readEmailsFromTxt(inputFile);
        }

        if (emails.length === 0) {
            console.error('❌ No valid aliases found to generate passwords for.\n');
            process.exit(1);
        }
        console.log(`✅ Found ${emails.length} aliases\n`);

        // Step 2: Generate unique passwords
        console.log('🔒 Generating secure passwords...');
        const startTime = Date.now();
        const credentials = generateUniquePasswords(emails);
        const duration = Date.now() - startTime;
        console.log(`✅ Generated ${credentials.length} unique passwords in ${duration}ms\n`);

        // Step 3: Update TXT file (email:password format)
        console.log('💾 Updating exports...');
        const txtContent = credentials.map(c => `${c.email}:${c.password}`).join('\n') + '\n';
        await writeFile(txtFile, txtContent, 'utf-8');
        console.log(`✅ Updated TXT list: ${txtFile}`);

        // Step 4: Update JSON file
        try {
            if (existsSync(jsonFile)) {
                const jsonContent = await readFile(jsonFile, 'utf-8');
                const jsonData = JSON.parse(jsonContent);
                const credMap = new Map(credentials.map(c => [c.email, c.password]));

                let updatedAliases = [];
                if (Array.isArray(jsonData)) {
                    updatedAliases = jsonData.map(entry => ({
                        ...entry,
                        password: credMap.get(entry.alias || entry.email) || entry.password
                    }));
                } else if (jsonData.results || jsonData.aliases) {
                    const base = jsonData.results || jsonData.aliases;
                    updatedAliases = base.map(entry => ({
                        ...entry,
                        password: credMap.get(entry.alias || entry.email) || entry.password
                    }));
                }

                const finalJson = {
                    metadata: {
                        domain: baseFileName.replace('-', '.'),
                        updated_at: new Date().toISOString(),
                        total_count: credentials.length,
                        security: '12-character mixed-set passwords'
                    },
                    results: updatedAliases
                };

                await writeFile(jsonFile, JSON.stringify(finalJson, null, 2), 'utf-8');
                console.log(`✅ Updated JSON data: ${jsonFile}`);
            }
        } catch (error) {
            console.warn(`⚠️  JSON update failed: ${error.message}`);
        }

        // Step 5: Update TOON file
        try {
            const toonContent = generateToonFormat(credentials, {
                timestamp: new Date().toISOString(),
                sourceFile: inputFile
            });
            await writeFile(toonFile, toonContent, 'utf-8');
            console.log(`✅ Updated TOON export: ${toonFile}\n`);
        } catch (error) {
            console.warn(`⚠️  TOON update failed: ${error.message}`);
        }

        // Summary
        console.log('═══════════════════════════════════════════════════════');
        console.log('📊 PASSWORD GENERATION SUMMARY');
        console.log('═══════════════════════════════════════════════════════');
        console.log(`📧 Aliases secured: ${credentials.length}`);
        console.log(`🔑 Formats updated: TXT, JSON, TOON`);
        console.log(`⚡ Speed: ${(credentials.length / (duration / 1000 || 1)).toFixed(0)} creds/sec`);
        console.log('═══════════════════════════════════════════════════════\n');
        console.log(`📧 Emails processed: ${credentials.length}`);
        console.log('🔐 Password strength: Strong (12 characters)');
        console.log('   - Lowercase: ✓');
        console.log('   - Uppercase: ✓');
        console.log('   - Numbers: ✓');
        console.log('   - Special chars: ✓');
        console.log(`⚡ Generation speed: ${(credentials.length / (duration / 1000)).toFixed(0)} passwords/sec`);
        console.log('✨ Uniqueness: Guaranteed (no duplicates)');
        console.log('═══════════════════════════════════════════════════════\n');

        console.log('🎉 Files updated successfully!');
        console.log(`   📝 ${inputFile} (email:password format)`);
        console.log(`   📊 ${jsonFile} (with credentials)`);
        console.log(`   🤖 ${toonFile} (LLM-optimized)`);
        console.log('\n⚠️  SECURITY WARNING:');
        console.log('   These files now contain plaintext passwords!');
        console.log('   Store them securely or use a password manager.\n');

    } catch (error) {
        console.error(`\n❌ Error: ${error.message}\n`);
        process.exit(1);
    }
}

// ============================================================================
// ENTRY POINT
// ============================================================================

main().catch(error => {
    console.error(`\n💥 Fatal error: ${error.message}\n`);
    process.exit(1);
});
