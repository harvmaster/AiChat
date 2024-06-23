import { validatePortableModel } from './utils';

import { ENGINES, EngineType, EngineHandler } from './EngineTypes';

import {
  Engine,
  EngineProps,
  Model,
  PortableModel,
  // EngineType
} from './types';

// Define your engines and constructor in .Engines.ts

// I cant figure out the TS wizardy to have this type be an full array of all the keys of the ENGINES object. This is close enough

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
    if (this.isValidEngineType(engineProps.type) && ENGINES[engineProps.type]) {
      const handler = this.getEngineHandler(engineProps.type);
      return new handler(engineProps);
    }
    
    throw new Error(`Engine type ${engineProps.type} is not supported`);
  }

  getEngineTypes(): EngineType[] {
    return Object.keys(ENGINES) as EngineType[];
  }

  getEngineHandler (engineType: EngineType): EngineHandler {
    return ENGINES[engineType];
  }

  isValidEngineType (engineType: string): engineType is EngineType {
    return engineType in ENGINES;
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

  removeModel(model: Model) {
    const index = this.models.findIndex((m) => m.id === model.id);
    if (index !== -1) {
      this.models.splice(index, 1);
    }
  }
}

// const engineManager = new EngineManager();
// export default engineManager;

export default EngineManager