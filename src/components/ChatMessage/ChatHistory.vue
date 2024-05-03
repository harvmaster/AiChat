<template>
  <div ref="ChatHistoryElement" class="" @scroll="handleScroll">
    <transition-group name="list" tag="div" class="row col-12" mode="out-in">
      <chat-message
        class="col-12"

        v-for="message in props.messages"
        :key="message.id"

        :message="message"
      />
      <div class="col-12 row justify-center q-pa-sm" v-if="messages.at(-1)?.author == 'user'">
        <q-btn class="col-auto" btn outline color="blue-2" label="regenerate response"  @click="regenerateResponse" />
      </div>
    </transition-group>
  </div>
</template>

<style lang="scss" scoped>
.list-move, /* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
.list-leave-active {
  position: absolute;
}
</style>

<script setup lang="ts">
import { app } from 'boot/app'
import { watch, ref, nextTick } from 'vue'
import Message from 'src/utils/App/Message'
import ChatMessage from './ChatMessage.vue'
import useCurrentConversation from 'src/composeables/useCurrentConversation'

export type ChatHistoryProps = {
  messages: Message[];
}

const props = defineProps<ChatHistoryProps>()

const ChatHistoryElement = ref<HTMLElement | null>(null)

watch(() => props.messages.length, () => {
  preventScroll = false
  scrollToBottom()
})

watch(props.messages, () => {
  if (ChatHistoryElement.value && ChatHistoryElement.value.scrollTop + ChatHistoryElement.value.clientHeight - ChatHistoryElement.value.scrollHeight > -200) {
    if (!preventScroll) {
      scrollToBottom()
    }
  }
})

const scrollToBottom = (resetLock?: boolean, behavior?: 'smooth' | 'instant') => {
  nextTick(() => {
    if (ChatHistoryElement.value) {
      ChatHistoryElement.value.scrollTo({
        top: ChatHistoryElement.value.scrollHeight,
        behavior: behavior || 'instant',
      })
    }
  })

  if (resetLock) {
    preventScroll = false
  }
}

let lastScroll = 0
let preventScroll = false
const handleScroll = (event: Event) => {
  const element = event.target as HTMLElement
  const currentPosition = element.scrollTop + element.clientHeight

  const direction = currentPosition >= lastScroll ? 'down' : 'up'
  if  (direction == 'down') {
    preventScroll = false
  } else {
    preventScroll = true
  }

  lastScroll = currentPosition
}

const currentConversation = useCurrentConversation()
const regenerateResponse = () => {
  if (currentConversation.value && app.settings.value.selectedModel) {
    currentConversation.value.addAssistantMessage(app.settings.value.selectedModel)
  }
}

defineExpose({
  scrollToBottom
})
</script>