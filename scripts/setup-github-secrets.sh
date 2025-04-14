#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}GitHub Secrets Setup Script${NC}"
echo "This script will add all required secrets to your GitHub repository using the GitHub CLI."
echo ""

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}GitHub CLI is not installed. Please install it first:${NC}"
    echo "brew install gh"
    echo "gh auth login"
    exit 1
fi

# Check if user is logged in to GitHub CLI
if ! gh auth status &> /dev/null; then
    echo -e "${RED}You are not logged in to GitHub CLI. Please log in first:${NC}"
    echo "gh auth login"
    exit 1
fi

# Get repository name with owner
REPO_NAME=$(gh repo view --json nameWithOwner -q .nameWithOwner)
if [ -z "$REPO_NAME" ]; then
    echo -e "${RED}Could not determine repository name. Please make sure you're in a git repository.${NC}"
    exit 1
fi

echo -e "${GREEN}Adding secrets to repository: $REPO_NAME${NC}"
echo ""

# Function to add a secret
add_secret() {
    local secret_name=$1
    local secret_value=$2
    local description=$3

    echo -e "${YELLOW}Adding $secret_name...${NC}"
    if [ -z "$secret_value" ]; then
        echo -e "${YELLOW}Warning: $secret_name is empty. Please provide a value.${NC}"
        return
    fi

    if gh secret set "$secret_name" --body "$secret_value" --repo "$REPO_NAME"; then
        echo -e "${GREEN}✓ $secret_name added successfully${NC}"
    else
        echo -e "${RED}✗ Failed to add $secret_name${NC}"
    fi
}

# Cloudflare Secrets
add_secret "CLOUDFLARE_API_TOKEN" "dummy_cf_token_123" "Cloudflare API Token"
add_secret "CLOUDFLARE_ACCOUNT_ID" "dummy_cf_account_123" "Cloudflare Account ID"

# Application Secrets
add_secret "JWT_SECRET" "dummy_jwt_secret_123" "JWT Secret for authentication"
add_secret "ENCRYPTION_KEY" "dummy_encryption_key_123" "Encryption key for sensitive data"

# Gmail API Secrets (5 accounts)
for i in {1..5}; do
    add_secret "GMAIL_CLIENT_ID_$i" "dummy_gmail_client_id_$i" "Google OAuth Client ID for Account $i"
    add_secret "GMAIL_CLIENT_SECRET_$i" "dummy_gmail_client_secret_$i" "Google OAuth Client Secret for Account $i"
    add_secret "GMAIL_REFRESH_TOKEN_$i" "dummy_gmail_refresh_token_$i" "Google OAuth Refresh Token for Account $i"
done

echo -e "\n${GREEN}All secrets have been added to your GitHub repository!${NC}"
echo -e "${YELLOW}Note:${NC} The following secrets have been added:"
echo "- CLOUDFLARE_API_TOKEN: For Cloudflare API access"
echo "- CLOUDFLARE_ACCOUNT_ID: For Cloudflare account identification"
echo "- JWT_SECRET: For JWT token generation"
echo "- ENCRYPTION_KEY: For data encryption"
echo "- GMAIL_CLIENT_ID_1 through GMAIL_CLIENT_ID_5: For Gmail integration"
echo "- GMAIL_CLIENT_SECRET_1 through GMAIL_CLIENT_SECRET_5: For Gmail integration"
echo "- GMAIL_REFRESH_TOKEN_1 through GMAIL_REFRESH_TOKEN_5: For Gmail token refresh"
echo "You can verify these in your GitHub repository settings." 