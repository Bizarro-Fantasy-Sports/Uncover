# Quick Start - AWS Deployment

## TL;DR - Payment & Billing

**When do you pay?**
- 📅 Monthly, charged 3-5 days after month ends
- 🎁 **FREE for first 12 months** if you stay under free tier limits
- 💰 **~$0.60-1/month** for dev after free tier

**How to set up:**

### Step 1: Add Payment Method (5 minutes)
1. Go to: https://console.aws.amazon.com/billing/home#/paymentmethods
2. Click "Add a payment method"
3. Enter credit/debit card
4. Done! (required even for free tier)

### Step 2: Set Up Billing Alerts (3 minutes)
```bash
./aws/setup-billing-alerts.sh
```
Then:
- Check email and confirm subscription
- Go to https://console.aws.amazon.com/billing/home#/preferences
- Enable "Receive Billing Alerts"

**You'll get emails if costs exceed $5, $10, or $20/month**

---

## Full Deployment (After Billing Setup)

### One-Time Setup (~25 minutes)
```bash
# 1. Configure environment
cp .env.dev.example .env.dev
# Edit .env.dev with your API URL

# 2. Create AWS infrastructure (wait 15-20 min)
./aws/setup-infrastructure.sh dev

# 3. Set up private access (optional)
./aws/configure-basic-auth.sh dev
```

### Every Deployment (~5 minutes)
```bash
./aws/deploy.sh dev
```

---

## Documentation

- 💳 **[AWS_BILLING_SETUP.md](../AWS_BILLING_SETUP.md)** - Complete billing guide
- 🚀 **[DEPLOYMENT_NEXT_STEPS.md](../DEPLOYMENT_NEXT_STEPS.md)** - Step-by-step deployment
- 📚 **[AWS_DEPLOYMENT.md](../AWS_DEPLOYMENT.md)** - Full technical documentation
- 📖 **[README.md](README.md)** - Script reference

---

## Need Help?

See troubleshooting in [AWS_DEPLOYMENT.md](../AWS_DEPLOYMENT.md#troubleshooting)
