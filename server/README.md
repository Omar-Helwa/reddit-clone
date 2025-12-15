# MongoAPI

Dynamic RESTful API for MongoDB using ES6 classes and schema-driven configuration.

## Features

- Entry point orchestrates configuration, MongoDB connection, and REST server.
- Express API with modular endpoint classes that are auto-discovered from the `src/api/endpoints` directory.
- MongoDB connection wrapper centralises database access and ObjectId handling.
- Schema registry loads schema classes from the `schemas` folder at runtime.
- Declarative schema definitions provide automatic coercion, defaults, and validation for payloads.

## Quick Start

```bash
cp .env.example .env
npm install
npm run dev
```

The API listens on the port defined by `PORT` (default `3000`). Health check is available at `/health`.

## Dynamic Schemas

1. Create a new file in `schemas/` exporting a default class that extends `Schemas` from `src/schemas/Schemas.js`.
2. Provide `schemaName`, `databaseName`, and `collectionName` via the parent constructor.
3. Override `getFieldDefinitions()` and describe each field (type, required, defaults, etc.). The base class automatically performs coercion and validation using that metadata.

To surface new routes, drop additional endpoint classes into `src/api/endpoints/` (or subdirectories). Each class that extends `Endpoint` is auto-discovered and registered when the server boots.

Schemas are loaded at startup; restart the server after adding or modifying schema files.

Sample schemas provided in this repository include:

- `books.schema.js` for book metadata.
- `authors.schema.js` for author biographies and notable works.

Populate the demo dataset with:

```bash
mongosh "${MONGODB_URI:-mongodb://127.0.0.1:27017}" schemas/sample_data.mongosh.txt
```

## Available Scripts

- `npm run dev` – Starts the server with nodemon and watches `src` and `schemas`.
- `npm start` – Starts the server once using Node.
- `npm run docs:serve` – Launches the VitePress-powered documentation site locally.
- `npm run docs:build` – Produces a static copy of the documentation in `docs/.vitepress/dist`.
- `npm run docs:preview` – Serves the built documentation bundle for spot checks.

## Environment Variables

- `MONGODB_URI` – MongoDB connection string (default `mongodb://127.0.0.1:27017`).
- `PORT` – HTTP port (default `3000`).
- `SCHEMA_DIRECTORY` – Optional path override for the schema folder.
- `LOG_LEVEL` – Logging verbosity (`error`, `warn`, `info`, `debug`).
- `MONGO_MAX_POOL_SIZE` – Overrides MongoDB connection pool size.
- `BOOKS_DB_NAME` – Override the target database name for the books schema (default `library`).
- `AUTHORS_DB_NAME` – Override the target database name for the authors schema (default `library`).

## Graceful Shutdown

The entry point listens for `SIGINT`/`SIGTERM` and shuts down the HTTP server and MongoDB connection gracefully.
