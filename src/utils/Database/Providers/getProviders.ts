import EasyIDB, { settings } from '../IDB';
import { Database__Provider } from 'src/types';

export default async function getProviders(): Promise<Database__Provider[]> {
  const db = await EasyIDB.getDB(settings.dbName, settings.dbVersion);
  console.log('db', db);

  const tx = db.db.transaction('providers', 'readonly');
  const store = tx.objectStore('providers');

  const providers = await store.getAll();

  await tx.done;

  return providers;
}
