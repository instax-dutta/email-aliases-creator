# Quick Reference Cheatsheet

## 🎨 New: Themed Word Bundles

The script now features **6 privacy-focused themed bundles** for personalized alias generation!

### Available Bundles

1. **🛡️ Privacy Guardian** - Security & anonymity (3,136 combinations)
2. **⚡ Tech Wizard** - Tech & coding (3,192 combinations)
3. **🌿 Nature Zen** - Calm & natural (3,136 combinations)
4. **🏙️ Urban Legend** - Modern & city (3,136 combinations)
5. **🚀 Cosmic Explorer** - Space & sci-fi (3,920 combinations)
6. **🔮 Mystic Shadow** - Fantasy & mysterious (3,024 combinations)

---

## Setup (First Time Only)

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Edit .env with your credentials
nano .env  # or use your preferred editor

# 3. Verify Node.js version (must be 18+)
node --version
```

---

## Interactive Mode (Default)

### Create Aliases

```bash
# Run the script
node create-email-aliases.js

# The script will ask you:
# 1. Which bundle? (1-6)
# 2. How many aliases? (1-500)

# Example session:
🎯 Select a bundle (1-6): 1
✅ Selected: 🛡️ Privacy Guardian

📧 How many aliases to create? (1-500, default 100): 50
✅ Creating 50 aliases
```

### Dry Run (Preview)

```bash
# Test before creating
node create-email-aliases.js --dry-run

# Shows first 10 aliases that would be created
```

---

## Programmatic Mode (Automation)

```bash
# Privacy Guardian - 100 aliases
echo -e "1\n100" | node create-email-aliases.js

# Tech Wizard - 50 aliases
echo -e "2\n50" | node create-email-aliases.js

# Nature Zen - 25 aliases  
echo -e "3\n25" | node create-email-aliases.js
```

---

## Common Commands

### Test Credentials

```bash
node test-credentials.js
# All 3 tests should pass ✅
```

### Delete Aliases

```bash
# Dry run deletion
node delete-email-aliases.js email-aliases-privacy-guardian-2025-12-31.json --dry-run

# Actually delete
node delete-email-aliases.js email-aliases-privacy-guardian-2025-12-31.json
```

### NPM Shortcuts

```bash
npm start       # Interactive mode
npm run dry-run # Preview mode
npm test        # Test credentials
```

---

## Bundle Selection Guide

| Bundle | Best For | Example Aliases |
|--------|----------|-----------------|
| 🛡️ Privacy Guardian | Max anonymity, security services | `cipher.vault`, `ghost.proxy` |
| ⚡ Tech Wizard | Developer tools, SaaS | `quantum.node`, `binary.daemon` |
| 🌿 Nature Zen | Personal, wellness, travel | `alpine.creek`, `ocean.valley` |
| 🏙️ Urban Legend | Shopping, entertainment | `neon.pulse`, `apex.grid` |
| 🚀 Cosmic Explorer | Gaming, sci-fi | `nova.orbit`, `stellar.void` |
| 🔮 Mystic Shadow | Fantasy, creative | `shadow.rune`, `phantom.oracle` |

---

## Environment Variables Quick Reference

```bash
# Required
CLOUDFLARE_API_TOKEN=your_token     # Get from Cloudflare Dashboard
CLOUDFLARE_ZONE_ID=your_zone_id     # Found in domain overview
EMAIL_DOMAIN=yourdomain.com         # Your domain
DESTINATION_EMAIL=inbox@gmail.com   # Where emails forward to

# Optional
REQUEST_DELAY_MS=100                # Delay between requests
RANDOM_SEED=12345                   # For reproducibility
```

**Note:** `ALIAS_COUNT` is now interactive (prompted at runtime)

---

## Troubleshooting Commands

### Check Node.js Version

```bash
node --version  # Should be v18 or higher
```

### Validate Environment Variables

```bash
# Check if variables are set
env | grep CLOUDFLARE
```

### Test API Token

```bash
# Quick API test (should return zone info)
curl -X GET "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json"
```

---

## Output Files

| File Pattern | Contains |
|-------------|----------|
| `email-aliases-{bundle}-{date}.json` | Created aliases with rule IDs |
| Bundle name in filename | Tracks which theme was used |

**Example:** `email-aliases-privacy-guardian-2025-12-31.json`

---

## Rate Limiting Tips

If you hit rate limits:

```bash
# Increase delay to 500ms between requests
REQUEST_DELAY_MS=500 node create-email-aliases.js

# Or create in smaller batches  
# Choose smaller count when prompted (e.g., 25 instead of 100)
```

---

## Security Checklist

- [ ] Never commit `.env` to git (protected by `.gitignore`)
- [ ] Keep output JSON files secure  
- [ ] Use scoped API tokens with minimal permissions
- [ ] Rotate tokens regularly
- [ ] **Mix different bundles** for better privacy
- [ ] Delete test aliases after experimentation

---

## Example Workflow

```bash
# 1. Setup
cp .env.example .env
# Edit .env with your credentials

# 2. Test credentials
npm test
# ✅ All checks should pass

# 3. Preview first
npm run dry-run
# Choose bundle: 1 (Privacy Guardian)
# Count: 10

# 4. Create for real
npm start
# Choose bundle: 1
# Count: 100

# 5. Check results
ls -lh email-aliases-*.json
cat email-aliases-privacy-guardian-2025-12-31.json

# 6. (Optional) Try different bundle
npm start
# Choose bundle: 2 (Tech Wizard)
# Count: 50
```

---

## Pro Tips

### Mix Bundles for Better Privacy

```bash
# Run 1: Privacy Guardian for sensitive accounts
npm start  # Select: 1, Count: 30

# Run 2: Tech Wizard for developer services  
npm start  # Select: 2, Count: 30

# Run 3: Nature Zen for personal use
npm start  # Select: 3, Count: 30
```

### Reproducible Generation

```bash
# Set seed for consistent results
RANDOM_SEED=42 npm start
# Same seed + bundle = same aliases every time
```

### Dry Run Different Bundles

```bash
# Test all bundles before committing
for bundle in {1..6}; do
  echo -e "${bundle}\n10" | node create-email-aliases.js --dry-run
done
```

---

## Exit Codes

- `0` = Success (all aliases created)
- `1` = Error (check logs for details)

---

## Quick Links

- 📖 [Full README](README.md) - Complete documentation
- 🐛 [Report Issue](https://github.com/instax-dutta/email-aliases-creator/issues)
- 💡 [Request Feature](https://github.com/instax-dutta/email-aliases-creator/issues)

---

**Need help?** Check the [FAQ](README.md#-faq) in the full README!
