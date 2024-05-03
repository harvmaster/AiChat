import { ChatCompletionRequestOptions, ChatCompletionResponse, OpenProvider, OpenModel, OllamaOptions, TextGenerationRequest, ChatGenerationResponse } from '../types';
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
  public model = 'New Model'
  public advancedSettings: Partial<OllamaOptions> = {...defaultOptions};
  createdAt?: number | undefined;
  
  public provider: OpenProvider

  constructor (id: string, provider: OllamaProvider, createdAt: number, advancedSettings?: string, model?: string) {
    this.id = id
    this.provider = provider
    if (model) this.model = model
    this.createdAt = createdAt

    try {
      if (!advancedSettings) throw new Error('No advanced settings')
      this.advancedSettings = JSON.parse(advancedSettings)
    } catch (err) {
      this.advancedSettings = {...defaultOptions}
    }
  }

  sendChat (request: ChatCompletionRequestOptions, callback?: (response: ChatCompletionResponse) => void, options?: OllamaOptions): ChatGenerationResponse {
    const controller = new AbortController()
    const response = fetch(`${this.provider.url}/api/chat`, {
      method: 'POST',
      body: JSON.stringify({ model: this.model, messages: request.messages, options: { ...this.advancedSettings, ...options } }),
      signal: controller.signal
    })

    const handleError = (err: any) => {
      if (err.name == 'AbortError') return err.response
      throw err
    }

    return {
      abort: () => response.then(() => controller.abort('Cancelled by user')).catch(handleError),
      response: response.then(res => this.handleResponse(res, callback)).catch(handleError)
    }
  }

  generateText (request: TextGenerationRequest, callback?: (response: ChatCompletionResponse) => void, options?: OllamaOptions): ChatGenerationResponse {
    const controller = new AbortController()
    const response = fetch(`${this.provider.url}/api/generate`, {
      method: 'POST',
      body: JSON.stringify({ model: this.model, prompt: request.prompt, format: 'json', options: { ...this.advancedSettings, ...options } }),
      signal: controller.signal
    })
    
    const handleError = (err: any) => {
      if (err.name == 'AbortError') return err.response
      throw err
    }

    return {
      abort: () => response.then(() => controller.abort('Cancelled by user')).catch(handleError),
      response: response.then(res => this.handleResponse(res, callback)).catch(handleError)
    }
  }

  async handleResponse (response: Response, callback?: (res: ChatCompletionResponse) => void): Promise<ChatCompletionResponse> {
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
        if (chunk.response) {
          if (callback) await callback({ message: { finished: chunk.done, content: chunk.response } });
          result += chunk.response;
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