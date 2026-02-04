/**
 * Worker Process - Starts background job workers
 * Run this in a separate process from the Next.js server
 * Usage: npx tsx worker.ts
 */

// IMPORTANT: Load environment variables FIRST, before any other imports
import 'dotenv/config';

import './lib/workers/search-worker';
import { log } from './lib/logger';

log.info('Worker process started');
log.info('Listening for search jobs...');

// Keep process alive
process.on('SIGTERM', () => {
  log.info('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  log.info('SIGINT received, shutting down gracefully...');
  process.exit(0);
});
