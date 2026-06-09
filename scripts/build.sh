#!/bin/bash
# InvoiceCraft — Production Build Script
# Copies only public-facing files to dist/ for Cloudflare Pages deployment.

set -euo pipefail

echo "Building InvoiceCraft for production..."

# Clean previous build
rm -rf dist
mkdir -p dist/docs

# Core application files
echo "  → Copying core application files..."
cp index.html app.js styles.css dist/
cp favicon.svg logo.svg dist/
cp test-products.csv dist/

# Cloudflare Pages config files
echo "  → Copying Cloudflare config files..."
cp _headers _redirects CNAME dist/

# Documentation
echo "  → Copying documentation..."
cp -R docs/* dist/docs/

# Verify critical files exist
for file in index.html app.js styles.css _headers CNAME; do
  if [ ! -f "dist/$file" ]; then
    echo "ERROR: dist/$file is missing!" >&2
    exit 1
  fi
done

echo "  ✓ Build complete — dist/ is ready for deployment"
