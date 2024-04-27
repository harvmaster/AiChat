<template>
  <div ref="ChatHistoryElement" class="">
    <transition-group name="list" tag="div" class="row col-12" mode="out-in">
      <chat-message
        class="col-12"

        v-for="message in props.messages"
        :key="message.id"

        :id="message.id"
        :author="message.author"
        :content="message.content"
        :created-at="message.createdAt"
        :model-id="message.modelId"
      />
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
import { Message } from 'src/types';
import { watch, ref, nextTick, computed } from 'vue'
import ChatMessage from './ChatMessage.vue'

export type ChatHistoryProps = {
  messages: Message[]
}

const props = defineProps<ChatHistoryProps>()

const ChatHistoryElement = ref<HTMLElement | null>(null)

watch(props.messages, (oldMessages, newMessages) => {
  if (ChatHistoryElement.value && ChatHistoryElement.value.scrollTop + ChatHistoryElement.value.clientHeight - ChatHistoryElement.value.scrollHeight > -90) {
    scrollToBottom()
  }
})

const messagesLength = computed(() => props.messages.length)
watch(messagesLength, () => {
  scrollToBottom()
})

const scrollToBottom = () => {
  nextTick(() => {
    if (ChatHistoryElement.value) {
      ChatHistoryElement.value.scrollTop = ChatHistoryElement.value.scrollHeight
    }
  })
}

defineExpose({
  scrollToBottom
})
</script>