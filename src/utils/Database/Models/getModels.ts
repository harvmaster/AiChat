import { Database__Model } from 'src/types';
import EasyIDB, { settings } from '../IDB';

export default async function getModels(): Promise<Database__Model[]> {
  const db = await EasyIDB.getDB(settings.dbName, settings.dbVersion);

  const tx = db.db.transaction('models', 'readonly');
  const store = tx.objectStore('models');

  const models = await store.getAll();

  await tx.done;

  return models;
}