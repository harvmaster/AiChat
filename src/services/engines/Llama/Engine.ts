import generateUUID from 'src/composeables/generateUUID';
import { OpenEngine, ModelProps, OpenEngineProps, PortableEngine } from '../types';
import { LlamaModel } from './Model';
import MetricCollector from 'src/services/metric-collector/metric-collector';

export interface LlamaEngineI extends OpenEngine {
  type: 'llama';
  createModel(model: ModelProps): LlamaModel;
}

export type LlamaRunningModel = {
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

export type LlamaRunningModels = {
  data: LlamaRunningModel[];
};

export type LlamaAvailableModel = {
  id: string;
  created: number;
  meta: {
    n_ctx_train: number;
    n_embd: number;
    n_params: number;
    n_vocab: number;
    size: number;
    vocab_type: number;
  };
  object: string;
  owned_by: string;
};

export type LlamaAvailableModels = {
  data: LlamaAvailableModel[];
};

export class LlamaEngine implements LlamaEngineI {
  readonly type = 'llama';
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
    return LlamaEngine.isClosed;
  }

  createModel(model: ModelProps): LlamaModel {
    const newModel = new LlamaModel({
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

  async fetchAvailableModels(): Promise<LlamaAvailableModels> {
    try {

      const response = await fetch(`${this.url}/v1/models`);
      const data = await response.json();
      
      return data;
    } catch (err) {
      // Set default error message
      let errorMessage = 'Could not get available models, Please check your Host URL.'

      // Handle Brave Browser Shield error
      if ((navigator as any).brave && (err as Error).message.includes('Failed to fetch')) {
        errorMessage = 'Could not get available models, Please check your Host URL. Brave Browser Shield may be blocking the request. Please disable it and try again.'
      }

      // Throw error
      console.error(err);
      throw new Error(errorMessage);
    }
  }

  async getAvailableModels(): Promise<string[]> {
    const models = await this.fetchAvailableModels();

    return models.data.filter(model => model.object === 'model').map(model => model.id)
  }

  async getRunningModels(): Promise<LlamaRunningModels> {
    const response = await fetch(`${this.url}/api/ps`);
    const data = await response.json();

    return data;
  }

  async getMemoryUsage(): Promise<number> {
    const models = await this.getRunningModels();

    const memoryUsage = models.data.reduce((acc: number, model: LlamaRunningModel) => {
      return acc + model.size;
    }, 0);

    return memoryUsage;
  }

}

export default LlamaEngine;
