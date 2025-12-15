import { SchemaDocumentEndpoint } from '../SchemaDocumentEndpoint.js';

export class GetSchemaDocumentEndpoint extends SchemaDocumentEndpoint {
  // Declares the route used to fetch a single schema document.
  constructor(dependencies) {
    super({
      ...dependencies,
      name: 'schema:get',
      description: 'Retrieve a single document for a dynamic schema.',
      method: 'get',
      path: '/:schemaName/:id',
    });
  }

  // Loads a document by ID and returns a friendly JSON payload.
  async handle(req, res) {
    const schema = this.resolveSchema(req.params.schemaName);
    const id = this.toObjectId(req.params.id);
    const collection = this.collectionFor(schema);

    const document = await collection.findOne({ _id: id });
    if (!document) {
      throw this.createValidationError('Document not found.', 404);
    }

    res.json(this.normalizeDocument(document));
  }
}
