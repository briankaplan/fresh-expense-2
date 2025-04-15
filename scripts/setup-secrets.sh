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

echo "Setting up secrets for $REPO_OWNER/$REPO_NAME"

# Function to add secret
add_secret() {
    local secret_name=$1
    local secret_value=$2
    
    echo "Adding $secret_name..."
    echo "$secret_value" | gh secret set "$secret_name" --repo "$REPO_OWNER/$REPO_NAME"
}

# Add core secrets
add_secret "JWT_SECRET" "$(openssl rand -base64 32)"
add_secret "JWT_ISSUER" "expense-app"
add_secret "JWT_AUDIENCE" "expense-app"
add_secret "MONGODB_URI" "your-mongodb-uri"
add_secret "API_URL" "https://api.yourdomain.com"

# Add Cloudflare secrets
add_secret "CLOUDFLARE_API_TOKEN" "your-cloudflare-api-token"
add_secret "CLOUDFLARE_ACCOUNT_ID" "your-cloudflare-account-id"
add_secret "CLOUDFLARE_ZONE_ID" "your-cloudflare-zone-id"

# Add Teller API secrets
add_secret "TELLER_API_KEY" "your-teller-api-key"
add_secret "TELLER_ENV" "sandbox"

# Add R2 secrets
add_secret "R2_ACCESS_KEY_ID" "your-r2-access-key"
add_secret "R2_SECRET_ACCESS_KEY" "your-r2-secret-key"
add_secret "R2_BUCKET" "expense-files"
add_secret "R2_ENDPOINT" "https://your-account.r2.cloudflarestorage.com"

# Map existing secrets to new names
gh secret set CF_API_TOKEN --body "$(gh secret get CLOUDFLARE_API_TOKEN)"
gh secret set CLOUDFLARE_API_URL --body "$(gh secret get PROD_API_URL)"
gh secret set CLOUDFLARE_ZONE_ID --body "$(gh secret get PROD_CLOUDFLARE_ZONE_ID)"
gh secret set MONGODB_URI --body "$(gh secret get PROD_MONGODB_URI)"
gh secret set HUGGINGFACE_API_KEY --body "$(gh secret get PROD_HUGGINGFACE_API_KEY)"
gh secret set R2_ACCOUNT_ID --body "$(gh secret get PROD_R2_ACCOUNT_ID)"
gh secret set R2_ACCESS_KEY_ID --body "$(gh secret get PROD_R2_ACCESS_KEY_ID)"
gh secret set R2_SECRET_ACCESS_KEY --body "$(gh secret get PROD_R2_SECRET_ACCESS_KEY)"

# Create KV namespace ID if it doesn't exist
KV_NAMESPACE_ID=$(wrangler kv:namespace list | grep CACHE | awk '{print $1}')
if [ -z "$KV_NAMESPACE_ID" ]; then
    echo "Creating new KV namespace..."
    KV_NAMESPACE_ID=$(wrangler kv:namespace create CACHE | grep -o 'id = "[^"]*' | cut -d'"' -f2)
fi
gh secret set KV_NAMESPACE_ID --body "$KV_NAMESPACE_ID"

echo "All secrets have been set up successfully!"
echo "Please update the values in your Cloudflare and MongoDB dashboards." 