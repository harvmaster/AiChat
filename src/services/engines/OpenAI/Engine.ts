import { ClosedEngine, ClosedEngineProps, Model, ModelProps, OpenEngineProps, PortableEngine } from '../types';

import * as Models from './models';
import OpenAIModel from './models/Model';

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

  constructor(props: ClosedEngineProps) {
    this.id = props.id || generateUUID();
    this.name = props.name;
    this.token = props.token;
    this.createdAt = props.createdAt || Date.now();
  }

  get isClosed() {
    return OpenAIEngine.isClosed;
  }

  createModel(model: ModelProps): OpenAIModel {
    if (model.model === 'gpt-3.5-turbo') {
      return new Models.GPT3_5Turbo({
        ...model,
        engine: this,
      });
    }

    if (model.model === 'gpt-4-turbo') {
      return new Models.GPT4Turbo({
        ...model,
        engine: this,
      });
    }

    if (model.model === 'gpt-4o') {
      return new Models.GPT4Omni({
        ...model,
        engine: this,
      });
    }

    if (model.model === 'gpt-4o-mini') {
      return new Models.GPT4OmniMini({
        ...model,
        engine: this,
      });
    }

    throw new Error(`Model ${model.model} is not supported by OpenAI`);
  }

  getAvailableModels(): Promise<string[]> {
    return Promise.resolve(['gpt-3.5-turbo', 'gpt-4-turbo', 'gpt-4o', 'gpt-4o-mini']);
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
