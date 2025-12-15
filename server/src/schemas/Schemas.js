/**
 * Base schema abstraction used by dynamically loaded schema definitions.
 */
export class Schemas {
  
  // Sets up the schema wrapper and guards against missing metadata.
  constructor({ schemaName, databaseName, collectionName }) {
    if (!schemaName || !databaseName || !collectionName) {
      throw new Error('schemaName, databaseName, and collectionName are required.');
    }

    this.schemaName = schemaName;
    this.databaseName = databaseName;
    this.collectionName = collectionName;
  }

  /**
   * Override to define field specifications.
   * Expected shape: { fieldName: { type, required, default, ... } }
   */
  
  // Let subclasses describe their fields in one tidy place.
  getFieldDefinitions() {
    return {};
  }

  /**
   * Override to allow payloads with undeclared fields.
   */
  
  // Toggle this if a schema needs to tolerate unexpected keys.
  allowUnknownFields() {
    return false;
  }

  // Validates a brand-new document against the schema rules.
  validateForCreate(document) {
    const sanitized = this._sanitizeDocument(document, { partial: false });
    return this.afterValidate(sanitized, { partial: false, original: document }) ?? sanitized;
  }

  // Cleans up a partial update without losing existing data.
  validateForUpdate(document) {
    const sanitized = this._sanitizeDocument(document, { partial: true });
    return this.afterValidate(sanitized, { partial: true, original: document }) ?? sanitized;
  }

  /**
   * Hook for subclasses to implement additional validation after sanitisation.
   */
  
  // Give subclasses one last chance to tweak or inspect the payload.
  afterValidate(document, context) {
    return document;
  }

  
  // Central sanitiser that walks each field definition and tidies input.
  _sanitizeDocument(document, { partial }) {
    if (!document || typeof document !== 'object' || Array.isArray(document)) {
      throw this._validationError('Payload must be a JSON object.');
    }

    const definitions = this.getFieldDefinitions();
    const definitionEntries = Object.entries(definitions);

    if (definitionEntries.length === 0) {
      return { ...document };
    }

    if (!this.allowUnknownFields()) {
      const unknownFields = Object.keys(document).filter((key) => !Object.hasOwn(definitions, key));
      if (unknownFields.length > 0) {
        throw this._validationError(`Unknown fields: ${unknownFields.join(', ')}`);
      }
    }

    const sanitized = {};

    for (const [field, definition] of definitionEntries) {
      const hasValue = Object.hasOwn(document, field);
      const rawValue = document[field];

      if (!hasValue || rawValue === undefined) {
        if (!partial) {
          if (Object.hasOwn(definition, 'default')) {
            const defaultValue = this._resolveDefault(definition.default);
            const coerced = this._coerceField(field, definition, defaultValue, { partial: false, fromDefault: true });
            if (coerced !== undefined || definition.allowUndefinedResult) {
              sanitized[field] = coerced;
            }
          } else if (definition.required) {
            throw this._validationError(`${field} is required.`);
          }
        }
        continue;
      }

      if (rawValue === null) {
        if (definition.allowNull) {
          sanitized[field] = null;
          continue;
        }
        if (!partial && Object.hasOwn(definition, 'default')) {
          const defaultValue = this._resolveDefault(definition.default);
          const coerced = this._coerceField(field, definition, defaultValue, { partial: false, fromDefault: true });
          if (coerced !== undefined || definition.allowUndefinedResult) {
            sanitized[field] = coerced;
          }
          continue;
        }
        throw this._validationError(`${field} cannot be null.`);
      }

      const coerced = this._coerceField(field, definition, rawValue, { partial, fromDefault: false });

      if (coerced === undefined) {
        if (!partial && definition.required) {
          throw this._validationError(`${field} is required.`);
        }
        continue;
      }

      sanitized[field] = coerced;
    }

    return sanitized;
  }

  // Handles type coercion, defaults, enums, and custom validators for fields.
  _coerceField(field, definition, value, { partial, fromDefault }) {
    if (value === undefined) {
      return undefined;
    }

    if (definition.transformBeforeType) {
      value = definition.transformBeforeType(value, { partial, fromDefault });
    }

    const type = definition.type ?? 'any';
    let result;

    switch (type) {
      case 'string':
        result = this._coerceString(field, value, definition);
        break;
      case 'number':
        result = this._coerceNumber(field, value, definition);
        break;
      case 'boolean':
        result = this._coerceBoolean(field, value, definition);
        break;
      case 'array':
        result = this._coerceArray(field, value, definition);
        break;
      case 'object':
        result = this._coerceObject(field, value, definition);
        break;
      case 'any':
        result = value;
        break;
      default:
        throw this._validationError(`Unsupported field type '${type}' for ${field}.`);
    }

    if (result === undefined) {
      return undefined;
    }

    if (definition.enum && !definition.enum.includes(result)) {
      throw this._validationError(`${field} must be one of: ${definition.enum.join(', ')}.`);
    }

    if (definition.validate) {
      const validationResult = definition.validate(result, { partial, fromDefault });
      if (validationResult === false) {
        throw this._validationError(`${field} failed validation.`);
      }
      if (validationResult !== true && validationResult !== undefined) {
        result = validationResult;
      }
    }

    if (definition.transform) {
      result = definition.transform(result, { partial, fromDefault });
    }

    return result;
  }

  // Normalises string input with trimming and length checks.
  _coerceString(field, value, definition) {
    let result = String(value);
    if (definition.trim !== false) {
      result = result.trim();
    }

    if (definition.emptyToUndefined && result.length === 0) {
      return undefined;
    }

    if (definition.minLength !== undefined && result.length < definition.minLength) {
      throw this._validationError(`${field} must be at least ${definition.minLength} characters long.`);
    }

    if (definition.maxLength !== undefined && result.length > definition.maxLength) {
      throw this._validationError(`${field} must be at most ${definition.maxLength} characters long.`);
    }

    return result;
  }

  // Makes sure numeric fields behave, including integer and range rules.
  _coerceNumber(field, value, definition) {
    const result = typeof value === 'number' ? value : Number(value);
    if (Number.isNaN(result)) {
      throw this._validationError(`${field} must be numeric.`);
    }

    if (definition.integer && !Number.isInteger(result)) {
      throw this._validationError(`${field} must be an integer.`);
    }

    if (definition.min !== undefined && result < definition.min) {
      throw this._validationError(`${field} must be greater than or equal to ${definition.min}.`);
    }

    if (definition.max !== undefined && result > definition.max) {
      throw this._validationError(`${field} must be less than or equal to ${definition.max}.`);
    }

    return result;
  }

  // Converts common truthy and falsy values into a proper boolean.
  _coerceBoolean(field, value) {
    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'string') {
      const normalised = value.trim().toLowerCase();
      if (['true', '1', 'yes', 'y'].includes(normalised)) {
        return true;
      }
      if (['false', '0', 'no', 'n'].includes(normalised)) {
        return false;
      }
    }

    if (typeof value === 'number') {
      if (value === 1) {
        return true;
      }
      if (value === 0) {
        return false;
      }
    }

    throw this._validationError(`${field} must be boolean.`);
  }

  // Checks array inputs, applies nested rules, and enforces length requirements.
  _coerceArray(field, value, definition) {
    let arrayValue = value;
    if (!Array.isArray(arrayValue)) {
      if (definition.coerceSingle) {
        arrayValue = [arrayValue];
      } else {
        throw this._validationError(`${field} must be an array.`);
      }
    }

    let result = arrayValue.map((item, index) => {
      if (!definition.items) {
        return item;
      }
      return this._coerceField(`${field}[${index}]`, definition.items, item, { partial: false, fromDefault: false });
    }).filter((item) => item !== undefined);

    if (definition.minLength !== undefined && result.length < definition.minLength) {
      throw this._validationError(`${field} must contain at least ${definition.minLength} items.`);
    }

    if (definition.maxLength !== undefined && result.length > definition.maxLength) {
      throw this._validationError(`${field} must contain at most ${definition.maxLength} items.`);
    }

    if (definition.unique) {
      result = Array.from(new Set(result));
    }

    return result;
  }

  // Recursively validates nested objects using a lightweight schema instance.
  _coerceObject(field, value, definition) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw this._validationError(`${field} must be an object.`);
    }

    if (!definition.fields) {
      return value;
    }

    const nestedSchema = new Schemas({
      schemaName: `${this.schemaName}.${field}`,
      databaseName: this.databaseName,
      collectionName: this.collectionName,
    });

    nestedSchema.getFieldDefinitions = () => definition.fields;
    if (definition.allowUnknownFields !== undefined) {
      nestedSchema.allowUnknownFields = () => definition.allowUnknownFields;
    }

    return nestedSchema._sanitizeDocument(value, { partial: false });
  }

  // Resolves default values, running lazy factories when needed.
  _resolveDefault(defaultValue) {
    return typeof defaultValue === 'function' ? defaultValue() : defaultValue;
  }

  // Wraps validation errors with an HTTP-friendly status code.
  _validationError(message) {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
  }
}
