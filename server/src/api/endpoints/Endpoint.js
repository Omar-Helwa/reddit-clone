export class Endpoint {
  // Captures endpoint metadata and wiring options used across handlers.
  constructor({
    logger,
    name,
    aliases = [],
    description = 'No description provided.',
    category = 'General',
    usage = 'No usage provided.',
    expectedArgs = 'No arguments documented.',
    developerOnly = false,
    method,
    path,
    middlewares = [],
  } = {}) {
    this.logger = logger;
    this.name = name ?? this.constructor.name;
    this.aliases = aliases;
    this.description = description;
    this.category = category;
    this.usage = usage;
    this.expectedArgs = expectedArgs;
    this.developerOnly = developerOnly;
    this.method = method;
    this.path = path;
    this.middlewares = middlewares;
  }

  // Default implementation forces subclasses to provide actual logic.
  handle(_req, _res, _next) {
    throw new Error(`${this.constructor.name} must implement the handle() method.`);
  }

  // Normalises middlewares into an array for consistent processing.
  getMiddlewares() {
    return Array.isArray(this.middlewares) ? this.middlewares : [];
  }

  // Produces the structure used by the route loader to register handlers.
  getRouteDefinition() {
    if (!this.method) {
      throw new Error(`${this.constructor.name} is missing an HTTP method.`);
    }
    if (!this.path) {
      throw new Error(`${this.constructor.name} is missing an HTTP path.`);
    }

    return {
      name: this.name,
      aliases: this.aliases,
      description: this.description,
      category: this.category,
      usage: this.usage,
      expectedArgs: this.expectedArgs,
      developerOnly: this.developerOnly,
      method: this.method.toLowerCase(),
      path: this.path,
      handlers: this._buildHandlerPipeline(),
    };
  }

  // Builds the composed middleware stack with the main handler at the end.
  _buildHandlerPipeline() {
    const middlewareHandlers = this.getMiddlewares().map((middleware) => this.wrap(middleware));
    return [...middlewareHandlers, this.wrap(this.handle)];
  }

  // Wraps a handler to catch async errors and preserve the endpoint context.
  wrap(handler) {
    if (typeof handler !== 'function') {
      throw new Error(`${this.constructor.name} received a non-function handler.`);
    }

    return async (req, res, next) => {
      try {
        await handler.call(this, req, res, next);
      } catch (error) {
        next(error);
      }
    };
  }

  // Helper for raising validation errors with consistent status codes.
  createValidationError(message, statusCode = 400) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
  }
}
