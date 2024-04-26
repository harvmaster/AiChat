import { ref } from 'vue';
import { OpenProvider } from '../types';

class OllamaProvider implements OpenProvider {
  id = 'ollama';
  name = 'Ollama';
  type = 'ollama';
  isClosed = false as const;

  url = ref('https://ollama.com');

  constructor (id: string, name: string, url?: string) {
    this.id = id;
    this.name = name;
    if (url) {
      this.url.value = url;
    }
  }
}

export default OllamaProvider;