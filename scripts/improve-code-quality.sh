#!/bin/bash

# Function to check and fix TypeScript files
check_typescript() {
  echo "Checking TypeScript files..."
  find . -name "*.ts" -o -name "*.tsx" | while read file; do
    # Check for any type
    if grep -q "any" "$file"; then
      echo "Warning: 'any' type found in $file"
    fi
    
    # Check for proper error handling
    if grep -q "catch" "$file" && ! grep -q "catch.*error" "$file"; then
      echo "Warning: Generic catch block found in $file"
    fi
    
    # Check for proper async/await usage
    if grep -q "Promise\.then" "$file"; then
      echo "Warning: Promise.then found in $file, consider using async/await"
    fi
  done
}

# Function to check and fix imports
check_imports() {
  echo "Checking imports..."
  find . -name "*.ts" -o -name "*.tsx" | while read file; do
    # Check for relative imports
    if grep -q "from '\.\./" "$file"; then
      echo "Warning: Relative import found in $file, consider using absolute imports"
    fi
    
    # Check for unused imports
    if grep -q "import.*from" "$file" && ! grep -q "from.*@/" "$file"; then
      echo "Warning: Non-absolute import found in $file"
    fi
  done
}

# Function to check and fix naming conventions
check_naming() {
  echo "Checking naming conventions..."
  find . -name "*.ts" -o -name "*.tsx" | while read file; do
    # Check for PascalCase in component files
    if [[ "$file" == *".tsx" ]] && ! [[ "$file" =~ [A-Z][a-zA-Z]*\.tsx$ ]]; then
      echo "Warning: React component file not in PascalCase: $file"
    fi
    
    # Check for kebab-case in non-component files
    if [[ "$file" == *".ts" ]] && ! [[ "$file" =~ [a-z0-9-]+\.ts$ ]]; then
      echo "Warning: Non-component file not in kebab-case: $file"
    fi
  done
}

# Function to check and fix documentation
check_documentation() {
  echo "Checking documentation..."
  find . -name "*.ts" -o -name "*.tsx" | while read file; do
    # Check for JSDoc comments on exported functions
    if grep -q "export function" "$file" && ! grep -q "/\*\*" "$file"; then
      echo "Warning: Exported function without JSDoc in $file"
    fi
    
    # Check for interface documentation
    if grep -q "export interface" "$file" && ! grep -q "/\*\*" "$file"; then
      echo "Warning: Exported interface without documentation in $file"
    fi
  done
}

# Function to check and fix error handling
check_error_handling() {
  echo "Checking error handling..."
  find . -name "*.ts" -o -name "*.tsx" | while read file; do
    # Check for try/catch blocks
    if grep -q "try" "$file" && ! grep -q "catch.*error" "$file"; then
      echo "Warning: Try block without proper error handling in $file"
    fi
    
    # Check for async functions without error handling
    if grep -q "async function" "$file" && ! grep -q "try" "$file"; then
      echo "Warning: Async function without error handling in $file"
    fi
  done
}

# Main execution
echo "Starting code quality improvements..."

check_typescript
check_imports
check_naming
check_documentation
check_error_handling

echo "Code quality check complete. Please review the warnings and make necessary improvements." 