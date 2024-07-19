import generateUUID from 'src/composeables/generateUUID';
import { OpenEngine, ModelProps, OpenEngineProps, PortableEngine } from '../types';
import OllamaModel from './Model';

export interface OllamaEngineI extends OpenEngine {
  type: 'ollama';
  createModel(model: ModelProps): OllamaModel;
}

export type OllamaRunningModel = {
  name: string;
  model: string;
  size: number;
  digest: string;
  details: {
    parent_model: string;
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  };
  expires_at: string;
  size_vram: number;
};

export type OllamaRunningModels = {
  models: OllamaRunningModel[];
};

export type OllamaAvailableModel = {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
  details: {
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  };
};

export type OllamaAvailableModels = {
  models: OllamaAvailableModel[];
};

export class OllamaEngine implements OllamaEngineI {
  readonly type = 'ollama';
  static readonly isClosed = false as const;

  id: string;
  name: string;
  url: string;
  createdAt: number;

  constructor(props: OpenEngineProps) {
    this.id = props.id || generateUUID();
    this.name = props.name;
    this.url = props.url;
    this.createdAt = props.createdAt || Date.now();
  }

  get isClosed() {
    return OllamaEngine.isClosed;
  }

  createModel(model: ModelProps): OllamaModel {
    const newModel = new OllamaModel({
      ...model,
      engine: this,
    });

    return newModel;
  }

  toPortableEngine(): PortableEngine {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      token: '',
      url: this.url,
      createdAt: this.createdAt,
    };
  }

  async fetchAvailableModels(): Promise<OllamaAvailableModels> {
    const response = await fetch(`${this.url}/api/tags`);
    const data = await response.json();

    return data;
  }

  async getAvailableModels(): Promise<string[]> {
    const models = await this.fetchAvailableModels();

    return models.models.map((model) => model.name.endsWith(':latest') ? model.name.split(':')[0] : model.name);
  }

  async getRunningModels(): Promise<OllamaRunningModels> {
    const response = await fetch(`${this.url}/api/ps`);
    const data = await response.json();

    return data;
  }

  async getMemoryUsage(): Promise<number> {
    const models = await this.getRunningModels();

    const memoryUsage = models.models.reduce((acc: number, model: OllamaRunningModel) => {
      return acc + model.size;
    }, 0);

    return memoryUsage;
  }

}

export default OllamaEngine;
