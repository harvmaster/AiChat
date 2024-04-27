import { reactive, watch } from 'vue';

import { ClosedModel, Model, OpenModel, Provider } from 'src/services/models';
import { OllamaModel, OllamaProvider, loadOllamaModels } from 'src/services/models/ollama';
import { GPT3_5Turbo, GPT4Turbo, initOpenAIProvider } from 'src/services/models/openai';

import getProviders from 'src/utils/Database/Providers/getProviders';
import getModels from 'src/utils/Database/Models/getModels';
import getConversations from 'src/utils/Database/Conversations/getConversations';

import { Conversation } from 'src/types';
import { saveConversations, saveModels } from 'src/utils/Database';

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
    const formattedModels = await loadOllamaModels();

    const openaiModels: ClosedModel[] = [
      GPT3_5Turbo,
      GPT4Turbo
    ]
    await initOpenAIProvider()

    this.models.value = [ ...formattedModels, ...openaiModels ];
    this.settings.value.selectedModel = this.models.value[0];

    const conversations = await getConversations({ getMessages: true });
    this.conversations.value = conversations;

    console.log('Loaded from database:', this.models, this.conversations);

    watch(this.conversations, () => {
      console.log('Conversations updated:', this.conversations);
      saveConversations(this.conversations.value).catch(err => console.error('Failed to save conversations:', err));
    })

    watch(this.settings, () => {
      console.log('Settings updated:', this.settings);
      // saveSettings
    })

    watch(this.models, () => {
      console.log('Models updated:', this.models);
      saveModels(this.models.value).catch(err => console.error('Failed to save models:', err));
    })
  }

}

const app = new App();

export { app };