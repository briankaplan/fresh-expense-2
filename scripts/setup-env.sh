#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Environment Setup Script${NC}"
echo "This script will help you set up all environment variables and GitHub secrets."
echo ""

# Function to generate random string
generate_random_string() {
    openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c $1
}

# Function to prompt for sensitive input
prompt_sensitive() {
    local prompt=$1
    local var_name=$2
    local is_required=$3
    
    read -p "$prompt: " -s value
    echo ""
    
    if [ "$is_required" = "true" ] && [ -z "$value" ]; then
        echo "This value is required. Please try again."
        prompt_sensitive "$prompt" "$var_name" "$is_required"
    else
        eval "$var_name='$value'"
    fi
}

# Generate secure values
echo -e "${GREEN}1. Generating secure values...${NC}"
JWT_SECRET=$(generate_random_string 32)
ENCRYPTION_KEY=$(generate_random_string 32)
ENCRYPTION_IV=$(generate_random_string 16)
echo "Generated secure values for JWT and encryption"

# Development Environment Setup
echo -e "\n${BLUE}2. Development Environment Setup${NC}"
echo "Setting up development environment variables..."

# Create .env files
cat > apps/backend/.env << EOL
# Server Configuration
NODE_ENV=development
PORT=3001
HOST=localhost

# Authentication
JWT_SECRET=$JWT_SECRET
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
ENCRYPTION_KEY=$ENCRYPTION_KEY
ENCRYPTION_IV=$ENCRYPTION_IV

# Database Configuration
DATABASE_URL="mongodb://localhost:27017/expense-tracker"
MONGODB_DB=expense-v2

# Frontend
FRONTEND_URL="http://localhost:3000"

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
CORS_METHODS=GET,HEAD,PUT,PATCH,POST,DELETE
CORS_CREDENTIALS=true

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Storage Configuration (Cloudflare R2)
R2_ACCOUNT_ID=your_r2_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_URL=your_r2_public_url
R2_REGION=auto
R2_ENDPOINT=your_r2_endpoint

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@domain.com
SMTP_PASSWORD=your_app_specific_password
SMTP_FROM="Expense Tracker <your_email@domain.com>"
EMAIL_FROM=your_email@domain.com

# Teller API Integration
TELLER_API_URL=https://api.teller.io
TELLER_APPLICATION_ID=your_teller_app_id
TELLER_API_VERSION=2020-10-12
TELLER_ENVIRONMENT=sandbox
TELLER_CERT_PATH=/path/to/teller_certificate.pem
TELLER_KEY_PATH=/path/to/teller_private_key.pem
TELLER_SIGNING_SECRET=your_teller_signing_secret
TELLER_SIGNING_KEY=your_teller_signing_key
TELLER_REDIRECT_URI=http://localhost:3000/api/teller/callback

# Logging
LOG_LEVEL=debug
ENABLE_DEBUG_MODE=false
EOL

# GitHub Secrets Setup
echo -e "\n${GREEN}3. GitHub Secrets Setup${NC}"
echo "To add these secrets to your GitHub repository:"
echo "1. Go to your repository on GitHub"
echo "2. Click on 'Settings'"
echo "3. Click on 'Secrets and variables' → 'Actions'"
echo "4. Click 'New repository secret'"
echo ""
echo "Add the following secrets:"
echo "PROD_JWT_SECRET: $JWT_SECRET"
echo "PROD_MONGODB_URI: [Your MongoDB connection string]"
echo "PROD_API_URL: [Your production API URL]"
echo "PROD_ENCRYPTION_KEY: $ENCRYPTION_KEY"
echo "PROD_ENCRYPTION_IV: $ENCRYPTION_IV"
echo "PROD_GOOGLE_CLIENT_ID: [Your Google OAuth Client ID]"
echo "PROD_GOOGLE_CLIENT_SECRET: [Your Google OAuth Client Secret]"
echo "PROD_R2_ACCOUNT_ID: [Your Cloudflare R2 Account ID]"
echo "PROD_R2_ACCESS_KEY_ID: [Your Cloudflare R2 Access Key ID]"
echo "PROD_R2_SECRET_ACCESS_KEY: [Your Cloudflare R2 Secret Access Key]"
echo "PROD_R2_BUCKET_NAME: [Your Cloudflare R2 Bucket Name]"
echo "PROD_SMTP_USER: [Your Email Address]"
echo "PROD_SMTP_PASSWORD: [Your App-Specific Password]"
echo "PROD_TELLER_APPLICATION_ID: [Your Teller Application ID]"
echo "PROD_TELLER_SIGNING_SECRET: [Your Teller Signing Secret]"
echo "PROD_TELLER_SIGNING_KEY: [Your Teller Signing Key]"

# Instructions for setting up production environment
echo -e "\n${YELLOW}4. Production Environment Setup${NC}"
echo "For production deployment:"
echo "1. Set up your domain and SSL certificates"
echo "2. Configure your production API URL (e.g., https://api.yourdomain.com)"
echo "3. Update CORS_ORIGIN to your production frontend URL"
echo "4. Set NODE_ENV=production in your production environment"
echo "5. Configure your production MongoDB connection"
echo "6. Set up production OAuth credentials"
echo "7. Configure production email settings"
echo "8. Set up production storage (Cloudflare R2)"
echo "9. Configure production Teller API settings"

# Security Notes
echo -e "\n${YELLOW}Important Security Notes:${NC}"
echo "1. Keep all secrets secure and never commit them to your repository"
echo "2. Store a copy of these values in a secure password manager"
echo "3. Rotate secrets periodically for security"
echo "4. Use different credentials for development and production"
echo "5. Enable 2FA on all services (GitHub, MongoDB, Google, etc.)"
echo "6. Regularly audit and update your security settings"
echo "7. Monitor your application logs for security issues"
echo "8. Keep your dependencies updated"

echo -e "\n${GREEN}Setup complete!${NC}"
echo "You can now run your application in development mode."
echo "For production deployment, make sure to set up all the required secrets in GitHub." 