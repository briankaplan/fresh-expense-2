#!/bin/bash

# Exit on error
set -e

# Build backend image
echo "Building backend image..."
docker build \
  --build-arg JWT_SECRET=test_jwt_secret \
  --build-arg ENCRYPTION_KEY=test_encryption_key \
  --build-arg GMAIL_CLIENT_ID_1=test_client_id \
  --build-arg GMAIL_CLIENT_SECRET_1=test_client_secret \
  --build-arg GMAIL_REFRESH_TOKEN_1=test_refresh_token \
  --build-arg PROD_HUGGINGFACE_API_KEY=test_huggingface_key \
  --build-arg HUGGINGFACE_API_KEY=test_huggingface_key \
  --build-arg SENDGRID_API_KEY=test_sendgrid_key \
  -t fresh-expense-api:test \
  -f apps/backend/Dockerfile .

# Build frontend image
echo "Building frontend image..."
docker build \
  --build-arg VITE_API_URL=http://localhost:3000 \
  --build-arg VITE_GOOGLE_CLIENT_ID=test_client_id \
  --build-arg VITE_GOOGLE_CLIENT_SECRET=test_client_secret \
  --build-arg VITE_JWT_STORAGE_KEY=jwt_token \
  -t fresh-expense-frontend:test \
  -f apps/frontend/Dockerfile .

echo "Docker builds completed successfully!"
echo "You can run the containers with:"
echo "docker run -p 3000:3000 fresh-expense-api:test"
echo "docker run -p 80:80 fresh-expense-frontend:test" 