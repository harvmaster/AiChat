import OpenAI from 'openai';
import { Stream } from 'openai/streaming';
import { ChatCompletionChunk, ChatCompletionMessageParam, ChatCompletionContentPartImage, ChatCompletionContentPart } from 'openai/resources';

import { Capabilities, ChatCompletionRequestOptions, ChatCompletionResponse, ChatGenerationResponse, ChatHistory, ClosedModel, ModelProps, ModelSettings, PortableModel, SupportLevel, TextGenerationRequest,  } from '../../types';

import { OpenAIEngine } from '../Engine';
import { MODELS } from './models';

import generateUUID from 'src/composeables/generateUUID';
import { Metrics } from 'src/services/metric-collector/types';
import { createPortableModelURL } from '../../utils';

export type OpenAIMetrics = Metrics<[
  {
    key: 'Estimated Tokens/s',
    value: string
  },
  {
    key: 'Token Count',
    value: string
  }
]>

export type OpenAIResponseFinalChunk = {
  usage: {
    completion_tokens: number;
    prompt_tokens: number;
    total_tokens: number;
  }
}

export type OpenAIResponseMetrics = OpenAIResponseFinalChunk & {
  firstToken: number;
  lastToken: number;
}

export interface OpenAIModelI extends ClosedModel {
  engine: OpenAIEngine;
  model: keyof typeof MODELS
  external_name: typeof MODELS[keyof typeof MODELS]['external_name'];
}

export type OpenAIModelProps = ModelProps & {
  engine: OpenAIEngine;
  model: keyof typeof MODELS;
};

export class OpenAIModel implements OpenAIModelI {
  readonly model: keyof typeof MODELS;
  readonly external_name: typeof MODELS[keyof typeof MODELS]['external_name'];

  id: string;
  name: string;
  createdAt: number;
  engine: OpenAIEngine;

  advancedSettings: Partial<ModelSettings> = {
    temperature: 0.8,
  };

  capabilities: Capabilities;

  constructor(props: OpenAIModelProps) {
    this.id = props.id || generateUUID();
    this.name = props.name;
    this.engine = props.engine;

    this.model = props.model;
    this.external_name = MODELS[props.model].external_name;
    this.capabilities = MODELS[props.model].capabilities;


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
      model: this.external_name,
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
      model: this.external_name,
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
  parseMetrics(metrics: OpenAIResponseMetrics): OpenAIMetrics { 
    const timeDiff = metrics.lastToken - metrics.firstToken

    const formattedMetrics: OpenAIMetrics = [
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

export default OpenAIModel;