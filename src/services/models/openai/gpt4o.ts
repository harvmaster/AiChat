import OpenAI from 'openai';
import Provider from './Provider';

import {
  ChatCompletionRequestOptions,
  ChatCompletionResponse,
  ChatGenerationResponse,
  ChatHistory,
  ClosedModel,
  TextGenerationRequest,
} from '../types';
import { Stream } from 'openai/streaming';
import {
  ChatCompletionContentPart,
  ChatCompletionContentPartImage,
  ChatCompletionMessageParam,
} from 'openai/resources';

export type OpenAIAdvancedOptions = {
  image_detail: 'auto' | 'low' | 'high';
  temperature: number;
};

export const defaultAdvancedOptions = {
  image_detail: 'low' as const,
  temperature: 0.8,
};

class GPT4o implements ClosedModel {
  id = 'gpt-4o';
  name = 'GPT-4o';
  model = 'gpt-4o';
  provider = Provider;
  advancedSettings: OpenAIAdvancedOptions = { ...defaultAdvancedOptions };

  sendChat(
    request: ChatCompletionRequestOptions,
    callback?: (response: ChatCompletionResponse) => void,
    options?: OpenAIAdvancedOptions
  ): ChatGenerationResponse {
    const openai = new OpenAI({ apiKey: Provider.token, dangerouslyAllowBrowser: true });

    const messages = this.formatChatHistory(request.messages);
    const stream = openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
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
    options?: OpenAIAdvancedOptions
  ): ChatGenerationResponse {
    const openai = new OpenAI({ apiKey: Provider.token, dangerouslyAllowBrowser: true });
    const stream = openai.chat.completions.create({
      model: 'gpt-4o',
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
    for await (const chunk of stream) {
      if (chunk.choices[0]?.delta?.content) {
        if (callback)
          callback({ message: { finished: false, content: chunk.choices[0].delta.content } });
        result += chunk.choices[0].delta.content;
      }
    }
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
      if (message.images) {
        return {
          role: 'user' as const,
          content: [
            ...message.images.map((image) => {
              return {
                type: 'image_url' as const,
                image_url: {
                  url: image,
                  detail: this.advancedSettings.image_detail,
                },
              } as ChatCompletionContentPartImage;
            }),
            {
              type: 'text' as const,
              text: message.content,
            } as ChatCompletionContentPart,
          ],
        };
      }

      return {
        role: message.role,
        content: message.content,
      } as ChatCompletionMessageParam;
    });
  }
}

const gpt4o = new GPT4o();

export default gpt4o;
