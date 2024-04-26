import { Model } from 'src/services/models';
import { OllamaModel, OllamaProvider } from 'src/services/models/ollama';
import EasyIDB, { settings } from '../IDB';

import getProviders from '../Providers/getProviders';
import { Database__Model } from 'src/types';

export default async function getModels(): Promise<Database__Model[]> {
  const db = await EasyIDB.getDB(settings.dbName, settings.dbVersion);

  const tx = db.db.transaction('models', 'readonly');
  const store = tx.objectStore('models');

  const models = await store.getAll();

  await tx.done;

  // const providers = await getProviders();

  // const formattedModels = models.map((model) => {
  //   let provider_db = providers.find((provider) => provider.id === model.providerId);
  //   if (!provider_db) {
  //     return null;
  //   }
  //   if (provider_db.type !== 'ollama') {
  //     return null;
  //   }

  //   const provider = new OllamaProvider(provider_db.id, provider_db.name, provider_db.url);
  //   return new OllamaModel(model.id, provider, model.model);
  // }).filter((model) => model != null) as Model[];

  return models;
}