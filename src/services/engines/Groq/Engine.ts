import { ClosedEngine, ClosedEngineProps, PortableEngine } from '../types';

import { GroqModel, GroqModelProps, MODELS } from './models';

import generateUUID from 'src/composeables/generateUUID';

export interface GroqEngineI extends ClosedEngine {
  type: 'groq';
}

export type GroqEngineProps = ClosedEngineProps & {
  token: string;
};

export class GroqEngine implements GroqEngineI {
  readonly type = 'groq';
  readonly api = 'https://api.groq.com/openai/v1/'
  static readonly isClosed = true as const;

  id: string;
  name: string;
  token: string;
  createdAt: number;

  constructor(props: ClosedEngineProps) {
    this.id = props.id || generateUUID();
    this.name = props.name;
    this.token = props.token;
    this.createdAt = props.createdAt || Date.now();
  }

  get isClosed() {
    return GroqEngine.isClosed;
  }

  createModel(model: GroqModelProps): GroqModel {
    if (MODELS[model.model] === undefined) {
      throw new Error(`Model ${model.model} is not supported by Groq`);
    }

    return new GroqModel({
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

export default GroqEngine;
