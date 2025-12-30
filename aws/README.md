# AWS Deployment Scripts

Quick reference for deploying the Statsland website to AWS.

## Quick Start

```bash
# 1. Initial setup (one-time)
./aws/setup-infrastructure.sh dev

# 2. Deploy your application
./aws/deploy.sh dev

# 3. (Optional) Configure private access
./aws/configure-basic-auth.sh dev
```

## Available Scripts

### `setup-infrastructure.sh [environment]`
Creates AWS infrastructure (S3, CloudFront, OAI)

**Usage:**
```bash
./aws/setup-infrastructure.sh dev   # Development
./aws/setup-infrastructure.sh prod  # Production
```

**What it creates:**
- S3 bucket with versioning and lifecycle policies
- CloudFront distribution with custom error pages
- Origin Access Identity (OAI) for secure S3 access
- Proper bucket policies

**Time:** 15-20 minutes (CloudFront deployment)

---

### `deploy.sh [environment]`
Builds and deploys the React app

**Usage:**
```bash
./aws/deploy.sh dev   # Deploy to development
./aws/deploy.sh prod  # Deploy to production
```

**What it does:**
1. Validates infrastructure exists
2. Loads environment-specific `.env` file
3. Builds React app with `npm run build`
4. Uploads files to S3 with optimized cache headers
5. Invalidates CloudFront cache
6. Runs automated smoke tests

**Time:** 5-10 minutes (including build and cache invalidation)

---

### `configure-basic-auth.sh [environment]`
Sets up basic authentication using Lambda@Edge

**Usage:**
```bash
./aws/configure-basic-auth.sh dev
```

**Cost:** ~$0.60 per million requests (pay per use)

**Manual step required:** After running, you must attach the Lambda function to CloudFront via AWS Console (instructions provided by script)

---

### `configure-private-access.sh [environment]`
Sets up IP whitelisting using AWS WAF

**Usage:**
```bash
# Initial setup
./aws/configure-private-access.sh dev

# Add additional IP
./aws/configure-private-access.sh dev add-ip 203.0.113.45
```

**Cost:** ~$5-10/month base + $1 per million requests

**Note:** More expensive than basic auth but provides more robust security

---

## Configuration

### Environment Files

- `.env.dev` - Development environment variables
- `.env.prod` - Production environment variables
- `aws/config.sh` - AWS configuration (regions, bucket names, etc.)

### Cache Files

Scripts store state in `aws/.cache/`:
- `{env}-infrastructure.json` - Infrastructure IDs and details
- `{env}-last-deployment.json` - Last deployment timestamp and info
- `{env}-basic-auth.json` - Lambda@Edge configuration

**Note:** `.cache/` directory is gitignored

---

## Common Tasks

### Deploy after code changes
```bash
./aws/deploy.sh dev
```

### Check deployment status
```bash
# View CloudFront URL
cat aws/.cache/dev-infrastructure.json

# Check last deployment
cat aws/.cache/dev-last-deployment.json
```

### Invalidate cache manually
```bash
DIST_ID=$(cat aws/.cache/dev-infrastructure.json | grep cloudfront_distribution_id | cut -d'"' -f4)
aws cloudfront create-invalidation --distribution-id $DIST_ID --paths "/*"
```

### View CloudFront URL
```bash
DIST_ID=$(cat aws/.cache/dev-infrastructure.json | grep cloudfront_distribution_id | cut -d'"' -f4)
aws cloudfront get-distribution --id $DIST_ID --query "Distribution.DomainName" --output text
```

### Tear down infrastructure (cleanup)
```bash
# Delete CloudFront distribution (must disable first)
DIST_ID=$(cat aws/.cache/dev-infrastructure.json | grep cloudfront_distribution_id | cut -d'"' -f4)
aws cloudfront get-distribution-config --id $DIST_ID > /tmp/dist-config.json
# Edit /tmp/dist-config.json: set "Enabled": false
# Update distribution, wait ~15 mins, then delete

# Empty and delete S3 bucket
aws s3 rm s3://statsland-website-dev/ --recursive
aws s3api delete-bucket --bucket statsland-website-dev
```

---

## Troubleshooting

### "Infrastructure not found" error
```bash
# Re-run setup
./aws/setup-infrastructure.sh dev
```

### Deployment shows old version
```bash
# Hard refresh browser: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
# Wait 5-10 minutes for CloudFront invalidation to complete
```

### Build fails
```bash
# Clean build and node_modules cache
rm -rf build node_modules/.cache
npm run build
```

### Permission errors
```bash
# Make scripts executable
chmod +x aws/*.sh

# Check AWS credentials
aws sts get-caller-identity
```

---

## Documentation

See [AWS_DEPLOYMENT.md](../AWS_DEPLOYMENT.md) for comprehensive documentation including:
- Architecture overview
- Prerequisites and setup
- Private access configuration
- Going public with custom domain
- Smoke tests
- Cost optimization
- Detailed troubleshooting

---

## Support

For issues:
1. Check script output for error messages
2. Review AWS CloudWatch logs
3. See [AWS_DEPLOYMENT.md](../AWS_DEPLOYMENT.md) troubleshooting section
4. Check AWS Console for resource status
