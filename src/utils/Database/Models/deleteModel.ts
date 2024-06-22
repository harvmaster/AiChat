import { Model } from 'src/services/models';
import EasyIDB, { settings } from '../IDB';
import getModels from './getModels';

export default async function deleteModel(model: Model): Promise<void> {
  const db = await EasyIDB.getDB(settings.dbName, settings.dbVersion);

  if (!model.id) return;

  // if (model.provider) {
  //   const models = await getModels();
  //   if (models.every((m) => m.providerId !== model.provider.id)) {
  //     const tx = db.db.transaction('providers', 'readwrite');
  //     const store = tx.objectStore('providers');

  //     store.delete(model.provider.id);

  //     await tx.done;
  //   }
  // }

  const tx = db.db.transaction('models', 'readwrite');
  const store = tx.objectStore('models');

  store.delete(model.id);

  await tx.done;
}
