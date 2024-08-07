import { computed, reactive, ref, watch } from 'vue';
import { Notify } from 'quasar';

import { Model, Engine, ChatGenerationMetrics, EngineManager, PortableModel } from 'src/services/engines';
import DefaultModels from 'src/services/engines/DefaultModels';
import { default as getModelsFromDB } from 'src/utils/Database/Models/getModels'

import { Database__Model, Settings } from 'src/types';
import Conversation from 'src/utils/App/Conversation';
import {
  getConversations,
  getSettings,
  saveConversations,
  saveModels,
  saveSettings,
} from 'src/utils/Database';
import generateUUID from 'src/composeables/generateUUID';
import { migrateFromProvider } from 'src/services/engines/utils';
import MetricCollector from 'src/services/metric-collector/metric-collector';

class App {
  readonly conversations = reactive<{ value: Conversation[] }>({ value: [] });
  readonly providers = reactive<{ value: Engine[] }>({ value: [] });
  readonly models = computed<Model[]>(() => {
    const length = app.engineManager.value.models.length
    return this.engineManager.value.models
  })

  readonly metrics = reactive<{ value: MetricCollector }>({ value: new MetricCollector() });

  readonly engineManager = reactive<{ value: EngineManager }>({ value: new EngineManager(this.metrics.value) });

  readonly settings = reactive<{ value: Settings }>({
    value: {
      selectedModel: undefined,
      showMetrics: false,
    },
  });
  // readonly metrics = reactive<{ value: ChatGenerationMetrics }>({
  //   value: {
  //     token_count: 0,
  //     token_time: 0,
  //     prompt_count: 0,
  //     prompt_time: 0,
  //     tps: 0,
  //     memory_usage: 0,
  //   },
  // });

  readonly version = ref('1.2.0');

  async loadFromDatabase() {
    const models: PortableModel[] = await getModelsFromDB();
    console.log(models)
    const formattedModels = await  Promise.all(models.map(async (model: (PortableModel | Database__Model)) => {
      if ((model as Database__Model).providerId != undefined) {
        return await migrateFromProvider(model as unknown as Database__Model);
      }
      return model as PortableModel;
    }))

    // add models to the engine manager. If the model is not found, load the default models
    formattedModels.forEach(model => {
      try {
        // Try to load the model
        this.engineManager.value.importModel(model)
      } catch (err) {
        // If the model fails to load, log the error and notify the user
        console.error('Failed to load model:', model, err);
        Notify.create({
          message: `Failed to load model: ${model.name}. Check the console for more information.`,
          color: 'negative',
        });
      }
    });

    if (this.engineManager.value.models.length === 0) {
      console.log('no models found, loading defaults')
      DefaultModels.forEach(model => this.engineManager.value.importModel(model));
    }
    console.log(`Loaded ${this.engineManager.value.models.length} models`, this.engineManager.value.models)

    const conversations = await getConversations({ getMessages: false });
    this.conversations.value = conversations;
    console.log(`Loaded ${this.conversations.value.length} conversations`, this.conversations.value);

    const databaseSettings = await getSettings();
    const formattedSettings = {
      selectedModel: this.models.value.find((model) => model.id === databaseSettings.selectedModel),
      showMetrics: databaseSettings.showMetrics,
    };
    this.settings.value = formattedSettings;
    if (!this.settings.value.selectedModel)
      this.settings.value.selectedModel = this.models.value[0];
  }

  initListeners() {
    watch(this.conversations, () => {
      saveConversations(this.conversations.value).catch((err) =>
        console.error('Failed to save conversations:', err)
      );
    });

    watch(this.settings, () => {
      saveSettings(this.settings.value).catch((err) =>
        console.error('Failed to save settings:', err)
      );
      if (!this.settings.value.selectedModel) return;
      if (this.settings.value.selectedModel.engine.isClosed) return;

      // get memory usage metric
      this.settings.value.selectedModel.engine.getMemoryUsage?.().then((memoryUsage) => {
        this.metrics.value.memory_usage = memoryUsage;
      });
    });

    watch(this.engineManager, () => {
      console.log('saving models')
      saveModels(this.models.value).catch((err) => console.error('Failed to save models:', err));
    });
  }

  createConversation() {
    const newConversation = new Conversation({
      id: generateUUID(),
      messages: [],
      summary: '',
    });
    this.conversations.value.push(newConversation);
    return newConversation;
  }

  private listeners: { [key: string]: (() => void)[] } = {};
  on(event: string, callback: () => void) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }
  emit(event: string) {
    if (!this.listeners[event]) return;
    for (const listener of this.listeners[event]) {
      listener();
    }
  }
}

const app = new App();

const initApp = async () => {
  await app.loadFromDatabase();
  app.initListeners();
  console.log('loaded');
  app.emit('app:loaded');
};

initApp();

export { app };
