#!/bin/bash

# Function to validate MongoDB URI
validate_mongodb_uri() {
    local uri=$1
    if [[ $uri == mongodb://* ]] || [[ $uri == mongodb+srv://* ]]; then
        return 0
    else
        echo "Error: Invalid MongoDB URI format"
        return 1
    fi
}

# Function to validate URL
validate_url() {
    local url=$1
    if [[ $url =~ ^https?:// ]]; then
        return 0
    else
        echo "Error: Invalid URL format"
        return 1
    fi
}

# Generate a secure JWT secret
echo "Generating JWT secret..."
JWT_SECRET=$(openssl rand -base64 32)
echo "PROD_JWT_SECRET: $JWT_SECRET"
echo ""

# Instructions for MongoDB URI
echo "For PROD_MONGODB_URI:"
echo "1. Go to your MongoDB Atlas dashboard"
echo "2. Click on 'Database'"
echo "3. Click 'Connect'"
echo "4. Choose 'Connect your application'"
echo "5. Copy the connection string and replace <password> with your actual password"
echo "6. Add the database name at the end: /expense-app?retryWrites=true&w=majority"
echo ""

# Instructions for API URL
echo "For PROD_API_URL:"
echo "Enter the full URL where your backend API will be accessible in production"
echo "Example: https://api.yourdomain.com"
echo ""

echo "To add these secrets to GitHub:"
echo "1. Go to your repository settings"
echo "2. Navigate to Secrets and variables > Actions"
echo "3. Add each secret with its corresponding value"
echo ""
echo "Note: Keep these values secure and never commit them to your repository!"

# Generate JWT secrets
echo "Generating JWT secrets..."
DEV_JWT_SECRET=$(openssl rand -base64 32)
TEST_JWT_SECRET=$(openssl rand -base64 32)
PROD_JWT_SECRET=$(openssl rand -base64 32)

# Generate MongoDB URIs
echo "Generating MongoDB URIs..."
DEV_MONGODB_URI="mongodb://localhost:27017/expense-app-dev"
TEST_MONGODB_URI="mongodb://localhost:27017/expense-app-test"
PROD_MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/expense-app?retryWrites=true&w=majority"

# Generate API URL
echo "Generating API URL..."
PROD_API_URL="https://api.expense-app.com"

# Validate URIs
validate_mongodb_uri "$DEV_MONGODB_URI" || exit 1
validate_mongodb_uri "$TEST_MONGODB_URI" || exit 1
validate_mongodb_uri "$PROD_MONGODB_URI" || exit 1
validate_url "$PROD_API_URL" || exit 1

# Output the values
echo "Copy these values to your GitHub repository secrets:"
echo ""
echo "DEV_JWT_SECRET: $DEV_JWT_SECRET"
echo "TEST_JWT_SECRET: $TEST_JWT_SECRET"
echo "PROD_JWT_SECRET: $PROD_JWT_SECRET"
echo ""
echo "DEV_MONGODB_URI: $DEV_MONGODB_URI"
echo "TEST_MONGODB_URI: $TEST_MONGODB_URI"
echo "PROD_MONGODB_URI: $PROD_MONGODB_URI"
echo ""
echo "PROD_API_URL: $PROD_API_URL"
echo ""
echo "IMPORTANT: Replace the following placeholders in PROD_MONGODB_URI:"
echo "- username: Your MongoDB Atlas username"
echo "- password: Your MongoDB Atlas password"
echo "- cluster: Your MongoDB Atlas cluster name"
echo ""
echo "IMPORTANT: Update PROD_API_URL with your actual production domain" 