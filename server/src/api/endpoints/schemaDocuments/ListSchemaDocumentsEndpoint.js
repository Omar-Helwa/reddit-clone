import { SchemaDocumentEndpoint } from '../SchemaDocumentEndpoint.js';

export class ListSchemaDocumentsEndpoint extends SchemaDocumentEndpoint {
  // Registers the handler that lists documents for any schema.
  constructor(dependencies) {
    super({
      ...dependencies,
      name: 'schema:list',
      description: 'List documents for a dynamic schema.',
      method: 'get',
      path: '/:schemaName',
    });
  }

  // Streams paginated documents back while normalising Mongo IDs.
  async handle(req, res) {
    const schema = this.resolveSchema(req.params.schemaName);
    const limit = Math.min(Number(req.query.limit) || 25, 100);
    const skip = Number(req.query.skip) || 0;

    const collection = this.collectionFor(schema);
    const cursor = collection.find({}, { limit, skip });
    const documents = await cursor.toArray();
    const items = documents.map((doc) => this.normalizeDocument(doc));

    res.json({ items, count: items.length, limit, skip });
  }
}
