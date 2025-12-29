'use strict';

// Backup local MongoDB to remote using mongodump -> mongorestore streaming
// Loads environment variables from .env (if present)

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Try to load .env if present
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('dotenv').config({ path: envPath });
  } catch (err) {
    // dotenv might not be installed — continue, user can set env vars externally
  }
}

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_URI_REMOTO = process.env.MONGODB_URI_REMOTO || process.env.MONGODB_URI_REMOTE;

function exitWithError(msg) {
  console.error(msg);
  process.exit(1);
}

if (!MONGODB_URI) exitWithError('MONGODB_URI is not defined. Set it in .env or environment.');
if (!MONGODB_URI_REMOTO) exitWithError('MONGODB_URI_REMOTO is not defined. Set it in .env or environment.');

console.log('Starting backup from local -> remote');
console.log('Local:', MONGODB_URI);
console.log('Remote:', MONGODB_URI_REMOTO.replace(/:(?:[^:@\n]+)@/, ':****@')); // hide password

// Spawn mongodump
const dump = spawn('mongodump', ['--uri', MONGODB_URI, '--archive', '--gzip'], { stdio: ['ignore', 'pipe', 'pipe'] });

dump.stderr.on('data', (d) => {
  process.stderr.write(`[mongodump] ${d}`);
});

// Spawn mongorestore reading from stdin
const restore = spawn('mongorestore', ['--uri', MONGODB_URI_REMOTO, '--archive', '--gzip', '--drop'], { stdio: ['pipe', 'inherit', 'pipe'] });

restore.stderr.on('data', (d) => {
  process.stderr.write(`[mongorestore] ${d}`);
});

// Pipe dump -> restore
dump.stdout.pipe(restore.stdin);

restore.on('close', (code) => {
  if (code === 0) {
    console.log('Backup completed successfully.');
    process.exit(0);
  } else {
    console.error('mongorestore exited with code', code);
    process.exit(code || 1);
  }
});

dump.on('error', (err) => {
  console.error('Failed to start mongodump:', err.message);
  process.exit(1);
});

restore.on('error', (err) => {
  console.error('Failed to start mongorestore:', err.message);
  process.exit(1);
});
