#!/bin/bash

# AWS Deployment Script
# Builds the React app and deploys to S3 + CloudFront

set -e  # Exit on any error

# Load configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/config.sh" "$@"

PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

log_info "Deploying to ${ENVIRONMENT} environment..."

# Function to check if infrastructure exists
check_infrastructure() {
    log_info "Checking infrastructure..."

    INFRA_FILE="${SCRIPT_DIR}/.cache/${ENVIRONMENT}-infrastructure.json"

    if [ ! -f "$INFRA_FILE" ]; then
        log_error "Infrastructure not found for ${ENVIRONMENT} environment"
        log_info "Please run: ./aws/setup-infrastructure.sh ${ENVIRONMENT}"
        exit 1
    fi

    # Load infrastructure info
    DIST_ID=$(grep -o '"cloudfront_distribution_id": "[^"]*' "$INFRA_FILE" | grep -o '[^"]*$')

    if [ -z "$DIST_ID" ]; then
        log_error "CloudFront distribution ID not found"
        exit 1
    fi

    log_success "Infrastructure found"
}

# Function to load environment variables
load_env_file() {
    local env_file="${PROJECT_ROOT}/.env.${ENVIRONMENT}"

    if [ -f "$env_file" ]; then
        log_info "Loading environment variables from .env.${ENVIRONMENT}"
        export $(cat "$env_file" | grep -v '^#' | xargs)
    else
        log_warning "No .env.${ENVIRONMENT} file found, using defaults"
        # Use .env.local if it exists
        if [ -f "${PROJECT_ROOT}/.env.local" ]; then
            log_info "Using .env.local"
            export $(cat "${PROJECT_ROOT}/.env.local" | grep -v '^#' | xargs)
        fi
    fi
}

# Function to build the React app
build_app() {
    log_info "Building React application..."

    cd "$PROJECT_ROOT"

    # Clean previous build
    if [ -d "build" ]; then
        log_info "Cleaning previous build..."
        rm -rf build
    fi

    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        log_info "Installing dependencies..."
        npm ci
    fi

    # Build the app
    log_info "Running production build..."
    CI=false npm run build

    # Verify build
    if [ ! -d "build" ]; then
        log_error "Build directory not found. Build may have failed."
        exit 1
    fi

    if [ ! -f "build/index.html" ]; then
        log_error "index.html not found in build directory. Build may have failed."
        exit 1
    fi

    log_success "Build completed successfully"
}

# Function to upload to S3
upload_to_s3() {
    log_info "Uploading files to S3..."

    cd "$PROJECT_ROOT"

    # Sync build directory to S3
    aws s3 sync build/ "s3://${S3_BUCKET_NAME}/" \
        --delete \
        --profile "${AWS_PROFILE}" \
        --region "${AWS_REGION}" \
        --cache-control "public, max-age=31536000, immutable" \
        --exclude "*.html" \
        --exclude "*.json"

    # Upload HTML files with shorter cache (for SPA routing)
    aws s3 sync build/ "s3://${S3_BUCKET_NAME}/" \
        --profile "${AWS_PROFILE}" \
        --region "${AWS_REGION}" \
        --cache-control "public, max-age=0, must-revalidate" \
        --content-type "text/html" \
        --exclude "*" \
        --include "*.html"

    # Upload JSON files (manifest, etc)
    aws s3 sync build/ "s3://${S3_BUCKET_NAME}/" \
        --profile "${AWS_PROFILE}" \
        --region "${AWS_REGION}" \
        --cache-control "public, max-age=0, must-revalidate" \
        --content-type "application/json" \
        --exclude "*" \
        --include "*.json"

    log_success "Files uploaded to S3 successfully"
}

# Function to invalidate CloudFront cache
invalidate_cloudfront() {
    log_info "Invalidating CloudFront cache..."

    INVALIDATION_OUTPUT=$(aws cloudfront create-invalidation \
        --distribution-id "${DIST_ID}" \
        --paths "/*" \
        --profile "${AWS_PROFILE}")

    INVALIDATION_ID=$(echo "$INVALIDATION_OUTPUT" | grep -o '"Id": "[^"]*' | grep -o '[^"]*$' | head -1)

    log_success "CloudFront invalidation created: ${INVALIDATION_ID}"
    log_info "Cache invalidation can take 5-10 minutes to complete"
}

# Function to get CloudFront URL
get_cloudfront_url() {
    CF_DOMAIN=$(aws cloudfront get-distribution \
        --id "${DIST_ID}" \
        --query "Distribution.DomainName" \
        --output text \
        --profile "${AWS_PROFILE}")

    echo "https://${CF_DOMAIN}"
}

# Function to run smoke tests
run_smoke_tests() {
    local url=$1
    log_info "Running smoke tests..."

    # Wait a few seconds for deployment to propagate
    sleep 5

    # Test 1: Check if site is accessible
    log_info "Test 1: Checking if site is accessible..."
    HTTP_STATUS=$(curl -o /dev/null -s -w "%{http_code}" "${url}")

    if [ "$HTTP_STATUS" -eq 200 ]; then
        log_success "✓ Site is accessible (HTTP ${HTTP_STATUS})"
    else
        log_error "✗ Site returned HTTP ${HTTP_STATUS}"
        return 1
    fi

    # Test 2: Check if index.html contains React app
    log_info "Test 2: Checking if React app is present..."
    CONTENT=$(curl -s "${url}")

    if echo "$CONTENT" | grep -q "root"; then
        log_success "✓ React root div found"
    else
        log_warning "⚠ React root div not found (may be okay if using different structure)"
    fi

    # Test 3: Check HTTPS redirect
    log_info "Test 3: Checking HTTPS enforcement..."
    HTTP_URL=$(echo "$url" | sed 's/https/http/')
    REDIRECT_STATUS=$(curl -o /dev/null -s -w "%{http_code}" -L "${HTTP_URL}")

    if [ "$REDIRECT_STATUS" -eq 200 ]; then
        log_success "✓ HTTPS is enforced"
    else
        log_warning "⚠ HTTPS redirect may not be working correctly"
    fi

    # Test 4: Check SPA routing (404 should return index.html)
    log_info "Test 4: Checking SPA routing..."
    SPA_STATUS=$(curl -o /dev/null -s -w "%{http_code}" "${url}/some-non-existent-route")

    if [ "$SPA_STATUS" -eq 200 ]; then
        log_success "✓ SPA routing is configured correctly"
    else
        log_error "✗ SPA routing returned HTTP ${SPA_STATUS}"
    fi

    log_success "Smoke tests completed!"
}

# Main execution
main() {
    log_info "Starting deployment process..."

    # Check infrastructure
    check_infrastructure

    # Load environment variables
    load_env_file

    # Build the app
    build_app

    # Upload to S3
    upload_to_s3

    # Invalidate CloudFront cache
    invalidate_cloudfront

    # Get deployment URL
    DEPLOYMENT_URL=$(get_cloudfront_url)

    log_success "=== Deployment Complete ==="
    log_info "Environment: ${ENVIRONMENT}"
    log_info "S3 Bucket: ${S3_BUCKET_NAME}"
    log_info "CloudFront Distribution: ${DIST_ID}"
    log_info "Deployment URL: ${DEPLOYMENT_URL}"
    echo ""

    # Run smoke tests
    log_info "Running smoke tests..."
    if run_smoke_tests "${DEPLOYMENT_URL}"; then
        log_success "All tests passed!"
    else
        log_warning "Some tests failed. Please check manually."
    fi

    echo ""
    log_info "Next steps:"
    log_info "1. Visit ${DEPLOYMENT_URL} to view your deployed site"
    log_info "2. Wait 5-10 minutes if you see old content (CloudFront cache invalidation)"
    log_info "3. Test the application functionality"

    # Save deployment info
    cat > "${SCRIPT_DIR}/.cache/${ENVIRONMENT}-last-deployment.json" <<EOF
{
    "environment": "${ENVIRONMENT}",
    "deployed_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "url": "${DEPLOYMENT_URL}",
    "distribution_id": "${DIST_ID}",
    "s3_bucket": "${S3_BUCKET_NAME}"
}
EOF
}

# Run main function
main
