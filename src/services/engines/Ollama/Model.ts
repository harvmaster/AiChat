import generateUUID from 'src/composeables/generateUUID';
import {
  Capabilities,
  ChatCompletionRequestOptions,
  ChatCompletionResponse,
  ChatGenerationResponse,
  ModelProps,
  ModelSettings,
  OpenModel,
  PortableModel,
  SupportLevel,
  TextGenerationRequest,
} from '../types';
import OllamaEngine from './Engine';
import { createPortableModelURL } from '../utils';

import { Metrics } from 'src/services/metric-collector/types';

export type OllamaMetrics = Metrics<[
  {
    key: 'Tokens/s',
    value: string
  },
  {
    key: 'Evaluation Tokens/s',
    value: string
  },
  {
    key: 'Token Count',
    value: string
  },
  {
    key: 'Memory Usage',
    value: string
  }
]>

export interface OllamaModelI extends OpenModel {
  engine: OllamaEngine;
}

export type OllamaModelProps = ModelProps & {
  engine: OllamaEngine;
};

export type OllamaResponseStreamingChunk = {
  model: string;
  message: {
    role: 'assistant';
    content: string;
  };
  done: false;
  created_at: string;
};

export type OllamaResponseFinalChunk = {
  message: {
    role: 'assistant';
    content: '';
  };
  done_reason: 'stop';
  done: true;
  total_duration: number;
  load_duration: number;
  prompt_eval_duration: number;
  prompt_eval_count: number;
  eval_count: number;
  eval_duration: number;
}

export type OllamaResponseChunk = OllamaResponseStreamingChunk | OllamaResponseFinalChunk;

export class OllamaModel implements OllamaModelI {
  readonly id: string;
  name: string;
  model: string;
  createdAt: number;
  engine: OllamaEngine;

  advancedSettings: Partial<ModelSettings> = {
    temperature: 0.8,
  };
  capabilities: Capabilities = {
    text: SupportLevel.SUPPORTED,
    image: SupportLevel.UNKNOWN,
  };

  constructor(props: OllamaModelProps) {
    this.id = props.id || generateUUID();
    this.name = props.name;
    this.model = props.model;
    this.createdAt = props.createdAt || Date.now();
    this.advancedSettings = props.advancedSettings || this.advancedSettings;
    this.engine = props.engine as OllamaEngine;
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
        images: message.images?.map((image) => image.split(',')[1]) || [],
      };
    });

    const response = fetch(`${this.engine.url}/api/chat`, {
      method: 'POST',
      body: JSON.stringify({
        model: this.model,
        messages: request.messages,
        options: { ...this.advancedSettings, ...options },
      }),
      signal: controller.signal,
    });

    // TS gave me an error when err was defined as 'any', response requires a response property. So i did this. I dont know how error handling works in TS
    const handleError = (err: Error & { response: Response & ChatCompletionResponse }) => {
      if (err.name == 'AbortError') return err.response;

      // Handler for other Errors
      // Set default error message
      let errorMessage = 'Could not generate response, Please check your Host URL and ensure the Ollama API is enabled.'

      // Handle Brave Browser Shield error
      if ((navigator as any).brave && (err as Error).message.includes('Failed to fetch')) {
        errorMessage += 'Brave Browser Shield may be blocking the request. Please disable it and try again.'
      }

      // Throw error
      console.error(err);
      throw new Error(errorMessage);
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
    const controller = new AbortController();

    // Create Request
    const response = fetch(`${this.engine.url}/api/generate`, {
      method: 'POST',
      body: JSON.stringify({
        model: this.model,
        prompt: request.prompt,
        format: 'json',
        options: { ...this.advancedSettings, ...options },
      }),
      signal: controller.signal,
    });

    const handleError = (err: Error & { response: Response & ChatCompletionResponse }) => {
      if (err.name == 'AbortError') return err.response;

      // Handler for other Errors
      // Set default error message
      let errorMessage = 'Could not generate response, Please check your Host URL and ensure the Ollama API is enabled.'

      // Handle Brave Browser Shield error
      if ((navigator as any).brave && (err as Error).message.includes('Failed to fetch')) {
        errorMessage += 'Brave Browser Shield may be blocking the request. Please disable it and try again.'
      }

      // Throw error
      console.error(err);
      throw new Error(errorMessage);
    };

    return {
      abort: () => response.then(() => controller.abort('Cancelled by user')).catch(handleError),
      response: response.then((res) => this.handleResponse(res, callback)).catch(handleError),
    };
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
    const responseChunks: OllamaResponseChunk[] = []

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      const text = decoder.decode(value, { stream: true });
      const textChunks = text.match(/{(.*)}\n/g);
      const chunks: OllamaResponseChunk[] = textChunks?.map((chunk) => JSON.parse(chunk)) || [];

      for (const chunk of chunks) {
        responseChunks.push(chunk);

        if (chunk.message?.content) {
          if (callback)
            await callback({ message: { finished: chunk.done, content: chunk.message.content } });
          result += chunk.message.content;
        }

        // I dont know what .response is for. So im commenting it out for now
        // if (chunk.response) {
        //   if (callback)
        //     await callback({ message: { finished: chunk.done, content: chunk.response } });
        //   result += chunk.response;
        // }
      }
    }

    // Collect metrics

    // compile chunks
    const responseSummary = responseChunks.at(-1) as OllamaResponseFinalChunk;
    if (responseSummary) {
      this.engine.metricsCollector.updateMetrics(await this.parseMetrics(responseSummary));
    }


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

  async parseMetrics(metrics: OllamaResponseFinalChunk): Promise<OllamaMetrics> {
    const memUsage = await this.engine.getMemoryUsage();

    const formattedMetrics: OllamaMetrics = [
      {
        key: 'Tokens/s',
        value: ((metrics.eval_count / metrics.eval_duration) * 10 ** 9).toFixed(2)
      },
      {
        key: 'Evaluation Tokens/s',
        value: ((metrics.prompt_eval_count / metrics.prompt_eval_duration) * 10 ** 9).toFixed(2)
      },
      {
        key: 'Token Count',
        value: metrics.eval_count.toString()
      },
      {
        key: 'Memory Usage',
        value: `${(memUsage / 1024 / 1024 / 1024).toFixed(2)} GB`
      }
    ]

    return formattedMetrics;
  }
}

export default OllamaModel;
