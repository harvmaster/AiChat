import ConversationStore from './stores/ConversationStore'
import MessageStore from './stores/MessageStore';
import { BaseStoreI, ObjectStoreSchema } from './types'


class Database {
  private db: IDBDatabase | undefined
  stores: {
    conversations: ConversationStore;
    messages: MessageStore
  } | undefined

  private VERSION = 1

  async init (schemas: [ ConversationStore, MessageStore ], version?: number) {
    const initPromise = new Promise<IDBDatabase>((resolve, reject) => {
      if (version === undefined) version = this.VERSION
      const openRequest = indexedDB.open('ai_chat', version);
  
      openRequest.onsuccess = () => {
        this.VERSION = openRequest.result.version

        this.stores = {
          conversations: schemas[0],
          messages: schemas[1]
        }
        
        resolve(openRequest.result);
      };
  
      openRequest.onerror = () => {
        reject(openRequest.error);
      };
  
      openRequest.onblocked = () => {
        reject(new Error('Database is blocked'))
      }
  
      openRequest.onupgradeneeded = (event) => {
        const db = openRequest.result;
        schemas.forEach((store) => {
          const schema = store.schema
          db.createObjectStore(schema.name, { keyPath: schema.keyPath, autoIncrement: schema.autoIncrement })
        })
      };
    });

    const db = await initPromise

    this.db = db
    return this
  }

  async find<T extends object>(store: string, query?: Partial<T>): Promise<T[]> {
    if (!this.db) throw new Error('Database not initialized')

    const tx = this.db.transaction(store, 'readonly')
    const objectStore = tx.objectStore(store)
    const cursor = objectStore.openCursor()
    const results: T[] = []
    
    return new Promise((resolve) => {
      cursor.onsuccess = (event: any) => {
        const cursor = event.target.result;

        if (cursor) {
          const record = cursor.value;
          const isMatch = Object.entries(query as { [s: string]: unknown }).every(([key, value]) => record[key] == value);

          if (isMatch) {
            results.push(record);
          }
          cursor.continue();
        } else {
          resolve(results)
        }
      }
    })
  }

  async findOne<T extends object>(store: string, query: Partial<T>): Promise<T | null> {
    if (!this.db) throw new Error('Database not initialized')

    const tx = this.db.transaction(store, 'readonly');
    const objectStore = tx.objectStore(store);
    const cursor = objectStore.openCursor()

    return new Promise((resolve) => {
      cursor.onsuccess = (event: any) => {
        const cursor = event.target.result;

        if (cursor) {
          const record = cursor.value;
          const isMatch = Object.entries(query).every(([key, value]) => record[key] == value);

          if (isMatch) {
            resolve(record)
          }
          cursor.continue();
        } else {
          resolve(null)
        }
      }
    })
  }

  async findById<T extends object>(store: string, id: string): Promise<T | null> {
    if (!this.db) throw new Error('Database not initialized')

    const tx = this.db.transaction(store, 'readonly');
    const objectStore = tx.objectStore(store);
    const request = objectStore.get(id)

    return new Promise((resolve) => {
      request.onsuccess = () => {
        resolve(request.result)
      }
    })
  }

  async findAndUpdate<T extends object>(store: string, query: Partial<T>, update: Partial<T>): Promise<T[]> {
    if (!this.db) throw new Error('Database not initialized')

    const tx = this.db.transaction(store, 'readwrite');
    const objectStore = tx.objectStore(store);
    const cursor = objectStore.openCursor()

    return new Promise((resolve) => {
      cursor.onsuccess = (event: any) => {
        const cursor = event.target.result;

        if (cursor) {
          const record = cursor.value;
          const isMatch = Object.entries(query).every(([key, value]) => record[key] == value);

          if (isMatch) {
            cursor.update({ ...record, ...update });
          }
          cursor.continue();
        } else {
          resolve([])
        }
      }
    })
  }

  async findOneAndUpdate<T extends object>(store: string, query: Partial<T>, update: Partial<T>): Promise<T | null> {
    if (!this.db) throw new Error('Database not initialized')

    const tx = this.db.transaction(store, 'readwrite');
    const objectStore = tx.objectStore(store);
    const cursor = objectStore.openCursor()

    return new Promise((resolve) => {
      cursor.onsuccess = (event: any) => {
        const cursor = event.target.result;

        if (cursor) {
          const record = cursor.value;
          const isMatch = Object.entries(query).every(([key, value]) => record[key] == value);

          if (isMatch) {
            cursor.update({ ...record, ...update });
            resolve(record)
          }
          cursor.continue();
        } else {
          resolve(null)
        }
      }
    })
  }

  async delete<T extends object>(store: string, query: Partial<T>): Promise<number> {
    if (!this.db) throw new Error('Database not initialized')

    const tx = this.db.transaction(store, 'readwrite');
    const objectStore = tx.objectStore(store);
    const cursor = objectStore.openCursor()
    let count = 0

    return new Promise((resolve) => {
      cursor.onsuccess = (event: any) => {
        const cursor = event.target.result;

        if (cursor) {
          const record = cursor.value;
          const isMatch = Object.entries(query).every(([key, value]) => record[key] == value);

          if (isMatch) {
            cursor.delete();
            count++
          }
          cursor.continue();
        } else {
          resolve(count)
        }
      }
    })
  }

  async deleteOne<T extends object>(store: string, query: Partial<T>): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized')

    const tx = this.db.transaction(store, 'readwrite');
    const objectStore = tx.objectStore(store);
    const cursor = objectStore.openCursor()

    return new Promise((resolve) => {
      cursor.onsuccess = (event: any) => {
        const cursor = event.target.result;

        if (cursor) {
          const record = cursor.value;
          const isMatch = Object.entries(query).every(([key, value]) => record[key] == value);

          if (isMatch) {
            cursor.delete();
            resolve(true)
          }
          cursor.continue();
        } else {
          resolve(false)
        }
      }
    })
  }

  async create<T extends object>(store: string, data: T | T[]): Promise<T | T[]> {
    if (!this.db) throw new Error('Database not initialized')

    const tx = this.db.transaction(store, 'readwrite');
    const objectStore = tx.objectStore(store);

    if (Array.isArray(data)) {
      data.forEach((record) => {
        objectStore.add(record)
      })
    } else {
      objectStore.add(data)
    }

    return data
  }
}

export default Database