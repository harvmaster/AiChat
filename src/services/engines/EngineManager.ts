import { OpenAI, Ollama } from ".";
import { ClosedEngineProps, Engine, EngineProps, Model, OpenEngineProps, PortableModel } from "./types";

export class EngineManager {
  
  selectedModel: Model | null = null
  models: Model[] = []

  selectModel (model: Model) {
    this.selectedModel = model
  }

  getEngine (id: string): Engine | undefined {
    return this.models.find(model => model.engine.id === id)?.engine
  }

  createEngine (engineProps: EngineProps): Engine {
    switch (engineProps.type) {
      case 'openai':
        return new OpenAI.OpenAIEngine(engineProps as ClosedEngineProps)
      case 'ollama':
        return new Ollama.OllamaEngine(engineProps as OpenEngineProps)
    }

    throw new Error(`Engine type ${engineProps.type} is not supported`)
  }

  getOrCreateEngine (model: PortableModel) {
    let engine = this.getEngine(model.engine.id)
    if (!engine) {
      engine = this.createEngine(model.engine)
    }
    return engine
  }

   importModel (model: PortableModel) {
    validatePortableModel(model)

    let engine = this.getOrCreateEngine(model)
    if (!engine) {
      throw new Error(`Engine ${model.engine.id} not found`)
    }

    const newModel = engine.createModel(model)
    this.models.push(newModel)
  }
}

const validatePortableModel = (model: PortableModel) => {
  if (!model.id) {
    throw new Error('Model must have an id')
  }
  if (!model.name) {
    throw new Error('Model must have a name')
  }
  if (!model.model) {
    throw new Error('Model must have a model')
  }
  if (!model.engine) {
    throw new Error('Model must have an engine')
  }

  if (!model.engine.id) {
    throw new Error('Model engine must have an id')
  }

  if (!model.engine.name) {
    throw new Error('Model engine must have a name')
  }

  if (!model.engine.type) {
    throw new Error('Model engine must have a type')
  }

  if (!model.engine.createdAt) {
    throw new Error('Model engine must have a createdAt')
  }
}

const engineManager = new EngineManager()
export default engineManager