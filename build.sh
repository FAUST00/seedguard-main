#!/bin/bash

# SeedGuard Build Script
echo "🌱 Building SeedGuard v2.0.0..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the Next.js app
echo "Building Next.js application..."
npm run build

# Export to static files
echo "Exporting to static files..."
npm run export

echo "✅ Build complete! Files are ready for deployment."
echo "📦 Check the 'out' directory for the built files."
