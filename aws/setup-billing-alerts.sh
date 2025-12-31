#!/bin/bash

# AWS Billing Alerts Setup
# Creates CloudWatch alarms to notify you when costs exceed thresholds

set -e

# Load configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/config.sh"

log_info "Setting up AWS billing alerts..."

# Function to enable billing alerts
enable_billing_alerts() {
    log_info "Enabling billing alerts in CloudWatch..."

    # This must be done in us-east-1
    aws cloudwatch put-metric-alarm \
        --alarm-name "BillingAlarm-\$5-Monthly" \
        --alarm-description "Alert when estimated monthly charges exceed \$5" \
        --metric-name EstimatedCharges \
        --namespace AWS/Billing \
        --statistic Maximum \
        --period 21600 \
        --evaluation-periods 1 \
        --threshold 5.0 \
        --comparison-operator GreaterThanThreshold \
        --dimensions Name=Currency,Value=USD \
        --region us-east-1 \
        --profile "${AWS_PROFILE}" 2>/dev/null || true

    log_info "Note: You need to enable billing alerts in the AWS Console first"
    log_info "Go to: https://console.aws.amazon.com/billing/home#/preferences"
    log_info "Check 'Receive Billing Alerts' and save"
}

# Function to create SNS topic for billing alerts
create_billing_alert_topic() {
    local email=$1

    log_info "Creating SNS topic for billing alerts..."

    # Create SNS topic (must be in us-east-1 for billing)
    TOPIC_ARN=$(aws sns create-topic \
        --name "billing-alerts" \
        --region us-east-1 \
        --profile "${AWS_PROFILE}" \
        --query "TopicArn" \
        --output text)

    log_success "SNS topic created: ${TOPIC_ARN}"

    # Subscribe email to topic
    log_info "Subscribing ${email} to billing alerts..."

    aws sns subscribe \
        --topic-arn "${TOPIC_ARN}" \
        --protocol email \
        --notification-endpoint "${email}" \
        --region us-east-1 \
        --profile "${AWS_PROFILE}"

    log_warning "Check your email (${email}) and confirm the SNS subscription!"

    echo "${TOPIC_ARN}"
}

# Function to create billing alarms
create_billing_alarms() {
    local topic_arn=$1

    log_info "Creating billing alarms..."

    # Alarm at $5
    aws cloudwatch put-metric-alarm \
        --alarm-name "BillingAlarm-5-USD" \
        --alarm-description "Alert when estimated monthly charges exceed \$5" \
        --metric-name EstimatedCharges \
        --namespace AWS/Billing \
        --statistic Maximum \
        --period 21600 \
        --evaluation-periods 1 \
        --threshold 5.0 \
        --comparison-operator GreaterThanThreshold \
        --dimensions Name=Currency,Value=USD \
        --alarm-actions "${topic_arn}" \
        --region us-east-1 \
        --profile "${AWS_PROFILE}"

    log_success "Billing alarm created: \$5 threshold"

    # Alarm at $10
    aws cloudwatch put-metric-alarm \
        --alarm-name "BillingAlarm-10-USD" \
        --alarm-description "Alert when estimated monthly charges exceed \$10" \
        --metric-name EstimatedCharges \
        --namespace AWS/Billing \
        --statistic Maximum \
        --period 21600 \
        --evaluation-periods 1 \
        --threshold 10.0 \
        --comparison-operator GreaterThanThreshold \
        --dimensions Name=Currency,Value=USD \
        --alarm-actions "${topic_arn}" \
        --region us-east-1 \
        --profile "${AWS_PROFILE}"

    log_success "Billing alarm created: \$10 threshold"

    # Alarm at $20 (safety net)
    aws cloudwatch put-metric-alarm \
        --alarm-name "BillingAlarm-20-USD" \
        --alarm-description "URGENT: Alert when estimated monthly charges exceed \$20" \
        --metric-name EstimatedCharges \
        --namespace AWS/Billing \
        --statistic Maximum \
        --period 21600 \
        --evaluation-periods 1 \
        --threshold 20.0 \
        --comparison-operator GreaterThanThreshold \
        --dimensions Name=Currency,Value=USD \
        --alarm-actions "${topic_arn}" \
        --region us-east-1 \
        --profile "${AWS_PROFILE}"

    log_success "Billing alarm created: \$20 threshold"
}

# Main execution
main() {
    log_info "=== AWS Billing Alerts Setup ==="
    echo ""
    log_info "This script will create CloudWatch alarms to notify you when costs exceed:"
    log_info "- \$5/month"
    log_info "- \$10/month"
    log_info "- \$20/month (safety net)"
    echo ""

    # Get email for notifications
    read -p "Enter your email for billing alerts: " EMAIL

    if [ -z "$EMAIL" ]; then
        log_error "Email is required"
        exit 1
    fi

    # Check if AWS CLI is configured
    if ! aws sts get-caller-identity --profile "${AWS_PROFILE}" >/dev/null 2>&1; then
        log_error "AWS CLI not configured. Run: aws configure"
        exit 1
    fi

    # Create SNS topic
    TOPIC_ARN=$(create_billing_alert_topic "${EMAIL}")

    # Create billing alarms
    create_billing_alarms "${TOPIC_ARN}"

    log_success "Billing alerts setup complete!"
    echo ""
    log_info "Important next steps:"
    log_info "1. Check your email (${EMAIL}) and CONFIRM the SNS subscription"
    log_info "2. Go to: https://console.aws.amazon.com/billing/home#/preferences"
    log_info "3. Check 'Receive Billing Alerts' and save preferences"
    log_info "4. You'll receive emails when your costs exceed \$5, \$10, or \$20"
    echo ""
    log_info "View your current costs:"
    log_info "https://console.aws.amazon.com/billing/home#/"
}

# Run main function
main "$@"
