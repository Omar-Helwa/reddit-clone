import http from 'node:http';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createLogger } from '../utils/logger.js';
import { EndpointLoader } from './endpoints/EndpointLoader.js';

export class RestApiServer {
  // Wires up Express, logging, and endpoint discovery pieces.
  constructor({ port, schemaRegistry, mongoConnection, logger, endpoints, endpointDirectories } = {}) {
    this.port = port;
    this.schemaRegistry = schemaRegistry;
    this.mongoConnection = mongoConnection;
    this.logger = logger ?? createLogger('info');
    this.app = express();
    this.server = null;
    this.explicitEndpoints = Array.isArray(endpoints) ? endpoints : null;
    this.endpointDirectories = this._resolveEndpointDirectories(endpointDirectories);
    this.endpointLoader = this.explicitEndpoints ? null : new EndpointLoader({ directories: this.endpointDirectories });
    this.loadedEndpoints = null;
    this.routesRegistered = false;
    this.errorHandlingConfigured = false;

    this._configureMiddleware();
  }

  // Spins up HTTP server once routes are registered.
  async start() {
    if (this.server) {
      return;
    }

    await this._ensureRoutesRegistered();

    await new Promise((resolve) => {
      this.server = http.createServer(this.app);
      this.server.listen(this.port, resolve);
    });

    this.logger.info(`REST API listening on port ${this.port}`);
  }

  // Shuts down the HTTP server if it was running.
  async stop() {
    if (!this.server) {
      return;
    }

    await new Promise((resolve, reject) => {
      this.server.close((err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });

    this.server = null;
    this.logger.info('REST API stopped');
  }

  // Applies global middleware required for every request.
  _configureMiddleware() {
    this.app.use(express.json());
  }

  // Lazily loads endpoints and ensures they are registered once.
  async _ensureRoutesRegistered() {
    if (this.routesRegistered) {
      return;
    }

    const endpoints = await this._loadEndpoints();
    this._registerEndpoints(endpoints);
    this._configureErrorHandling();
    this.routesRegistered = true;
  }

  // Binds each endpoint's handlers onto the Express app.
  _registerEndpoints(endpoints) {
    for (const endpoint of endpoints) {
      const { method, path: routePath, handlers, name } = endpoint.getRouteDefinition();
      const register = this.app[method];

      if (typeof register !== 'function') {
        throw new Error(`Unsupported HTTP method '${method}' for endpoint ${name}.`);
      }

      register.call(this.app, routePath, ...handlers);
      this.logger.debug('Registered endpoint', { endpoint: name, method, path: routePath });
    }
  }

  // Sets up a single JSON error handler and avoids duplicate wiring.
  _configureErrorHandling() {
    if (this.errorHandlingConfigured) {
      return;
    }

    this.app.use((err, req, res, _next) => {
      this.logger.error(err.message, { stack: err.stack });
      const status = err.statusCode ?? 500;
      res.status(status).json({ error: err.message });
    });
    this.errorHandlingConfigured = true;
  }

  // Loads endpoint classes from the configured directories.
  async _loadEndpoints() {
    if (this.explicitEndpoints) {
      return this.explicitEndpoints;
    }

    if (!this.loadedEndpoints) {
      const dependencies = this._buildEndpointDependencies();
      this.loadedEndpoints = await this.endpointLoader.load(dependencies);

      if (this.loadedEndpoints.length === 0) {
        this.logger.warn('No endpoint classes discovered.', {
          directories: this.endpointDirectories,
        });
      }
    }

    return this.loadedEndpoints;
  }

  // Provides shared resources to dynamically created endpoints.
  _buildEndpointDependencies() {
    return {
      logger: this.logger,
      schemaRegistry: this.schemaRegistry,
      mongoConnection: this.mongoConnection,
    };
  }

  // Figures out where to look for endpoint modules on disk.
  _resolveEndpointDirectories(endpointDirectories) {
    if (Array.isArray(endpointDirectories) && endpointDirectories.length > 0) {
      return endpointDirectories.map((directory) => path.resolve(directory));
    }

    const defaultDirectory = path.resolve(fileURLToPath(new URL('./endpoints', import.meta.url)));
    return [defaultDirectory];
  }
}
