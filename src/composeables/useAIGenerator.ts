import { ref } from 'vue';
import { ChatCompletionResponse, Model } from 'src/services/models';


export const useAIGenerator = () => {
  const loading = ref(false)

  const generateAIResponse = async (model: Model, prompt: string, callback: (message: ChatCompletionResponse) => void) => {
    try {
      loading.value = true
      const response = await model.generateText({ prompt }, callback);
      loading.value = false;
      return response;
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`Failed to generate AI response: ${err.message}`)
      }
      throw new Error('Failed to generate AI response')
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    generateAIResponse
  }
}

export default useAIGenerator;