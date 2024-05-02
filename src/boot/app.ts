import { reactive, watch } from 'vue';

import { ClosedModel, Model, Provider } from 'src/services/models';
import { loadOllamaModels } from 'src/services/models/ollama';
import { GPT3_5Turbo, GPT4Turbo, initOpenAIProvider } from 'src/services/models/openai';

import { Settings } from 'src/types';
import Conversation from 'src/utils/App/Conversation';
import { 
  getConversations, getSettings,
  saveConversations, saveModels, saveSettings
 } from 'src/utils/Database';
import generateUUID from 'src/composeables/generateUUID';

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
  }

  initListeners () {
    watch(this.conversations, () => {
      saveConversations(this.conversations.value).catch(err => console.error('Failed to save conversations:', err));
    })

    watch(this.settings, () => {
      saveSettings(this.settings.value).catch(err => console.error('Failed to save settings:', err));
    })

    watch(this.models, () => {
      saveModels(this.models.value).catch(err => console.error('Failed to save models:', err));
    })
  }

  createConversation () {
    const newConversation = new Conversation({
      id: generateUUID(),
      messages: [],
      summary: ''
    });
    this.conversations.value.push(newConversation);
    return newConversation;
  }

}

const app = new App();

export { app };