#!/usr/bin/env node
import dotenv from 'dotenv';
import path from 'path';

// Load .env if present (local dev)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const required = [
  'SENTRY_DSN',
  'JWT_SECRET',
  'FRONTEND_URL',
  'MONGODB_URI',
];

const optional = ['PORT', 'NODE_ENV'];

const args = process.argv.slice(2);
const strict = args.includes('--strict');

const missing = required.filter((k) => !process.env[k] || String(process.env[k]).trim() === '');

if (missing.length > 0) {
  console.error('Missing required environment variables:');
  missing.forEach((k) => console.error(` - ${k}`));

  console.error('\nTip: create a .env file based on .env.example or provide these vars via your orchestration (Docker, Kubernetes, cloud secrets).');

  if (strict || process.env.NODE_ENV === 'production') {
    console.error('\nExiting with code 1 because required env vars are missing (strict/prod).');
    process.exit(1);
  } else {
    process.exitCode = 0;
  }
} else {
  console.log('Environment validation: OK');
}
