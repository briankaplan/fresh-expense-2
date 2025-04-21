#!/bin/bash

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "jq is not installed. Please install it first: brew install jq"
    exit 1
fi

# Check if GITHUB_TOKEN is set
if [ -z "$GITHUB_TOKEN" ]; then
    echo "GITHUB_TOKEN environment variable is not set. Please set it first."
    exit 1
fi

# GitHub API configuration
REPO_OWNER="briankaplan"
REPO_NAME="fresh-expense-2"
API_URL="https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/secrets"

# List of secrets to fetch
secrets=(
    "JWT_SECRET"
    "ENCRYPTION_KEY"
    "ENCRYPTION_IV"
    "MONGODB_URI"
    "PROD_HUGGINGFACE_API_KEY"
    "R2_ACCOUNT_ID"
    "R2_ACCESS_KEY_ID"
    "R2_SECRET_ACCESS_KEY"
    "R2_PUBLIC_URL"
    "R2_ENDPOINT"
    "TELLER_APPLICATION_ID"
    "TELLER_WEBHOOK_URL"
    "TELLER_SIGNING_SECRET"
    "TELLER_SIGNING_KEY"
)

# Create or update .env.test file
env_file="apps/backend/.env.test"

# Backup existing file
if [ -f "$env_file" ]; then
    cp "$env_file" "${env_file}.bak"
fi

# Start with base configuration
cat > "$env_file" << EOL
# Server Configuration
NODE_ENV=test
PORT=3000
HOST=localhost

# Authentication
EOL

# Fetch each secret and append to .env.test
for secret in "${secrets[@]}"; do
    # Get the public key for encryption
    public_key_response=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        "$API_URL/public-key")
    
    key_id=$(echo "$public_key_response" | jq -r '.key_id')
    key=$(echo "$public_key_response" | jq -r '.key')
    
    if [ -z "$key_id" ] || [ -z "$key" ]; then
        echo "Warning: Could not get public key for $secret"
        continue
    fi
    
    # Get the secret value from GitHub Actions
    secret_value=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        "$API_URL/$secret" | jq -r '.value')
    
    if [ -n "$secret_value" ] && [ "$secret_value" != "null" ]; then
        echo "$secret=$secret_value" >> "$env_file"
    else
        echo "Warning: Could not fetch secret $secret"
    fi
done

# Add remaining configuration
cat >> "$env_file" << EOL

# Frontend
FRONTEND_URL=http://localhost:3000

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
CORS_METHODS=GET,HEAD,PUT,PATCH,POST,DELETE
CORS_CREDENTIALS=true

# API Configuration
API_URL=http://localhost:3000
API_VERSION=v1

# Database Configuration
MONGODB_DB=expense_test_db

# Storage Configuration
R2_BUCKET_NAME=expense-files-test

# Teller API Configuration
TELLER_API_URL=https://api.teller.io
TELLER_API_VERSION=2020-10-12
TELLER_ENVIRONMENT=sandbox
EOL

echo "Environment file updated at $env_file" 