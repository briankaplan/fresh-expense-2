# GitHub Repository Secrets Setup

This document explains how to set up the required secrets for the Docker Build and Push workflow.

## Required Secrets

The following secrets need to be added to your GitHub repository:

### 1. PROD_JWT_SECRET

- **Purpose**: Used for JWT token generation and verification in production
- **Format**: A secure random string (minimum 32 characters)
- **Example**: `openssl rand -base64 32`

### 2. PROD_MONGODB_URI

- **Purpose**: MongoDB connection string for the production database
- **Format**: MongoDB connection URI
- **Example**: `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/expense-app?retryWrites=true&w=majority`

### 3. PROD_API_URL

- **Purpose**: The URL where the backend API is accessible in production
- **Format**: Full URL including protocol
- **Example**: `https://api.yourdomain.com`

## Setting Up Secrets

1. Go to your GitHub repository
2. Click on "Settings"
3. In the left sidebar, click on "Secrets and variables" > "Actions"
4. Click "New repository secret"
5. For each secret:
   - Enter the secret name (e.g., `PROD_JWT_SECRET`)
   - Enter the secret value
   - Click "Add secret"

## Security Best Practices

- Never commit these values to your repository
- Use different values for development and production
- Rotate secrets periodically
- Use strong, randomly generated values
- Limit access to these secrets to only necessary team members

## Testing Secrets

After adding the secrets, you can test them by:

1. Manually triggering the workflow using the "workflow_dispatch" event
2. Checking the "validate-secrets" job output
3. Verifying that the build process completes successfully

## Troubleshooting

If you encounter issues:

1. Verify that all secrets are properly set
2. Check the workflow logs for specific error messages
3. Ensure the secrets are correctly referenced in the workflow file
4. Verify that the repository has the necessary permissions to access the secrets
