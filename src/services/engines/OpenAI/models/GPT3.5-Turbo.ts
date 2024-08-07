import OpenAI from 'openai';
import { Stream } from 'openai/streaming';
import { ChatCompletionChunk } from 'openai/resources';

import { OpenAIEngine } from '../Engine';
import OpenAIModel, { OpenAIModelProps } from './Model';

import {
  Capabilities,
  ChatCompletionRequestOptions,
  ChatCompletionResponse,
  ChatGenerationResponse,
  ModelSettings,
  PortableModel,
  SupportLevel,
  TextGenerationRequest,
} from '../../types';

import generateUUID from 'src/composeables/generateUUID';
import { createPortableModelURL } from '../../utils';

import { Metric } from 'src/services/metric-collector/types';

export type GPT3_5TurboMetrics = {
  estimated_tokens_per_second: Metric;
  token_count: Metric;
}

export type GPT3_5TurboResponseFinalChunk = {
  usage: {
    completion_tokens: number;
    prompt_tokens: number;
    total_tokens: number;
  }
} 

export type GPT3_5TurboResponseMetrics = GPT3_5TurboResponseFinalChunk & {
  firstToken: number;
  lastToken: number;
}

export interface GPT3_5TurboI extends OpenAIModel {
  model: 'gpt-3.5-turbo';
}

export class GPT3_5Turbo implements GPT3_5TurboI {
  readonly model = 'gpt-3.5-turbo';

  id: string;
  name: string;
  createdAt: number;
  engine: OpenAIEngine;

  advancedSettings: Partial<ModelSettings> = {
    temperature: 0.8,
  };
  capabilities: Capabilities = {
    text: SupportLevel.SUPPORTED,
    image: SupportLevel.SUPPORTED,
  };

  constructor(props: OpenAIModelProps) {
    this.id = props.id || generateUUID();
    this.name = props.name;
    this.engine = props.engine;

    this.createdAt = props.createdAt || Date.now();
    this.advancedSettings = props.advancedSettings || this.advancedSettings;
  }

  sendChat(
    request: ChatCompletionRequestOptions,
    callback?: (response: ChatCompletionResponse) => void,
    options?: Partial<ModelSettings>
  ): ChatGenerationResponse {
    const openai = new OpenAI({ apiKey: this.engine.token, dangerouslyAllowBrowser: true });
    const stream = openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: request.messages,
      stream: true,
      ...options,
    });

    return {
      abort: () => stream.then((s) => s.controller.abort()),
      response: stream.then((s) => this.handleResponse(s, callback)),
    };
  }

  generateText(
    request: TextGenerationRequest,
    callback?: (response: ChatCompletionResponse) => void,
    options?: Partial<ModelSettings>
  ): ChatGenerationResponse {
    const openai = new OpenAI({ apiKey: this.engine.token, dangerouslyAllowBrowser: true });
    const stream = openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ content: request.prompt, role: 'user' }],
      stream: true,
      stream_options: {
        include_usage: true
      },
      ...options,
    });

    return {
      abort: () => stream.then((s) => s.controller.abort()),
      response: stream.then((s) => this.handleResponse(s, callback)),
    };
  }

  async handleResponse(
    stream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk>,
    callback?: (res: ChatCompletionResponse) => void
  ): Promise<ChatCompletionResponse> {
    let result = '';
    let firstToken;

    const responseChunks: ChatCompletionChunk[] = []

    for await (const chunk of stream) {
      if (firstToken === undefined) {
        firstToken = Date.now()
      }

      responseChunks.push(chunk);

      if (chunk.choices[0]?.delta?.content) {
        if (callback)
          callback({ message: { finished: false, content: chunk.choices[0].delta.content } });
        result += chunk.choices[0].delta.content;
      }
    }

    // Collect metrics
    const lastToken = Date.now()
    const responseSummary = responseChunks.at(-1);

    this.engine.metricsCollector.updateMetrics(await this.parseMetrics({
      firstToken,
      lastToken,
      usage: responseSummary.usage
    }));

    return {
      message: {
        finished: true,
        content: result,
      },
    };
  }

  createShareableURL(portableModel?: PortableModel): string {
    if (!portableModel) portableModel = this.toPortableModel();

    return createPortableModelURL(portableModel);
  }

  toPortableModel(): PortableModel {
    return {
      id: this.id,
      name: this.name,
      model: this.model,
      engine: this.engine.toPortableEngine(),
      advancedSettings: this.advancedSettings,
      createdAt: this.createdAt,
    };
  }

  parseMetrics(metrics: GPT3_5TurboResponseMetrics): GPT3_5TurboMetrics {
    const timeDiff = metrics.lastToken - metrics.firstToken

    return {
      estimated_tokens_per_second: {
        key: "Estimated Tokens/s",
        value: (metrics.usage.completion_tokens / timeDiff * 1000).toFixed(2)
      },
      token_count: {
        key: "Token Count",
        value: metrics.usage.total_tokens.toString()
      },
    };
  }
}

export default GPT3_5Turbo;
