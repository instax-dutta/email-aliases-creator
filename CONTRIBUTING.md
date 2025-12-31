# Contributing to Cloudflare Email Alias Creator

First off, thank you for considering contributing! 🎉

## 🤝 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected vs actual behavior**
- **Environment details** (Node.js version, OS, etc.)
- **Error messages** or logs

### Suggesting Features

Feature suggestions are welcome! Please:

- **Check existing feature requests** first
- **Explain the use case** clearly
- **Describe the proposed solution**
- **Consider alternatives** you've thought about

### Pull Requests

1. **Fork the repo** and create your branch from `main`
2. **Make your changes**:
   - Follow the existing code style
   - Add comments for complex logic
   - Update documentation if needed
3. **Test your changes**:
   - Run `node test-credentials.js`
   - Test with `--dry-run` first
   - Verify actual alias creation works
4. **Commit with clear messages**:
   - Use descriptive commit messages
   - Reference issues if applicable
5. **Push and create a Pull Request**

## 📝 Code Style Guidelines

- Use **modern JavaScript** (ES modules, async/await)
- Keep **zero external dependencies**
- Write **clear, self-documenting code**
- Add **inline comments** for complex logic
- Use **meaningful variable names**
- Follow **existing patterns** in the codebase

## 🧪 Testing

Before submitting a PR:

```bash
# Test credentials
node test-credentials.js

# Dry run
node create-email-aliases.js --dry-run

# Test with small count
ALIAS_COUNT=5 node create-email-aliases.js
```

## 💡 Ideas for Contributions

Here are some areas where contributions would be especially valuable:

### Features

- [ ] Web UI for easier configuration
- [ ] Support for other email providers (AWS SES, etc.)
- [ ] Bulk import/export of aliases
- [ ] Pattern-based name generation
- [ ] Email analytics/tracking
- [ ] Webhook notifications on email received

### Improvements

- [ ] Unit tests with a testing framework
- [ ] Better error messages
- [ ] Progress bar for bulk operations
- [ ] Colored terminal output
- [ ] CSV export option
- [ ] Statistics dashboard

### Documentation

- [ ] Video tutorial
- [ ] More example use cases
- [ ] Comparison with alternatives
- [ ] Troubleshooting guide expansion
- [ ] Non-English translations

## 🔧 Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/cloudflare-email-alias-creator.git
cd cloudflare-email-alias-creator

# Create .env file
cp .env.example .env
# Edit .env with your test credentials

# Test the setup
node test-credentials.js

# Make your changes
# ...

# Test your changes
node create-email-aliases.js --dry-run
```

## 📜 Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discriminatory language
- Trolling or insulting comments
- Personal or political attacks
- Publishing others' private information
- Any conduct inappropriate in a professional setting

## ❓ Questions?

Feel free to:

- Open an issue for discussion
- Reach out to maintainers
- Ask in pull request comments

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for making this project better!** 🚀
