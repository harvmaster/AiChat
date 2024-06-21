import { OllamaModel, OllamaProvider } from '.';
import { getModels, getProviders } from '../../../utils/Database';
import { defaultOptions } from './Ollama';

// Hard coded model for demo purposes
const defaultOllamaModels = [
  new OllamaModel(
    '917320fa-5bd3-486a-88d1-850404e21759',
    new OllamaProvider(
      '1c56f141-54ec-479d-a7cf-52aa0077a099',
      'AI Chat',
      'https://ai.ollama.mc.hzuccon.com',
      1714182389701
    ),
    1714182389701,
    JSON.stringify(defaultOptions),
    'phi3'
  ),
];

export const loadOllamaModels = async () => {
  console.log('loading ollama models');
  const providers = await getProviders();
  console.log('loaded providers');
  const models = await getModels();
  console.log('loaded models');

  const formattedModels = models
    .map((model) => {
      const provider_db = providers.find((provider) => provider.id === model.providerId);
      if (!provider_db) {
        return null;
      }
      if (provider_db.type !== 'ollama') {
        return null;
      }

      const provider = new OllamaProvider(provider_db.id, provider_db.name, provider_db.url);
      return new OllamaModel(
        model.id,
        provider,
        model.createdAt,
        model.advancedSettings,
        model.model
      );
    })
    .filter((model) => model != null) as OllamaModel[];

  if (formattedModels.find((model) => model.id === defaultOllamaModels[0].id) === undefined) {
    formattedModels.push(defaultOllamaModels[0]);
  }

  return formattedModels;
};

export default loadOllamaModels;
