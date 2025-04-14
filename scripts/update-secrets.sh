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
gh secret set JWT_SECRET -b"$JWT_SECRET" --repo "$REPO"

echo "Updating ENCRYPTION_KEY..."
gh secret set ENCRYPTION_KEY -b"$ENCRYPTION_KEY" --repo "$REPO"

echo "Updating GMAIL_CLIENT_ID_1..."
gh secret set GMAIL_CLIENT_ID_1 -b"$GMAIL_CLIENT_ID_1" --repo "$REPO"

echo "Updating GMAIL_CLIENT_SECRET_1..."
gh secret set GMAIL_CLIENT_SECRET_1 -b"$GMAIL_CLIENT_SECRET_1" --repo "$REPO"

echo "Updating GMAIL_REFRESH_TOKEN_1..."
gh secret set GMAIL_REFRESH_TOKEN_1 -b"$GMAIL_REFRESH_TOKEN_1" --repo "$REPO"

echo "Updating GMAIL_CLIENT_ID_2..."
gh secret set GMAIL_CLIENT_ID_2 -b"$GMAIL_CLIENT_ID_2" --repo "$REPO"

echo "Updating GMAIL_CLIENT_SECRET_2..."
gh secret set GMAIL_CLIENT_SECRET_2 -b"$GMAIL_CLIENT_SECRET_2" --repo "$REPO"

echo "Updating GMAIL_REFRESH_TOKEN_2..."
gh secret set GMAIL_REFRESH_TOKEN_2 -b"$GMAIL_REFRESH_TOKEN_2" --repo "$REPO"

echo "Updating GMAIL_CLIENT_ID_3..."
gh secret set GMAIL_CLIENT_ID_3 -b"$GMAIL_CLIENT_ID_3" --repo "$REPO"

echo "Updating GMAIL_CLIENT_SECRET_3..."
gh secret set GMAIL_CLIENT_SECRET_3 -b"$GMAIL_CLIENT_SECRET_3" --repo "$REPO"

echo "Updating GMAIL_REFRESH_TOKEN_3..."
gh secret set GMAIL_REFRESH_TOKEN_3 -b"$GMAIL_REFRESH_TOKEN_3" --repo "$REPO"

echo "Updating GMAIL_CLIENT_ID_4..."
gh secret set GMAIL_CLIENT_ID_4 -b"$GMAIL_CLIENT_ID_4" --repo "$REPO"

echo "Updating GMAIL_CLIENT_SECRET_4..."
gh secret set GMAIL_CLIENT_SECRET_4 -b"$GMAIL_CLIENT_SECRET_4" --repo "$REPO"

echo "Updating GMAIL_REFRESH_TOKEN_4..."
gh secret set GMAIL_REFRESH_TOKEN_4 -b"$GMAIL_REFRESH_TOKEN_4" --repo "$REPO"

echo "Updating GMAIL_CLIENT_ID_5..."
gh secret set GMAIL_CLIENT_ID_5 -b"$GMAIL_CLIENT_ID_5" --repo "$REPO"

echo "Updating GMAIL_CLIENT_SECRET_5..."
gh secret set GMAIL_CLIENT_SECRET_5 -b"$GMAIL_CLIENT_SECRET_5" --repo "$REPO"

echo "Updating GMAIL_REFRESH_TOKEN_5..."
gh secret set GMAIL_REFRESH_TOKEN_5 -b"$GMAIL_REFRESH_TOKEN_5" --repo "$REPO"

echo "Updating CLOUDFLARE_API_TOKEN..."
gh secret set CLOUDFLARE_API_TOKEN -b"$CLOUDFLARE_API_TOKEN" --repo "$REPO"

echo "Updating CLOUDFLARE_ACCOUNT_ID..."
gh secret set CLOUDFLARE_ACCOUNT_ID -b"$CLOUDFLARE_ACCOUNT_ID" --repo "$REPO"

echo "Updating PROD_HUGGINGFACE_API_KEY..."
gh secret set PROD_HUGGINGFACE_API_KEY -b"$HUGGINGFACE_API_KEY" --repo "$REPO"

echo "Updating SENDGRID_API_KEY..."
gh secret set SENDGRID_API_KEY -b"$SENDGRID_API_KEY" --repo "$REPO"

echo "All secrets have been updated successfully." 