import process from 'node:process';

const levels = ['error', 'warn', 'info', 'debug'];

// Produces a minimal console logger with level-aware filtering.
export function createLogger(level = 'info') {
  const threshold = levels.indexOf(level);

  // Central logging helper that respects the configured level.
  const log = (msgLevel, message, context = {}) => {
    if (levels.indexOf(msgLevel) <= threshold) {
      const payload = JSON.stringify(context);
      process.stdout.write(`[${msgLevel.toUpperCase()}] ${message}${payload !== '{}' ? ` ${payload}` : ''}\n`);
    }
  };

  return {
    error: (message, context) => log('error', message, context),
    warn: (message, context) => log('warn', message, context),
    info: (message, context) => log('info', message, context),
    debug: (message, context) => log('debug', message, context),
  };
}
