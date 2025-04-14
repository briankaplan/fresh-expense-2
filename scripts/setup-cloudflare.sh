#!/bin/bash

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "Installing wrangler..."
    npm install -g wrangler
fi

# Login to Cloudflare
wrangler login

# Create KV namespace
echo "Creating KV namespace..."
KV_NAMESPACE=$(wrangler kv:namespace create "CACHE" --preview | grep -o 'id="[^"]*"' | cut -d'"' -f2)
KV_PREVIEW=$(wrangler kv:namespace create "CACHE" --preview --preview-name "CACHE_PREVIEW" | grep -o 'id="[^"]*"' | cut -d'"' -f2)

# Create R2 bucket
echo "Creating R2 bucket..."
wrangler r2 bucket create "expense-files"
wrangler r2 bucket create "expense-files-dev"

# Get zone ID
echo "Getting zone ID..."
ZONE_ID=$(wrangler whoami | grep -o 'zone_id: "[^"]*"' | cut -d'"' -f2)

# Update wrangler.toml with the new values
echo "Updating wrangler.toml..."
sed -i "s/id = \"\"/id = \"$KV_NAMESPACE\"/g" apps/backend/wrangler.toml
sed -i "s/preview_id = \"\"/preview_id = \"$KV_PREVIEW\"/g" apps/backend/wrangler.toml
sed -i "s/zone_id = \"\"/zone_id = \"$ZONE_ID\"/g" apps/backend/wrangler.toml

# Set environment variables from GitHub secrets
echo "Setting environment variables from GitHub secrets..."
for var in JWT_SECRET MONGODB_URI R2_ACCOUNT_ID R2_ACCESS_KEY_ID R2_SECRET_ACCESS_KEY R2_BUCKET_NAME R2_PUBLIC_URL R2_ENDPOINT R2_JURISDICTION GOOGLE_CLIENT_ID GOOGLE_CLIENT_SECRET GOOGLE_REDIRECT_URI GOOGLE_PHOTOS_REDIRECT_URI SMTP_HOST SMTP_PORT SMTP_USER SMTP_PASSWORD EMAIL_FROM TELLER_APPLICATION_ID TELLER_API_URL TELLER_API_VERSION TELLER_ENVIRONMENT TELLER_WEBHOOK_URL TELLER_SIGNING_SECRET TELLER_SIGNING_KEY; do
    if [ -n "${!var}" ]; then
        echo "Setting $var..."
        wrangler secret put "$var" <<< "${!var}"
    else
        echo "Warning: $var is not set in environment"
    fi
done

echo "Cloudflare setup complete!"
echo "KV Namespace ID: $KV_NAMESPACE"
echo "KV Preview ID: $KV_PREVIEW"
echo "Zone ID: $ZONE_ID" 