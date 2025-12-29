#!/usr/bin/env bash
set -euo pipefail

# Wrapper: attempts to use node loader script; if node or mongodump/mongorestore not available, prints instructions.
SCRIPTDIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODE_SCRIPT="$SCRIPTDIR/backup-local-to-remote.js"

if command -v node >/dev/null 2>&1 && [ -f "$NODE_SCRIPT" ]; then
  node "$NODE_SCRIPT"
  exit $?
fi

# Fallback: try direct mongodump | mongorestore pipeline (requires mongotools installed)
if ! command -v mongodump >/dev/null 2>&1 || ! command -v mongorestore >/dev/null 2>&1; then
  echo "Error: mongodump and mongorestore must be installed."
  echo "Install MongoDB Database Tools: https://www.mongodb.com/docs/database-tools/installation/"
  echo "Or install Node and run: node $NODE_SCRIPT"
  exit 1
fi

# Load .env if present (simple loader — doesn't handle all edge cases)
if [ -f .env ]; then
  # shellcheck disable=SC2046
  export $(grep -v '^#' .env | sed -E 's/\r$//' | xargs)
fi

if [ -z "${MONGODB_URI:-}" ] || [ -z "${MONGODB_URI_REMOTO:-}" ]; then
  echo "MONGODB_URI and MONGODB_URI_REMOTO must be set in environment or .env"
  exit 1
fi

echo "Streaming mongodump from local to remote (this will drop target collections)..."

mongodump --uri "$MONGODB_URI" --archive --gzip | mongorestore --uri "$MONGODB_URI_REMOTO" --archive --gzip --drop

echo "Backup finished."
