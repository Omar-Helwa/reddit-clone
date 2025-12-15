import { RestApiServer } from '../api/RestApiServer.js';
import { MongoConnection } from '../db/MongoConnection.js';
import { SchemaRegistry } from '../schemas/SchemaRegistry.js';
import { buildAppConfig } from '../config/appConfig.js';
import { createLogger } from '../utils/logger.js';

/**
 * EntryPoint wires together configuration, schemas, database, and REST API.
 */
export class EntryPoint {
  // Pulls in config and builds the core service singletons.
  constructor() {
    this.config = buildAppConfig();
    this.schemaRegistry = new SchemaRegistry(this.config.schemaDirectory);
    this.mongoConnection = new MongoConnection({
      uri: this.config.mongo.uri,
      options: this.config.mongo.options,
    });
    this.logger = createLogger(this.config.logging.level);
    this.apiServer = new RestApiServer({
      port: this.config.http.port,
      schemaRegistry: this.schemaRegistry,
      mongoConnection: this.mongoConnection,
      logger: this.logger,
    });
  }

  // Boots schemas, database, and the REST server in order.
  async start() {
    await this.schemaRegistry.loadSchemas();
    await this.mongoConnection.connect();
    await this.apiServer.start();
  }

  // Gracefully tears down the server and database connection.
  async stop() {
    await this.apiServer.stop();
    await this.mongoConnection.disconnect();
  }
}
