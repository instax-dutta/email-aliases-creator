# Quick Reference Cheatsheet

## Setup (First Time Only)

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Edit .env with your credentials
nano .env  # or use your preferred editor

# 3. Verify Node.js version (must be 18+)
node --version
```

## Common Commands

### Create 100 Aliases (Default)

```bash
# Dry run first (recommended)
node create-email-aliases.js --dry-run

# Actually create them
node create-email-aliases.js
```

### Create Custom Number of Aliases

```bash
# Create only 50 aliases
ALIAS_COUNT=50 node create-email-aliases.js

# Create 500 aliases
ALIAS_COUNT=500 node create-email-aliases.js
```

### Reproducible Alias Generation

```bash
# Generate same aliases every time
RANDOM_SEED=12345 node create-email-aliases.js
```

### Delete Aliases

```bash
# Dry run deletion
node delete-email-aliases.js email-aliases-2025-12-31.json --dry-run

# Actually delete them
node delete-email-aliases.js email-aliases-2025-12-31.json
```

## Using NPM Scripts

```bash
# Dry run
npm run dry-run

# Create aliases
npm start
```

## Troubleshooting Commands

### Check Node.js Version

```bash
node --version  # Should be v18 or higher
```

### Validate Environment Variables

```bash
# Show all env vars (careful - shows secrets!)
env | grep CLOUDFLARE
```

### Test API Token

```bash
# Quick API test
curl -X GET "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json"
```

## File Locations

| File | Purpose |
|------|---------|
| `create-email-aliases.js` | Main script to create aliases |
| `delete-email-aliases.js` | Script to delete aliases |
| `.env` | Your credentials (create from .env.example) |
| `email-aliases-*.json` | Generated output files |
| `README.md` | Full documentation |

## Environment Variables Quick Reference

```bash
# Required
CLOUDFLARE_API_TOKEN=your_token
CLOUDFLARE_ZONE_ID=your_zone_id
EMAIL_DOMAIN=example.com
DESTINATION_EMAIL=inbox@example.com

# Optional
ALIAS_COUNT=100                # Number of aliases
REQUEST_DELAY_MS=100           # Delay between requests
RANDOM_SEED=12345              # For reproducibility
```

## Exit Codes

- `0` = Success
- `1` = Error (check logs)

## Rate Limiting Tips

If you hit rate limits:

```bash
# Increase delay to 500ms between requests
REQUEST_DELAY_MS=500 node create-email-aliases.js

# Or create in smaller batches
ALIAS_COUNT=50 node create-email-aliases.js
```

## Security Checklist

- [ ] Never commit `.env` to git
- [ ] Keep output JSON files secure
- [ ] Use scoped API tokens
- [ ] Rotate tokens regularly
- [ ] Delete test aliases after experimentation

## Example Workflow

```bash
# 1. Setup
cp .env.example .env
# Edit .env with your credentials

# 2. Test
npm run dry-run

# 3. Create 100 aliases
npm start

# 4. Check output
ls -lh email-aliases-*.json

# 5. (Optional) Delete if needed
node delete-email-aliases.js email-aliases-2025-12-31.json --dry-run
node delete-email-aliases.js email-aliases-2025-12-31.json
```

---

**Need help?** Check README.md for detailed documentation.
