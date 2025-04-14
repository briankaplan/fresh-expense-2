#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to log messages
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

# Function to log errors
error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

# Function to log warnings
warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    error "Please do not run as root"
    exit 1
fi

# Check prerequisites
log "Checking prerequisites..."
if ! command -v docker &> /dev/null; then
    error "Docker is not installed"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose is not installed"
    exit 1
fi

# Load environment variables
if [ -f .env ]; then
    log "Loading environment variables..."
    source .env
else
    warn "No .env file found, using default values"
fi

# Function to check if a container is running
check_container() {
    local container_name=$1
    if docker ps | grep -q "$container_name"; then
        return 0
    else
        return 1
    fi
}

# Function to stop and remove containers
cleanup() {
    log "Cleaning up existing containers..."
    docker-compose -f docker-compose.prod.yml down
}

# Function to build and start containers
deploy() {
    log "Building and starting containers..."
    docker-compose -f docker-compose.prod.yml up -d --build

    # Wait for containers to be healthy
    log "Waiting for containers to be healthy..."
    sleep 10

    # Check if containers are running
    if check_container "backend" && check_container "frontend"; then
        log "Deployment successful!"
    else
        error "Deployment failed - containers are not running"
        exit 1
    fi
}

# Function to verify deployment
verify() {
    log "Verifying deployment..."
    
    # Check backend health
    if curl -s http://localhost:3000/api/health | grep -q "ok"; then
        log "Backend is healthy"
    else
        error "Backend health check failed"
        exit 1
    fi

    # Check frontend
    if curl -s http://localhost:80 | grep -q "Expense Tracking"; then
        log "Frontend is accessible"
    else
        error "Frontend is not accessible"
        exit 1
    fi
}

# Main deployment process
log "Starting deployment process..."

# Cleanup existing containers
cleanup

# Deploy new containers
deploy

# Verify deployment
verify

log "Deployment completed successfully!" 