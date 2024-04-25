import OpenAI from 'openai';
import Provider from './Provider';

import { ChatCompletionRequest, ChatCompletionResponse } from '../types';

class GPT3_5Turbo {
  static provider = Provider;

  static async sendChat (request: ChatCompletionRequest, callback?: (response: ChatCompletionResponse) => void): Promise<ChatCompletionResponse> {
    const openai = new OpenAI({ apiKey: Provider.token.value, dangerouslyAllowBrowser: true });

    const stream = await openai.chat.completions.create({ model: 'gpt-3.5-turbo', messages: request.messages, stream: true });

    let result = ''
    for await (const chunk of stream) {
      if (chunk.choices[0]?.delta?.content) {
        if (callback) callback({ message: { finished: true, content: chunk.choices[0].delta.content } });
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
    
export default GPT3_5Turbo;