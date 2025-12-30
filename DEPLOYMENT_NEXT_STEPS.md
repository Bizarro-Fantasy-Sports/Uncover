# Deployment Next Steps

This document outlines the immediate next steps to deploy the Statsland website to AWS.

## ✅ What's Been Done

1. Created AWS deployment infrastructure scripts
2. Created automated deployment scripts
3. Configured environment files for dev/prod
4. Set up private access options (Basic Auth & WAF)
5. Comprehensive documentation created

## 📋 Immediate Next Steps

### 0. Set Up AWS Billing (FIRST - Do This Now!)

⚠️ **Before deploying anything, set up billing alerts to avoid surprises!**

```bash
./aws/setup-billing-alerts.sh
```

**What you need to do:**
1. Add payment method to AWS account ([instructions](AWS_BILLING_SETUP.md))
2. Run the billing alerts script above
3. Confirm email subscription (check your inbox)
4. Enable "Receive Billing Alerts" in AWS Console

**Expected costs:**
- 🎁 **FREE** if you're in your first 12 months (free tier)
- 💰 **~$0.60-1/month** after free tier for dev environment
- 💰 **~$2-3/month** for production (10k visitors)

See **[AWS_BILLING_SETUP.md](AWS_BILLING_SETUP.md)** for complete billing guide.

### 1. Configure Your Environment Variables

**Create `.env.dev` file** (not committed to git):
```bash
cp .env.dev.example .env.dev  # If you create an example file
```

Edit `.env.dev` and update:
- `REACT_APP_API_BASE_URL` - Your API Gateway dev URL
- Verify Auth0 settings are correct

### 2. Set Up AWS CLI (if not done)

```bash
# Check if AWS CLI is configured
aws sts get-caller-identity

# If not configured, run:
aws configure
# Enter your AWS Access Key ID, Secret Access Key, Region (us-west-2)
```

**Required AWS Permissions:**
- S3: CreateBucket, PutObject, GetObject, DeleteObject
- CloudFront: CreateDistribution, UpdateDistribution, CreateInvalidation
- IAM: CreateRole, AttachRolePolicy (for Lambda@Edge)
- Lambda: CreateFunction, PublishVersion (for Basic Auth)
- WAF: CreateIPSet, CreateWebACL (for IP whitelisting)

### 3. Run Initial Infrastructure Setup

```bash
./aws/setup-infrastructure.sh dev
```

⏱️ **Expected time:** 15-20 minutes (CloudFront deployment)

**What this creates:**
- S3 bucket: `statsland-website-dev`
- CloudFront distribution
- Origin Access Identity
- Proper security policies

**Output:** CloudFront URL (e.g., `https://d111111abcdef8.cloudfront.net`)

### 4. Deploy Your Application

After infrastructure is ready (wait 15-20 minutes from step 3):

```bash
./aws/deploy.sh dev
```

⏱️ **Expected time:** 5-10 minutes

**What this does:**
- Builds your React app
- Uploads to S3
- Invalidates CloudFront cache
- Runs automated smoke tests

### 5. Configure Private Access (Development Only)

Choose one option:

**Option A: Basic Authentication** (Recommended - Cheaper)
```bash
./aws/configure-basic-auth.sh dev
```
- Cost: ~$0.60 per million requests
- Requires manual attachment in AWS Console (instructions provided)

**Option B: IP Whitelisting**
```bash
./aws/configure-private-access.sh dev
```
- Cost: ~$5-10/month base
- Automatically includes your current IP

### 6. Test Your Deployment

Visit your CloudFront URL and verify:
- [ ] Site loads correctly
- [ ] Navigation works
- [ ] API calls work (check Network tab)
- [ ] Auth0 login works
- [ ] No console errors

## 🚀 Future Steps (When Going Public)

### Prepare for Production

1. **Update `.env.prod`** with production API URLs and Auth0 credentials
2. **Request SSL certificate** in AWS Certificate Manager (us-east-1)
3. **Configure custom domain** in CloudFront
4. **Update DNS** to point to CloudFront
5. **Remove private access** (Basic Auth or WAF)
6. **Deploy to prod**: `./aws/deploy.sh prod`

See [AWS_DEPLOYMENT.md](./AWS_DEPLOYMENT.md#going-public) for detailed instructions.

## 📚 Documentation

- **[AWS_DEPLOYMENT.md](./AWS_DEPLOYMENT.md)** - Comprehensive deployment guide
- **[aws/README.md](./aws/README.md)** - Quick reference for scripts

## 💰 Cost Estimate

**Development Environment:**
- ~$0.60-1/month for light usage
- S3 + CloudFront + (optional) Lambda@Edge

**Production Environment:**
- ~$2-3/month for moderate traffic (10k visitors)
- Scales automatically with usage

See [AWS_DEPLOYMENT.md - Cost Optimization](./AWS_DEPLOYMENT.md#cost-optimization) for details.

## ❓ Troubleshooting

### Infrastructure setup fails
- Check AWS credentials: `aws sts get-caller-identity`
- Verify IAM permissions
- Check AWS region is supported (us-west-2)

### Deployment fails
- Ensure infrastructure setup completed successfully
- Check Node.js version: `node --version` (should be v14+)
- Clean build: `rm -rf build node_modules/.cache`

### Site shows old version
- Wait 5-10 minutes for CloudFront cache invalidation
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

### Can't access site (403 error)
- Check if private access is configured (Basic Auth or WAF)
- Verify CloudFront distribution is deployed (can take 15-20 min)
- Check S3 bucket policy allows CloudFront OAI

See [AWS_DEPLOYMENT.md - Troubleshooting](./AWS_DEPLOYMENT.md#troubleshooting) for more help.

## 📞 Support

For questions or issues:
1. Review documentation in AWS_DEPLOYMENT.md
2. Check CloudWatch logs in AWS Console
3. Review CloudFront distribution status
4. Check script output for error messages
