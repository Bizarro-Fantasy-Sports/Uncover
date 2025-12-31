#!/bin/bash

# Configure Private Access for CloudFront Distribution
# This script restricts access to your CloudFront distribution using IP whitelisting

set -e  # Exit on any error

# Load configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/config.sh" "$@"

log_info "Configuring private access for ${ENVIRONMENT} environment..."

# Function to get current public IP
get_current_ip() {
    CURRENT_IP=$(curl -s https://checkip.amazonaws.com)
    log_info "Your current public IP: ${CURRENT_IP}"
    echo "${CURRENT_IP}"
}

# Function to create WAF IP set
create_waf_ip_set() {
    log_info "Creating AWS WAF IP set..."

    # WAF must be in us-east-1 for CloudFront
    WAF_REGION="us-east-1"
    IP_SET_NAME="${PROJECT_NAME}-${ENVIRONMENT}-allowed-ips"

    # Check if IP set already exists
    EXISTING_IP_SET=$(aws wafv2 list-ip-sets \
        --scope CLOUDFRONT \
        --region "${WAF_REGION}" \
        --profile "${AWS_PROFILE}" \
        --query "IPSets[?Name=='${IP_SET_NAME}'].Id" \
        --output text)

    if [ -n "$EXISTING_IP_SET" ]; then
        log_warning "IP set already exists: ${EXISTING_IP_SET}"
        echo "${EXISTING_IP_SET}"
        return 0
    fi

    # Get current IP
    CURRENT_IP=$(get_current_ip)

    # Create IP set with current IP
    IP_SET_OUTPUT=$(aws wafv2 create-ip-set \
        --name "${IP_SET_NAME}" \
        --scope CLOUDFRONT \
        --region "${WAF_REGION}" \
        --profile "${AWS_PROFILE}" \
        --ip-address-version IPV4 \
        --addresses "${CURRENT_IP}/32" \
        --description "Allowed IPs for ${PROJECT_NAME} ${ENVIRONMENT}" \
        --tags Key=Project,Value="${TAG_PROJECT}" Key=Environment,Value="${TAG_ENVIRONMENT}")

    IP_SET_ID=$(echo "$IP_SET_OUTPUT" | grep -o '"Id": "[^"]*' | grep -o '[^"]*$' | head -1)
    log_success "IP set created: ${IP_SET_ID}"
    echo "${IP_SET_ID}"
}

# Function to create WAF Web ACL
create_waf_web_acl() {
    local ip_set_id=$1
    log_info "Creating AWS WAF Web ACL..."

    WAF_REGION="us-east-1"
    WEB_ACL_NAME="${PROJECT_NAME}-${ENVIRONMENT}-web-acl"

    # Check if Web ACL already exists
    EXISTING_WEB_ACL=$(aws wafv2 list-web-acls \
        --scope CLOUDFRONT \
        --region "${WAF_REGION}" \
        --profile "${AWS_PROFILE}" \
        --query "WebACLs[?Name=='${WEB_ACL_NAME}'].Id" \
        --output text)

    if [ -n "$EXISTING_WEB_ACL" ]; then
        log_warning "Web ACL already exists: ${EXISTING_WEB_ACL}"
        echo "${EXISTING_WEB_ACL}"
        return 0
    fi

    # Get IP set ARN
    IP_SET_ARN=$(aws wafv2 list-ip-sets \
        --scope CLOUDFRONT \
        --region "${WAF_REGION}" \
        --profile "${AWS_PROFILE}" \
        --query "IPSets[?Id=='${ip_set_id}'].ARN" \
        --output text)

    # Create Web ACL with IP whitelist rule
    WEB_ACL_OUTPUT=$(aws wafv2 create-web-acl \
        --name "${WEB_ACL_NAME}" \
        --scope CLOUDFRONT \
        --region "${WAF_REGION}" \
        --profile "${AWS_PROFILE}" \
        --default-action Block={} \
        --description "Web ACL for ${PROJECT_NAME} ${ENVIRONMENT} - IP whitelist" \
        --rules "[
            {
                \"Name\": \"AllowWhitelistedIPs\",
                \"Priority\": 1,
                \"Statement\": {
                    \"IPSetReferenceStatement\": {
                        \"ARN\": \"${IP_SET_ARN}\"
                    }
                },
                \"Action\": {
                    \"Allow\": {}
                },
                \"VisibilityConfig\": {
                    \"SampledRequestsEnabled\": true,
                    \"CloudWatchMetricsEnabled\": true,
                    \"MetricName\": \"AllowWhitelistedIPs\"
                }
            }
        ]" \
        --visibility-config SampledRequestsEnabled=true,CloudWatchMetricsEnabled=true,MetricName="${WEB_ACL_NAME}" \
        --tags Key=Project,Value="${TAG_PROJECT}" Key=Environment,Value="${TAG_ENVIRONMENT}")

    WEB_ACL_ID=$(echo "$WEB_ACL_OUTPUT" | grep -o '"Id": "[^"]*' | grep -o '[^"]*$' | head -1)
    WEB_ACL_ARN=$(echo "$WEB_ACL_OUTPUT" | grep -o '"ARN": "[^"]*' | grep -o '[^"]*$' | head -1)

    log_success "Web ACL created: ${WEB_ACL_ID}"
    echo "${WEB_ACL_ARN}"
}

# Function to attach WAF to CloudFront
attach_waf_to_cloudfront() {
    local web_acl_arn=$1

    log_info "Attaching WAF to CloudFront distribution..."

    # Load infrastructure info
    INFRA_FILE="${SCRIPT_DIR}/.cache/${ENVIRONMENT}-infrastructure.json"
    if [ ! -f "$INFRA_FILE" ]; then
        log_error "Infrastructure not found. Run setup-infrastructure.sh first."
        exit 1
    fi

    DIST_ID=$(grep -o '"cloudfront_distribution_id": "[^"]*' "$INFRA_FILE" | grep -o '[^"]*$')

    # Get current distribution config
    aws cloudfront get-distribution-config \
        --id "${DIST_ID}" \
        --profile "${AWS_PROFILE}" \
        > /tmp/cf-dist-config.json

    # Extract ETag
    ETAG=$(grep -o '"ETag": "[^"]*' /tmp/cf-dist-config.json | grep -o '[^"]*$' | head -1)

    # Extract just the DistributionConfig
    cat /tmp/cf-dist-config.json | grep -A 10000 '"DistributionConfig"' | tail -n +2 > /tmp/cf-dist-config-only.json

    # Update WebACLId in the config
    # Note: This is a simplified approach. In production, use jq for JSON manipulation
    log_warning "Manual step required:"
    log_info "1. Open /tmp/cf-dist-config-only.json"
    log_info "2. Add or update the 'WebACLId' field with: ${web_acl_arn}"
    log_info "3. Run: aws cloudfront update-distribution --id ${DIST_ID} --distribution-config file:///tmp/cf-dist-config-only.json --if-match ${ETAG} --profile ${AWS_PROFILE}"

    log_success "WAF is ready. Complete manual steps above to attach to CloudFront."
}

# Function to add IP to whitelist
add_ip_to_whitelist() {
    local ip_address=$1
    log_info "Adding IP ${ip_address} to whitelist..."

    WAF_REGION="us-east-1"
    IP_SET_NAME="${PROJECT_NAME}-${ENVIRONMENT}-allowed-ips"

    # Get IP set details
    IP_SET_ID=$(aws wafv2 list-ip-sets \
        --scope CLOUDFRONT \
        --region "${WAF_REGION}" \
        --profile "${AWS_PROFILE}" \
        --query "IPSets[?Name=='${IP_SET_NAME}'].Id" \
        --output text)

    if [ -z "$IP_SET_ID" ]; then
        log_error "IP set not found. Run this script without arguments first to create it."
        exit 1
    fi

    # Get current IP set
    IP_SET_INFO=$(aws wafv2 get-ip-set \
        --id "${IP_SET_ID}" \
        --name "${IP_SET_NAME}" \
        --scope CLOUDFRONT \
        --region "${WAF_REGION}" \
        --profile "${AWS_PROFILE}")

    LOCK_TOKEN=$(echo "$IP_SET_INFO" | grep -o '"LockToken": "[^"]*' | grep -o '[^"]*$' | head -1)
    CURRENT_IPS=$(echo "$IP_SET_INFO" | grep -o '"Addresses": \[[^]]*\]' | grep -o '\[[^]]*\]')

    # Add new IP to the list
    NEW_IPS=$(echo "$CURRENT_IPS" | sed "s/\]/,\"${ip_address}\/32\"\]/")

    # Update IP set
    aws wafv2 update-ip-set \
        --id "${IP_SET_ID}" \
        --name "${IP_SET_NAME}" \
        --scope CLOUDFRONT \
        --region "${WAF_REGION}" \
        --profile "${AWS_PROFILE}" \
        --lock-token "${LOCK_TOKEN}" \
        --addresses $(echo "$NEW_IPS" | tr -d '[]"' | tr ',' ' ')

    log_success "IP ${ip_address} added to whitelist"
}

# Main execution
main() {
    if [ "$2" == "add-ip" ]; then
        if [ -z "$3" ]; then
            log_error "Please provide an IP address: ./configure-private-access.sh ${ENVIRONMENT} add-ip <IP_ADDRESS>"
            exit 1
        fi
        add_ip_to_whitelist "$3"
        exit 0
    fi

    log_info "=== Configuring Private Access ==="
    log_info ""
    log_warning "Note: AWS WAF has costs (~\$5-10/month minimum)"
    log_info "Alternative: Use CloudFront signed URLs (free but more complex)"
    log_info ""
    log_info "This script will:"
    log_info "1. Create a WAF IP set with your current IP"
    log_info "2. Create a WAF Web ACL that blocks all traffic except whitelisted IPs"
    log_info "3. Provide instructions to attach WAF to CloudFront"
    echo ""

    read -p "Do you want to continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Cancelled"
        exit 0
    fi

    # Create WAF IP set
    IP_SET_ID=$(create_waf_ip_set)

    # Create WAF Web ACL
    WEB_ACL_ARN=$(create_waf_web_acl "${IP_SET_ID}")

    # Instructions to attach WAF
    attach_waf_to_cloudfront "${WEB_ACL_ARN}"

    log_success "Private access configuration complete!"
    log_info ""
    log_info "To add more IPs later, run:"
    log_info "./aws/configure-private-access.sh ${ENVIRONMENT} add-ip <IP_ADDRESS>"
}

# Run main function
main "$@"
