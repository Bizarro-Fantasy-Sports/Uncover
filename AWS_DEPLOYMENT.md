# AWS Deployment Guide

This document provides comprehensive instructions for deploying the Statsland website to AWS.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Deployment Process](#deployment-process)
- [Private Access Configuration](#private-access-configuration)
- [Going Public](#going-public)
- [Smoke Tests](#smoke-tests)
- [Troubleshooting](#troubleshooting)
- [Cost Optimization](#cost-optimization)

## Architecture Overview

The deployment uses a serverless, cost-optimized architecture:

```
Users
  ↓
Namecheap DNS (yourdomain.com → CloudFront)
  ↓
CloudFront CDN (Global distribution, SSL/TLS)
  ↓
S3 Bucket (Static website hosting)
```

**Components:**
- **S3**: Stores static build files (HTML, JS, CSS, images)
- **CloudFront**: Global CDN for fast delivery, HTTPS enforcement, SPA routing
- **Route53/Namecheap DNS**: Domain name routing (for production)
- **Lambda@Edge** (optional): Basic authentication for private access
- **WAF** (optional): IP whitelisting for private access

## Prerequisites

1. **AWS Account**: With appropriate permissions (S3, CloudFront, IAM)
2. **AWS CLI**: Installed and configured
   ```bash
   # Install AWS CLI
   brew install awscli  # macOS
   # or download from https://aws.amazon.com/cli/

   # Configure AWS CLI
   aws configure
   # Enter your AWS Access Key ID, Secret Access Key, Region (us-west-2), and output format (json)
   ```

3. **Node.js and npm**: For building the React app
   ```bash
   node --version  # Should be v14+
   npm --version
   ```

4. **Environment Variables**: Configure `.env.dev` and `.env.prod` with your API URLs and Auth0 settings

## Initial Setup

### Step 1: Configure Environment Variables

1. **Update `.env.dev`** with your development API endpoint:
   ```bash
   REACT_APP_API_BASE_URL=https://your-api-gateway-dev-url.execute-api.us-west-2.amazonaws.com
   ```

2. **Update `.env.prod`** (for future production deployment):
   ```bash
   REACT_APP_API_BASE_URL=https://your-api-gateway-prod-url.execute-api.us-west-2.amazonaws.com
   REACT_APP_AUTH0_DOMAIN=your-prod-auth0-domain.auth0.com
   REACT_APP_AUTH0_CLIENT_ID=your-prod-client-id
   ```

### Step 2: Make Scripts Executable

```bash
chmod +x aws/setup-infrastructure.sh
chmod +x aws/deploy.sh
chmod +x aws/configure-basic-auth.sh
chmod +x aws/configure-private-access.sh
```

### Step 3: Set Up AWS Infrastructure

Run the infrastructure setup script to create S3 bucket and CloudFront distribution:

```bash
./aws/setup-infrastructure.sh dev
```

**What this creates:**
- S3 bucket: `statsland-website-dev`
- CloudFront distribution with Origin Access Identity (OAI)
- S3 bucket policy to allow CloudFront access only
- CloudFront custom error pages for SPA routing

**Expected output:**
```
[INFO] Creating S3 bucket: statsland-website-dev
[SUCCESS] S3 bucket created successfully
[INFO] Creating CloudFront distribution...
[SUCCESS] CloudFront distribution created: E1234567890ABC
[INFO] CloudFront URL: https://d111111abcdef8.cloudfront.net
[WARNING] Note: CloudFront distribution deployment can take 15-20 minutes
```

**Important:** Wait 15-20 minutes for CloudFront to fully deploy before the first deployment.

## Deployment Process

### Quick Deployment

For most deployments, simply run:

```bash
./aws/deploy.sh dev
```

### What the Deployment Script Does

1. **Checks infrastructure**: Verifies S3 and CloudFront are set up
2. **Loads environment**: Uses `.env.dev` or `.env.prod` based on environment
3. **Builds the app**: Runs `npm run build` with production optimizations
4. **Uploads to S3**: Syncs build files with proper cache headers
5. **Invalidates CloudFront cache**: Ensures users get the latest version
6. **Runs smoke tests**: Verifies deployment is working

### Manual Deployment Steps

If you need more control:

```bash
# 1. Build the application
npm run build

# 2. Upload to S3
aws s3 sync build/ s3://statsland-website-dev/ \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "*.html"

# Upload HTML separately (short cache for SPA routing)
aws s3 sync build/ s3://statsland-website-dev/ \
  --cache-control "public, max-age=0, must-revalidate" \
  --content-type "text/html" \
  --exclude "*" --include "*.html"

# 3. Invalidate CloudFront cache
DIST_ID=$(cat aws/.cache/dev-infrastructure.json | grep cloudfront_distribution_id | cut -d'"' -f4)
aws cloudfront create-invalidation --distribution-id $DIST_ID --paths "/*"
```

## Private Access Configuration

For development environments, you want to restrict access. Choose one option:

### Option 1: Basic Authentication (Recommended - Cheaper)

**Cost:** ~$0.60 per million requests (only pay for usage)

```bash
./aws/configure-basic-auth.sh dev
```

You'll be prompted for a username and password. This creates a Lambda@Edge function that requires basic authentication.

**Manual step required:** Follow the instructions printed by the script to attach the Lambda function to CloudFront in the AWS Console.

### Option 2: IP Whitelisting with WAF

**Cost:** ~$5-10/month base cost + $1 per million requests

```bash
./aws/configure-private-access.sh dev
```

This creates:
- WAF IP set with your current IP
- WAF Web ACL that blocks all traffic except whitelisted IPs
- Instructions to attach WAF to CloudFront

**To add more IPs:**
```bash
./aws/configure-private-access.sh dev add-ip 203.0.113.45
```

## Going Public

When you're ready to make the website publicly accessible:

### Step 1: Remove Private Access

**If using Basic Auth:**
1. Go to CloudFront console
2. Edit the distribution behavior
3. Remove the Lambda@Edge association
4. Save and wait for deployment (~15 minutes)

**If using WAF:**
1. Detach WAF from CloudFront distribution
2. (Optional) Delete WAF Web ACL and IP sets if no longer needed

### Step 2: Configure Custom Domain

1. **Purchase domain** (if not already done) from Namecheap, Route53, etc.

2. **Request SSL certificate in AWS Certificate Manager (ACM):**
   ```bash
   # Certificate MUST be in us-east-1 for CloudFront
   aws acm request-certificate \
     --domain-name yourdomain.com \
     --validation-method DNS \
     --subject-alternative-names www.yourdomain.com \
     --region us-east-1
   ```

3. **Validate certificate:**
   - Get CNAME records from ACM
   - Add them to your domain's DNS settings
   - Wait for validation (5-30 minutes)

4. **Update CloudFront distribution:**
   - Go to CloudFront console
   - Edit distribution
   - Under "Alternate Domain Names (CNAMEs)", add your domain
   - Under "SSL Certificate", select your ACM certificate
   - Save changes and wait for deployment

5. **Update DNS records:**

   **Option A: Using Route53 (AWS DNS):**
   ```bash
   # Create hosted zone
   aws route53 create-hosted-zone --name yourdomain.com --caller-reference $(date +%s)

   # Create alias record pointing to CloudFront
   # (Use AWS Console or CLI with JSON config)
   ```

   **Option B: Using Namecheap or other DNS:**
   - Add CNAME record:
     - Host: `www`
     - Value: `d111111abcdef8.cloudfront.net` (your CloudFront domain)
   - Add CNAME/ALIAS for root domain (or use A record with CloudFront IP)

### Step 3: Update Environment Configuration

Update `.env.prod` with production settings and redeploy:

```bash
./aws/deploy.sh prod
```

## Smoke Tests

The deployment script automatically runs smoke tests. You can also run them manually:

```bash
# Get CloudFront URL
CF_URL=$(cat aws/.cache/dev-infrastructure.json | grep cloudfront_distribution_id | cut -d'"' -f4)
CF_DOMAIN=$(aws cloudfront get-distribution --id $CF_URL --query "Distribution.DomainName" --output text)

# Test 1: Site is accessible
curl -I https://$CF_DOMAIN
# Expected: HTTP 200 OK

# Test 2: HTTPS redirect
curl -I http://$CF_DOMAIN
# Expected: HTTP 301 or 302 redirecting to HTTPS

# Test 3: SPA routing (404 should return index.html)
curl -I https://$CF_DOMAIN/some-non-existent-route
# Expected: HTTP 200 OK (not 404)

# Test 4: Static assets are cached
curl -I https://$CF_DOMAIN/static/js/main.js
# Expected: Cache-Control header with max-age
```

### Manual Testing Checklist

- [ ] Homepage loads correctly
- [ ] Navigation between routes works
- [ ] Refresh on a non-root route doesn't give 404
- [ ] API calls work (check browser console)
- [ ] Auth0 login/logout works
- [ ] Static assets load (images, fonts, etc.)
- [ ] Console has no errors
- [ ] Mobile responsive design works

## Troubleshooting

### CloudFront shows old version after deployment

**Cause:** Cache not invalidated or invalidation still in progress

**Solution:**
```bash
# Check invalidation status
DIST_ID=$(cat aws/.cache/dev-infrastructure.json | grep cloudfront_distribution_id | cut -d'"' -f4)
aws cloudfront list-invalidations --distribution-id $DIST_ID

# Create new invalidation
aws cloudfront create-invalidation --distribution-id $DIST_ID --paths "/*"

# Hard refresh in browser: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows/Linux)
```

### 403 Forbidden error

**Cause:** Either WAF/basic auth is blocking, or S3 bucket policy is incorrect

**Solution:**
```bash
# Check CloudFront distribution status
aws cloudfront get-distribution --id $DIST_ID

# Verify S3 bucket policy allows CloudFront OAI
aws s3api get-bucket-policy --bucket statsland-website-dev
```

### SPA routes return 404

**Cause:** CloudFront custom error pages not configured

**Solution:**
Verify CloudFront has custom error responses:
- 403 → /index.html (200)
- 404 → /index.html (200)

### Environment variables not updating

**Cause:** Build used old .env file or env vars not loaded

**Solution:**
```bash
# Force rebuild with correct env
rm -rf build node_modules/.cache
npm run build

# Verify environment in build
grep -r "REACT_APP" build/static/js/main.*.js
```

### "Distribution not found" error

**Cause:** Infrastructure setup didn't complete or cache file is missing

**Solution:**
```bash
# Re-run infrastructure setup
./aws/setup-infrastructure.sh dev

# Or manually check CloudFront distributions
aws cloudfront list-distributions --query "DistributionList.Items[*].[Id,Comment,DomainName]" --output table
```

### Lambda@Edge not working

**Cause:** Lambda function not properly attached or still deploying

**Solution:**
- Wait 15-20 minutes after attaching Lambda to CloudFront
- Verify Lambda is attached in CloudFront behaviors
- Check Lambda logs in CloudWatch (must look in the region where it executed)

## Cost Optimization

### Current Setup Costs (Estimated)

**Development Environment:**
- S3 storage: $0.023/GB/month (first 50 TB) → ~$0.05/month for 2GB
- S3 requests: $0.005 per 1,000 PUT, $0.0004 per 1,000 GET → ~$0.01/month
- CloudFront: $0.085/GB for first 10 TB (US/EU) → ~$0.50/month for light traffic
- CloudFront requests: $0.0075 per 10,000 HTTPS requests → ~$0.01/month
- Lambda@Edge (if using): $0.60 per million requests → ~$0.01/month
- **Total: ~$0.60-1/month for dev**

**Production Environment (moderate traffic):**
- Assume 10,000 visitors/month, 5 pages/visit, 2MB/visit
- Data transfer: 10,000 × 2MB = 20GB × $0.085 = $1.70
- Requests: 10,000 × 5 = 50,000 requests × $0.0075/10,000 = $0.04
- **Total: ~$2-3/month**

### Cost Saving Tips

1. **Use PriceClass_100**: Serves from US, Canada, Europe only (cheapest)
   - Already configured in `aws/config.sh`
   - Saves ~40% compared to global distribution

2. **Enable compression**: Already configured in CloudFront
   - Reduces bandwidth by 50-70% for text files

3. **Set appropriate cache TTLs**: Already configured
   - Static assets: 1 year cache
   - HTML files: No cache (for SPA routing)

4. **Lifecycle policies**: Already configured
   - Old S3 versions deleted after 30 days

5. **Choose Basic Auth over WAF**:
   - Basic Auth: Pay per use (~$0.60/million requests)
   - WAF: $5/month base + $1/million rules + $0.60/million requests

6. **Use CloudFront invalidations sparingly**:
   - First 1,000 paths/month free
   - $0.005 per path after that
   - Use versioned file names instead when possible

## Additional Resources

- [AWS S3 Pricing](https://aws.amazon.com/s3/pricing/)
- [AWS CloudFront Pricing](https://aws.amazon.com/cloudfront/pricing/)
- [AWS Lambda@Edge Pricing](https://aws.amazon.com/lambda/pricing/)
- [CloudFront Best Practices](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/best-practices.html)
- [React Deployment Guide](https://create-react-app.dev/docs/deployment/)

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review AWS CloudWatch logs
3. Check CloudFront distribution status in AWS Console
4. Review S3 bucket and CloudFront access logs (if enabled)
