import { PortableModel } from './types';
import { Model } from '../models'
import { getProviders } from 'src/utils/Database';
import { Database__Model } from 'src/types';

export const validatePortableModel = (model: PortableModel) => {
  if (!model.id) {
    throw new Error('Model must have an id');
  }
  if (!model.name) {
    throw new Error('Model must have a name');
  }
  if (!model.model) {
    throw new Error('Model must have a model');
  }
  if (!model.engine) {
    throw new Error('Model must have an engine');
  }

  if (!model.engine.id) {
    throw new Error('Model engine must have an id');
  }

  if (!model.engine.name) {
    throw new Error('Model engine must have a name');
  }

  if (!model.engine.type) {
    throw new Error('Model engine must have a type');
  }

  if (!model.engine.createdAt) {
    throw new Error('Model engine must have a createdAt');
  }
};

export const createPortableModelURL = (portableModel: PortableModel): string => {
  return `${window.location.origin}/#/?${btoa(JSON.stringify(portableModel))}`;
};

export const migrateFromProvider = async (models: Database__Model): Promise<PortableModel> => {
  const providers = await getProviders();
  const provider = providers.find((provider) => provider.id === models.providerId);

  if (!provider) {
    throw new Error('Provider not found');
  }

  return {
    id: models.id,
    name: models.name,
    model: models.model,
    advancedSettings: JSON.parse(models.advancedSettings || ''),
    engine: {
      id: provider.id,
      name: provider.name,
      url: provider.url || '',
      token: provider.token || '',
      type: provider.type,
      createdAt: provider.createdAt,
    },
  };
}