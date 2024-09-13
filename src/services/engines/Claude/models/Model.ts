import {
  Capabilities,
  ChatCompletionRequestOptions,
  ChatCompletionResponse,
  ChatGenerationResponse,
  ChatHistory,
  ClosedModel,
  ModelProps,
  ModelSettings,
  PortableModel,
  SupportLevel,
  TextGenerationRequest,
} from '../../types';
import ClaudeEngine from '../Engine';
import { ChatCompletionChunk } from 'openai/resources';

import { createPortableModelURL } from '../../utils';
import generateUUID from 'src/composeables/generateUUID';

import MODELS from './models';

// Metric Engine types
import { Metrics } from 'src/services/metric-collector/types';

export type ClaudeMetrics = Metrics<
  [
    {
      key: 'Tokens/s';
      value: string;
    },
    {
      key: 'Queue Time';
      value: string;
    },
    {
      key: 'Token Count';
      value: string;
    }
  ]
>;

export type ClaudeResponseChunk = {
  type: string;
  delta: {
    text: string;
  };
};

export type ClaudeModelProps = ModelProps & {
  engine: ClaudeEngine;
  model: keyof typeof MODELS;
};

export interface ClaudeModelI extends ClosedModel {
  engine: ClaudeEngine;
  model: keyof typeof MODELS;
  external_name: (typeof MODELS)[keyof typeof MODELS]['external_name'];
}

export class ClaudeModel implements ClaudeModelI {
  readonly model: keyof typeof MODELS;
  readonly external_name: (typeof MODELS)[keyof typeof MODELS]['external_name'];

  id: string;
  name: string;
  createdAt: number;
  engine: ClaudeEngine;

  advancedSettings: Partial<ModelSettings> = {
    temperature: 0.8,
  };
  capabilities: Capabilities = {
    text: SupportLevel.SUPPORTED,
    image: SupportLevel.UNSUPPORTED,
  };

  constructor(props: ClaudeModelProps) {
    this.id = props.id || generateUUID();
    this.name = props.name;
    this.engine = props.engine;
    this.model = props.model;

    this.external_name = MODELS[props.model].external_name;

    this.createdAt = props.createdAt || Date.now();
    this.advancedSettings = props.advancedSettings || this.advancedSettings;
  }

  sendChat(
    request: ChatCompletionRequestOptions,
    callback?: (response: ChatCompletionResponse) => void,
    options?: Partial<ModelSettings>
  ): ChatGenerationResponse {
    const controller = new AbortController();

    // Remove the header information from the base64 image. (removed 'data: image/png;base64' or similar from the start of the string)
    request.messages = request.messages.map((message) => {
      return {
        role: message.role,
        content: message.content,
      };
    });

    const response = fetch(`${this.engine.api}`, {
      method: 'POST',
      body: JSON.stringify({
        model: this.external_name,
        messages: request.messages,
        stream: true,
      }),
      headers: {
        'x-api-key': `${this.engine.token}`,
        'anhropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      signal: controller.signal,
    });

    // TS gave me an error when err was defined as 'any', response requires a response property. So i did this. I dont know how error handling works in TS
    const handleError = (err: Error & { response: Response & ChatCompletionResponse }) => {
      if (err.name == 'AbortError') return err.response;
      throw err;
    };

    return {
      abort: () => response.then(() => controller.abort('Cancelled by user')).catch(handleError),
      response: response.then((res) => this.handleResponse(res, callback)).catch(handleError),
    };
  }

  generateText(
    request: TextGenerationRequest,
    callback?: (response: ChatCompletionResponse) => void,
    options?: Partial<ModelSettings>
  ): ChatGenerationResponse {
    const messages: ChatHistory = [{ content: request.prompt, role: 'user' }];

    const req = { messages, ...options };
    return this.sendChat(req, callback, options);
  }

  async handleResponse(
    response: Response,
    callback?: (res: ChatCompletionResponse) => void
  ): Promise<ChatCompletionResponse> {
    if (!response.ok) throw new Error('Failed to send chat');
    if (!response.body) throw new Error('Failed to read response body');

    let result = '';
    const decoder = new TextDecoder();
    const reader = response.body.getReader();

    // This is used to get the metrics
    const responseChunks: ClaudeResponseChunk[] = [];

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      const chunks: ClaudeResponseChunk[] = [];

      try {
        const text = decoder.decode(value, { stream: true });
        const textChunks = text.match(/{(.*)}\n/g);
        const newChunks: ClaudeResponseChunk[] =
          textChunks?.map((chunk) => JSON.parse(chunk)) || [];
        chunks.push(...newChunks);
      } catch (err) {
        console.error('Failed to parse response:', err);
        continue;
      }

      for (const chunk of chunks) {
        responseChunks.push(chunk);
        if (!chunk.type.startsWith('content_block')) continue;

        if (chunk.delta.text) {
          if (callback) {
            await callback({
              message: {
                finished: false,
                content: chunk.delta.text,
              },
            });
          }
          result += chunk.delta.text;
        }
      }
    }

    // Collect metrics
    // const responseSummary = responseChunks.at(-1) as ClaudeResponseChunk;
    // if (responseSummary) {
    //   this.engine.metricsCollector.updateMetrics(await this.parseMetrics(responseSummary));
    // }

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

  // parseMetrics(metrics: ClaudeResponseChunk): ClaudeMetrics {
  //   return [
  //     {
  //       key: 'Tokens/s',
  //       value: (
  //         metrics.x_Claude.usage.completion_tokens / metrics.x_Claude.usage.completion_time
  //       ).toFixed(2),
  //     },
  //     {
  //       key: 'Queue Time',
  //       value: `${metrics.x_Claude.usage.queue_time.toFixed(2)}s`,
  //     },
  //     {
  //       key: 'Token Count',
  //       value: metrics.x_Claude.usage.total_tokens.toString(),
  //     },
  //   ];
  // }
}

export default ClaudeModel;
