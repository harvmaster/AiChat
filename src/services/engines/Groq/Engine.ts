import { ClosedEngine, ClosedEngineProps, Model, ModelProps, OpenEngineProps, PortableEngine } from '../types';

import * as Models from './models';
import GroqModel from './models/Model';

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

  createModel(model: ModelProps): GroqModel {
    if (model.model === 'llama3-8b') {
      return new Models.Llama3_8b({
        ...model,
        engine: this,
      });
    }

    if (model.model === 'llama3-70b') {
      return new Models.Llama3_70b({
        ...model,
        engine: this,
      });
    }

    if (model.model === 'gemma-7b') {
      return new Models.Gemma_7b({
        ...model,
        engine: this,
      });
    }

    if (model.model === 'mixtral-8x7b') {
      return new Models.Mixtral_8x7b({
        ...model,
        engine: this,
      });
    }

    throw new Error(`Model ${model.model} is not supported by OpenAI`);
  }

  getAvailableModels(): Promise<string[]> {
    return Promise.resolve(['llama3-8b', 'llama3-70b', 'gemma-7b', 'mixtral-8x7b']);
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
