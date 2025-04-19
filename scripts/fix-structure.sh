#!/bin/bash

# Create required directories if they don't exist
mkdir -p packages/types/src
mkdir -p packages/utils/src
mkdir -p packages/hooks/src
mkdir -p packages/ui/src

# Ensure package.json files exist
for pkg in types utils hooks ui; do
  if [ ! -f "packages/$pkg/package.json" ]; then
    echo "Creating package.json for $pkg"
    echo '{
      "name": "@fresh-expense/'$pkg'",
      "version": "0.0.1",
      "main": "dist/index.js",
      "types": "dist/index.d.ts",
      "scripts": {
        "build": "tsc",
        "clean": "rm -rf dist"
      }
    }' > "packages/$pkg/package.json"
  fi
done

# Ensure tsconfig.json files exist
for pkg in types utils hooks ui; do
  if [ ! -f "packages/$pkg/tsconfig.json" ]; then
    echo "Creating tsconfig.json for $pkg"
    echo '{
      "extends": "../../tsconfig.json",
      "compilerOptions": {
        "outDir": "./dist",
        "rootDir": "./src",
        "composite": true
      },
      "include": ["src/**/*"]
    }' > "packages/$pkg/tsconfig.json"
  fi
done

# Ensure index.ts files exist
for pkg in types utils hooks ui; do
  if [ ! -f "packages/$pkg/src/index.ts" ]; then
    echo "Creating index.ts for $pkg"
    mkdir -p "packages/$pkg/src"
    echo '// Export all public APIs here' > "packages/$pkg/src/index.ts"
  fi
done

echo "Structure fixed. Now install dependencies and build." 