import { promises as fs } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { Endpoint } from './Endpoint.js';

const DEFAULT_EXCLUSIONS = new Set([
  'Endpoint.js',
  'EndpointLoader.js',
  'SchemaDocumentEndpoint.js',
  'SchemaCrudEndpoint.js',
]);

export class EndpointLoader {
  // Preps directory list and exclusion set for endpoint discovery.
  constructor({ directories = [], exclude = [] } = {}) {
    this.directories = directories.map((directory) => path.resolve(directory));
    this.exclusions = new Set([...DEFAULT_EXCLUSIONS, ...exclude]);
  }

  // Finds endpoint classes on disk, instantiates them with shared deps.
  async load(dependencies = {}) {
    const files = await this._collectEndpointFiles();
    const instances = [];

    for (const filePath of files) {
      const candidates = await this._importEndpointClasses(filePath);
      for (const EndpointClass of candidates) {
        instances.push(new EndpointClass({ ...dependencies }));
      }
    }

    return instances;
  }

  // Gathers every candidate .js file across configured folders.
  async _collectEndpointFiles() {
    const discovered = new Set();

    for (const directory of this.directories) {
      const files = await this._walkDirectory(directory);
      files.forEach((file) => discovered.add(file));
    }

    return Array.from(discovered).sort();
  }

  // Recursively walks a directory, filtering for relevant endpoint files.
  async _walkDirectory(baseDirectory) {
    const results = [];

    let stat;
    try {
      stat = await fs.stat(baseDirectory);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return results;
      }
      throw error;
    }

    if (!stat.isDirectory()) {
      return results;
    }

    const entries = await fs.readdir(baseDirectory, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name.startsWith('.')) {
        continue;
      }

      const absolutePath = path.join(baseDirectory, entry.name);

      if (entry.isDirectory()) {
        const nested = await this._walkDirectory(absolutePath);
        results.push(...nested);
        continue;
      }

      if (!entry.isFile()) {
        continue;
      }

      if (!entry.name.endsWith('.js')) {
        continue;
      }

      if (this.exclusions.has(entry.name)) {
        continue;
      }

      results.push(absolutePath);
    }

    return results;
  }

  // Imports modules and pulls out any exported Endpoint subclasses.
  async _importEndpointClasses(filePath) {
    const moduleUrl = pathToFileURL(filePath).href;
    const imported = await import(moduleUrl);
    const candidates = new Set();

    if (this._isEndpointSubclass(imported.default)) {
      candidates.add(imported.default);
    }

    for (const value of Object.values(imported)) {
      if (this._isEndpointSubclass(value)) {
        candidates.add(value);
      }
    }

    return Array.from(candidates);
  }

  // Quick guard to confirm a value is a custom Endpoint implementation.
  _isEndpointSubclass(value) {
    if (typeof value !== 'function') {
      return false;
    }

    if (value === Endpoint) {
      return false;
    }

    return value.prototype instanceof Endpoint;
  }
}
