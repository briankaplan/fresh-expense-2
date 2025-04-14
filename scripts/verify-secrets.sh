#!/bin/bash

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "GitHub CLI is not installed. Please install it first."
    echo "Visit https://cli.github.com/ for installation instructions."
    exit 1
fi

# Check if user is logged in to GitHub
if ! gh auth status &> /dev/null; then
    echo "Please log in to GitHub first using: gh auth login"
    exit 1
fi

# Get repository name
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)

echo "Verifying secrets in repository: $REPO"

# List of required secrets
required_secrets=(
    "PROD_JWT_SECRET"
    "PROD_ENCRYPTION_KEY"
    "PROD_ENCRYPTION_IV"
    "PROD_GMAIL_CLIENT_ID_1"
    "PROD_GMAIL_CLIENT_SECRET_1"
    "PROD_GMAIL_REFRESH_TOKEN_1"
    "PROD_GOOGLE_REDIRECT_URI_1"
    "PROD_GMAIL_CLIENT_ID_2"
    "PROD_GMAIL_CLIENT_SECRET_2"
    "PROD_GMAIL_REFRESH_TOKEN_2"
    "PROD_GOOGLE_REDIRECT_URI_2"
    "PROD_GOOGLE_PHOTOS_REDIRECT_URI"
    "PROD_R2_ACCOUNT_ID"
    "PROD_R2_ACCESS_KEY_ID"
    "PROD_R2_SECRET_ACCESS_KEY"
    "PROD_R2_BUCKET_NAME"
    "PROD_R2_PUBLIC_URL"
    "PROD_CLOUDFLARE_API_TOKEN"
    "PROD_CLOUDFLARE_ACCOUNT_ID"
    "PROD_TELLER_APPLICATION_ID"
    "PROD_TELLER_SIGNING_SECRET"
    "PROD_TELLER_SIGNING_KEY"
    "PROD_HUGGINGFACE_API_TOKEN"
    "PROD_HUGGINGFACE_OCR_TOKEN"
    "PROD_MONGODB_URI"
    "PROD_SENDGRID_API_KEY"
    "PROD_RECEIPT_EMAIL"
)

# Check each secret
missing_secrets=()
for secret in "${required_secrets[@]}"; do
    if ! gh secret list --repo "$REPO" | grep -q "^$secret"; then
        missing_secrets+=("$secret")
    fi
done

if [ ${#missing_secrets[@]} -eq 0 ]; then
    echo "✅ All required secrets are present"
else
    echo "❌ Missing secrets:"
    for secret in "${missing_secrets[@]}"; do
        echo "  - $secret"
    done
    exit 1
fi 