import OpenAI from 'openai';

import { Agent, ChatCompletionRequest, ChatCompletionRequestOptions, ChatCompletionResponse } from '../Agent';

class GPT4_Turbo implements Agent {
  private openai: OpenAI;
  constructor (token: string) {
    this.openai = new OpenAI({ apiKey: token, dangerouslyAllowBrowser: true });
  }

  async sendChat(request: ChatCompletionRequest, callback?: (response: ChatCompletionResponse) => void): Promise<ChatCompletionResponse> {
    const stream = await this.openai.chat.completions.create({ model: 'gpt-4-turbo', messages: request.messages, stream: true });

    let result = ''
    for await (const chunk of stream) {
      if (chunk.choices[0]?.delta?.content) {
        if (callback) callback({ message: { finished: true, content: chunk.choices[0].delta.content } });
        else result += chunk.choices[0].delta.content;
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

export default GPT4_Turbo;