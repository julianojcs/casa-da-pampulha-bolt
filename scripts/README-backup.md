# Backup local MongoDB -> Remote

This repository includes a small utility to copy your local MongoDB database (configured in `.env` as `MONGODB_URI`) to a remote MongoDB (configured in `.env` as `MONGODB_URI_REMOTO`). The process performs a streaming `mongodump` -> `mongorestore` and will `--drop` target collections.

Prerequisites

- `mongodump` and `mongorestore` from MongoDB Database Tools must be installed and available in your PATH, or
- Node.js installed (recommended) so the JS script can load `.env` via `dotenv`.

Files

- `scripts/backup-local-to-remote.js` — Node.js script that loads `.env` and streams `mongodump` to `mongorestore`.
- `scripts/backup-local-to-remote.sh` — Executable wrapper that calls the Node script or falls back to a shell pipeline.

Usage

1. From project root, ensure `.env` contains `MONGODB_URI` and `MONGODB_URI_REMOTO`.

2. Run the wrapper (preferred):

```bash
./scripts/backup-local-to-remote.sh
```

3. Or run the node script directly:

```bash
node scripts/backup-local-to-remote.js
```

Notes & Safety

- The script uses `--drop` when restoring to the remote: it will replace collections on the remote target. Ensure this is what you want before running.
- For large databases, consider using `mongodump` to a file and transferring it instead of piping.
- Keep credentials secure. The `.env` file may contain sensitive data.

Troubleshooting

- If you see "command not found" for `mongodump` or `mongorestore`, install MongoDB Database Tools: https://www.mongodb.com/docs/database-tools/installation/
- If using the node script it tries to load `.env` using `dotenv`. Install dependencies if you plan to run it via node: `npm install dotenv` (optional). The fallback shell wrapper also works without `dotenv` by sourcing `.env` approximately.
