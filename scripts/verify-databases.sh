#!/bin/bash

# Function to verify database connection and indexes
verify_database() {
    local db_name=$1
    local username=$2
    local password=$3
    
    echo "Verifying $db_name database..."
    
    # Test connection
    if mongosh "mongodb://$username:$password@localhost:27017/$db_name?authSource=$db_name" --eval "db.version()" &> /dev/null; then
        echo "✓ Connection successful"
    else
        echo "✗ Connection failed"
        return 1
    fi
    
    # Verify indexes
    echo "Checking indexes..."
    mongosh "mongodb://$username:$password@localhost:27017/$db_name?authSource=$db_name" --eval "
        // Verify existing indexes
        print('Users indexes:');
        db.users.getIndexes();
        print('\nTransactions indexes:');
        db.transactions.getIndexes();
        print('\nCategories indexes:');
        db.categories.getIndexes();
        
        // Create basic indexes
        print('\nCreating basic indexes...');
        db.transactions.createIndex({ 'amount': 1 });
        db.transactions.createIndex({ 'date': -1, 'amount': -1 });
        db.transactions.createIndex({ 'userId': 1, 'date': -1, 'amount': -1 });
        db.transactions.createIndex({ 'userId': 1, 'category': 1, 'date': -1 });
        db.transactions.createIndex({ 'userId': 1, 'description': 'text' });
        
        // Create compound indexes for better query performance
        print('\nCreating compound indexes...');
        db.transactions.createIndex({ 'userId': 1, 'date': -1, 'category': 1 });
        db.transactions.createIndex({ 'userId': 1, 'date': -1, 'type': 1 });
        
        // Create indexes for specific query patterns
        print('\nCreating indexes for specific query patterns...');
        // Monthly reports
        db.transactions.createIndex({ 'userId': 1, 'date': 1, 'type': 1 });
        // Category analysis
        db.transactions.createIndex({ 'userId': 1, 'category': 1, 'type': 1, 'date': -1 });
        // Amount range queries
        db.transactions.createIndex({ 'userId': 1, 'amount': 1, 'date': -1 });
        // Search by tags
        db.transactions.createIndex({ 'userId': 1, 'tags': 1, 'date': -1 });
        // Recurring transactions
        db.transactions.createIndex({ 'userId': 1, 'isRecurring': 1, 'nextOccurrence': 1 });
        // Budget tracking
        db.transactions.createIndex({ 'userId': 1, 'budgetId': 1, 'date': -1 });
        
        // Create TTL indexes for temporary data
        print('\nCreating TTL indexes...');
        db.sessions.createIndex({ 'createdAt': 1 }, { expireAfterSeconds: 86400 });
        db.tempFiles.createIndex({ 'createdAt': 1 }, { expireAfterSeconds: 3600 });
        db.notifications.createIndex({ 'createdAt': 1 }, { expireAfterSeconds: 2592000 }); // 30 days
        
        // Create partial indexes for better performance
        print('\nCreating partial indexes...');
        db.transactions.createIndex(
            { 'userId': 1, 'date': -1 },
            { partialFilterExpression: { 'amount': { \$gt: 1000 } } }
        );
        db.transactions.createIndex(
            { 'userId': 1, 'category': 1 },
            { partialFilterExpression: { 'type': 'expense' } }
        );
        
        print('\nAll indexes verified and created successfully');
    "
}

# Verify all databases
echo "Verifying database connections and indexes..."

# Development database
verify_database "expense-tracker-dev" "dev" "n36cGzjxsZ47zAYh"

# Test database
verify_database "expense-tracker-test" "test" "vjztqdwWFXtQC9E3"

# Production database
verify_database "expense-tracker-prod" "prod" "0s4Whjlj6ByFi+GZ"

echo "Database verification complete!" 