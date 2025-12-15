import { MongoClient, ObjectId } from 'mongodb';

export class MongoConnection {
  // Creates a MongoDB client using the provided URI and options.
  constructor({ uri, options }) {
    this.client = new MongoClient(uri, options);
  }

  // Opens the connection if it's not already established.
  async connect() {
    if (!this.client.topology || !this.client.topology.isConnected()) {
      await this.client.connect();
    }
  }

  // Returns a database handle for the given name.
  getDatabase(databaseName) {
    return this.client.db(databaseName);
  }

  // Retrieves a collection reference from the specified database.
  getCollection({ databaseName, collectionName }) {
    return this.getDatabase(databaseName).collection(collectionName);
  }

  // Validates and converts input into a Mongo ObjectId.
  toObjectId(id) {
    if (!ObjectId.isValid(id)) {
      throw new Error('Invalid ObjectId supplied.');
    }
    return new ObjectId(id);
  }

  // Closes the MongoDB client connection.
  async disconnect() {
    await this.client.close();
  }
}
