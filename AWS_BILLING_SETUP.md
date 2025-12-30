# AWS Billing Setup Guide

## When You Pay

**AWS Billing Model:**
- 📅 **Monthly billing** - Charged at the end of each calendar month
- 💰 **Payment date** - Usually 3rd-5th of following month
- 🎯 **Pay-as-you-go** - Only pay for what you use
- 🎁 **Free tier** - First 12 months include generous free allowances

**Example:**
- December 1-31 usage → Bill generated Jan 1 → Payment charged Jan 3-5
- Charges appear on credit card statement as "AWS *Amazon Web Services"

## Free Tier Allowances (First 12 Months)

| Service | Free Tier | Estimated Dev Usage | Will You Pay? |
|---------|-----------|---------------------|---------------|
| **S3** | 5 GB storage, 20k GET, 2k PUT | ~1-2 GB, <1k requests | ❌ Free |
| **CloudFront** | 1 TB transfer, 10M requests | ~1-5 GB, <100k requests | ❌ Free |
| **Lambda@Edge** | 1M requests | <1k requests | ❌ Free |

**Result: Your dev environment will likely be FREE if you're within first 12 months!**

After 12 months, expect ~$0.60-1/month for dev environment.

## Step-by-Step Setup

### Step 1: Add Payment Method (Required)

Even for free tier, AWS requires a valid payment method.

1. **Go to AWS Billing Console:**
   ```
   https://console.aws.amazon.com/billing/home#/paymentmethods
   ```

2. **Add payment method:**
   - Click "Add a payment method"
   - Enter credit or debit card details
   - Card will be verified (may see $1 temporary charge)
   - Click "Verify and add"

3. **Set as default:**
   - Ensure your card is set as default payment method

### Step 2: Enable Cost Alerts (Highly Recommended!)

**Option A: Automated Setup (Recommended)**

Run our script to set up billing alerts:

```bash
chmod +x aws/setup-billing-alerts.sh
./aws/setup-billing-alerts.sh
```

You'll be prompted for your email and it will create alerts at:
- 🟡 $5/month
- 🟠 $10/month
- 🔴 $20/month (safety net)

**After running:**
1. ✅ Check your email and **confirm SNS subscription**
2. ✅ Go to https://console.aws.amazon.com/billing/home#/preferences
3. ✅ Check "Receive Billing Alerts"
4. ✅ Click "Save preferences"

**Option B: Manual Setup**

1. **Enable billing alerts:**
   - Go to https://console.aws.amazon.com/billing/home#/preferences
   - Check "Receive Billing Alerts"
   - Click "Save preferences"

2. **Create billing alarm:**
   - Go to CloudWatch (us-east-1): https://console.aws.amazon.com/cloudwatch/
   - Click "Alarms" → "Create alarm"
   - Click "Select metric"
   - Choose "Billing" → "Total Estimated Charge"
   - Set threshold (e.g., $5)
   - Create SNS topic and subscribe your email
   - Create alarm

### Step 3: Set Up Budget (Optional but Recommended)

Create a budget to automatically track and alert on spending:

1. **Go to AWS Budgets:**
   ```
   https://console.aws.amazon.com/billing/home#/budgets
   ```

2. **Create budget:**
   - Click "Create budget"
   - Select "Cost budget"
   - Set budget amount: $10/month (or your preference)
   - Set alerts at:
     - 50% of budget ($5)
     - 80% of budget ($8)
     - 100% of budget ($10)
   - Enter your email for notifications

3. **Save budget**

**Cost:** AWS Budgets is free for first 2 budgets

## Monitoring Your Costs

### Check Current Month Charges

**AWS Console:**
```
https://console.aws.amazon.com/billing/home#/
```

**Using AWS CLI:**
```bash
# Get current month estimated charges
aws ce get-cost-and-usage \
  --time-period Start=$(date -u +"%Y-%m-01"),End=$(date -u +"%Y-%m-%d") \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=SERVICE
```

### View Detailed Cost Breakdown

**Cost Explorer:**
```
https://console.aws.amazon.com/cost-management/home#/cost-explorer
```

- Group by: Service
- Filter by: Time period
- View daily or monthly costs

**Note:** Cost Explorer has a small fee ($0.01 per request) but is free for basic usage.

## Expected Costs

### Development Environment

**Free Tier (First 12 Months):**
- Likely $0/month if usage is light

**After Free Tier:**
| Item | Cost |
|------|------|
| S3 storage (2 GB) | $0.05 |
| S3 requests | $0.01 |
| CloudFront data transfer | $0.50 |
| CloudFront requests | $0.01 |
| Lambda@Edge (if using Basic Auth) | $0.01 |
| **Total** | **~$0.60/month** |

### Production Environment (10k visitors/month)

| Item | Cost |
|------|------|
| S3 storage | $0.05 |
| S3 requests | $0.02 |
| CloudFront data transfer (20 GB) | $1.70 |
| CloudFront requests (50k) | $0.04 |
| ACM Certificate (SSL) | $0.00 (free) |
| Route53 Hosted Zone (optional) | $0.50 |
| **Total** | **~$2-3/month** |

## Cost Optimization Tips

### 1. Use Free Tier Wisely
- Stay under CloudFront 1 TB free tier
- Use S3 lifecycle policies (already configured)
- Delete old CloudFront distributions you're not using

### 2. Limit CloudFront Invalidations
- First 1,000 paths/month are free
- After that: $0.005 per path
- Our deployment script invalidates all (`/*`) - just 1 path per deployment

### 3. Choose Right Price Class
- **PriceClass_100** (US, Canada, Europe) - Cheapest, already configured
- Save ~40% vs global distribution
- Good enough for most startups

### 4. Clean Up Unused Resources
```bash
# List all S3 buckets
aws s3 ls

# List all CloudFront distributions
aws cloudfront list-distributions --query "DistributionList.Items[*].[Id,Comment,Enabled]" --output table

# Delete unused resources to avoid charges
```

### 5. Monitor Regularly
- Check billing dashboard weekly
- Review Cost Explorer monthly
- Investigate any unexpected charges immediately

## Payment FAQ

### When will I be charged?

**Free Tier:**
- No charges if you stay within limits
- You'll only pay for usage exceeding free tier

**After Free Tier:**
- Charged monthly based on usage
- Payment processed 3-5 days after month ends

### What if I forget to pay?

- AWS will email you multiple times
- After 30 days, they may suspend your account
- Services will stop working until payment is made

**Prevention:** Enable billing alerts!

### Can I set a spending limit?

AWS doesn't have hard spending limits, but you can:
- ✅ Set up budgets with alerts
- ✅ Set up billing alarms (our script does this)
- ✅ Manually disable/delete resources if costs spike

### What if there's an unexpected charge?

1. Check Cost Explorer to identify the service
2. Check CloudWatch metrics for unusual activity
3. Contact AWS Support (all accounts get billing support)
4. In some cases, AWS may credit legitimate errors

### How do I see what I'm paying for?

**Detailed billing:**
1. Go to https://console.aws.amazon.com/billing/home#/bills
2. Expand service to see detailed line items
3. Download CSV for spreadsheet analysis

**Cost allocation tags:**
- Our scripts tag all resources with Project, Environment
- Use these tags in Cost Explorer to track costs per environment

## Canceling/Deleting Resources

If you want to stop all charges:

```bash
# 1. Delete CloudFront distribution (must disable first)
DIST_ID=$(cat aws/.cache/dev-infrastructure.json | grep cloudfront_distribution_id | cut -d'"' -f4)
aws cloudfront get-distribution-config --id $DIST_ID > /tmp/dist-config.json
# Edit /tmp/dist-config.json: set "Enabled": false
# Update and wait ~15 minutes, then delete

# 2. Empty and delete S3 bucket
aws s3 rm s3://statsland-website-dev/ --recursive
aws s3api delete-bucket --bucket statsland-website-dev

# 3. Delete billing alarms (optional)
aws cloudwatch delete-alarms --alarm-names BillingAlarm-5-USD BillingAlarm-10-USD BillingAlarm-20-USD --region us-east-1

# 4. Delete SNS topic (optional)
aws sns delete-topic --topic-arn <topic-arn> --region us-east-1
```

**Note:** You'll still have the current month's charges for usage up to deletion.

## Getting Started Checklist

- [ ] Add payment method to AWS account
- [ ] Enable billing alerts in preferences
- [ ] Run `./aws/setup-billing-alerts.sh` and confirm email
- [ ] Set up AWS Budget ($10/month recommended)
- [ ] Check current costs: https://console.aws.amazon.com/billing/
- [ ] Verify free tier status: https://console.aws.amazon.com/billing/home#/freetier
- [ ] Set calendar reminder to check costs monthly

## Support Resources

**AWS Billing Support:**
- Available to all AWS accounts (even free tier)
- Use the "Support" link in AWS Console
- Or visit: https://console.aws.amazon.com/support/

**Useful Links:**
- Billing Dashboard: https://console.aws.amazon.com/billing/
- Free Tier Usage: https://console.aws.amazon.com/billing/home#/freetier
- Cost Explorer: https://console.aws.amazon.com/cost-management/home#/cost-explorer
- Budgets: https://console.aws.amazon.com/billing/home#/budgets
- Pricing Calculator: https://calculator.aws/

---

**Summary:**
1. Add payment method now (required)
2. Run `./aws/setup-billing-alerts.sh` (protects you from surprises)
3. Expect $0/month for first 12 months (free tier)
4. Expect ~$1-3/month after free tier
5. Check billing dashboard monthly
