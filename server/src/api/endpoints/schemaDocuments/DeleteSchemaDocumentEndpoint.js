import { SchemaDocumentEndpoint } from '../SchemaDocumentEndpoint.js';

export class DeleteSchemaDocumentEndpoint extends SchemaDocumentEndpoint {
  // Sets up the DELETE route for removing schema documents.
  constructor(dependencies) {
    super({
      ...dependencies,
      name: 'schema:delete',
      description: 'Delete a document for a dynamic schema.',
      method: 'delete',
      path: '/:schemaName/:id',
    });
  }

  // Removes a document by ID and replies with a no-content response.
  async handle(req, res) {
    const schema = this.resolveSchema(req.params.schemaName);
    const id = this.toObjectId(req.params.id);
    const collection = this.collectionFor(schema);

    const result = await collection.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      throw this.createValidationError('Document not found.', 404);
    }

    res.status(204).send();
  }
}
