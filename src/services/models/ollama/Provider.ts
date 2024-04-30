import { OpenProvider } from '../types';

class OllamaProvider implements OpenProvider {
  id = 'ollama';
  name = 'Ollama';
  type = 'ollama';
  isClosed = false as const;

  url = 'https://ollama.com';
  createdAt = Date.now();

  constructor (id: string, name: string, url?: string, createdAt?: number ) {
    this.id = id;
    this.name = name;
    if (url) {
      this.url = url;
    }
    if (createdAt) {
      this.createdAt = createdAt;
    }
  }
}

export default OllamaProvider;