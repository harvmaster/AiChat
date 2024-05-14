import OpenAI from "openai";
import { Stream } from "openai/streaming";
import { ChatCompletionContentPart, ChatCompletionContentPartImage, ChatCompletionMessageParam } from "openai/resources";

import { OpenAIEngine } from "../Engine";
import OpenAIModel, { OpenAIModelProps } from "./Model";

import { Capabilities, ChatCompletionRequestOptions, ChatCompletionResponse, ChatGenerationResponse, ChatHistory, ModelSettings, PortableModel, SupportLevel, TextGenerationRequest } from "../../types";

import generateUUID from "src/composeables/generateUUID";

export interface GPT4TurboI extends OpenAIModel {
  model: 'gpt-4-turbo';
}

export class GPT4Turbo implements GPT4TurboI {
  readonly model = 'gpt-4-turbo';

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

    const messages = this.formatChatHistory(request.messages)
    const stream = openai.chat.completions.create({ model: 'gpt-4-turbo', messages, stream: true, ...options });

    return {
      abort: () => stream.then(s => s.controller.abort()),
      response: stream.then(s => this.handleResponse(s, callback))
    } 
  }

  generateText (request: TextGenerationRequest, callback?: (response: ChatCompletionResponse) => void, options?: Partial<ModelSettings>): ChatGenerationResponse {
    const openai = new OpenAI({ apiKey: this.engine.token, dangerouslyAllowBrowser: true });
    const stream = openai.chat.completions.create({ model: 'gpt-4-turbo', messages: [{ content: request.prompt, role: 'user' }], stream: true, ...options });
  
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

  // We need to format the chat history to match the OpenAI API. This needs to be done for Ollama too as it has a different api structure
  formatChatHistory (chatHistory: ChatHistory): ChatCompletionMessageParam[] {
    return chatHistory.map(message => {
      if (message.images) {
        return {
          role: 'user' as const,
          content: [
            ...message.images.map(image => { 
              return {
                type: 'image_url' as const,
                image_url: {
                  url: image,
                  detail: this.advancedSettings.image_detail
                } 
              } as ChatCompletionContentPartImage
            }),
            {
              type: 'text' as const,
              text: message.content
            } as ChatCompletionContentPart
          ]
        }
      }

      return {
        role: message.role,
        content: message.content
      } as ChatCompletionMessageParam
    })
  }

  createShareableURL(): string {
    return `${this.engine.id}/models/${this.id}`
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

export default GPT4Turbo;