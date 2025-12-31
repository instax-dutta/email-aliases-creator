<div align="center">

# 🚀 Cloudflare Email Alias Creator

### Bulk create human-readable email aliases with Cloudflare Email Routing

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-blue.svg)](package.json)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

[Features](#-features) • [Quick Start](#-quick-start) • [Usage](#-usage) • [Examples](#-examples) • [FAQ](#-faq)

</div>

---

## 🎯 What is this?

A production-grade Node.js script that **programmatically creates hundreds of beautiful, human-readable email aliases** using Cloudflare's Email Routing API.

Instead of manually creating aliases one-by-one, generate them in bulk:

```
✨ luna.fox@yourdomain.com
✨ amber.wolf@yourdomain.com  
✨ neo.tiger@yourdomain.com
... and 97 more in seconds!
```

All aliases automatically forward to your main inbox. Perfect for:

- 🛡️ Privacy-focused email management
- 🧪 Testing and development
- 📧 Service-specific aliases (Netflix, Amazon, etc.)
- 🎭 Disposable email addresses
- 🔐 Enhanced security with unique emails per service

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎨 **Human-Readable Names** | Beautiful aliases like `luna.fox@domain.com` instead of random strings |
| 🔢 **Bulk Creation** | Create 100s of aliases in one go (configurable) |
| 🎲 **Deterministic Seeding** | Reproducible alias generation with optional seed |
| ⚡ **Smart Rate Limiting** | Automatic delays to respect API limits |
| 🔄 **Auto-Retry Logic** | Exponential backoff for transient failures |
| 🧪 **Dry Run Mode** | Preview aliases before creating them |
| 📊 **JSON Export** | Complete audit trail with rule IDs and timestamps |
| 🚫 **Zero Dependencies** | Uses only Node.js native modules |
| 🛠️ **Bonus Tools** | Credential tester and deletion script included |

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
git clone https://github.com/yourusername/email-alias-creator.git
cd email-alias-creator
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

### 4️⃣ Create Your Aliases

```bash
# Preview first (recommended)
node create-email-aliases.js --dry-run

# Create them for real
node create-email-aliases.js
```

🎉 **Done!** Check your `email-aliases-*.json` file for all created aliases.

---

## 💻 Usage

### Basic Commands

```bash
# Create 100 aliases (default)
node create-email-aliases.js

# Create a custom number
ALIAS_COUNT=50 node create-email-aliases.js

# Dry run (preview only)
node create-email-aliases.js --dry-run

# Test credentials
node test-credentials.js

# Delete aliases from a previous run
node delete-email-aliases.js email-aliases-2025-12-31.json
```

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `CLOUDFLARE_API_TOKEN` | ✅ Yes | - | Your Cloudflare API token |
| `CLOUDFLARE_ZONE_ID` | ✅ Yes | - | Zone ID for your domain |
| `EMAIL_DOMAIN` | ✅ Yes | - | Domain for aliases |
| `DESTINATION_EMAIL` | ✅ Yes | - | Where to forward emails |
| `ALIAS_COUNT` | No | `100` | Number of aliases to create |
| `REQUEST_DELAY_MS` | No | `100` | Delay between API requests |
| `RANDOM_SEED` | No | timestamp | Seed for reproducible names |

### NPM Scripts

```bash
npm start          # Create aliases
npm run dry-run    # Preview aliases
```

---

## 📸 Examples

### Successful Run

```
🚀 Cloudflare Email Routing Bulk Alias Creator

📋 Configuration:
   Domain: example.com
   Destination: inbox@gmail.com
   Aliases to create: 100
   Request delay: 100ms

🎲 Generating random alias names...
✅ Generated 100 unique names

📧 Creating email routing rules...

[1/100] Creating: luna.fox@example.com
✅ Created successfully (ID: abc123...)

[2/100] Creating: amber.wolf@example.com
✅ Created successfully (ID: def456...)

...

💾 Results exported to: email-aliases-2025-12-31.json

═══════════════════════════════════════════
📊 SUMMARY
═══════════════════════════════════════════
✅ Successful: 100
❌ Failed: 0
📧 Total: 100
═══════════════════════════════════════════
```

### Output File Format

```json
[
  {
    "alias": "luna.fox@example.com",
    "ruleId": "abc123def456",
    "createdAt": "2025-12-31T10:25:00.000Z",
    "status": "success"
  },
  {
    "alias": "neo.tiger@example.com",
    "ruleId": "ghi789jkl012",
    "createdAt": "2025-12-31T10:25:01.000Z",
    "status": "success"
  }
]
```

**Use this file to:**

- 📝 Map aliases to specific services
- 🔍 Audit which aliases were created
- 🗑️ Delete aliases later (with `delete-email-aliases.js`)

---

## 🎨 How Name Generation Works

The script combines words from three curated lists:

- **30 Adjectives**: `amber`, `cosmic`, `lunar`, `shadow`, etc.
- **30 First Names**: `alex`, `luna`, `neo`, `sage`, etc.
- **50 Nouns**: `fox`, `tiger`, `wolf`, `aurora`, `phoenix`, etc.

Each alias randomly picks:

- `{adjective}.{noun}` → `amber.wolf`
- `{firstname}.{noun}` → `luna.fox`

**Result:** 3,000+ unique combinations 🎯

Naming is deterministic with `RANDOM_SEED` for reproducibility.

---

## 🛠️ Advanced Usage

### Reproducible Alias Sets

Generate the same aliases across multiple runs:

```bash
RANDOM_SEED=12345 node create-email-aliases.js
```

### Rate Limit Adjustment

If you encounter rate limits:

```bash
REQUEST_DELAY_MS=500 node create-email-aliases.js
```

### Smaller Batches

Create aliases in chunks:

```bash
ALIAS_COUNT=25 node create-email-aliases.js
```

### Delete Aliases

Clean up using the JSON output:

```bash
# Dry run first
node delete-email-aliases.js email-aliases-2025-12-31.json --dry-run

# Actually delete
node delete-email-aliases.js email-aliases-2025-12-31.json
```

---

## ❓ FAQ

<details>
<summary><b>Why am I getting "Authentication error"?</b></summary>

Your API token doesn't have Email Routing permissions. Create a new token:

1. Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Create Token → "Edit zone Email Routing Routes"
3. Update `CLOUDFLARE_API_TOKEN` in `.env`
4. Run `node test-credentials.js` to verify

</details>

<details>
<summary><b>Can I customize the naming patterns?</b></summary>

Yes! Edit the `ADJECTIVES`, `FIRST_NAMES`, and `NOUNS` arrays in `create-email-aliases.js` to add your own words.

</details>

<details>
<summary><b>What happens if the script fails midway?</b></summary>

The JSON file is written at the end with all results, including failures. Successfully created aliases remain active. You can adjust `ALIAS_COUNT` and re-run to create the remaining ones.

</details>

<details>
<summary><b>Is there a limit to how many aliases I can create?</b></summary>

Cloudflare Email Routing supports up to 200 routing rules per zone on the free plan. Check your plan limits in the Cloudflare Dashboard.

</details>

<details>
<summary><b>Can I use this for multiple domains?</b></summary>

Yes! Just change `EMAIL_DOMAIN` and `CLOUDFLARE_ZONE_ID` in your `.env` file, or create separate `.env` files for each domain.

</details>

---

## 🔒 Security Best Practices

- ✅ Never commit `.env` to version control (already in `.gitignore`)
- ✅ Use scoped API tokens with minimal permissions
- ✅ Rotate tokens regularly
- ✅ Store output JSON files securely
- ✅ Use unique aliases per service for better tracking

---

## 🤝 Contributing

Contributions are welcome! Here are some ideas:

- 🎨 New naming patterns
- 🌍 Support for other email routing providers
- 📊 Better reporting/analytics
- 🧪 Unit tests
- 📝 Documentation improvements

**How to contribute:**

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with ❤️ for privacy-conscious users
- Powered by [Cloudflare Email Routing](https://developers.cloudflare.com/email-routing/)
- Zero dependencies, maximum reliability

---

## 📞 Support

- 🐛 [Report a bug](https://github.com/yourusername/email-alias-creator/issues)
- 💡 [Request a feature](https://github.com/yourusername/email-alias-creator/issues)
- 📖 [Documentation](https://github.com/yourusername/email-alias-creator/wiki)

---

<div align="center">

**If this saved you time, give it a ⭐ on GitHub!**

Made with 🚀 by developers, for developers

</div>
