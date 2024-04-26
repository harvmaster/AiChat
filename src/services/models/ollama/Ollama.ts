import { Model, ChatCompletionRequest, ChatCompletionResponse, OpenProvider, OpenModel } from '../types';
import OllamaProvider from './Provider';

class Ollama implements OpenModel {
  public id = 'ollama'
  public name = 'Ollama'
  public model = 'phi3'
  public temperature = 1;
  
  public provider: OpenProvider

  constructor (id: string, provider: OllamaProvider, temperature: number, model?: string) {
    this.id = id
    this.provider = provider
    this.temperature = Math.max(Math.min(temperature || 1, 2), 0)
    if (model) this.model = model
  }

  async sendChat (request: ChatCompletionRequest, callback?: (response: ChatCompletionResponse) => void): Promise<ChatCompletionResponse> {
    const response = await fetch(`${this.provider.url}/api/chat`, {
      method: 'POST',
      body: JSON.stringify({ model: this.model, messages: request.messages })
    })

    if (!response.ok) throw new Error('Failed to send chat')
    if (!response.body) throw new Error('Failed to read response body')

    let result = ''
    const decoder = new TextDecoder()
    const reader = response.body.getReader();
    
    while (true) {
      const { done, value } = await reader.read();
  
      if (done) break;
  
      const text = decoder.decode(value, { stream: true });
      const textChunks = text.match(/{(.*)}\n/g);
      const chunks = textChunks?.map(chunk => JSON.parse(chunk)) || [];
  
      for (const chunk of chunks) {
        if (chunk.message?.content) {
          if (callback) await callback({ message: { finished: chunk.done, content: chunk.message.content } });
          result += chunk.message.content;
        }
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

export default Ollama;