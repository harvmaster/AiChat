import MetricCollector from 'src/services/metric-collector/metric-collector';
import { ClosedEngine, ClosedEngineProps, PortableEngine } from '../types';

import { ClaudeModel, ClaudeModelProps, MODELS } from './models';

import generateUUID from 'src/composeables/generateUUID';

export interface ClaudeEngineI extends ClosedEngine {
  type: 'claude';
}

export type ClaudeEngineProps = ClosedEngineProps & {
  token: string;
};

export class ClaudeEngine implements ClaudeEngineI {
  readonly type = 'claude';
  readonly api = 'https://api.anthropic.com/v1/messages'
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
    return ClaudeEngine.isClosed;
  }

  createModel(model: ClaudeModelProps): ClaudeModel {
    if (MODELS[model.model] === undefined) {
      throw new Error(`Model ${model.model} is not supported by Claude`);
    }

    return new ClaudeModel({
      ...model,
      engine: this,
    });
  }

  getAvailableModels(): Promise<(keyof typeof MODELS)[]> {
    return Promise.resolve(Object.keys(MODELS) as (keyof typeof MODELS)[]);
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

export default ClaudeEngine;
