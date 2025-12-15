import { Schemas } from '../src/schemas/Schemas.js';

export default class BooksSchema extends Schemas {
  // Points this schema at the correct books collection.
  constructor() {
    super({
      schemaName: 'books',
      databaseName: process.env.BOOKS_DB_NAME ?? 'library',
      collectionName: 'books',
    });
  }

  // Describes the validation rules for stored book records.
  getFieldDefinitions() {
    return {
      title: {
        type: 'string',
        required: true,
        minLength: 1,
      },
      author: {
        type: 'string',
        required: true,
        minLength: 1,
      },
      authorId: {
        type: 'string',
        emptyToUndefined: true,
        minLength: 1,
      },
      publishedYear: {
        type: 'number',
        integer: true,
        min: 0,
      },
    };
  }
}
