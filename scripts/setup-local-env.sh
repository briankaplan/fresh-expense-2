#!/bin/bash

# Check if MongoDB is running
if ! mongosh --eval "db.version()" &> /dev/null; then
    echo "MongoDB is not running. Please start MongoDB first."
    exit 1
fi

# Function to create database and user
create_database() {
    local db_name=$1
    local username=$2
    local password=$3
    
    echo "Setting up $db_name database..."
    
    # Create database
    mongosh --eval "use $db_name" &> /dev/null
    
    # Create user with proper roles
    mongosh $db_name --eval "
        db.createUser({
            user: '$username',
            pwd: '$password',
            roles: [
                { role: 'readWrite', db: '$db_name' },
                { role: 'dbAdmin', db: '$db_name' },
                { role: 'clusterMonitor', db: 'admin' }
            ]
        })"
    
    # Create indexes
    mongosh $db_name --eval "
        db.users.createIndex({ email: 1 }, { unique: true });
        db.transactions.createIndex({ userId: 1, date: -1 });
        db.transactions.createIndex({ userId: 1, category: 1 });
        db.categories.createIndex({ userId: 1, name: 1 }, { unique: true });"
}

# Generate secure passwords
DEV_PASSWORD=$(openssl rand -base64 12)
TEST_PASSWORD=$(openssl rand -base64 12)
PROD_PASSWORD=$(openssl rand -base64 12)

# Create databases
create_database "expense-tracker-dev" "dev" "$DEV_PASSWORD"
create_database "expense-tracker-test" "test" "$TEST_PASSWORD"
create_database "expense-tracker-prod" "prod" "$PROD_PASSWORD"

# Create .env files
echo "Creating environment files..."

# Development environment
cat > apps/backend/.env << EOL
# Server Configuration
NODE_ENV=development
PORT=3001
HOST=localhost

# Authentication
JWT_SECRET=$DEV_JWT_SECRET
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
ENCRYPTION_KEY=$(openssl rand -base64 32)
ENCRYPTION_IV=$(openssl rand -base64 16)

# Database Configuration
MONGODB_URI=mongodb://dev:$DEV_PASSWORD@localhost:27017/expense-tracker-dev?authSource=expense-tracker-dev
MONGODB_DB=expense-tracker-dev

# Frontend
FRONTEND_URL=http://localhost:3000

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
CORS_METHODS=GET,HEAD,PUT,PATCH,POST,DELETE
CORS_CREDENTIALS=true
EOL

# Test environment
cat > apps/backend/.env.test << EOL
# Server Configuration
NODE_ENV=test
PORT=3002
HOST=localhost

# Authentication
JWT_SECRET=$TEST_JWT_SECRET
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
ENCRYPTION_KEY=$(openssl rand -base64 32)
ENCRYPTION_IV=$(openssl rand -base64 16)

# Database Configuration
MONGODB_URI=mongodb://test:$TEST_PASSWORD@localhost:27017/expense-tracker-test?authSource=expense-tracker-test
MONGODB_DB=expense-tracker-test

# Frontend
FRONTEND_URL=http://localhost:3000

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
CORS_METHODS=GET,HEAD,PUT,PATCH,POST,DELETE
CORS_CREDENTIALS=true
EOL

# Production environment
cat > apps/backend/.env.production << EOL
# Server Configuration
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Authentication
JWT_SECRET=$PROD_JWT_SECRET
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
ENCRYPTION_KEY=$(openssl rand -base64 32)
ENCRYPTION_IV=$(openssl rand -base64 16)

# Database Configuration
MONGODB_URI=mongodb://prod:$PROD_PASSWORD@localhost:27017/expense-tracker-prod?authSource=expense-tracker-prod
MONGODB_DB=expense-tracker-prod

# Frontend
FRONTEND_URL=https://your-production-domain.com

# CORS Configuration
CORS_ORIGIN=https://your-production-domain.com
CORS_METHODS=GET,HEAD,PUT,PATCH,POST,DELETE
CORS_CREDENTIALS=true
EOL

echo "Local environment setup complete!"
echo "Database credentials:"
echo "Development:"
echo "  Database: expense-tracker-dev"
echo "  Username: dev"
echo "  Password: $DEV_PASSWORD"
echo "Test:"
echo "  Database: expense-tracker-test"
echo "  Username: test"
echo "  Password: $TEST_PASSWORD"
echo "Production:"
echo "  Database: expense-tracker-prod"
echo "  Username: prod"
echo "  Password: $PROD_PASSWORD"
echo ""
echo "Please save these credentials securely!"
echo "You can now start the development server with: pnpm dev" 