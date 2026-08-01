#!/usr/bin/env bash
set -euo pipefail

# Quick verification script after deployment.
# Usage: ./verify_frontend.sh TARGET_URL API_URL
# Example: ./verify_frontend.sh https://app.example.com https://api.example.com

if [ $# -lt 2 ]; then
  echo "Usage: $0 TARGET_URL API_URL" >&2
  exit 2
fi
TARGET_URL=$1
API_URL=$2

echo "Fetching frontend index from: ${TARGET_URL}"
HTTP_OK=$(curl -sS -o /tmp/frontend_index.html -w "%{http_code}" "${TARGET_URL}")
if [ "${HTTP_OK}" != "200" ]; then
  echo "ERROR: frontend returned HTTP ${HTTP_OK}" >&2
  exit 3
fi

# Check for legacy selectors
grep -q 'id="recipes"' /tmp/frontend_index.html && echo "Found #recipes" || echo "Missing #recipes"
grep -q 'id="search"' /tmp/frontend_index.html && echo "Found #search" || echo "Missing #search"

# Query backend legacy list endpoint
echo "Querying backend list: ${API_URL}/api/recipes/"
RESP=$(curl -sS "${API_URL}/api/recipes/")
if [ -z "${RESP}" ]; then
  echo "ERROR: empty response from API" >&2
  exit 4
fi

# Try to extract first name using python (works without jq)
FIRST_NAME=$(python3 - <<PY
import sys, json
try:
    data=json.loads(sys.stdin.read())
    if isinstance(data, list) and data:
        print(data[0].get('name',''))
except Exception as e:
    pass
PY <<<"${RESP}")

if [ -n "${FIRST_NAME}" ]; then
  echo "API first item name: ${FIRST_NAME}"
else
  echo "API returned list but could not parse first item name"
fi

echo "Verify visually by opening ${TARGET_URL} in a browser and comparing to the legacy site."
