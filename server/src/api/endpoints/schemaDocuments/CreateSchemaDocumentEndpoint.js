import { SchemaDocumentEndpoint } from '../SchemaDocumentEndpoint.js';

export class CreateSchemaDocumentEndpoint extends SchemaDocumentEndpoint {
  // Maps HTTP metadata for creating documents on dynamic schemas.
  constructor(dependencies) {
    super({
      ...dependencies,
      name: 'schema:create',
      description: 'Create a document for a dynamic schema.',
      method: 'post',
      path: '/:schemaName',
    });
  }

  // Validates the incoming payload and inserts it into MongoDB.
  async handle(req, res) {
    const schema = this.resolveSchema(req.params.schemaName);
    const payload = schema.validateForCreate({ ...req.body });
    const collection = this.collectionFor(schema);

    const { insertedId } = await collection.insertOne(payload);
    res.status(201).json({ id: insertedId.toHexString(), ...payload });
  }
}
