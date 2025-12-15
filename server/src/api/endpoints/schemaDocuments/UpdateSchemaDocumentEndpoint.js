import { SchemaDocumentEndpoint } from '../SchemaDocumentEndpoint.js';

export class UpdateSchemaDocumentEndpoint extends SchemaDocumentEndpoint {
  // Declares the PATCH route for partial schema updates.
  constructor(dependencies) {
    super({
      ...dependencies,
      name: 'schema:update',
      description: 'Apply a partial update to a document for a dynamic schema.',
      method: 'patch',
      path: '/:schemaName/:id',
    });
  }

  // Validates partial fields and applies them to the stored document.
  async handle(req, res) {
    const schema = this.resolveSchema(req.params.schemaName);
    const id = this.toObjectId(req.params.id);
    const updates = schema.validateForUpdate({ ...req.body });

    if (Object.keys(updates).length === 0) {
      throw this.createValidationError('No valid fields supplied for update.');
    }

    const collection = this.collectionFor(schema);
    const updateDoc = { $set: updates };

    const result = await collection.updateOne({ _id: id }, updateDoc);
    if (result.matchedCount === 0) {
      throw this.createValidationError('Document not found.', 404);
    }

    const updated = await collection.findOne({ _id: id });
    res.json(this.normalizeDocument(updated));
  }
}
