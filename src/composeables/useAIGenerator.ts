import { ref } from "vue";
import { ChatCompletionResponse, ChatHistory, Model } from "src/services/models";


export const useAIGenerator = () => {
  const loading = ref(false)

  const generateAIResponse = async (model: Model, prompt: string, callback: (message: ChatCompletionResponse) => void) => {
    try {
      loading.value = true
      const response = await model.generateText({ prompt }, callback);
      return response;
    } catch (err: any) {
      throw new Error(`Failed to generate AI response: ${err.message}`)
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