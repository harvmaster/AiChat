import { useRouter } from 'vue-router'
import { app } from 'boot/app'
import Conversation from 'src/utils/App/Conversation'
import { ComputedRef, computed } from 'vue'

export const useCurrentConversation = (): ComputedRef<Conversation | undefined> => {
  const router = useRouter()
  const conversationId = computed(() => router.currentRoute.value.params.id as string)

  const conversation = computed(() => {
    return app.conversations.value.find(conversation => conversation.id == conversationId.value)
  })
  return conversation
}

export default useCurrentConversation 