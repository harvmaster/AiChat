import { Database__Settings } from 'src/types';
import EasyIDB, { settings as dbSettings } from '../IDB';

const settingsId = 1;
export default async function getSettings(): Promise<Database__Settings> {
  const db = await EasyIDB.getDB(dbSettings.dbName, dbSettings.dbVersion);

  const tx = db.db.transaction('settings', 'readonly');
  const store = tx.objectStore('settings');

  const settings = await store.get(settingsId);

  await tx.done;

  if (!settings) {
    return {
      selectedModel: '',
      showMetrics: true
    }
  }
  return settings;
}