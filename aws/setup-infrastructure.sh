#!/bin/bash

# AWS Infrastructure Setup Script
# Creates S3 bucket and CloudFront distribution for static website hosting

set -e  # Exit on any error

# Load configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/config.sh" "$@"

log_info "Setting up AWS infrastructure for ${ENVIRONMENT} environment..."
log_info "Region: ${AWS_REGION}"
log_info "S3 Bucket: ${S3_BUCKET_NAME}"

# Function to create S3 bucket
create_s3_bucket() {
    log_info "Creating S3 bucket: ${S3_BUCKET_NAME}"

    # Check if bucket already exists
    if aws s3 ls "s3://${S3_BUCKET_NAME}" 2>/dev/null; then
        log_warning "S3 bucket ${S3_BUCKET_NAME} already exists"
        return 0
    fi

    # Create bucket
    if [ "$AWS_REGION" == "us-east-1" ]; then
        aws s3api create-bucket \
            --bucket "${S3_BUCKET_NAME}" \
            --region "${AWS_REGION}" \
            --profile "${AWS_PROFILE}"
    else
        aws s3api create-bucket \
            --bucket "${S3_BUCKET_NAME}" \
            --region "${AWS_REGION}" \
            --create-bucket-configuration LocationConstraint="${AWS_REGION}" \
            --profile "${AWS_PROFILE}"
    fi

    log_success "S3 bucket created successfully"
}

# Function to configure S3 bucket
configure_s3_bucket() {
    log_info "Configuring S3 bucket..."

    # Block public access (we'll use CloudFront)
    aws s3api put-public-access-block \
        --bucket "${S3_BUCKET_NAME}" \
        --public-access-block-configuration \
            "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true" \
        --profile "${AWS_PROFILE}"

    # Enable versioning (optional but recommended)
    aws s3api put-bucket-versioning \
        --bucket "${S3_BUCKET_NAME}" \
        --versioning-configuration Status=Enabled \
        --profile "${AWS_PROFILE}"

    # Add lifecycle policy to delete old versions after 30 days (cost optimization)
    cat > /tmp/lifecycle-policy.json <<EOF
{
    "Rules": [
        {
            "Id": "DeleteOldVersions",
            "Status": "Enabled",
            "NoncurrentVersionExpiration": {
                "NoncurrentDays": 30
            }
        }
    ]
}
EOF

    aws s3api put-bucket-lifecycle-configuration \
        --bucket "${S3_BUCKET_NAME}" \
        --lifecycle-configuration file:///tmp/lifecycle-policy.json \
        --profile "${AWS_PROFILE}"

    rm /tmp/lifecycle-policy.json

    # Add tags
    aws s3api put-bucket-tagging \
        --bucket "${S3_BUCKET_NAME}" \
        --tagging "TagSet=[{Key=Project,Value=${TAG_PROJECT}},{Key=Environment,Value=${TAG_ENVIRONMENT}},{Key=ManagedBy,Value=${TAG_MANAGED_BY}}]" \
        --profile "${AWS_PROFILE}"

    log_success "S3 bucket configured successfully"
}

# Function to create CloudFront Origin Access Identity (OAI)
create_cloudfront_oai() {
    log_info "Creating CloudFront Origin Access Identity..."

    # Check if OAI already exists
    OAI_ID=$(aws cloudfront list-cloud-front-origin-access-identities \
        --query "CloudFrontOriginAccessIdentityList.Items[?Comment=='${S3_BUCKET_NAME}-oai'].Id" \
        --output text \
        --profile "${AWS_PROFILE}")

    if [ -n "$OAI_ID" ]; then
        log_warning "CloudFront OAI already exists: ${OAI_ID}"
        echo "$OAI_ID"
        return 0
    fi

    # Create OAI
    OAI_OUTPUT=$(aws cloudfront create-cloud-front-origin-access-identity \
        --cloud-front-origin-access-identity-config \
            CallerReference="${S3_BUCKET_NAME}-$(date +%s)",Comment="${S3_BUCKET_NAME}-oai" \
        --profile "${AWS_PROFILE}")

    OAI_ID=$(echo "$OAI_OUTPUT" | grep -o '"Id": "[^"]*' | grep -o '[^"]*$' | head -1)
    log_success "CloudFront OAI created: ${OAI_ID}"
    echo "$OAI_ID"
}

# Function to update S3 bucket policy for CloudFront
update_s3_bucket_policy() {
    local oai_id=$1
    log_info "Updating S3 bucket policy for CloudFront access..."

    # Get CloudFront OAI canonical user ID
    OAI_CANONICAL_USER=$(aws cloudfront get-cloud-front-origin-access-identity \
        --id "${oai_id}" \
        --query "CloudFrontOriginAccessIdentity.S3CanonicalUserId" \
        --output text \
        --profile "${AWS_PROFILE}")

    # Create bucket policy
    cat > /tmp/bucket-policy.json <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "CloudFrontOAIAccess",
            "Effect": "Allow",
            "Principal": {
                "CanonicalUser": "${OAI_CANONICAL_USER}"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::${S3_BUCKET_NAME}/*"
        }
    ]
}
EOF

    aws s3api put-bucket-policy \
        --bucket "${S3_BUCKET_NAME}" \
        --policy file:///tmp/bucket-policy.json \
        --profile "${AWS_PROFILE}"

    rm /tmp/bucket-policy.json
    log_success "S3 bucket policy updated successfully"
}

# Function to create CloudFront distribution
create_cloudfront_distribution() {
    local oai_id=$1
    log_info "Creating CloudFront distribution..."

    # Check if distribution already exists
    EXISTING_DIST=$(aws cloudfront list-distributions \
        --query "DistributionList.Items[?Comment=='${CLOUDFRONT_COMMENT}'].Id" \
        --output text \
        --profile "${AWS_PROFILE}")

    if [ -n "$EXISTING_DIST" ]; then
        log_warning "CloudFront distribution already exists: ${EXISTING_DIST}"
        # Get the domain name
        DOMAIN=$(aws cloudfront get-distribution \
            --id "${EXISTING_DIST}" \
            --query "Distribution.DomainName" \
            --output text \
            --profile "${AWS_PROFILE}")
        log_info "CloudFront URL: https://${DOMAIN}"
        echo "${EXISTING_DIST}"
        return 0
    fi

    # Create distribution configuration
    cat > /tmp/cf-config.json <<EOF
{
    "CallerReference": "${S3_BUCKET_NAME}-$(date +%s)",
    "Comment": "${CLOUDFRONT_COMMENT}",
    "DefaultRootObject": "index.html",
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "${S3_BUCKET_NAME}-origin",
                "DomainName": "${S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com",
                "S3OriginConfig": {
                    "OriginAccessIdentity": "origin-access-identity/cloudfront/${oai_id}"
                }
            }
        ]
    },
    "DefaultCacheBehavior": {
        "TargetOriginId": "${S3_BUCKET_NAME}-origin",
        "ViewerProtocolPolicy": "redirect-to-https",
        "AllowedMethods": {
            "Quantity": 2,
            "Items": ["GET", "HEAD"],
            "CachedMethods": {
                "Quantity": 2,
                "Items": ["GET", "HEAD"]
            }
        },
        "Compress": true,
        "ForwardedValues": {
            "QueryString": false,
            "Cookies": {
                "Forward": "none"
            }
        },
        "MinTTL": 0,
        "DefaultTTL": 86400,
        "MaxTTL": 31536000,
        "TrustedSigners": {
            "Enabled": false,
            "Quantity": 0
        }
    },
    "CustomErrorResponses": {
        "Quantity": 2,
        "Items": [
            {
                "ErrorCode": 403,
                "ResponsePagePath": "/index.html",
                "ResponseCode": "200",
                "ErrorCachingMinTTL": 300
            },
            {
                "ErrorCode": 404,
                "ResponsePagePath": "/index.html",
                "ResponseCode": "200",
                "ErrorCachingMinTTL": 300
            }
        ]
    },
    "Enabled": true,
    "PriceClass": "${CLOUDFRONT_PRICE_CLASS}",
    "ViewerCertificate": {
        "CloudFrontDefaultCertificate": true,
        "MinimumProtocolVersion": "TLSv1.2_2021"
    }
}
EOF

    # Create distribution
    DIST_OUTPUT=$(aws cloudfront create-distribution \
        --distribution-config file:///tmp/cf-config.json \
        --profile "${AWS_PROFILE}")

    DIST_ID=$(echo "$DIST_OUTPUT" | grep -o '"Id": "[^"]*' | grep -o '[^"]*$' | head -1)
    DOMAIN=$(echo "$DIST_OUTPUT" | grep -o '"DomainName": "[^"]*' | grep -o '[^"]*$' | head -1)

    rm /tmp/cf-config.json

    log_success "CloudFront distribution created: ${DIST_ID}"
    log_info "CloudFront URL: https://${DOMAIN}"
    log_warning "Note: CloudFront distribution deployment can take 15-20 minutes"

    echo "${DIST_ID}"
}

# Main execution
main() {
    log_info "Starting infrastructure setup..."

    # Create and configure S3 bucket
    create_s3_bucket
    configure_s3_bucket

    # Create CloudFront OAI
    OAI_ID=$(create_cloudfront_oai)

    # Update S3 bucket policy
    update_s3_bucket_policy "${OAI_ID}"

    # Create CloudFront distribution
    DIST_ID=$(create_cloudfront_distribution "${OAI_ID}")

    # Save infrastructure info
    mkdir -p "${SCRIPT_DIR}/.cache"
    cat > "${SCRIPT_DIR}/.cache/${ENVIRONMENT}-infrastructure.json" <<EOF
{
    "environment": "${ENVIRONMENT}",
    "region": "${AWS_REGION}",
    "s3_bucket": "${S3_BUCKET_NAME}",
    "oai_id": "${OAI_ID}",
    "cloudfront_distribution_id": "${DIST_ID}",
    "created_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

    log_success "Infrastructure setup complete!"
    log_info "Configuration saved to: ${SCRIPT_DIR}/.cache/${ENVIRONMENT}-infrastructure.json"

    # Get CloudFront domain
    CF_DOMAIN=$(aws cloudfront get-distribution \
        --id "${DIST_ID}" \
        --query "Distribution.DomainName" \
        --output text \
        --profile "${AWS_PROFILE}")

    echo ""
    log_success "=== Deployment Information ==="
    log_info "Environment: ${ENVIRONMENT}"
    log_info "S3 Bucket: ${S3_BUCKET_NAME}"
    log_info "CloudFront Distribution ID: ${DIST_ID}"
    log_info "CloudFront URL: https://${CF_DOMAIN}"
    echo ""
    log_info "Next steps:"
    log_info "1. Wait 15-20 minutes for CloudFront to deploy"
    log_info "2. Run './aws/deploy.sh ${ENVIRONMENT}' to deploy your website"
}

# Run main function
main
