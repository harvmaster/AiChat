import { OpenProvider, OllamaRunningModels, OllamaRunningModel } from '../types';

class OllamaProvider implements OpenProvider {
  id = 'ollama';
  name = 'Ollama';
  type = 'ollama';
  isClosed = false as const;

  url = 'https://ollama.com';
  createdAt = Date.now();

  constructor(id: string, name: string, url?: string, createdAt?: number) {
    this.id = id;
    this.name = name;
    if (url) {
      this.url = url;
    }
    if (createdAt) {
      this.createdAt = createdAt;
    }
  }

  async getRunningModels(): Promise<OllamaRunningModels> {
    const response = await fetch(`${this.url}/api/ps`);
    const data = await response.json();

    return data;
  }

  async getMemoryUsage(): Promise<number> {
    const models = await this.getRunningModels();

    const memoryUsage = models.models.reduce((acc: number, model: OllamaRunningModel) => {
      return acc + model.size;
    }, 0);

    return memoryUsage;
  }
}

export default OllamaProvider;
