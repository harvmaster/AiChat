import { ClosedModel, Model, OpenModel } from "src/services/models";
import EasyIDB, { settings } from "../IDB";
import saveProviders from "../Providers/saveProviders";

export default async function saveModels(models: Model[]) {
  const db = await EasyIDB.getDB(settings.dbName, settings.dbVersion);

  const tx = db.db.transaction('models', 'readwrite');
  const store = tx.objectStore('models');

  const formattedModels = models.map((model) => {
    return {
      id: model.id,
      name: model.name,
      model: (model as OpenModel).model,
      temperature: model.temperature,
      providerId: model.provider.id,
      // providerId: Date.now(),
      createdAt: model.createdAt || Date.now(),
    }
  })

  const formattedProviders = models.map((model) => {
    return {
      id: model.provider.id,
      name: model.provider.name,
      type: model.provider.type,

      token: (model as ClosedModel).provider.token,
      url: (model as OpenModel).provider.url,
      isClosed: model.provider.isClosed,
      // createdAt: model.provider.createdAt,
      createdAt: Date.now(),
    }
  })

  await saveProviders(formattedProviders);

 for (const model of formattedModels) {
    store.put(model);
  }

  await tx.done;

  // return models;
}