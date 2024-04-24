export interface BaseStoreI<TRecord> {
  find(query?: Partial<TRecord>, index?: string): Promise<TRecord[]>;
  findOne(query: Partial<TRecord>, index?: string): Promise<TRecord>;
  findById(query: string): Promise<TRecord>;
  findAndUpdate(query: Partial<TRecord>, update: Partial<TRecord>, index?: string): Promise<TRecord[]>;
  findOneAndUpdate(query: Partial<TRecord>, update: Partial<TRecord>, index?: string): Promise<TRecord>;
  delete(query: Partial<TRecord>, index?: string): Promise<number>;
  deleteOne(query: Partial<TRecord>, index?: string): Promise<boolean>;
  create(data: TRecord | TRecord[]): Promise<TRecord | TRecord[]>;
  schema: ObjectStoreSchema;
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