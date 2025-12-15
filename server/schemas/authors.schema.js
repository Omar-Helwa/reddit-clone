import { Schemas } from '../src/schemas/Schemas.js';

export default class AuthorsSchema extends Schemas {
  // Defines database details for author records.
  constructor() {
    super({
      schemaName: 'authors',
      databaseName: process.env.AUTHORS_DB_NAME ?? 'library',
      collectionName: 'authors',
    });
  }

  // Outlines the fields and validation rules for author documents.
  getFieldDefinitions() {
    return {
      firstName: {
        type: 'string',
        required: true,
        minLength: 1,
      },
      lastName: {
        type: 'string',
        required: true,
        minLength: 1,
      },
      nationality: {
        type: 'string',
        emptyToUndefined: true,
      },
      birthYear: {
        type: 'number',
        integer: true,
      },
      deathYear: {
        type: 'number',
        integer: true,
      },
      notableWorks: {
        type: 'array',
        default: () => [],
        items: {
          type: 'string',
          emptyToUndefined: true,
          minLength: 1,
        },
      },
    };
  }
}
