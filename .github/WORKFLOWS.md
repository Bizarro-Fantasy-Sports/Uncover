# GitHub Actions Workflows Documentation

This document explains all GitHub Actions workflows configured for the Statsland Website project.

## Table of Contents
- [Overview](#overview)
- [Workflows](#workflows)
  - [CI Pipeline](#ci-pipeline)
  - [PR Checks](#pr-checks)
  - [Deploy to Dev](#deploy-to-dev)
  - [Changelog Reminder](#changelog-reminder)
- [Setup & Configuration](#setup--configuration)
- [Secrets Required](#secrets-required)
- [Troubleshooting](#troubleshooting)

---

## Overview

Our GitHub Actions workflows provide automated:
- ✅ **Continuous Integration (CI)** - Build, test, and security checks
- 🔍 **Pull Request validation** - Fast feedback on PRs before merge
- 🚀 **Automated deployment** - Deploy to dev environment on release branches
- 🔒 **Security scanning** - CodeQL analysis and dependency audits

### Workflow Triggers

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| CI Pipeline | Push to `main` | Validate production code |
| PR Checks | Pull requests to `main`/`develop` | Validate changes before merge |
| Deploy to Dev | Push to `release/**` branches | Auto-deploy to dev environment |
| Changelog Reminder | Pull requests opened/updated | Remind to update CHANGELOG.md (optional) |

---

## Workflows

### CI Pipeline
**File:** `.github/workflows/ci.yml`

Runs comprehensive checks on every push to the `main` branch to ensure code quality and security.

#### Jobs

**1. Build and Test**
- Checks out code
- Installs dependencies with `npm ci`
- Runs TypeScript type checking
- Runs ESLint for code quality
- Executes test suite
- Builds production bundle
- Reports bundle size

**2. Security Audit**
- Runs `npm audit` to check for vulnerable dependencies
- Performs dependency review (on PRs)
- Continues even with moderate vulnerabilities (warnings only)

**3. CodeQL Analysis**
- GitHub's security scanning for JavaScript/TypeScript
- Identifies security vulnerabilities and coding errors
- Results appear in Security tab

**4. Build Summary**
- Aggregates results from all jobs
- Creates summary in Actions tab

#### When It Runs
- ✅ Every push to `main`
- ✅ Manual trigger via Actions tab

#### Expected Duration
~3-5 minutes

---

### PR Checks
**File:** `.github/workflows/pr-checks.yml`

Fast feedback loop for pull requests before they're merged.

#### Jobs

**1. PR Validation**
- All the same checks as CI Pipeline
- Additional test coverage reporting
- Scans for `console.log` statements in new code
- Posts comment on PR with build status

#### When It Runs
- ✅ Every pull request to `main` or `develop`

#### Expected Duration
~3-5 minutes

#### PR Comments
After checks complete, the workflow automatically comments on the PR with:
- ✅/❌ Build status
- Commit SHA
- Link to full action logs

---

### Deploy to Dev
**File:** `.github/workflows/deploy-dev.yml`

Automatically deploys to development environment when release branches are pushed.

#### Jobs

**1. Build and Deploy**
- Checks out code
- Runs tests to ensure quality
- Builds production bundle with dev environment variables
- Runs smoke tests on build output
- **Deploys to configured platform** (needs configuration)
- Performs post-deployment health checks
- Creates deployment summary

**2. Notify**
- Sends notifications about deployment status
- (Needs configuration for Slack/Discord/etc.)

#### When It Runs
- ✅ Push to branches matching `release/**` or `release-*`
- ✅ Manual trigger via Actions tab

#### Expected Duration
~5-10 minutes (depends on deployment platform)

#### ⚠️ Configuration Required

This workflow includes **placeholder deployment steps**. You must configure your deployment platform:

**Option 1: Vercel**
```yaml
# Uncomment in deploy-dev.yml
- name: Deploy to Vercel
  uses: amondnet/vercel-action@v25
  with:
    vercel-token: ${{ secrets.VERCEL_TOKEN }}
    vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
    vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

**Option 2: Netlify**
```yaml
# Uncomment in deploy-dev.yml
- name: Deploy to Netlify
  uses: nwtgck/actions-netlify@v3
  with:
    publish-dir: './build'
    production-deploy: false
  env:
    NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
    NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

**Option 3: AWS S3 + CloudFront**
```yaml
# Uncomment in deploy-dev.yml
- name: Deploy to S3
  run: |
    aws s3 sync build/ s3://your-dev-bucket --delete
    aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

---

### Changelog Reminder
**File:** `.github/workflows/changelog-reminder.yml`

Automatically reminds contributors to update the changelog when opening or updating pull requests.

#### Jobs

**1. Check Changelog**
- Detects if `CHANGELOG.md` was modified in the PR
- Analyzes commits and generates suggested changelog entry
- Comments on PR with reminder and suggestion
- Adds/removes `needs-changelog` label
- Updates comment when changelog is added

#### When It Runs
- ✅ Pull requests opened to `main` or `develop`
- ✅ Pull requests synchronized (new commits pushed)
- ✅ Pull requests reopened

#### Expected Duration
~30 seconds

#### How It Works

**If CHANGELOG.md is NOT updated:**
1. Workflow analyzes the PR title and commits
2. Generates a suggested changelog entry based on changes
3. Posts a comment on the PR with:
   - Reminder about changelog
   - Auto-generated suggested entry
   - Instructions on how to update
4. Adds `needs-changelog` label to PR

**If CHANGELOG.md IS updated:**
1. Workflow detects the changelog modification
2. Updates the comment to show ✅ changelog updated
3. Removes `needs-changelog` label from PR

#### PR Comment Example

When a PR doesn't include changelog updates, the bot comments:

```markdown
## 📝 Changelog Reminder

This PR does not include an update to `CHANGELOG.md`.

**Is a changelog entry needed?**
- ✅ Yes, if this PR includes user-facing changes
- ❌ No, if this is internal refactoring or tests only

### Suggested Changelog Entry
[Auto-generated entry based on your commits]

<details>
<summary>How to update CHANGELOG.md</summary>
[Instructions...]
</details>
```

#### Important Notes

⚠️ **This is a reminder, not a blocker**
- You can merge PRs without updating the changelog
- Useful for internal changes that don't affect users
- Helps maintain documentation for user-facing changes

**When to update CHANGELOG.md:**
- ✅ New features
- ✅ Bug fixes
- ✅ Breaking changes
- ✅ Deprecations
- ✅ Security fixes

**When you can skip:**
- ❌ Internal refactoring
- ❌ Test additions/updates
- ❌ Documentation-only changes
- ❌ CI/CD updates
- ❌ Dependency updates (unless they fix bugs)

---

## Setup & Configuration

### Initial Setup

1. **Enable GitHub Actions**
   - Actions are enabled by default for public repositories
   - For private repos: Settings → Actions → General → Enable Actions

2. **Configure Branch Protection (Recommended)**
   ```
   Settings → Branches → Add rule for 'main'
   - ✅ Require status checks to pass before merging
   - ✅ Select: "Build and Test", "Security Audit"
   - ✅ Require branches to be up to date before merging
   ```

3. **Set Up Environments**
   ```
   Settings → Environments → New environment
   Name: dev
   - Add deployment URL once configured
   - Optionally add required reviewers
   ```

### Configuring Deployment

1. **Choose your deployment platform** (Vercel, Netlify, AWS, etc.)

2. **Add required secrets** (see Secrets section below)

3. **Uncomment the appropriate deployment section** in `deploy-dev.yml`

4. **Update environment variables**:
   ```yaml
   env:
     REACT_APP_ENV: dev
     REACT_APP_API_URL: ${{ secrets.DEV_API_URL }}
     # Add your environment-specific variables
   ```

5. **Test deployment** by creating a test release branch:
   ```bash
   git checkout -b release/test-deployment
   git push origin release/test-deployment
   ```

---

## Secrets Required

Add these secrets in: **Settings → Secrets and variables → Actions → New repository secret**

### Required for All Deployments
None (base workflows work without secrets)

### For Vercel Deployment
| Secret | Description | How to Get |
|--------|-------------|------------|
| `VERCEL_TOKEN` | Vercel authentication token | Vercel → Settings → Tokens |
| `VERCEL_ORG_ID` | Your Vercel organization ID | Project settings in Vercel |
| `VERCEL_PROJECT_ID` | Your Vercel project ID | Project settings in Vercel |

### For Netlify Deployment
| Secret | Description | How to Get |
|--------|-------------|------------|
| `NETLIFY_AUTH_TOKEN` | Netlify authentication token | Netlify → User Settings → Applications |
| `NETLIFY_SITE_ID` | Your site ID | Site Settings → General → Site details |

### For AWS Deployment
| Secret | Description | How to Get |
|--------|-------------|------------|
| `AWS_ACCESS_KEY_ID` | AWS access key | AWS IAM → Users → Security credentials |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | AWS IAM → Users → Security credentials |

### Optional Secrets
| Secret | Purpose |
|--------|---------|
| `SLACK_WEBHOOK` | Slack notifications for deployments |
| `DEV_API_URL` | Dev environment API endpoint |

---

## Troubleshooting

### Common Issues

#### 1. "npm ci" fails
**Error:** `npm ci can only install packages when your package.json and package-lock.json are in sync`

**Solution:**
```bash
npm install
git add package-lock.json
git commit -m "Update package-lock.json"
```

#### 2. Build fails on "CI=true npm test"
**Error:** Tests fail in CI but pass locally

**Solution:**
- CI mode runs tests once without watch mode
- Add `--passWithNoTests` flag if you have no tests yet
- Check for environment-specific issues

#### 3. CodeQL analysis fails
**Error:** CodeQL initialization fails

**Solution:**
- Ensure `javascript-typescript` is the correct language
- Check that repository has JavaScript/TypeScript files
- CodeQL only works on public repos or GitHub Enterprise

#### 4. Deployment placeholder runs but doesn't deploy
**Error:** See message "Configure deployment target in workflow file"

**Solution:**
- This is expected! Uncomment and configure your deployment platform
- See "Configuring Deployment" section above

#### 5. "Lint warnings treated as errors"
**Error:** ESLint warnings fail the build

**Solution:**
- Fix the linting issues, or
- Change `npm run lint` to continue-on-error
- Update ESLint rules if too strict

### Viewing Logs

1. Go to **Actions** tab in your repository
2. Click on the workflow run
3. Click on the specific job
4. Expand steps to see detailed logs

### Manual Workflow Trigger

Some workflows support manual triggering:

1. Go to **Actions** tab
2. Select the workflow (e.g., "Deploy to Dev")
3. Click **Run workflow** button
4. Select branch and click **Run workflow**

### Getting Help

- Check [GitHub Actions documentation](https://docs.github.com/en/actions)
- Review workflow run logs for specific error messages
- Check this repo's Issues tab for known problems
- Create an issue with the `github-actions` label

---

## Workflow Status Badges

Add these to your README.md to show workflow status:

```markdown
![CI Pipeline](https://github.com/YOUR_USERNAME/statsland-website/actions/workflows/ci.yml/badge.svg)
![PR Checks](https://github.com/YOUR_USERNAME/statsland-website/actions/workflows/pr-checks.yml/badge.svg)
![Deploy to Dev](https://github.com/YOUR_USERNAME/statsland-website/actions/workflows/deploy-dev.yml/badge.svg)
```

---

## Best Practices

### For Developers

1. **Run tests locally** before pushing
   ```bash
   npm test
   npm run build
   ```

2. **Check Actions tab** after pushing to see if workflows pass

3. **Fix issues quickly** - failed workflows block merges if branch protection is enabled

4. **Don't commit secrets** - always use GitHub Secrets

### For Maintainers

1. **Review failed workflows** - investigate and fix root causes

2. **Keep dependencies updated** - run `npm audit fix` regularly

3. **Monitor workflow run times** - optimize if builds take >10 minutes

4. **Adjust CodeQL schedule** if needed (default: on every push)

---

## Next Steps

- [ ] Configure your deployment platform (Vercel/Netlify/AWS)
- [ ] Add required secrets to repository
- [ ] Test deployment with a release branch
- [ ] Set up branch protection rules
- [ ] Add workflow status badges to README
- [ ] Configure Slack/Discord notifications (optional)
- [ ] Set up Dependabot for automated dependency updates

---

**Last Updated:** 2025-12-26
**Maintained By:** Statsland Team
**Questions?** Open an issue with the `github-actions` label
