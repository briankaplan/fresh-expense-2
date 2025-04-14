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

function show_help {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  list           - List all secrets"
    echo "  update [name]  - Update a specific secret"
    echo "  delete [name]  - Delete a specific secret"
    echo "  generate       - Generate new JWT secrets"
    echo "  help          - Show this help message"
}

function list_secrets {
    echo "Listing all secrets for $REPO_OWNER/$REPO_NAME:"
    gh secret list
}

function update_secret {
    if [ -z "$1" ]; then
        echo "Error: Secret name is required"
        show_help
        exit 1
    fi
    
    read -s -p "Enter new value for $1: " value
    echo
    gh secret set "$1" -b"$value" -R "$REPO_OWNER/$REPO_NAME"
    echo "Secret $1 updated successfully"
}

function delete_secret {
    if [ -z "$1" ]; then
        echo "Error: Secret name is required"
        show_help
        exit 1
    fi
    
    read -p "Are you sure you want to delete $1? (y/n): " confirm
    if [ "$confirm" = "y" ]; then
        gh secret delete "$1" -R "$REPO_OWNER/$REPO_NAME"
        echo "Secret $1 deleted successfully"
    else
        echo "Operation cancelled"
    fi
}

function generate_jwt_secrets {
    echo "Generating new JWT secrets..."
    
    # Generate new secrets
    NEW_DEV_JWT=$(openssl rand -base64 32)
    NEW_TEST_JWT=$(openssl rand -base64 32)
    NEW_PROD_JWT=$(openssl rand -base64 32)
    
    # Update secrets
    gh secret set DEV_JWT_SECRET -b"$NEW_DEV_JWT" -R "$REPO_OWNER/$REPO_NAME"
    gh secret set TEST_JWT_SECRET -b"$NEW_TEST_JWT" -R "$REPO_OWNER/$REPO_NAME"
    gh secret set PROD_JWT_SECRET -b"$NEW_PROD_JWT" -R "$REPO_OWNER/$REPO_NAME"
    
    echo "New JWT secrets generated and updated:"
    echo "Development: $NEW_DEV_JWT"
    echo "Test: $NEW_TEST_JWT"
    echo "Production: $NEW_PROD_JWT"
    echo "Please save these values securely as they won't be shown again."
}

# Main script logic
case "$1" in
    list)
        list_secrets
        ;;
    update)
        update_secret "$2"
        ;;
    delete)
        delete_secret "$2"
        ;;
    generate)
        generate_jwt_secrets
        ;;
    help|*)
        show_help
        ;;
esac 