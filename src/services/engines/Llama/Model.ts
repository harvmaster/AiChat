import OpenAI from 'openai';
import { Stream } from 'openai/streaming';
import { ChatCompletionChunk, ChatCompletionMessageParam, ChatCompletionContentPartImage, ChatCompletionContentPart } from 'openai/resources';

import generateUUID from 'src/composeables/generateUUID';
import {
  Capabilities,
  ChatCompletionRequestOptions,
  ChatCompletionResponse,
  ChatGenerationResponse,
  ChatHistory,
  ModelProps,
  ModelSettings,
  OpenModel,
  PortableModel,
  SupportLevel,
  TextGenerationRequest,
} from '../types';
import llamaEngine from './Engine';
import { createPortableModelURL } from '../utils';

import { Metrics } from 'src/services/metric-collector/types';
import { OpenAIResponseMetrics } from '../OpenAI/models/Model';
import { LlamaEngine } from '.';

export type LlamaResponseFinalChunk = {
  usage: {
    completion_tokens: number;
    prompt_tokens: number;
    total_tokens: number;
  }
}

export type LlamaResponseMetrics = LlamaResponseFinalChunk & {
  firstToken: number;
  lastToken: number;
}

export type LlamaMetrics = Metrics<[
  {
    key: 'Estimated Tokens/s',
    value: string
  },
  {
    key: 'Token Count',
    value: string
  }
]>

export interface LlamaModelI extends OpenModel {
  engine: LlamaEngine;
}

export type LlamaModelProps = ModelProps & {
  engine: LlamaEngine;
};

export type LlamaResponseStreamingChunk = {
  model: string;
  done: false;
  created_at: string;
  choices: {
    message: {
      content: string;
    };
  }[];
};

export type llamaResponseFinalChunk = {
  choices: {
    message: {
      content: string;
    };
  }[];
  done_reason: 'stop';
  done: true;
  total_duration: number;
  load_duration: number;
  prompt_eval_duration: number;
  prompt_eval_count: number;
  eval_count: number;
  eval_duration: number;
}

export type llamaResponseChunk = LlamaResponseStreamingChunk | llamaResponseFinalChunk;

export class LlamaModel implements LlamaModelI {
  readonly id: string;
  name: string;
  model: string;
  createdAt: number;
  engine: LlamaEngine;

  advancedSettings: Partial<ModelSettings> = {};
  
  capabilities: Capabilities = {
    text: SupportLevel.SUPPORTED,
    image: SupportLevel.UNKNOWN,
  };

  constructor(props: LlamaModelProps) {
    this.id = props.id || generateUUID();
    this.name = props.name;
    this.model = props.model;
    this.createdAt = props.createdAt || Date.now();
    this.advancedSettings = props.advancedSettings || this.advancedSettings;
    this.engine = props.engine as LlamaEngine;
  }

  sendChat(
    request: ChatCompletionRequestOptions,
    callback?: (response: ChatCompletionResponse) => void,
    options?: Partial<ModelSettings>
  ): ChatGenerationResponse {
    const openai = new OpenAI({ baseURL: this.engine.url, apiKey: '', dangerouslyAllowBrowser: true });

    const messages = this.formatChatHistory(request.messages).filter(message => {
      if (typeof message.content === 'string') {
        return message.content.length > 0
      }

      return message.content?.some(part => {
        if (part.type === 'text') {
          return part.text.length > 0
        }

        if (part.type === 'image_url') {
          return part.image_url?.url.length > 0
        }

        return false
      })
    });

    const stream = openai.chat.completions.create({
      model: this.model,
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
    const openai = new OpenAI({ baseURL: this.engine.url, apiKey: '', dangerouslyAllowBrowser: true });

    const stream = openai.chat.completions.create({
      model: this.model,
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
    // Store the final response. This could be moved to a computed property from the responseChunks but its fine for now
    let result = '';

    // Get the time of the first token so we can calculate the metrics
    let firstToken: number | undefined;

    // Used to collect all the response stream parts
    const responseChunks: ChatCompletionChunk[] = []

    // Read response stream
    for await (const chunk of stream) {
      if (firstToken === undefined) {
        firstToken = Date.now()
      }

      // Add the message to the response array so we can return the entire response after and also call metrics on it
      responseChunks.push(chunk);

      if (chunk.choices[0]?.delta?.content) {
        // call callback with text response
        if (callback)
          callback({ message: { finished: false, content: chunk.choices[0].delta.content } });
        result += chunk.choices[0].delta.content;
      }
    }

    // Collect metrics
    const lastToken = Date.now()
    const responseSummary = responseChunks.at(-1);

    if (responseSummary && responseSummary.usage && firstToken) {
      this.engine.metricsCollector.updateMetrics(await this.parseMetrics({
        firstToken,
        lastToken,
        usage: responseSummary.usage
      }));
    }

    // Return final result
    return {
      message: {
        finished: true,
        content: result,
      },
    };
  }

  // We need to format the chat history to match the OpenAI API. This needs to be done for Ollama too as it has a different api structure
  formatChatHistory(chatHistory: ChatHistory): ChatCompletionMessageParam[] {
    // If the model does not support images, we can just return the chat history as is
    if (this.capabilities.image === SupportLevel.UNSUPPORTED) {
      return chatHistory
    }

    // If the model supports images, we need to format the images to match the OpenAI API
    // Map each message in the chat history to the OpenAI API format for images
    return chatHistory.map((message) => {

      // If there are no images, we can just return the message as is
      if (!message.images) {
        return {
          role: message.role,
          content: message.content,
        } as ChatCompletionMessageParam;
      }

      // If there are images, we need to format them to match the OpenAI API
      const images: ChatCompletionContentPartImage[] = message.images.map((image) => {
        return {
          type: 'image_url' as const,
          image_url: {
            url: image,
            detail: this.advancedSettings.image_detail,
          },
        };
      })

      // Return the message with the images
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

  // This should be extended to take a boolean for whether we share the API key
  createShareableURL(portableModel?: PortableModel): string {
    if (!portableModel) portableModel = this.toPortableModel();

    return createPortableModelURL(portableModel);
  }

  // Create a JSON object that can be shared with others to load the model
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

  // Parse the metrics from the response to a format that can be used by the metrics collector
  parseMetrics(metrics: LlamaResponseMetrics): LlamaMetrics { 
    const timeDiff = metrics.lastToken - metrics.firstToken

    const formattedMetrics: LlamaMetrics = [
      {
        key: 'Estimated Tokens/s',
        value: (metrics.usage.completion_tokens / timeDiff * 1000).toFixed(2)
      },
      {
        key: 'Token Count',
        value: metrics.usage.total_tokens.toString()
      }
    ]

    return formattedMetrics;
  }
}

export default LlamaModel;
