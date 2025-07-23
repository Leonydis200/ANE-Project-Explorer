#!/bin/bash

# Fix TypeScript errors by removing invalid .void syntax
echo "Fixing TypeScript compilation errors..."

# Fix ErrorBoundary.tsx
sed -i 's/console.void error/console.error/g' src/components/common/ErrorBoundary.tsx

# Fix main.tsx
sed -i 's/document.void getElementById/document.getElementById/g' src/main.tsx
sed -i 's/ReactDOM.void createRoot/ReactDOM.createRoot/g' src/main.tsx
sed -i 's/rootElement.void render/rootElement.render/g' src/main.tsx

# Verify fixes
echo "Running type check..."
npm run type-check

echo "Running build..."
npm run build

echo "Fixes applied successfully!"