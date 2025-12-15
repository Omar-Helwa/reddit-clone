import { Endpoint } from './Endpoint.js';

export class HealthEndpoint extends Endpoint {
  // Defines the lightweight health-check route metadata.
  constructor(dependencies = {}) {
    super({
      ...dependencies,
      name: 'health:status',
      description: 'Expose basic service health information.',
      method: 'get',
      path: '/health',
    });
  }

  // Returns a simple OK response to signal liveness.
  async handle(_req, res) {
    res.json({ status: 'ok' });
  }
}
