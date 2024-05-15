import { useRouter } from 'vue-router'
import { app } from 'boot/app'
import Conversation from 'src/utils/App/Conversation'

import { Ref, WatchStopHandle, ref, watch } from 'vue'
// import { ComputedRef, Ref, WatchStopHandle, computed, ref, watch } from 'vue'

// export const useCurrentConversation = (): ComputedRef<Conversation | undefined> => {
//   const router = useRouter()
//   const conversationId = computed(() => router.currentRoute.value.params.id as string)

//   const conversation = computed(() => {
//     return app.conversations.value.find(conversation => conversation.id == conversationId.value)
//   })
//   return conversation
// }

// Multiple components will need this information and it is not dependent on the component itself, so we just use a single instance of the watcher and currentConversation
const currentConvsation = ref<Conversation | undefined>(undefined)
let watcher: WatchStopHandle | undefined
export const useCurrentConversation = (): Ref<Conversation | undefined> => {
  const router = useRouter()

  currentConvsation.value = getConversationFromId(router.currentRoute.value.params.id as string)
  
  if (!watcher) {
    watcher = watch(() => router.currentRoute.value.params.id, (id) => {
      currentConvsation.value = getConversationFromId(id as string)
    })
  }

  return currentConvsation
}

const getConversationFromId = (id: string): Conversation | undefined => {
  return app.conversations.value.find(conversation => conversation.id == id)
}

export default useCurrentConversation 