import OpenAI from 'openai';
import Provider from './Provider';

import { ChatCompletionRequest, ChatCompletionResponse, ClosedModel, TextGenerationRequest } from '../types';
import { Stream } from 'openai/streaming';

export type OpenAIAdvancedOptions = {
  temperature: number
}

export const defaultAdvancedOptions = {
  temperature: 0.8
}


class GPT3_5Turbo implements ClosedModel {
  id = 'gpt-3.5-turbo';
  name = 'GPT-3.5 Turbo';
  model = 'gpt-3.5-turbo';
  provider = Provider;
  advancedSettings: OpenAIAdvancedOptions = {...defaultAdvancedOptions};

  async sendChat (request: ChatCompletionRequest, callback?: (response: ChatCompletionResponse) => void, options?: OpenAIAdvancedOptions): Promise<ChatCompletionResponse> {
    const openai = new OpenAI({ apiKey: Provider.token, dangerouslyAllowBrowser: true });
    const stream = await openai.chat.completions.create({ model: 'gpt-3.5-turbo', messages: request.messages, stream: true, ...options });

    return await this.handleResponse(stream, callback);
  }

  async generateText (request: TextGenerationRequest, callback?: (response: ChatCompletionResponse) => void, options?: OpenAIAdvancedOptions): Promise<ChatCompletionResponse> {
    const openai = new OpenAI({ apiKey: Provider.token, dangerouslyAllowBrowser: true });
    const stream = await openai.chat.completions.create({ model: 'gpt-3.5-turbo', messages: [{ content: request.prompt, role: 'user' }], stream: true, ...options });

    return await this.handleResponse(stream, callback);
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
}

const gpt3_5Turbo = new GPT3_5Turbo();
    
export default gpt3_5Turbo;