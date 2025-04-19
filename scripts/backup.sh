#!/bin/bash

# Configuration
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Backup MongoDB
echo "Backing up MongoDB..."
docker exec mongodb mongodump --out=/backup
docker cp mongodb:/backup $BACKUP_DIR/mongodb_$DATE
docker exec mongodb rm -rf /backup

# Backup Docker volumes
echo "Backing up Docker volumes..."
for volume in mongodb_data prometheus_data grafana_data minio_data; do
  echo "Backing up volume $volume..."
  docker run --rm -v $volume:/volume -v $BACKUP_DIR:/backup alpine tar -czf /backup/${volume}_${DATE}.tar.gz -C /volume ./
done

# Clean up old backups
echo "Cleaning up old backups..."
find $BACKUP_DIR -type f -mtime +$RETENTION_DAYS -delete

# Verify backups
echo "Verifying backups..."
for volume in mongodb_data prometheus_data grafana_data minio_data; do
  if [ -f "$BACKUP_DIR/${volume}_${DATE}.tar.gz" ]; then
    echo "Backup for $volume verified"
  else
    echo "ERROR: Backup for $volume failed!"
    exit 1
  fi
done

echo "Backup completed successfully!" 