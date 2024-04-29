import { Model, ChatCompletionRequest, ChatCompletionResponse, OpenProvider, OpenModel, OllamaOptions } from '../types';
import OllamaProvider from './Provider';

export const defaultOptions: Partial<OllamaOptions> = {
  // num_keep: 5,
  // seed: 42,
  // num_predict: 100,
  // top_k: 20,
  // top_p: 0.9,
  // tfs_z: 0.5,
  // typical_p: 0.7,
  // repeat_last_n: 33,
  temperature: 0.8,
  // repeat_penalty: 1.2,
  // presence_penalty: 1.5,
  // frequency_penalty: 1.0,
  // mirostat: 1,
  // mirostat_tau: 0.8,
  // mirostat_eta: 0.6,
  // penalize_newline: true,
  // stop: ['\n', 'user:'],
  // numa: false,
  // num_ctx: 1024,
  // num_batch: 2,
  // num_gqa: 1,
  // num_gpu: 1,
  // main_gpu: 0,
  // low_vram: false,
  // f16_kv: true,
  // vocab_only: false,
  // use_mmap: true,
  // use_mlock: false,
  // rope_frequency_base: 1.1,
  // rope_frequency_scale: 0.8,
  // num_thread: 8
}

class Ollama implements OpenModel {
  public id = 'ollama'
  public name = 'Ollama'
  public model = 'phi3'
  public advancedSettings: Partial<OllamaOptions> = {...defaultOptions};
  
  public provider: OpenProvider

  constructor (id: string, provider: OllamaProvider, createdAt: number, advancedSettings?: string, model?: string) {
    this.id = id
    this.provider = provider
    if (model) this.model = model

    try {
      if (!advancedSettings) throw new Error('No advanced settings')
      this.advancedSettings = JSON.parse(advancedSettings)
    } catch (err) {
      this.advancedSettings = {...defaultOptions}
    }
  }

  async sendChat (request: ChatCompletionRequest, callback?: (response: ChatCompletionResponse) => void): Promise<ChatCompletionResponse> {
    const response = await fetch(`${this.provider.url}/api/chat`, {
      method: 'POST',
      body: JSON.stringify({ model: this.model, messages: request.messages, options: {...this.advancedSettings} })
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