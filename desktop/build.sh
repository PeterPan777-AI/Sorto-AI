#!/bin/bash
# Build script for Document Organizer Desktop Application

set -e

echo "=== Building Document Organizer Desktop Application ==="
echo ""

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "Project root: $PROJECT_ROOT"
echo ""

# Install dependencies if needed
echo "Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    pnpm install
fi

# Build the frontend
echo ""
echo "Building frontend..."
cd "$PROJECT_ROOT"
pnpm run build

# Compile TypeScript server code
echo ""
echo "Compiling server code..."
pnpm exec tsc --project tsconfig.json --outDir dist/server

# Copy necessary files
echo ""
echo "Copying files..."
mkdir -p dist/desktop
cp desktop/launcher.py dist/desktop/
cp desktop/README.md dist/desktop/ 2>/dev/null || true

# Copy server files
mkdir -p dist/server
cp -r server/_core dist/server/ 2>/dev/null || true

# Copy Python document processor
cp server/document_processor.py dist/server/

# Copy package files
cp package.json dist/
cp -r drizzle dist/

echo ""
echo "=== Build Complete ==="
echo ""
echo "Build output is in: $PROJECT_ROOT/dist"
echo ""
echo "Next steps:"
echo "1. Test the build: cd dist && node server/_core/index.js"
echo "2. Create installer: Run desktop/create_installer.sh"
echo ""
