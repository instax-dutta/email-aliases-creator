#!/usr/bin/env node

/**
 * JSON to TXT Converter for Email Aliases
 * 
 * Converts email-aliases JSON files to simple TXT format (one email per line)
 * Useful for converting old JSON files or creating custom lists
 * 
 * @requires Node.js 18+
 */

import { readFile, writeFile } from 'fs/promises';

async function convertJsonToTxt(jsonFile) {
    console.log('📝 Email Alias JSON to TXT Converter\n');

    if (!jsonFile) {
        console.error('❌ Error: No input file specified\n');
        console.error('Usage:');
        console.error('  node json-to-txt.js <json-file>\n');
        console.error('Example:');
        console.error('  node json-to-txt.js email-aliases-privacy-guardian-2025-12-31.json\n');
        process.exit(1);
    }

    try {
        // Read JSON file
        const content = await readFile(jsonFile, 'utf-8');
        const aliases = JSON.parse(content);

        // Filter successful aliases and extract email addresses
        const emails = aliases
            .filter(a => a.status === 'success' && a.alias)
            .map(a => a.alias);

        if (emails.length === 0) {
            console.error('❌ No successful aliases found in JSON file\n');
            process.exit(1);
        }

        // Generate output filename
        const txtFile = jsonFile.replace('.json', '.txt');

        // Write to TXT file
        await writeFile(txtFile, emails.join('\n') + '\n', 'utf-8');

        console.log(`✅ Converted ${emails.length} emails`);
        console.log(`📄 Output: ${txtFile}\n`);
        console.log('Preview (first 10):');
        emails.slice(0, 10).forEach((email, i) => {
            console.log(`   ${i + 1}. ${email}`);
        });
        if (emails.length > 10) {
            console.log(`   ... and ${emails.length - 10} more\n`);
        }

    } catch (error) {
        console.error(`❌ Error: ${error.message}\n`);
        process.exit(1);
    }
}

// Get JSON file from command line
const jsonFile = process.argv[2];
convertJsonToTxt(jsonFile);
