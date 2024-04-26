import { reactive, watch } from 'vue';

import { ClosedModel, Model, OpenModel, Provider } from 'src/services/models';
import { OllamaModel, OllamaProvider } from 'src/services/models/ollama';
import { GPT3_5Turbo, GPT4Turbo } from 'src/services/models/openai';

import getProviders from 'src/utils/Database/Providers/getProviders';
import getModels from 'src/utils/Database/Models/getModels';
import getConversations from 'src/utils/Database/Conversations/getConversations';

import { Conversation } from 'src/types';
import { saveConversations } from 'src/utils/Database';

type Settings = {
  selectedModel?: Model;
}

class App {
  readonly conversations = reactive<{ value: Conversation[] }>({ value: []})
  readonly providers = reactive<{ value: Provider[] }>({ value: [] });
  readonly models = reactive<{ value: Model[] }>({ value: [] });

  readonly settings = reactive<{ value: Settings }>({ value: {
      selectedModel: undefined
    }
  })

  async loadFromDatabase () {
    const providers = await getProviders();
    const models = await getModels();

    const formattedModels = models.map((model) => {
      const provider_db = providers.find((provider) => provider.id === model.providerId);
      if (!provider_db) {
        return null;
      }
      if (provider_db.type !== 'ollama') {
        return null;
      }

      const provider = new OllamaProvider(provider_db.id, provider_db.name, provider_db.url);
      return new OllamaModel(model.id, provider, model.model);
    }).filter((model) => model != null) as OpenModel[]

    const openaiModels: ClosedModel[] = [
      GPT3_5Turbo,
      GPT4Turbo
    ]

    this.models.value = [ ...formattedModels, ...openaiModels ];
    this.settings.value.selectedModel = formattedModels[0];

    const conversations = await getConversations({ getMessages: true });
    this.conversations.value = conversations;

    console.log('Loaded from database:', this.models, this.conversations);

    watch(this.conversations, () => {
      console.log('Conversations updated:', this.conversations);
      saveConversations(this.conversations.value).catch(err => console.error('Failed to save conversations:', err));
    })

    watch(this.settings, () => {
      console.log('Settings updated:', this.settings);
      
    })
  }

}

const app = new App();

export { app };