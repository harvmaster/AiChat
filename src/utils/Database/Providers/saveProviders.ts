import { ClosedProvider, OpenProvider, Provider } from "src/services/models/types";
import EasyIDB, { settings } from "../IDB";

export default async function saveProviders(providers: Provider[]): Promise<void> {
  const db = await EasyIDB.getDB(settings.dbName, settings.dbVersion);

  const tx = db.db.transaction('providers', 'readwrite');
  const store = tx.objectStore('providers');

  for (const provider of providers) {
    const formatted = {
      id: provider.id,
      name: provider.name,
      type: provider.type,
      url: (provider as OpenProvider).url,
      token: (provider as ClosedProvider).token,
      isClosed: provider.isClosed,
      createdAt: Date.now(),
    }
    store.put(formatted); 
  }

  await tx.done;
}