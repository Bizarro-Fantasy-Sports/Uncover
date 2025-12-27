# GitHub Configuration

This directory contains GitHub-specific configuration files for the Statsland Website project.

## Contents

- **`workflows/`** - GitHub Actions workflow definitions
  - `ci.yml` - Continuous Integration pipeline (runs on push to main)
  - `pr-checks.yml` - Pull Request validation checks
  - `deploy-dev.yml` - Automated deployment to dev environment

- **`dependabot.yml`** - Dependabot configuration for automated dependency updates

- **`WORKFLOWS.md`** - **📖 Comprehensive documentation for all workflows** - **START HERE**

## Quick Links

- [Workflows Documentation](./WORKFLOWS.md) - Detailed guide to all GitHub Actions
- [GitHub Actions Dashboard](../../actions) - View workflow runs
- [Security Alerts](../../security) - CodeQL and dependency alerts

## Getting Started

1. **Read the documentation**: Start with [WORKFLOWS.md](./WORKFLOWS.md)
2. **Configure deployment**: Follow the setup guide in the documentation
3. **Add secrets**: Configure required secrets in repository settings
4. **Enable branch protection**: Recommended for main branch

## Need Help?

- Check [WORKFLOWS.md](./WORKFLOWS.md) for troubleshooting
- View workflow logs in the Actions tab
- Open an issue with the `github-actions` label
