#!/bin/bash

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "GitHub CLI is not installed. Please install it first:"
    echo "brew install gh"
    exit 1
fi

# Check if user is logged in
if ! gh auth status &> /dev/null; then
    echo "Please log in to GitHub CLI first:"
    echo "gh auth login"
    exit 1
fi

# Get repository name
REPO_NAME=$(gh repo view --json name -q .name)
REPO_OWNER=$(gh repo view --json owner -q .owner.login)

echo "Setting up environment secrets for $REPO_OWNER/$REPO_NAME..."

# Generate secure random values
DEV_JWT_SECRET=$(openssl rand -base64 32)
TEST_JWT_SECRET=$(openssl rand -base64 32)

# Development Environment Secrets
echo "Setting up development environment secrets..."
gh secret set DEV_JWT_SECRET -b"$DEV_JWT_SECRET" -R "$REPO_OWNER/$REPO_NAME"
gh secret set DEV_MONGODB_URI -b"mongodb://localhost:27017/expense-tracker-dev" -R "$REPO_OWNER/$REPO_NAME"

# Test Environment Secrets
echo "Setting up test environment secrets..."
gh secret set TEST_JWT_SECRET -b"$TEST_JWT_SECRET" -R "$REPO_OWNER/$REPO_NAME"
gh secret set TEST_MONGODB_URI -b"mongodb://localhost:27017/expense-tracker-test" -R "$REPO_OWNER/$REPO_NAME"

# Production Environment Secrets (only if not already set)
if ! gh secret list | grep -q "PROD_JWT_SECRET"; then
    echo "Setting up production environment secrets..."
    PROD_JWT_SECRET=$(openssl rand -base64 32)
    gh secret set PROD_JWT_SECRET -b"$PROD_JWT_SECRET" -R "$REPO_OWNER/$REPO_NAME"
    gh secret set PROD_MONGODB_URI -b"mongodb+srv://expense-tracker-prod:${PROD_JWT_SECRET}@cluster0.mongodb.net/expense-tracker-prod?retryWrites=true&w=majority" -R "$REPO_OWNER/$REPO_NAME"
else
    echo "Production secrets already exist, skipping..."
fi

echo "Environment secrets setup complete!"
echo "Development JWT Secret: $DEV_JWT_SECRET"
echo "Test JWT Secret: $TEST_JWT_SECRET"
echo "Please save these values securely as they won't be shown again." 