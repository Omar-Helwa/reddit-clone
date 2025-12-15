import { Endpoint } from './Endpoint.js';

export class SchemasEndpoint extends Endpoint {
  // Configures the endpoint metadata and stores the registry reference.
  constructor({ schemaRegistry, logger } = {}) {
    super({
      logger,
      name: 'schema:listNames',
      description: 'List all registered schema names.',
      method: 'get',
      path: '/schemas',
    });
    this.schemaRegistry = schemaRegistry;
  }

  // Responds with a simple list of schema names.
  async handle(_req, res) {
    res.json({ schemas: this.schemaRegistry.listSchemaNames() });
  }
}
