/**
 * Wrapper script to load .env and run the verification script
 */

require('dotenv').config();

const { spawn } = require('child_process');

const child = spawn('npx', ['tsx', 'scripts/verify-saved-leads.ts'], {
  stdio: 'inherit',
  env: process.env,
  cwd: process.cwd(),
});

child.on('exit', (code) => {
  process.exit(code);
});
