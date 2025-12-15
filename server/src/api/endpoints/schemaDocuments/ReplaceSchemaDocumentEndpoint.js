import { SchemaDocumentEndpoint } from '../SchemaDocumentEndpoint.js';

export class ReplaceSchemaDocumentEndpoint extends SchemaDocumentEndpoint {
  // Configures the PUT route for overwriting schema documents.
  constructor(dependencies) {
    super({
      ...dependencies,
      name: 'schema:replace',
      description: 'Replace a document for a dynamic schema.',
      method: 'put',
      path: '/:schemaName/:id',
    });
  }

  // Validates the new payload and replaces the existing document.
  async handle(req, res) {
    const schema = this.resolveSchema(req.params.schemaName);
    const id = this.toObjectId(req.params.id);
    const payload = schema.validateForCreate({ ...req.body });
    const collection = this.collectionFor(schema);

    const result = await collection.replaceOne({ _id: id }, payload, { upsert: false });
    if (result.matchedCount === 0) {
      throw this.createValidationError('Document not found.', 404);
    }

    res.json({ _id: id.toHexString(), ...payload });
  }
}
