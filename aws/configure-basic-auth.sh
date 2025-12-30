#!/bin/bash

# Configure Basic Authentication for CloudFront using Lambda@Edge
# This is a cost-effective alternative to WAF (~$0.60/million requests vs $5-10/month base for WAF)

set -e  # Exit on any error

# Load configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/config.sh" "$@"

log_info "Configuring basic authentication for ${ENVIRONMENT} environment..."

# Function to create Lambda@Edge function for basic auth
create_basic_auth_lambda() {
    local username=$1
    local password=$2

    log_info "Creating Lambda@Edge function for basic authentication..."

    # Lambda@Edge must be in us-east-1
    LAMBDA_REGION="us-east-1"
    FUNCTION_NAME="${PROJECT_NAME}-${ENVIRONMENT}-basic-auth"

    # Create base64 encoded credentials
    AUTH_STRING=$(echo -n "${username}:${password}" | base64)

    # Create Lambda function code
    mkdir -p /tmp/lambda-basic-auth
    cat > /tmp/lambda-basic-auth/index.js <<EOF
'use strict';

exports.handler = (event, context, callback) => {
    // Get request and request headers
    const request = event.Records[0].cf.request;
    const headers = request.headers;

    // Configure authentication
    const authUser = '${username}';
    const authPass = '${password}';

    // Construct the Basic Auth string
    const authString = 'Basic ' + Buffer.from(authUser + ':' + authPass).toString('base64');

    // Require Basic authentication
    if (typeof headers.authorization == 'undefined' || headers.authorization[0].value != authString) {
        const body = 'Unauthorized';
        const response = {
            status: '401',
            statusDescription: 'Unauthorized',
            body: body,
            headers: {
                'www-authenticate': [{key: 'WWW-Authenticate', value:'Basic'}]
            },
        };
        callback(null, response);
    }

    // Continue request processing if authentication passed
    callback(null, request);
};
EOF

    # Create deployment package
    cd /tmp/lambda-basic-auth
    zip -r function.zip index.js
    cd -

    # Check if Lambda function already exists
    EXISTING_FUNCTION=$(aws lambda list-functions \
        --region "${LAMBDA_REGION}" \
        --profile "${AWS_PROFILE}" \
        --query "Functions[?FunctionName=='${FUNCTION_NAME}'].FunctionName" \
        --output text)

    if [ -n "$EXISTING_FUNCTION" ]; then
        log_warning "Lambda function already exists. Updating..."

        aws lambda update-function-code \
            --function-name "${FUNCTION_NAME}" \
            --region "${LAMBDA_REGION}" \
            --profile "${AWS_PROFILE}" \
            --zip-file fileb:///tmp/lambda-basic-auth/function.zip

        sleep 5  # Wait for update to complete

        FUNCTION_ARN=$(aws lambda get-function \
            --function-name "${FUNCTION_NAME}" \
            --region "${LAMBDA_REGION}" \
            --profile "${AWS_PROFILE}" \
            --query "Configuration.FunctionArn" \
            --output text)
    else
        log_info "Creating new Lambda function..."

        # Create IAM role for Lambda@Edge
        ROLE_NAME="${FUNCTION_NAME}-role"

        # Check if role exists
        if ! aws iam get-role --role-name "${ROLE_NAME}" --profile "${AWS_PROFILE}" 2>/dev/null; then
            # Create trust policy
            cat > /tmp/trust-policy.json <<EOFTRUST
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": [
          "lambda.amazonaws.com",
          "edgelambda.amazonaws.com"
        ]
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOFTRUST

            aws iam create-role \
                --role-name "${ROLE_NAME}" \
                --assume-role-policy-document file:///tmp/trust-policy.json \
                --profile "${AWS_PROFILE}"

            # Attach basic Lambda execution policy
            aws iam attach-role-policy \
                --role-name "${ROLE_NAME}" \
                --policy-arn "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole" \
                --profile "${AWS_PROFILE}"

            log_success "IAM role created"
            sleep 10  # Wait for role to propagate
        fi

        ROLE_ARN=$(aws iam get-role \
            --role-name "${ROLE_NAME}" \
            --profile "${AWS_PROFILE}" \
            --query "Role.Arn" \
            --output text)

        # Create Lambda function
        FUNCTION_ARN=$(aws lambda create-function \
            --function-name "${FUNCTION_NAME}" \
            --region "${LAMBDA_REGION}" \
            --profile "${AWS_PROFILE}" \
            --runtime nodejs18.x \
            --role "${ROLE_ARN}" \
            --handler index.handler \
            --zip-file fileb:///tmp/lambda-basic-auth/function.zip \
            --description "Basic authentication for ${PROJECT_NAME} ${ENVIRONMENT}" \
            --timeout 5 \
            --memory-size 128 \
            --tags Project="${TAG_PROJECT}",Environment="${TAG_ENVIRONMENT}" \
            --query "FunctionArn" \
            --output text)

        log_success "Lambda function created: ${FUNCTION_ARN}"
    fi

    # Publish a new version (required for Lambda@Edge)
    VERSION_ARN=$(aws lambda publish-version \
        --function-name "${FUNCTION_NAME}" \
        --region "${LAMBDA_REGION}" \
        --profile "${AWS_PROFILE}" \
        --query "FunctionArn" \
        --output text)

    log_success "Lambda version published: ${VERSION_ARN}"

    # Clean up
    rm -rf /tmp/lambda-basic-auth /tmp/trust-policy.json

    echo "${VERSION_ARN}"
}

# Function to attach Lambda@Edge to CloudFront
attach_lambda_to_cloudfront() {
    local lambda_version_arn=$1

    log_info "Instructions to attach Lambda@Edge to CloudFront:"
    log_info ""
    log_warning "Due to CloudFront's complexity, this requires manual steps:"
    log_info ""
    log_info "1. Go to AWS CloudFront Console: https://console.aws.amazon.com/cloudfront/"
    log_info "2. Find your distribution for ${ENVIRONMENT}"
    log_info "3. Go to 'Behaviors' tab"
    log_info "4. Edit the default behavior"
    log_info "5. Scroll to 'Function associations'"
    log_info "6. Under 'Viewer request', select 'Lambda@Edge'"
    log_info "7. Paste this ARN: ${lambda_version_arn}"
    log_info "8. Click 'Save changes'"
    log_info "9. Wait 15-20 minutes for deployment"
    log_info ""
    log_info "Alternative (using AWS CLI - advanced):"
    log_info "Run the provided helper script: ./aws/attach-lambda-edge.sh ${ENVIRONMENT} ${lambda_version_arn}"
}

# Main execution
main() {
    log_info "=== Configuring Basic Authentication ==="
    log_info ""
    log_info "This will create a Lambda@Edge function for basic auth"
    log_info "Cost: ~\$0.60 per million requests (much cheaper than WAF)"
    log_info ""

    # Prompt for username and password
    read -p "Enter username for basic auth: " AUTH_USER
    read -s -p "Enter password for basic auth: " AUTH_PASS
    echo ""

    if [ -z "$AUTH_USER" ] || [ -z "$AUTH_PASS" ]; then
        log_error "Username and password are required"
        exit 1
    fi

    # Create Lambda function
    LAMBDA_VERSION_ARN=$(create_basic_auth_lambda "$AUTH_USER" "$AUTH_PASS")

    # Save configuration
    mkdir -p "${SCRIPT_DIR}/.cache"
    cat > "${SCRIPT_DIR}/.cache/${ENVIRONMENT}-basic-auth.json" <<EOF
{
    "environment": "${ENVIRONMENT}",
    "lambda_version_arn": "${LAMBDA_VERSION_ARN}",
    "configured_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

    log_success "Basic authentication Lambda created!"
    log_info ""

    # Instructions to attach
    attach_lambda_to_cloudfront "${LAMBDA_VERSION_ARN}"

    log_info ""
    log_success "Configuration saved to: ${SCRIPT_DIR}/.cache/${ENVIRONMENT}-basic-auth.json"
}

# Run main function
main "$@"
