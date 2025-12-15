import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { Schemas } from './Schemas.js';

export class SchemaRegistry {
  // Tracks schema instances loaded from the filesystem.
  constructor(schemaDirectory) {
    this.schemaDirectory = schemaDirectory;
    this.schemasByName = new Map();
  }

  // Loads every schema file and caches the instances by name.
  async loadSchemas() {
    this.schemasByName.clear();
    let entries;
    try {
      entries = await fs.readdir(this.schemaDirectory, { withFileTypes: true });
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Schema directory '${this.schemaDirectory}' was not found.`);
      }
      throw error;
    }

    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith('.js')) {
        continue;
      }

      const schemaPath = path.join(this.schemaDirectory, entry.name);
      const moduleUrl = pathToFileURL(schemaPath);
      const imported = await import(moduleUrl.href);
      const SchemaCtor = imported.default;

      if (typeof SchemaCtor !== 'function') {
        throw new Error(`Schema file ${entry.name} does not export a default class.`);
      }

      const schemaInstance = new SchemaCtor();

      if (!(schemaInstance instanceof Schemas)) {
        throw new Error(`Schema ${entry.name} must extend the Schemas base class.`);
      }

      this.schemasByName.set(schemaInstance.schemaName, schemaInstance);
    }
  }

  // Retrieves a schema or raises if it isn't registered.
  getSchema(schemaName) {
    const schema = this.schemasByName.get(schemaName);
    if (!schema) {
      throw new Error(`Schema '${schemaName}' is not registered.`);
    }
    return schema;
  }

  // Quick existence check for a given schema key.
  hasSchema(schemaName) {
    return this.schemasByName.has(schemaName);
  }

  // Returns the available schema names in alphabetical order.
  listSchemaNames() {
    return Array.from(this.schemasByName.keys()).sort();
  }
}
