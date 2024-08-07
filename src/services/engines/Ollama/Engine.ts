import generateUUID from 'src/composeables/generateUUID';
import { OpenEngine, ModelProps, OpenEngineProps, PortableEngine } from '../types';
import OllamaModel from './Model';
import { Notify } from 'quasar';
import MetricCollector from 'src/services/metric-collector/metric-collector';

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
  
  readonly hasMetrics = true;
  metricsCollector: MetricCollector;

  constructor(props: OpenEngineProps, metricsCollector: MetricCollector) {
    this.id = props.id || generateUUID();
    this.name = props.name;
    this.url = props.url;
    this.createdAt = props.createdAt || Date.now();

    this.metricsCollector = metricsCollector;
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
    try {

      const response = await fetch(`${this.url}/api/tags`);
      const data = await response.json();
      
      return data;
    } catch (err) {
      // Set default error message
      let errorMessage = 'Could not get available models, Please check your Host URL.'

      // Handle Brave Browser Shield error
      if ((navigator as any).brave && (err as Error).message.includes('Failed to fetch')) {
        errorMessage = 'Could not get available models, Please check your Host URL. Brave Browser Shield may be blocking the request. Please disable it and try again.'
      }

      // // Handle other errors
      // Notify.create({
      //   message: errorMessage,
      //   color: 'red',
      //   position: 'top-right'
      // })

      // Throw error
      console.error(err);
      throw new Error(errorMessage);
    }
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
