#!/bin/bash

# AWS Deployment Configuration
# This file contains environment-specific settings for deploying to AWS

# Environment (dev or prod)
ENVIRONMENT=${1:-dev}

# AWS Configuration
AWS_REGION="us-west-2"
AWS_PROFILE="default"  # Change if using named AWS profiles

# Project Configuration
PROJECT_NAME="statsland"
APP_NAME="website"

# S3 Bucket Configuration
if [ "$ENVIRONMENT" == "prod" ]; then
    S3_BUCKET_NAME="${PROJECT_NAME}-${APP_NAME}-prod"
    CLOUDFRONT_COMMENT="${PROJECT_NAME} Website Production"
    # Future: Add your custom domain here
    # DOMAIN_NAME="yourdomain.com"
else
    S3_BUCKET_NAME="${PROJECT_NAME}-${APP_NAME}-dev"
    CLOUDFRONT_COMMENT="${PROJECT_NAME} Website Development"
fi

# CloudFront Configuration
CLOUDFRONT_PRICE_CLASS="PriceClass_100"  # US, Canada, Europe (cheapest)
# CLOUDFRONT_PRICE_CLASS="PriceClass_All"  # Use this for global distribution

# Tags for all resources
TAG_PROJECT="${PROJECT_NAME}"
TAG_ENVIRONMENT="${ENVIRONMENT}"
TAG_MANAGED_BY="script"

# Output colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}
