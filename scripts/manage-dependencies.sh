#!/bin/bash

# Function to check for outdated dependencies
check_outdated() {
  echo "Checking for outdated dependencies..."
  pnpm outdated
}

# Function to check for duplicate dependencies
check_duplicates() {
  echo "Checking for duplicate dependencies..."
  pnpm dedupe
}

# Function to check for unused dependencies
check_unused() {
  echo "Checking for unused dependencies..."
  pnpm dlx depcheck
}

# Function to check for security vulnerabilities
check_security() {
  echo "Checking for security vulnerabilities..."
  pnpm audit
}

# Function to update dependencies
update_dependencies() {
  echo "Updating dependencies..."
  pnpm update
}

# Function to clean and reinstall dependencies
clean_install() {
  echo "Cleaning and reinstalling dependencies..."
  rm -rf node_modules
  rm -rf pnpm-lock.yaml
  pnpm install
}

# Function to check workspace dependencies
check_workspace() {
  echo "Checking workspace dependencies..."
  pnpm workspaces list
}

# Main execution
echo "Starting dependency management..."

case "$1" in
  "check")
    check_outdated
    check_duplicates
    check_unused
    check_security
    ;;
  "update")
    update_dependencies
    ;;
  "clean")
    clean_install
    ;;
  "workspace")
    check_workspace
    ;;
  *)
    echo "Usage: $0 {check|update|clean|workspace}"
    exit 1
    ;;
esac

echo "Dependency management complete." 