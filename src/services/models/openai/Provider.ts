import { ref } from "vue";
import { ClosedProvider } from "../types";
import getProviders from "src/utils/Database/Providers/getProviders";

const openAIProvider: ClosedProvider = {
  id: 'openai',
  name: 'OpenAI',
  type: 'openai',
  isClosed: true,

  token: '',
  createdAt: Date.now(),
}

export const initOpenAIProvider = async () => {
  const providers = await getProviders();
  const provider = providers.find((provider) => provider.id === openAIProvider.id);
  if (provider && provider.token) {
    openAIProvider.token = provider.token;
    openAIProvider.createdAt = provider.createdAt;
  }
}

export default openAIProvider;