import { OpenAI, Ollama } from '.';
import { validatePortableModel } from './utils';

import {
  ClosedEngineProps,
  Engine,
  EngineProps,
  Model,
  OpenEngineProps,
  PortableModel,
} from './types';

export class EngineManager {
  selectedModel: Model | null = null;
  models: Model[] = [];

  selectModel(model: Model) {
    this.selectedModel = model;
  }

  getEngine(id: string): Engine | undefined {
    return this.models.find((model) => model.engine.id === id)?.engine;
  }

  createEngine(engineProps: EngineProps): Engine {
    switch (engineProps.type) {
      case 'openai':
        return new OpenAI.OpenAIEngine(engineProps as ClosedEngineProps);
      case 'ollama':
        return new Ollama.OllamaEngine(engineProps as OpenEngineProps);
    }

    throw new Error(`Engine type ${engineProps.type} is not supported`);
  }

  getOrCreateEngine(model: PortableModel) {
    let engine = this.getEngine(model.engine.id);
    if (!engine) {
      engine = this.createEngine(model.engine);
    }
    return engine;
  }

  importModel(model: PortableModel) {
    validatePortableModel(model);

    const engine = this.getOrCreateEngine(model);
    if (!engine) {
      throw new Error(`Engine ${model.engine.id} not found`);
    }

    const newModel = engine.createModel(model);
    this.models.push(newModel);
  }
}

// const engineManager = new EngineManager();
// export default engineManager;

export default EngineManager