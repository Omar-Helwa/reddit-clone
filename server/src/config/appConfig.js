import path from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const rootDir = path.resolve(__dirname, '..', '..');

// Builds a handy snapshot of runtime configuration for the app.
export function buildAppConfig() {
  const schemaDirectory = process.env.SCHEMA_DIRECTORY
    ? path.resolve(rootDir, process.env.SCHEMA_DIRECTORY)
    : path.join(rootDir, 'schemas');

  return {
    rootDir,
    schemaDirectory,
    http: {
      port: Number(process.env.PORT) || 3000,
    },
    mongo: {
      uri: process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017',
      options: {
        maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE) || 10,
      },
    },
    logging: {
      level: process.env.LOG_LEVEL ?? 'info',
    },
  };
}
