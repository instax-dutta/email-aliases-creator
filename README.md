<div align="center">

# 🚀 Cloudflare Email Alias Creator

### Interactive privacy-focused email alias generator with themed word bundles

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-blue.svg)](package.json)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

[Features](#-features) • [Quick Start](#-quick-start) • [Bundles](#-themed-word-bundles) • [Usage](#-usage) • [FAQ](#-faq)

</div>

---

## 🎯 What is this?

An **interactive, privacy-focused** Node.js tool that bulk-creates beautiful, human-readable email aliases using Cloudflare's Email Routing API.

Choose from **6 themed word bundles** to generate aliases that match your style:

```
🛡️  Privacy Guardian → cipher.vault@yourdomain.com
⚡ Tech Wizard     → quantum.node@yourdomain.com  
🌿 Nature Zen      → alpine.creek@yourdomain.com
🏙️  Urban Legend   → neon.pulse@yourdomain.com
🚀 Cosmic Explorer → nova.orbit@yourdomain.com
🔮 Mystic Shadow   → shadow.rune@yourdomain.com
```

All aliases automatically forward to your main inbox. Perfect for:

- 🛡️ **Maximum privacy** with non-identifiable aliases
- 🧪 **Testing & development** with themed naming
- 📧 **Service-specific aliases** (each service gets unique email)
- 🎭 **Disposable addresses** that look professional
- 🔐 **Enhanced security** - track who sells your email

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎨 **6 Themed Bundles** | Choose from Privacy Guardian, Tech Wizard, Nature Zen, Urban Legend, Cosmic Explorer, or Mystic Shadow |
| 🎯 **Interactive Mode** | Guided selection with beautiful menu and prompts |
| 🔢 **Bulk Creation** | Create up to 500 aliases in one go |
| 🔒 **Privacy-Focused** | 19,000+ abstract combinations across all bundles |
| 🎲 **Deterministic Seeding** | Reproducible alias generation with optional seed |
| ⚡ **Smart Rate Limiting** | Automatic delays to respect API limits |
| 🔄 **Auto-Retry Logic** | Exponential backoff for transient failures |
| 🧪 **Dry Run Mode** | Preview aliases before creating them |
| 📊 **JSON Export** | Complete audit trail with bundle info and timestamps |
| 🚫 **Zero Dependencies** | Uses only Node.js native modules |
| 🛠️ **Bonus Tools** | Credential tester and deletion script included |

---

## 📦 Themed Word Bundles

Each bundle contains **50-70 carefully curated words** designed for maximum privacy and variety:

### 🛡️ Privacy Guardian

**Security & anonymity themed** - Perfect for maximum privacy  
**3,136 combinations** | Best for: Anonymous accounts, privacy-critical services  
**Examples:** `cipher.vault`, `ghost.proxy`, `stealth.sentinel`, `encrypted.shield`

### ⚡ Tech Wizard

**Tech & coding themed** - For the digital natives  
**3,192 combinations** | Best for: Developer tools, tech services, SaaS platforms  
**Examples:** `quantum.node`, `binary.daemon`, `neural.circuit`, `async.kernel`

### 🌿 Nature Zen

**Calm & natural themed** - Peaceful and organic  
**3,136 combinations** | Best for: Wellness apps, travel, lifestyle services  
**Examples:** `alpine.creek`, `misty.forest`, `ocean.valley`, `jade.harbor`

### 🏙️ Urban Legend

**Modern & city themed** - Sleek and contemporary  
**3,136 combinations** | Best for: Shopping, urban services, entertainment  
**Examples:** `neon.pulse`, `apex.grid`, `metro.hub`, `flash.district`

### 🚀 Cosmic Explorer

**Space & sci-fi themed** - For the stargazers  
**3,920 combinations** | Best for: Gaming, sci-fi content, astronomy tools  
**Examples:** `nova.orbit`, `quantum.nebula`, `stellar.void`, `cosmic.fusion`

### 🔮 Mystic Shadow

**Fantasy & mysterious themed** - Enigmatic and magical  
**3,024 combinations** | Best for: Gaming, creative platforms, fantasy content  
**Examples:** `shadow.rune`, `phantom.oracle`, `twilight.spell`, `arcane.grimoire`

**Total: 19,544 unique combinations across all bundles!**

---

## 📋 Prerequisites

- **Node.js 18+** (uses native `fetch`)
- **Cloudflare Account** with a domain
- **Email Routing enabled** on your domain ([How to enable](https://developers.cloudflare.com/email-routing/get-started/enable-email-routing/))
- **API Token** with Email Routing permissions

---

## 🚀 Quick Start

### 1️⃣ Clone & Setup

```bash
git clone https://github.com/instax-dutta/email-aliases-creator.git
cd email-aliases-creator
cp .env.example .env
```

### 2️⃣ Configure Your Credentials

Edit `.env` with your Cloudflare details:

```bash
CLOUDFLARE_API_TOKEN=your_api_token_here
CLOUDFLARE_ZONE_ID=your_zone_id_here
EMAIL_DOMAIN=yourdomain.com
DESTINATION_EMAIL=your-inbox@gmail.com
```

**📖 Where to find these:**

- **API Token**: [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens) → Create Token → "Edit zone Email Routing Routes"
- **Zone ID**: Cloudflare Dashboard → Select Domain → Overview → Right sidebar "API" section

### 3️⃣ Test Your Credentials

```bash
node test-credentials.js
```

All three checks should pass ✅

### 4️⃣ Create Your Aliases Interactively

```bash
node create-email-aliases.js
```

**The script will guide you through:**

```
🚀 Cloudflare Email Routing Bulk Alias Creator
   Interactive Privacy-Focused Edition

📦 Available Name Bundles:

  1. 🛡️  Privacy Guardian
     Security & anonymity themed - perfect for maximum privacy
     Words: 56 prefixes × 56 suffixes = 3136 combinations

  2. ⚡ Tech Wizard
     Tech & coding themed - for the digital natives
     Words: 57 prefixes × 56 suffixes = 3192 combinations

  ... (shows all 6 bundles)

🎯 Select a bundle (1-6): 1

✅ Selected: 🛡️  Privacy Guardian

📧 How many aliases to create? (1-500, default 100): 50

✅ Creating 50 aliases

📋 Configuration:
   Bundle: 🛡️  Privacy Guardian
   Domain: yourdomain.com
   ...

🎲 Generating random alias names...
✅ Generated 50 unique names

📧 Creating email routing rules...
[1/50] Creating: cipher.vault@yourdomain.com
✅ Created successfully
...
```

🎉 **Done!** Check your `email-aliases-privacy-guardian-2025-12-31.json` file for all created aliases.

---

## 💻 Usage

### Basic Commands

```bash
# Interactive mode (choose bundle and count)
node create-email-aliases.js

# Dry run - preview before creating
node create-email-aliases.js --dry-run

# Test credentials
node test-credentials.js

# Delete aliases from a previous run
node delete-email-aliases.js email-aliases-privacy-guardian-2025-12-31.json
```

### Programmatic Usage

```bash
# Pipe inputs for automation (bundle selection, then count)
echo -e "1\n100" | node create-email-aliases.js
# Creates 100 Privacy Guardian aliases

echo -e "3\n50" | node create-email-aliases.js
# Creates 50 Nature Zen aliases
```

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `CLOUDFLARE_API_TOKEN` | ✅ Yes | - | Your Cloudflare API token |
| `CLOUDFLARE_ZONE_ID` | ✅ Yes | - | Zone ID for your domain |
| `EMAIL_DOMAIN` | ✅ Yes | - | Domain for aliases |
| `DESTINATION_EMAIL` | ✅ Yes | - | Where to forward emails |
| `REQUEST_DELAY_MS` | No | `100` | Delay between API requests (ms) |
| `RANDOM_SEED` | No | timestamp | Seed for reproducible names |

**Note:** `ALIAS_COUNT` is now prompted interactively (not in .env)

### NPM Scripts

```bash
npm start          # Interactive mode
npm run dry-run    # Preview mode
npm test           # Test credentials
```

---

## 📸 Examples

### Bundle Selection Output

```bash
$ node create-email-aliases.js

📦 Available Name Bundles:

  1. 🛡️  Privacy Guardian - Security & anonymity themed
  2. ⚡ Tech Wizard - Tech & coding themed
  3. 🌿 Nature Zen - Calm & natural themed
  4. 🏙️  Urban Legend - Modern & city themed
  5. 🚀 Cosmic Explorer - Space & sci-fi themed
  6. 🔮 Mystic Shadow - Fantasy & mysterious themed

🎯 Select a bundle (1-6): 2
✅ Selected: ⚡ Tech Wizard

📧 How many aliases to create? (1-500, default 100): 25
✅ Creating 25 aliases
```

### Generated Aliases by Bundle

**Privacy Guardian:**

```
cipher.vault@domain.com
ghost.proxy@domain.com
stealth.sentinel@domain.com
encrypted.shield@domain.com
```

**Tech Wizard:**

```
quantum.node@domain.com
binary.daemon@domain.com
neural.circuit@domain.com
async.kernel@domain.com
```

**Nature Zen:**

```
alpine.creek@domain.com
misty.forest@domain.com
ocean.valley@domain.com
jade.harbor@domain.com
```

### Output File Format

```json
[
  {
    "alias": "cipher.vault@example.com",
    "ruleId": "abc123def456",
    "createdAt": "2025-12-31T10:25:00.000Z",
    "status": "success",
    "bundle": "privacy-guardian"
  },
  {
    "alias": "quantum.node@example.com",
    "ruleId": "ghi789jkl012",
    "createdAt": "2025-12-31T10:25:01.000Z",
    "status": "success",
    "bundle": "tech-wizard"
  }
]
```

**Filename includes bundle:** `email-aliases-{bundle}-{date}.json`

---

## 🎨 How It Works

### Privacy-Focused Name Generation

Each bundle contains curated word lists designed for maximum privacy:

- **No personal names** in Privacy Guardian, Tech Wizard, Urban Legend
- **Abstract concepts** that don't leak identity
- **50-70 words per category** = 3,000-4,000 combinations per bundle
- **Thematic consistency** maintains professionalism

### Selection Algorithm

1. User selects themed bundle (1-6)
2. User specifies count (1-500)
3. Script uses seeded PRNG for deterministic generation
4. Combines prefix + suffix from selected bundle
5. Ensures no duplicates within run
6. Creates Cloudflare Email Routing rules

### Why Themed Bundles?

- **Choice & Control**: Pick themes matching your use case
- **Better Privacy**: Harder to pattern-match across different themes
- **Organization**: Group aliases by purpose (tech, personal, shopping, etc.)
- **Fun & Engaging**: Makes privacy tools more accessible

---

## 🛠️ Advanced Usage

### Reproducible Alias Sets

Generate the same aliases across multiple runs:

```bash
RANDOM_SEED=12345 node create-email-aliases.js
# Then select bundle and count as usual
```

### Rate Limit Adjustment

If you encounter rate limits:

```bash
REQUEST_DELAY_MS=500 node create-email-aliases.js
```

### Smaller Batches

Create aliases in chunks for better control:

```bash
node create-email-aliases.js
# Select bundle: 1
# Count: 25
```

### Delete Aliases

Clean up using the JSON output:

```bash
# Dry run first
node delete-email-aliases.js email-aliases-privacy-guardian-2025-12-31.json --dry-run

# Actually delete
node delete-email-aliases.js email-aliases-privacy-guardian-2025-12-31.json
```

---

## ❓ FAQ

<details>
<summary><b>Which bundle should I choose?</b></summary>

- **Privacy Guardian**: Maximum anonymity, security-focused services
- **Tech Wizard**: Developer tools, SaaS, technical platforms
- **Nature Zen**: Personal use, wellness, travel
- **Urban Legend**: Shopping, entertainment, modern services
- **Cosmic Explorer**: Gaming, creative, sci-fi content
- **Mystic Shadow**: Fantasy gaming, creative platforms

Mix and match across different runs for better privacy!

</details>

<details>
<summary><b>Can I customize the word lists?</b></summary>

Yes! Edit the `WORD_BUNDLES` object in `create-email-aliases.js` to add your own words or create new bundles.

</details>

<details>
<summary><b>Why am I getting "Authentication error"?</b></summary>

Your API token doesn't have Email Routing permissions. Create a new token:

1. Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Create Token → "Edit zone Email Routing Routes"
3. Update `CLOUDFLARE_API_TOKEN` in `.env`
4. Run `node test-credentials.js` to verify

</details>

<details>
<summary><b>How many aliases can I create per bundle?</b></summary>

- Each bundle has 3,000-4,000 unique combinations
- You can create up to 500 per run
- Cloudflare free plan supports 200 routing rules total
- Mix bundles across runs for more variety

</details>

<details>
<summary><b>Can I use multiple bundles?</b></summary>

Absolutely! Run the script multiple times and choose different bundles each time. The JSON output tracks which bundle each alias came from.

</details>

<details>
<summary><b>What happens if the script fails midway?</b></summary>

The JSON file is written at the end with all results, including failures. Successfully created aliases remain active. You can adjust the count and re-run.

</details>

---

## 🔒 Security Best Practices

- ✅ Never commit `.env` to version control (already in `.gitignore`)
- ✅ Use scoped API tokens with minimal permissions
- ✅ Rotate tokens regularly
- ✅ Store output JSON files securely
- ✅ **Use different bundles** for different purposes to prevent pattern analysis
- ✅ **Mix bundles** across services for maximum privacy

---

## 🤝 Contributing

Contributions are welcome! Ideas:

- 🎨 **New themed bundles** (Military, Ocean, Space, etc.)
- 🌍 Multi-language support
- 📊 Analytics dashboard
- 🧪 Unit tests
- 📝 Documentation improvements

**How to contribute:**

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a [Pull Request](https://github.com/instax-dutta/email-aliases-creator/pulls)

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with ❤️ for privacy-conscious users
- Powered by [Cloudflare Email Routing](https://developers.cloudflare.com/email-routing/)
- Zero dependencies, maximum reliability
- Inspired by the need for better email privacy

---

## 📞 Support

- 🐛 [Report a bug](https://github.com/instax-dutta/email-aliases-creator/issues)
- 💡 [Request a feature](https://github.com/instax-dutta/email-aliases-creator/issues)
- 📖 [Documentation](https://github.com/instax-dutta/email-aliases-creator/wiki)

---

<div align="center">

**If this saved you time, give it a ⭐ on GitHub!**

Made with 🚀 by developers, for developers

*Protecting privacy, one alias at a time*

</div>
