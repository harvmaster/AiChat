import { reactive, watch } from 'vue';

import { ClosedModel, Model, OpenModel, Provider } from 'src/services/models';
import { OllamaModel, OllamaProvider, loadOllamaModels } from 'src/services/models/ollama';
import { GPT3_5Turbo, GPT4Turbo, initOpenAIProvider } from 'src/services/models/openai';

import { Conversation, Settings } from 'src/types';
import { 
  getConversations, getModels, getSettings, getProviders,
  saveConversations, saveModels, saveSettings
 } from 'src/utils/Database';

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

    const conversations = await getConversations({ getMessages: true });
    this.conversations.value = conversations;

    const databaseSettings = await getSettings();
    const formattedSettings = {
      selectedModel: this.models.value.find((model) => model.id === databaseSettings.selectedModel)
    }
    this.settings.value = formattedSettings
    if (!this.settings.value.selectedModel) this.settings.value.selectedModel = this.models.value[0];
    

    console.log('Loaded from database:', this.models, this.conversations, this.settings);

    watch(this.conversations, () => {
      // console.log('Conversations updated:', this.conversations);
      saveConversations(this.conversations.value).catch(err => console.error('Failed to save conversations:', err));
    })

    watch(this.settings, () => {
      // console.log('Settings updated:', this.settings);
      saveSettings(this.settings.value).catch(err => console.error('Failed to save settings:', err));
    })

    watch(this.models, () => {
      // console.log('Models updated:', this.models);
      saveModels(this.models.value).catch(err => console.error('Failed to save models:', err));
    })
  }

}

const app = new App();

export { app };