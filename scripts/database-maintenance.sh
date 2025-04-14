#!/bin/bash

# Configuration
BACKUP_DIR="./backups"
LOG_DIR="./logs"
RETENTION_DAYS=7
MONITORING_INTERVAL=300  # 5 minutes

# Function to create backup
create_backup() {
    local db_name=$1
    local username=$2
    local password=$3
    local timestamp=$(date +%Y%m%d_%H%M%S)
    
    echo "Creating backup for $db_name..."
    mongodump --uri="mongodb://$username:$password@localhost:27017/$db_name?authSource=$db_name" \
        --out="$BACKUP_DIR/$db_name/$timestamp"
    
    # Compress backup
    tar -czf "$BACKUP_DIR/$db_name/$timestamp.tar.gz" -C "$BACKUP_DIR/$db_name" "$timestamp"
    rm -rf "$BACKUP_DIR/$db_name/$timestamp"
    
    echo "Backup created: $BACKUP_DIR/$db_name/$timestamp.tar.gz"
}

# Function to monitor database
monitor_database() {
    local db_name=$1
    local username=$2
    local password=$3
    
    while true; do
        local timestamp=$(date +%Y%m%d_%H%M%S)
        mongosh "mongodb://$username:$password@localhost:27017/$db_name?authSource=$db_name" --eval "
            // Get server status
            const serverStatus = db.serverStatus();
            
            // Get database stats
            const dbStats = db.stats();
            
            // Get collection stats
            const collections = db.getCollectionNames();
            const collectionStats = {};
            collections.forEach(col => {
                collectionStats[col] = db[col].stats();
            });
            
            // Get index usage stats
            const indexStats = {};
            collections.forEach(col => {
                indexStats[col] = db[col].aggregate([
                    { \$indexStats: {} }
                ]).toArray();
            });
            
            // Log to file
            print(JSON.stringify({
                timestamp: new Date(),
                serverStatus,
                dbStats,
                collectionStats,
                indexStats
            }, null, 2));
        " >> "$LOG_DIR/$db_name/monitoring_$timestamp.json"
        
        sleep $MONITORING_INTERVAL
    done
}

# Function to optimize indexes
optimize_indexes() {
    local db_name=$1
    local username=$2
    local password=$3
    
    echo "Optimizing indexes for $db_name..."
    mongosh "mongodb://$username:$password@localhost:27017/$db_name?authSource=$db_name" --eval "
        // Get all collections
        const collections = db.getCollectionNames();
        
        // Analyze each collection
        collections.forEach(col => {
            print('Analyzing collection: ' + col);
            
            // Get current indexes
            const indexes = db[col].getIndexes();
            
            // Analyze index usage
            const indexStats = db[col].aggregate([
                { \$indexStats: {} }
            ]).toArray();
            
            // Identify unused indexes
            const unusedIndexes = indexStats.filter(stat => stat.accesses.ops === 0);
            if (unusedIndexes.length > 0) {
                print('Unused indexes found:');
                unusedIndexes.forEach(index => {
                    print('- ' + index.name);
                });
            }
            
            // Check for duplicate indexes
            const duplicateIndexes = [];
            for (let i = 0; i < indexes.length; i++) {
                for (let j = i + 1; j < indexes.length; j++) {
                    if (JSON.stringify(indexes[i].key) === JSON.stringify(indexes[j].key)) {
                        duplicateIndexes.push(indexes[j].name);
                    }
                }
            }
            if (duplicateIndexes.length > 0) {
                print('Duplicate indexes found:');
                duplicateIndexes.forEach(index => {
                    print('- ' + index);
                });
            }
        });
    "
}

# Function to clean up old backups
cleanup_backups() {
    local db_name=$1
    echo "Cleaning up old backups for $db_name..."
    find "$BACKUP_DIR/$db_name" -type f -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
}

# Create necessary directories
mkdir -p "$BACKUP_DIR/expense-tracker-dev"
mkdir -p "$BACKUP_DIR/expense-tracker-test"
mkdir -p "$BACKUP_DIR/expense-tracker-prod"
mkdir -p "$LOG_DIR/expense-tracker-dev"
mkdir -p "$LOG_DIR/expense-tracker-test"
mkdir -p "$LOG_DIR/expense-tracker-prod"

# Main menu
echo "Database Maintenance Script"
echo "1. Create backups"
echo "2. Start monitoring"
echo "3. Optimize indexes"
echo "4. Cleanup old backups"
echo "5. Exit"

read -p "Select an option: " option

case $option in
    1)
        create_backup "expense-tracker-dev" "dev" "n36cGzjxsZ47zAYh"
        create_backup "expense-tracker-test" "test" "vjztqdwWFXtQC9E3"
        create_backup "expense-tracker-prod" "prod" "0s4Whjlj6ByFi+GZ"
        ;;
    2)
        # Start monitoring in background
        monitor_database "expense-tracker-dev" "dev" "n36cGzjxsZ47zAYh" &
        monitor_database "expense-tracker-test" "test" "vjztqdwWFXtQC9E3" &
        monitor_database "expense-tracker-prod" "prod" "0s4Whjlj6ByFi+GZ" &
        echo "Monitoring started. Check $LOG_DIR for logs."
        ;;
    3)
        optimize_indexes "expense-tracker-dev" "dev" "n36cGzjxsZ47zAYh"
        optimize_indexes "expense-tracker-test" "test" "vjztqdwWFXtQC9E3"
        optimize_indexes "expense-tracker-prod" "prod" "0s4Whjlj6ByFi+GZ"
        ;;
    4)
        cleanup_backups "expense-tracker-dev"
        cleanup_backups "expense-tracker-test"
        cleanup_backups "expense-tracker-prod"
        ;;
    5)
        exit 0
        ;;
    *)
        echo "Invalid option"
        exit 1
        ;;
esac 