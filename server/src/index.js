import process from 'node:process';
import { EntryPoint } from './app/EntryPoint.js';

const entryPoint = new EntryPoint();

// Kicks off the app startup sequence and logs any hiccups.
async function main() {
  try {
    await entryPoint.start();
  } catch (error) {
    process.stderr.write(`Failed to start application: ${error.message}\n`);
    process.exitCode = 1;
  }
}

// Handles shutdown signals so the server can close cleanly.
async function shutdown() {
  try {
    await entryPoint.stop();
    process.exit(0);
  } catch (error) {
    process.stderr.write(`Failed to shutdown gracefully: ${error.message}\n`);
    process.exit(1);
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

main();
