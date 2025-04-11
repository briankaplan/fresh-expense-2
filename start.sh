#!/bin/bash

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for required commands
if ! command_exists docker; then
    echo "Error: docker is not installed"
    exit 1
fi

if ! command_exists docker-compose; then
    echo "Error: docker-compose is not installed"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "Please update the .env file with your configuration values"
    exit 1
fi

# Stop any existing containers
echo "Stopping any existing containers..."
docker-compose down

# Remove existing volumes if --clean flag is passed
if [ "$1" == "--clean" ]; then
    echo "Cleaning up volumes..."
    docker-compose down -v
    docker volume prune -f
fi

# Build and start the containers
echo "Building and starting containers..."
docker-compose build --no-cache
docker-compose up -d

# Wait for services to be ready
echo "Waiting for services to be ready..."
attempt=1
max_attempts=30
until docker-compose ps | grep "backend.*running" > /dev/null 2>&1; do
    if [ $attempt -eq $max_attempts ]; then
        echo "Error: Backend service failed to start"
        docker-compose logs backend
        exit 1
    fi
    echo "Waiting for backend service... (attempt $attempt/$max_attempts)"
    sleep 2
    ((attempt++))
done

echo "Services are ready!"
echo "Frontend: http://localhost:4200"
echo "Backend: http://localhost:3000"
echo "MongoDB: mongodb://localhost:27017"

# Show logs
echo "Showing logs (Ctrl+C to exit)..."
docker-compose logs -f 