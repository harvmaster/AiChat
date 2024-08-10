import MetricCollector from 'src/services/metric-collector/metric-collector';
import { ClosedEngine, ClosedEngineProps, OpenEngineProps, PortableEngine } from '../types';

import { OpenAIModel, OpenAIModelProps, MODELS } from './models';

import generateUUID from 'src/composeables/generateUUID';

export interface OpenAIEngineI extends ClosedEngine {
  type: 'openai';
}

export type OpenAIEngineProps = OpenEngineProps & {
  token: string;
};

export class OpenAIEngine implements OpenAIEngineI {
  readonly type = 'openai';
  static readonly isClosed = true as const;

  id: string;
  name: string;
  token: string;
  createdAt: number;

  readonly hasMetrics = true;
  metricsCollector: MetricCollector;

  constructor(props: ClosedEngineProps, metricsCollector: MetricCollector) {
    this.id = props.id || generateUUID();
    this.name = props.name;
    this.token = props.token;
    this.createdAt = props.createdAt || Date.now();

    this.metricsCollector = metricsCollector;
  }

  get isClosed() {
    return OpenAIEngine.isClosed;
  }
  
  createModel(model: OpenAIModelProps): OpenAIModel {
    if (MODELS[model.model] === undefined) {
      throw new Error(`Model ${model.model} is not supported by OpenAI`);
    }

    return new OpenAIModel({
      ...model,
      engine: this,
    });
  }

  getAvailableModels(): Promise<(keyof typeof MODELS)[]> {
    return Promise.resolve(Object.keys(MODELS)) as Promise<(keyof typeof MODELS)[]>;
  }

  toPortableEngine(): PortableEngine {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      url: '',
      token: this.token,
      createdAt: this.createdAt,
    };
  }
}

export default OpenAIEngine;
