#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Stopping all services...${NC}"

# Stop MongoDB
echo -e "${YELLOW}Stopping MongoDB...${NC}"
brew services stop mongodb-community

# Kill any running Node.js processes for our app
echo -e "${YELLOW}Stopping Node.js processes...${NC}"
pkill -f "node.*backend"
pkill -f "node.*frontend"

echo -e "${GREEN}All services stopped!${NC}" 