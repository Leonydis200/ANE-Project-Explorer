#!/bin/bash

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check and install dependencies
install_dependencies() {
  echo -e "${YELLOW}Checking and installing dependencies...${NC}"
  
  # Check for Node.js
  if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js v16+ first.${NC}"
    exit 1
  fi

  # Check for npm/yarn
  if [ -f "yarn.lock" ]; then
    if ! command -v yarn &> /dev/null; then
      echo -e "${RED}Yarn is not installed. Please install Yarn first.${NC}"
      exit 1
    fi
    PACKAGE_MANAGER="yarn"
  else
    PACKAGE_MANAGER="npm"
  fi

  # Install project dependencies
  $PACKAGE_MANAGER install

  # Install required dev dependencies
  $PACKAGE_MANAGER install --save-dev \
    @types/node \
    @types/react \
    @types/react-dom \
    @types/jest \
    @typescript-eslint/eslint-plugin \
    @typescript-eslint/parser \
    eslint \
    eslint-config-prettier \
    eslint-plugin-react \
    eslint-plugin-react-hooks \
    prettier \
    typescript

  echo -e "${GREEN}Dependencies installed successfully!${NC}"
}

# Function to fix TypeScript errors
fix_typescript_errors() {
  echo -e "${YELLOW}Fixing TypeScript errors...${NC}"

  # Create vite-env.d.ts if missing
  if [ ! -f "src/vite-env.d.ts" ]; then
    cat > src/vite-env.d.ts << 'EOL'
/// <reference types="vite/client" />

interface ImportMeta {
  readonly env: {
    readonly VITE_APP_NAME?: string
    readonly DEV: boolean
    readonly PROD: boolean
    [key: string]: string | boolean | undefined
  }
}
EOL
  fi

  # Fix App.tsx imports
  if [ -f "src/App.tsx" ]; then
    sed -i "s/type QueryCache/import { QueryCache } from '@tanstack\/react-query'/" src/App.tsx
    sed -i "s/type MutationCache/import { MutationCache } from '@tanstack\/react-query'/" src/App.tsx
    sed -i "s/cacheTime: 10 \* 60 \* 1000,/gcTime: 10 \* 60 \* 1000,/" src/App.tsx
  fi

  # Add React imports to components
  for file in src/components/*.tsx; do
    if ! grep -q "import React" "$file"; then
      sed -i "1s/^/import React from 'react';\n/" "$file"
    fi
  done

  echo -e "${GREEN}TypeScript errors fixed!${NC}"
}

# Function to fix Husky
fix_husky() {
  echo -e "${YELLOW}Fixing Husky configuration...${NC}"

  # Update Husky if needed
  if [ -d ".husky" ]; then
    npx husky install
    if [ ! -f ".husky/pre-commit" ]; then
      npx husky add .husky/pre-commit "npm run lint-staged"
    fi
  fi

  # Update package.json scripts if needed
  if [ -f "package.json" ]; then
    if ! grep -q "\"prepare\": \"husky install\"" package.json; then
      sed -i '/"scripts": {/a \    "prepare": "husky install",' package.json
    fi
  fi

  echo -e "${GREEN}Husky configuration updated!${NC}"
}

# Function to fix ESLint configuration
fix_eslint() {
  echo -e "${YELLOW}Fixing ESLint configuration...${NC}"

  # Create basic ESLint config if missing
  if [ ! -f ".eslintrc.json" ]; then
    cat > .eslintrc.json << 'EOL'
{
  "root": true,
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "plugins": [
    "@typescript-eslint",
    "react",
    "react-hooks"
  ],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/no-explicit-any": "warn"
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
}
EOL
  fi

  echo -e "${GREEN}ESLint configuration updated!${NC}"
}

# Function to fix missing types
fix_missing_types() {
  echo -e "${YELLOW}Fixing missing type definitions...${NC}"

  # Create basic types.ts if missing
  if [ ! -f "src/types.ts" ]; then
    cat > src/types.ts << 'EOL'
export interface PerformanceMetrics {
  timestamps: number[];
  cpu: number[];
  memory: number[];
  issues: string[];
}

export interface AdvancedMetrics {
  disk: number[];
  issues: string[];
  [key: string]: any;
}

export interface OptimizationStatus {
  status: 'idle' | 'optimizing' | 'optimized' | 'error';
  lastOptimized: Date;
  improvements: string[];
}

export interface HealthIndicator {
  id: string;
  name: string;
  status: 'ok' | 'warning' | 'critical';
  value: number;
  unit: string;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  indicators: HealthIndicator[];
  timestamp: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
}
EOL
  fi

  echo -e "${GREEN}Type definitions updated!${NC}"
}

# Function to run checks and fixes
run_checks() {
  echo -e "${YELLOW}Running project checks...${NC}"

  # Check TypeScript
  echo -e "${YELLOW}Running TypeScript check...${NC}"
  npx tsc --noEmit

  # Check ESLint
  echo -e "${YELLOW}Running ESLint...${NC}"
  npx eslint . --ext .ts,.tsx

  # Check Husky
  if [ -d ".husky" ]; then
    echo -e "${YELLOW}Checking Husky hooks...${NC}"
    ls -la .husky/
  fi

  echo -e "${GREEN}All checks completed!${NC}"
}

# Main execution
main() {
  install_dependencies
  fix_typescript_errors
  fix_husky
  fix_eslint
  fix_missing_types
  run_checks

  echo -e "${GREEN}Project repair completed successfully!${NC}"
  echo -e "${YELLOW}Please review the changes and run 'npm run build' to verify everything works.${NC}"
}

# Execute main function
main