import OpenAI from 'openai';
import { Stream } from 'openai/streaming';
import {
  ChatCompletionContentPart,
  ChatCompletionContentPartImage,
  ChatCompletionMessageParam,
  ChatCompletionChunk
} from 'openai/resources';

import { OpenAIEngine } from '../Engine';
import OpenAIModel, { OpenAIModelProps } from './Model';

import {
  Capabilities,
  ChatCompletionRequestOptions,
  ChatCompletionResponse,
  ChatGenerationResponse,
  ChatHistory,
  ModelSettings,
  PortableModel,
  SupportLevel,
  TextGenerationRequest,
} from '../../types';

import generateUUID from 'src/composeables/generateUUID';
import { createPortableModelURL } from '../../utils';

import { Metric } from 'src/services/metric-collector/types';

export type GPT4OmniMiniMetrics = {
  estimated_tokens_per_second: Metric;
  token_count: Metric;
}

export type GPT4OmniMiniResponseFinalChunk = {
  usage: {
    completion_tokens: number;
    prompt_tokens: number;
    total_tokens: number;
  }
}

export type GPT4OmniMiniResponseMetrics = GPT4OmniMiniResponseFinalChunk & {
  firstToken: number;
  lastToken: number;
}

export interface GPT4_Omni_MiniI extends OpenAIModel {
  model: 'gpt-4o-mini';
}

export class GPT4_Omni_Mini implements GPT4_Omni_MiniI {
  readonly model = 'gpt-4o-mini';

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

    const messages = this.formatChatHistory(request.messages);
    const stream = openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
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

  generateText(
    request: TextGenerationRequest,
    callback?: (response: ChatCompletionResponse) => void,
    options?: Partial<ModelSettings>
  ): ChatGenerationResponse {
    const openai = new OpenAI({ apiKey: this.engine.token, dangerouslyAllowBrowser: true });
    const stream = openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ content: request.prompt, role: 'user' }],
      stream: true,
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
    console.log(responseSummary)

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

  // We need to format the chat history to match the OpenAI API. This needs to be done for Ollama too as it has a different api structure
  formatChatHistory(chatHistory: ChatHistory): ChatCompletionMessageParam[] {
    return chatHistory.map((message) => {
      if (!message.images) {
        return {
          role: message.role,
          content: message.content,
        } as ChatCompletionMessageParam;
      }

      const images: ChatCompletionContentPartImage[] = message.images.map((image) => {
        return {
          type: 'image_url' as const,
          image_url: {
            url: image,
            detail: this.advancedSettings.image_detail,
          },
        };
      })

      return {
        role: 'user' as const,
        content: [
          ...images,
          {
            type: 'text' as const,
            text: message.content,
          } as ChatCompletionContentPart,
        ],
      };
    });
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

  parseMetrics(metrics: GPT4OmniMiniResponseMetrics): GPT4OmniMiniMetrics {
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

export default GPT4_Omni_Mini;
