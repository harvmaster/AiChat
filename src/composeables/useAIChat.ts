import { ChatCompletionResponse, ChatHistory, Model,  } from "src/services/models"
import { ref } from "vue"


export const useAIChat = () => {
  const loading = ref(false)

  const getChatResponse = async (model: Model, messages: ChatHistory, callback: (message: ChatCompletionResponse) => void) => {
    loading.value = true
    try {
      const response = await model.sendChat({ messages, stream: true }, callback)
      loading.value = false;

      return response
    } catch (err: any) {
      throw new Error(`Failed to generate AI response ${err.message}`)
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    getChatResponse
  }
}

export default useAIChat