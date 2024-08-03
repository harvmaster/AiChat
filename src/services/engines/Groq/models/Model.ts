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
  TextGenerationRequest 
} from "../../types";
import GroqEngine from "../Engine";
import { ChatCompletionChunk } from "openai/resources";

import { createPortableModelURL } from "../../utils";
import generateUUID from "src/composeables/generateUUID";

import MODELS from "./models";

export type GroqModelProps = ModelProps & {
  engine: GroqEngine;
  model: keyof typeof MODELS;
};

export interface GroqModelI extends ClosedModel {
  engine: GroqEngine;
  model: keyof typeof MODELS;
  external_name: typeof MODELS[keyof typeof MODELS]['external_name'];
}

export class GroqModel implements GroqModelI {
  readonly model: keyof typeof MODELS;
  readonly external_name: typeof MODELS[keyof typeof MODELS]['external_name'];

  id: string;
  name: string;
  createdAt: number;
  engine: GroqEngine;

  advancedSettings: Partial<ModelSettings> = {
    temperature: 0.8,
  };
  capabilities: Capabilities = {
    text: SupportLevel.SUPPORTED,
    image: SupportLevel.UNSUPPORTED,
  };

  constructor(props: GroqModelProps) {
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

    const response = fetch(`${this.engine.api}chat/completions`, {
      method: 'POST',
      body: JSON.stringify({
        model: this.external_name,
        messages: request.messages,
        stream: true,
        temperature: options?.temperature || this.advancedSettings.temperature
      }),
      headers: {
        Authorization: `Bearer ${this.engine.token}`,
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
    const responseChunks: ChatCompletionChunk[] = []

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      const chunks: ChatCompletionChunk[] = [];

      try {
        const text = decoder.decode(value, { stream: true });
        const textChunks = text.match(/{(.*)}\n/g);
        const newChunks: ChatCompletionChunk[] = textChunks?.map((chunk) => JSON.parse(chunk)) || [];
        chunks.push(...newChunks)
      } catch (err) {
        console.error('Failed to parse response:', err);
        continue;
      }
        
      for (const chunk of chunks) {
        responseChunks.push(chunk);

        if (chunk.choices[0].delta.content) {
          if (callback)
            await callback({ message: { finished: !!chunk.choices[0].finish_reason, content: chunk.choices[0].delta.content } });
          result += chunk.choices[0].delta.content;
        }
      }
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
}

export default GroqModel;