#!/usr/bin/env node
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);

const vitestBin = path.resolve(__dirname, '../node_modules/.bin/vitest');
const vitestArgs = ['run', ...args];

const child = spawn(vitestBin, vitestArgs, {
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
