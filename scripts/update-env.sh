#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Environment Update Script${NC}"
echo "This script will update your environment variables while preserving existing values."
echo ""

# Backup existing .env file
echo -e "${BLUE}1. Backing up existing .env file...${NC}"
cp apps/backend/.env apps/backend/.env.backup
echo "Backup created at apps/backend/.env.backup"

# Function to generate random string
generate_random_string() {
    openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c $1
}

# Function to get existing value from .env file
get_existing_value() {
    local key=$1
    local value=$(grep "^$key=" apps/backend/.env.backup | cut -d '=' -f2-)
    echo "$value"
}

# Generate new values only if they don't exist
echo -e "\n${GREEN}2. Checking and generating secure values...${NC}"

# Check and generate JWT_SECRET if needed
if [ "$(get_existing_value JWT_SECRET)" = "your_jwt_secret_here" ]; then
    JWT_SECRET=$(generate_random_string 32)
    echo "Generated new JWT_SECRET"
else
    JWT_SECRET=$(get_existing_value JWT_SECRET)
    echo "Using existing JWT_SECRET"
fi

# Check and generate ENCRYPTION_KEY if needed
if [ "$(get_existing_value ENCRYPTION_KEY)" = "your_encryption_key_here" ]; then
    ENCRYPTION_KEY=$(generate_random_string 32)
    echo "Generated new ENCRYPTION_KEY"
else
    ENCRYPTION_KEY=$(get_existing_value ENCRYPTION_KEY)
    echo "Using existing ENCRYPTION_KEY"
fi

# Check and generate ENCRYPTION_IV if needed
if [ "$(get_existing_value ENCRYPTION_IV)" = "your_encryption_iv_here" ]; then
    ENCRYPTION_IV=$(generate_random_string 16)
    echo "Generated new ENCRYPTION_IV"
else
    ENCRYPTION_IV=$(get_existing_value ENCRYPTION_IV)
    echo "Using existing ENCRYPTION_IV"
fi

# Update .env file with new values
echo -e "\n${GREEN}3. Updating .env file...${NC}"
sed -i '' "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" apps/backend/.env
sed -i '' "s|ENCRYPTION_KEY=.*|ENCRYPTION_KEY=$ENCRYPTION_KEY|" apps/backend/.env
sed -i '' "s|ENCRYPTION_IV=.*|ENCRYPTION_IV=$ENCRYPTION_IV|" apps/backend/.env

# Update MongoDB URI if provided
if [ ! -z "$1" ]; then
    echo "Updating MongoDB URI..."
    sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=\"$1\"|" apps/backend/.env
fi

# GitHub Secrets Setup
echo -e "\n${GREEN}4. GitHub Secrets Setup${NC}"
echo "To add these secrets to your GitHub repository:"
echo "1. Go to your repository on GitHub"
echo "2. Click on 'Settings'"
echo "3. Click on 'Secrets and variables' → 'Actions'"
echo "4. Click 'New repository secret'"
echo ""
echo "Add the following secrets:"
echo "PROD_JWT_SECRET: $JWT_SECRET"
echo "PROD_MONGODB_URI: [Your MongoDB connection string]"
echo "PROD_ENCRYPTION_KEY: $ENCRYPTION_KEY"
echo "PROD_ENCRYPTION_IV: $ENCRYPTION_IV"

# Security Notes
echo -e "\n${YELLOW}Important Security Notes:${NC}"
echo "1. Keep all secrets secure and never commit them to your repository"
echo "2. Store a copy of these values in a secure password manager"
echo "3. Rotate secrets periodically for security"
echo "4. Use different credentials for development and production"
echo "5. Enable 2FA on all services (GitHub, MongoDB, Google, etc.)"

echo -e "\n${GREEN}Update complete!${NC}"
echo "Your .env file has been updated with secure values."
echo "A backup of your original .env file is available at apps/backend/.env.backup" 