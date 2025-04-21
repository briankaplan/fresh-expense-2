#!/bin/bash

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🧼 Starting monorepo cleanup...${NC}"

# Function to safely remove files with confirmation
safe_remove() {
    local pattern="$1"
    local description="$2"
    local count=$(find . -type f -name "$pattern" | wc -l)
    
    if [ "$count" -gt 0 ]; then
        echo -e "${YELLOW}Found $count $description files:${NC}"
        find . -type f -name "$pattern" -print
        read -p "Remove these files? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            find . -type f -name "$pattern" -delete
            echo -e "${GREEN}✓ Removed $count $description files${NC}"
        else
            echo -e "${YELLOW}⚠️ Skipped removal of $description files${NC}"
        fi
    fi
}

# Remove unnecessary ESLint config files
safe_remove ".eslintrc.json" "ESLint config"
safe_remove "eslint.config.mjs" "ESLint config"

# Remove .DS_Store files
safe_remove ".DS_Store" "macOS .DS_Store"

# Remove orphaned .map files
echo -e "${YELLOW}Checking for orphaned .map files...${NC}"
find . -type f \( -name "*.js.map" -o -name "*.d.ts.map" \) | while read -r file; do
    base_file="${file%.map}"
    if [ ! -f "$base_file" ]; then
        echo "Found orphaned map file: $file"
        rm "$file"
    fi
done

# Remove temp and backup files
safe_remove "*.backup" "backup"
safe_remove "*.temp" "temp"
safe_remove ".env.temp" "temporary environment"

# Check for redundant nested directories
echo -e "${YELLOW}Checking for redundant nested directories...${NC}"
if [ -d "apps/apps" ]; then
    echo -e "${RED}⚠️ Found redundant directory: apps/apps${NC}"
    echo "Please review and merge contents if needed"
fi

if [ -d "packages/packages" ]; then
    echo -e "${RED}⚠️ Found redundant directory: packages/packages${NC}"
    echo "Please review and merge contents if needed"
fi

# Convert ESLint configs to .cjs format
echo -e "${YELLOW}Converting ESLint configs to .cjs format...${NC}"
find . -name "eslint.config.js" | while read -r file; do
    new_file="${file%.js}.cjs"
    echo "Converting $file to $new_file"
    mv "$file" "$new_file"
done

# Update package.json to use CommonJS
if [ -f "package.json" ]; then
    echo -e "${YELLOW}Setting package.json to CommonJS module system...${NC}"
    jq '.type = "commonjs"' package.json > package.tmp.json && mv package.tmp.json package.json
fi

# Show remaining tsconfig files
echo -e "${GREEN}📁 Remaining tsconfig files:${NC}"
find . -name "tsconfig*.json" -not -path "*/node_modules/*" | sort

# Show active ESLint config files
echo -e "${GREEN}📁 Active ESLint config files:${NC}"
find . -type f \( -name ".eslintrc.cjs" -o -name "eslint.config.cjs" \) | sort

echo -e "${GREEN}✅ Cleanup complete.${NC}"
echo ""
echo "To complete the cleanup, run:"
echo -e "${YELLOW}  pnpm store prune && rm -rf node_modules && pnpm install${NC}"
echo "" 