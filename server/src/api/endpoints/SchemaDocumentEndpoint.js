import { Endpoint } from './Endpoint.js';

export class SchemaDocumentEndpoint extends Endpoint {
  // Stores shared registry and database helpers for schema routes.
  constructor({ schemaRegistry, mongoConnection, logger, ...rest } = {}) {
    super({ logger, ...rest });
    this.schemaRegistry = schemaRegistry;
    this.mongoConnection = mongoConnection;
  }

  // Looks up a schema and raises a not-found error if missing.
  resolveSchema(schemaName) {
    try {
      return this.schemaRegistry.getSchema(schemaName);
    } catch (error) {
      throw this.createValidationError(error.message, 404);
    }
  }

  // Returns the Mongo collection tied to a given schema definition.
  collectionFor(schema) {
    return this.mongoConnection.getCollection({
      databaseName: schema.databaseName,
      collectionName: schema.collectionName,
    });
  }

  // Converts Mongo documents into plain JSON-friendly objects.
  normalizeDocument(document) {
    if (!document) {
      return document;
    }

    return {
      ...document,
      _id: document._id?.toHexString?.() ?? document._id,
    };
  }

  // Convenience wrapper for ObjectId conversion via the connection.
  toObjectId(value) {
    return this.mongoConnection.toObjectId(value);
  }
}
