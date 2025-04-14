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

echo "Updating secrets in repository: $REPO"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Error: .env file not found. Please create one with your secrets."
    exit 1
fi

# Source the .env file
source .env

# Update secrets with values from environment variables
echo "Updating JWT_SECRET..."
gh secret set JWT_SECRET --body "$JWT_SECRET"

echo "Updating ENCRYPTION_KEY..."
gh secret set ENCRYPTION_KEY --body "$ENCRYPTION_KEY"

echo "Updating GMAIL_CLIENT_ID_1..."
gh secret set GMAIL_CLIENT_ID_1 --body "$GMAIL_CLIENT_ID_1"

echo "Updating GMAIL_CLIENT_SECRET_1..."
gh secret set GMAIL_CLIENT_SECRET_1 --body "$GMAIL_CLIENT_SECRET_1"

echo "Updating GMAIL_REFRESH_TOKEN_1..."
gh secret set GMAIL_REFRESH_TOKEN_1 --body "$GMAIL_REFRESH_TOKEN_1"

echo "Updating GMAIL_CLIENT_ID_2..."
gh secret set GMAIL_CLIENT_ID_2 --body "$GMAIL_CLIENT_ID_2"

echo "Updating GMAIL_CLIENT_SECRET_2..."
gh secret set GMAIL_CLIENT_SECRET_2 --body "$GMAIL_CLIENT_SECRET_2"

echo "Updating GMAIL_REFRESH_TOKEN_2..."
gh secret set GMAIL_REFRESH_TOKEN_2 --body "$GMAIL_REFRESH_TOKEN_2"

echo "Updating GMAIL_CLIENT_ID_3..."
gh secret set GMAIL_CLIENT_ID_3 --body "$GMAIL_CLIENT_ID_3"

echo "Updating GMAIL_CLIENT_SECRET_3..."
gh secret set GMAIL_CLIENT_SECRET_3 --body "$GMAIL_CLIENT_SECRET_3"

echo "Updating GMAIL_REFRESH_TOKEN_3..."
gh secret set GMAIL_REFRESH_TOKEN_3 --body "$GMAIL_REFRESH_TOKEN_3"

echo "Updating GMAIL_CLIENT_ID_4..."
gh secret set GMAIL_CLIENT_ID_4 --body "$GMAIL_CLIENT_ID_4"

echo "Updating GMAIL_CLIENT_SECRET_4..."
gh secret set GMAIL_CLIENT_SECRET_4 --body "$GMAIL_CLIENT_SECRET_4"

echo "Updating GMAIL_REFRESH_TOKEN_4..."
gh secret set GMAIL_REFRESH_TOKEN_4 --body "$GMAIL_REFRESH_TOKEN_4"

echo "Updating GMAIL_CLIENT_ID_5..."
gh secret set GMAIL_CLIENT_ID_5 --body "$GMAIL_CLIENT_ID_5"

echo "Updating GMAIL_CLIENT_SECRET_5..."
gh secret set GMAIL_CLIENT_SECRET_5 --body "$GMAIL_CLIENT_SECRET_5"

echo "Updating GMAIL_REFRESH_TOKEN_5..."
gh secret set GMAIL_REFRESH_TOKEN_5 --body "$GMAIL_REFRESH_TOKEN_5"

echo "Updating CLOUDFLARE_API_TOKEN..."
gh secret set CLOUDFLARE_API_TOKEN --body "$CLOUDFLARE_API_TOKEN"

echo "Updating CLOUDFLARE_ACCOUNT_ID..."
gh secret set CLOUDFLARE_ACCOUNT_ID --body "$CLOUDFLARE_ACCOUNT_ID"

echo "Updating PROD_HUGGINGFACE_API_KEY..."
gh secret set PROD_HUGGINGFACE_API_KEY --body "$HUGGINGFACE_API_KEY"

echo "Updating SENDGRID_API_KEY..."
gh secret set SENDGRID_API_KEY --body "$SENDGRID_API_KEY"

echo "All secrets have been updated successfully." 