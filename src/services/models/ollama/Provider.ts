import { ref } from "vue";
import { OpenProvider } from "../types";

class OllamaProvider implements OpenProvider {
  id = 'ollama';
  name = 'Ollama';
  isClosed: false = false;

  url = ref('https://ollama.com');

  constructor (name: string, url?: string) {
    this.name = name;
    if (url) {
      this.url.value = url;
    }
  }
}

export default OllamaProvider;