import { openDB, IDBPDatabase } from 'idb';

interface DatabaseSchema {
  // Define the schema of your database
  conversations: {
    id: string;
    summary: string;
    createdAt: number;
  },
  messages: {
    id: string;
    author: string;
    conversationId: string;
    content: string;

    modelId?: string;
    createdAt: number;
  }
  models: {
    id: string;
    name: string;
    model: string;
    temperature: string;
    providerId: string;
    createdAt: number;
  }
  providers: {
    id: string;
    name: string;
    type: string;
    url?: string;
    token?: string;
    isClosed: boolean;
    createdAt: number;
  },
  settings: {
    id: string;
    key: string;
    value: string;
  
  }
}

export const settings = {
  dbName: 'AIChat',
  dbVersion: 4,
}

class EasyIDB {
  public static dbInstance: EasyIDB;
  public db: IDBPDatabase<DatabaseSchema>;

  constructor(db: IDBPDatabase<DatabaseSchema>) {
    this.db = db;
  }

  static async getDB(dbName: string, version = 1): Promise<EasyIDB> {
    if (!this.dbInstance) {
      EasyIDB.dbInstance = new EasyIDB(await openDB<DatabaseSchema>(dbName, version, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('conversations')) {
            db.createObjectStore('conversations', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('messages')) {
            // Create index on messages.conversationId
            db.createObjectStore('messages', { keyPath: 'id' }).createIndex('conversationId', 'conversationId');
          }
          if (!db.objectStoreNames.contains('models')) {
            db.createObjectStore('models', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('providers')) {
            db.createObjectStore('providers', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings', { keyPath: 'id' });
          }
        },
        blocked() {
          console.error('blocked')
        }
      }));
    }

    return EasyIDB.dbInstance;
  }

  async addStore (storeName: string, schema: object) {
    this.db.createObjectStore(storeName, schema);
  }

  async create<T extends object>(storeName: string, obj: T): Promise<T> {
    const key = await this.db.transaction(storeName, 'readwrite').objectStore(storeName).add(obj);
    return { ...obj, id: key } as T;
  }

  async update <T extends object & { id: string }>(storeName: string, obj: T): Promise<T> {
    await this.db.transaction(storeName, 'readwrite').objectStore(storeName).put({ ...obj });
    return obj;
  }

  async delete (storeName: string, id: string) {
    return this.db.transaction(storeName, 'readwrite').objectStore(storeName).delete(id);
  }
}

export default EasyIDB;