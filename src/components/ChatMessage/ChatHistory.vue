<template>
  <div class="">
    <transition-group name="list" tag="div" class="row col-12">
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
import { watch } from 'vue'
import ChatMessage from './ChatMessage.vue'

export type ChatHistoryProps = {
  messages: Message[]
}

const props = defineProps<ChatHistoryProps>()

// watch(props.messages, () => {
//   console.log('ChatHistory: messages changed', props.messages)
// })

</script>