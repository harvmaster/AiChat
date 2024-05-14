import OpenAI from "openai";
import { Stream } from "openai/streaming";

import { OpenAIEngine } from "../Engine";
import OpenAIModel, { OpenAIModelProps } from "./Model";

import { Capabilities, ChatCompletionRequestOptions, ChatCompletionResponse, ChatGenerationResponse, ChatHistory, ModelSettings, PortableModel, SupportLevel, TextGenerationRequest } from "../../types";

import generateUUID from "src/composeables/generateUUID";

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
  }

  constructor (props: OpenAIModelProps) {
    this.id = props.id || generateUUID();
    this.name = props.name;
    this.engine = props.engine

    this.createdAt = props.createdAt || Date.now();
    this.advancedSettings = props.advancedSettings || this.advancedSettings;
  }

  sendChat (request: ChatCompletionRequestOptions, callback?: (response: ChatCompletionResponse) => void, options?: Partial<ModelSettings>): ChatGenerationResponse {
    const openai = new OpenAI({ apiKey: this.engine.token, dangerouslyAllowBrowser: true });
    const stream = openai.chat.completions.create({ model: 'gpt-3.5-turbo', messages: request.messages, stream: true, ...options });

    return {
      abort: () => stream.then(s => s.controller.abort()),
      response: stream.then(s => this.handleResponse(s, callback))
    } 
  }

  generateText (request: TextGenerationRequest, callback?: (response: ChatCompletionResponse) => void, options?: Partial<ModelSettings>): ChatGenerationResponse {
    const openai = new OpenAI({ apiKey: this.engine.token, dangerouslyAllowBrowser: true });
    const stream = openai.chat.completions.create({ model: 'gpt-3.5-turbo', messages: [{ content: request.prompt, role: 'user' }], stream: true, ...options });

    return {
      abort: () => stream.then(s => s.controller.abort()),
      response: stream.then(s => this.handleResponse(s, callback))
    } 
  }

  async handleResponse (stream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk>, callback?: (res: ChatCompletionResponse) => void): Promise<ChatCompletionResponse> {
    let result = ''
    for await (const chunk of stream) {
      if (chunk.choices[0]?.delta?.content) {
        if (callback) callback({ message: { finished: false, content: chunk.choices[0].delta.content } });
        result += chunk.choices[0].delta.content;
      }
    }
    return {
      message: {
        finished: true,
        content: result
      }
    }
  }

  createShareableURL(): string {
    return `https://beta.openai.com/models/${this.model}`;
  }

  toPortableModel(): PortableModel {
    return {
      id: this.id,
      name: this.name,
      model: this.model,
      engine: this.engine.toPortableEngine(),
      advancedSettings: this.advancedSettings,
      createdAt: this.createdAt,
    }
  }
}

export default GPT3_5Turbo;