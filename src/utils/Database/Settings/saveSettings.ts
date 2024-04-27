import { Settings as SettingsType } from "src/types";
import EasyIDB, { settings as dbSettings } from "../IDB";


const settingsId = 1;
export default async function saveSettings(settings: SettingsType): Promise<void> {
  const db = await EasyIDB.getDB(dbSettings.dbName, dbSettings.dbVersion);

  const tx = db.db.transaction('settings', 'readwrite');
  const store = tx.objectStore('settings');

  const formattedSettings = {
    id: settingsId,
    selectedModel: settings.selectedModel?.id,
  }

  store.put(formattedSettings);

  await tx.done;
}