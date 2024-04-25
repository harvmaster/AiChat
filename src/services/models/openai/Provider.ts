import { ref } from "vue";
import { ClosedProvider, Provider } from "../types";

const openAIProvider: ClosedProvider = {
  id: 'openai',
  name: 'OpenAI',
  isClosed: true,

  token: ref(''),
}

export default openAIProvider;