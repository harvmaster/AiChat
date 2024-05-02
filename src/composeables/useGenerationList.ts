import { ref } from 'vue'

type GeneratingItems = {
  [key: string]: {
    messages: {
      [key: string]: () => void
    }
  }
}

const currentlyGenerating = ref<GeneratingItems>({})

const useGenerationList = () => {
  const addGeneratingItem = (conversationId: string, messageId: string, cancel: () => void) => {
    currentlyGenerating.value[conversationId] = {
      messages: {
        ...currentlyGenerating.value[conversationId]?.messages,
        [messageId]: cancel
      }
    }
  }

  const removeGeneratingItem = (conversationId: string, messageId: string) => {
    delete currentlyGenerating.value[conversationId]?.messages[messageId]
    if (Object.keys(currentlyGenerating.value[conversationId]?.messages).length === 0) {
      delete currentlyGenerating.value[conversationId]
    }
  }

  return {
    currentlyGenerating,
    addGeneratingItem,
    removeGeneratingItem
  }
}

export default useGenerationList