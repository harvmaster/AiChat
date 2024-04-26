import OpenAI from 'openai';
import Provider from './Provider';

import { ChatCompletionRequest, ChatCompletionResponse, ClosedModel } from '../types';

class GPT4Turbo implements ClosedModel {
  id = 'gpt-4-turbo';
  name = 'GPT-4 Turbo';
  model = 'gpt-4-turbo';
  provider = Provider;

  async sendChat (request: ChatCompletionRequest, callback?: (response: ChatCompletionResponse) => void): Promise<ChatCompletionResponse> {
    const openai = new OpenAI({ apiKey: Provider.token, dangerouslyAllowBrowser: true });

    const stream = await openai.chat.completions.create({ model: 'gpt-4-turbo', messages: request.messages, stream: true });

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

const gpt4Turbo = new GPT4Turbo;
    
export default gpt4Turbo;