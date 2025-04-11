#!/bin/bash

# Function to check if MongoDB is running
check_mongodb() {
    mongosh --eval "db.runCommand({ ping: 1 })" &>/dev/null
    return $?
}

# Function to wait for a service to be ready
wait_for_service() {
    local service=$1
    local port=$2
    echo "Waiting for $service to be ready..."
    while ! nc -z localhost $port; do
        sleep 1
    done
    echo "$service is ready!"
}

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Store the root directory
ROOT_DIR=$(pwd)

echo -e "${YELLOW}Starting services...${NC}"

# 1. Start MongoDB if not running
echo -e "${YELLOW}Checking MongoDB status...${NC}"
if ! check_mongodb; then
    echo -e "${YELLOW}Starting MongoDB...${NC}"
    brew services start mongodb-community
    sleep 5 # Give MongoDB time to start
fi

if check_mongodb; then
    echo -e "${GREEN}MongoDB is running${NC}"
else
    echo "Failed to start MongoDB"
    exit 1
fi

# 2. Clean and install dependencies
echo -e "${YELLOW}Cleaning and installing dependencies...${NC}"
rm -rf node_modules dist
npm install

# 3. Build and start backend
echo -e "${YELLOW}Building and starting backend...${NC}"
cd apps/backend
npm install
npm run build
npm run start:dev &
BACKEND_PID=$!

# Wait for backend to be ready
wait_for_service "Backend" 3000

# 4. Build and start frontend
echo -e "${YELLOW}Building and starting frontend...${NC}"
cd ../frontend
npm install
npm run build
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to be ready
wait_for_service "Frontend" 5173

echo -e "${GREEN}All services are running!${NC}"
echo -e "${GREEN}Frontend: http://localhost:5173${NC}"
echo -e "${GREEN}Backend: http://localhost:3000${NC}"

# Handle cleanup on script termination
cleanup() {
    echo -e "${YELLOW}Shutting down services...${NC}"
    kill $FRONTEND_PID 2>/dev/null
    kill $BACKEND_PID 2>/dev/null
    brew services stop mongodb-community
    echo -e "${GREEN}All services stopped${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Keep the script running
wait 