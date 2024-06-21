import { ClosedEngine, ClosedEngineProps, ModelProps, OpenEngineProps } from '../types';

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
  readonly isClosed = true;

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

    throw new Error(`Model ${model.model} is not supported by OpenAI`);
  }

  toPortableEngine() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      token: this.token,
      createdAt: this.createdAt,
    };
  }
}

export default OpenAIEngine;
