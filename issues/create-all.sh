#!/usr/bin/env bash
set -e

# Create all invoice-generator issues in order (blockers first)
# Run this from the repo root: bash issues/create-all.sh

REPO="ajitgoel/invoice-generator"
ISSUES_DIR="issues"

echo "Creating issues for $REPO..."
echo ""

create_issue() {
  local file="$1"
  local title=$(head -3 "$file" | grep "^title:" | sed 's/title: "\(.*\)"/\1/')
  local labels=$(head -5 "$file" | grep "^labels:" | sed 's/labels: \[\(.*\)\]/\1/')

  # Extract body: everything after the frontmatter (after the second ---)
  local body=$(awk 'BEGIN{count=0} /^---$/{count++; next} count>=2' "$file")

  echo "Creating: $title"

  gh issue create \
    --repo "$REPO" \
    --title "$title" \
    --label "$labels" \
    --body "$body"

  echo ""
}

# Create in dependency order
create_issue "$ISSUES_DIR/done/01-invoice-form-and-state.md"
create_issue "$ISSUES_DIR/done/02-invoice-preview-panel.md"
create_issue "$ISSUES_DIR/done/03-pdf-download.md"
create_issue "$ISSUES_DIR/done/04-localstorage-persistence.md"
create_issue "$ISSUES_DIR/done/05-company-logo-upload.md"
create_issue "$ISSUES_DIR/done/06-polish-css-styling.md"
create_issue "$ISSUES_DIR/done/07-calculation-tests.md"
create_issue "$ISSUES_DIR/08-tab-navigation-and-profiles.md"
create_issue "$ISSUES_DIR/09-products-catalog.md"
create_issue "$ISSUES_DIR/10-autocomplete-and-population.md"

echo "All issues created!"
