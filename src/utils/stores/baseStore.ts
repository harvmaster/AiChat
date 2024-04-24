import Database from '../Database'

type Options = {
  defaults: {
    index: string;
  };
}

export type ObjectStoreSchema = {
  name: string;
  keyPath: string;
  autoIncrement: boolean;
  indices: Array<{
    name: string;
    keyPath: string;
    options: IDBIndexParameters;
  }>;
}

class BaseStore<TRecord extends object> {
  protected dbClient: Database;
  protected storeName: string;
  protected options: Options;
  schema: ObjectStoreSchema;
  static schema: ObjectStoreSchema;

  constructor(dbClient: Database, storeName: string, options: Options, schema: ObjectStoreSchema) {
    this.dbClient = dbClient;
    this.storeName = storeName;
    this.options = options;
    this.schema = schema;
  }

  async find(query?: Partial<TRecord>, index?: string): Promise<TRecord[]> {
    index ?? this.options.defaults.index;

    return this.dbClient.find<TRecord>(this.storeName, query);
  }

  async findOne(query: Partial<TRecord>, index?: string): Promise<TRecord | null> {
    index ?? this.options.defaults.index;

    return this.dbClient.findOne<TRecord>(this.storeName, query);
  }

  async findById(query: string) {
    return this.dbClient.findById<TRecord>(this.storeName, query);
  }

  async findAndUpdate(query: Partial<TRecord>, update: Partial<TRecord>, index?: string): Promise<TRecord[]> {
    index ?? this.options.defaults.index;

    return this.dbClient.findAndUpdate<TRecord>(this.storeName, query, update);
  }

  async findOneAndUpdate(query: Partial<TRecord>, update: Partial<TRecord>, index?: string): Promise<TRecord | null> {
    index ?? this.options.defaults.index;

    return this.dbClient.findOneAndUpdate<TRecord>(this.storeName, query, update);
  }

  async delete(query: Partial<TRecord>, index?: string): Promise<number> {
    index ?? this.options.defaults.index;

    return this.dbClient.delete<TRecord>(this.storeName, query);
  }

  async deleteOne(query: Partial<TRecord>, index?: string): Promise<boolean> {
    index ?? this.options.defaults.index;

    return this.dbClient.deleteOne<TRecord>(this.storeName, query);
  }

  async create(data: TRecord | TRecord[]): Promise<TRecord | TRecord[]> {
    return this.dbClient.create<TRecord>(this.storeName, data) as unknown as TRecord;
  }
}

export default BaseStore;
