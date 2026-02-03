/**
 * Wrapper script to load .env and run the TypeScript import script
 */

require('dotenv').config();

const { spawn } = require('child_process');
const path = require('path');

// Run the TypeScript import script
const child = spawn('npx', ['tsx', 'scripts/import-gsa-lessors-to-db.ts'], {
  stdio: 'inherit',
  env: process.env,
  cwd: process.cwd(),
});

child.on('exit', (code) => {
  process.exit(code);
});
