<template>
  <div
    class="full-width card-background text-white q-py-sm"
  >
    <div class="chat-message q-pa-md row">
      <div class="col-auto q-pb-md row">
        <div class="col-12 row q-col-gutter-x-sm">
          <div class="col-auto self-center flat-line-height text-h6 text-weight-bold opacity-75">{{ props.author }}</div>
          <div class="col-auto self-end flat-line-height text-caption opacity-50">{{ timeAgo }}</div>
        </div>
        <q-separator class="col-12" horizontal color="white"/>
      </div>
      <div class="col-12" v-for="(chunk, index) of message.chunks" :key="chunk.input" >
        <chat-message-chunk :type="chunk.type" :output="chunk.output" :input="chunk.input" :index="index" :parentLength="message.chunks.length"/>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chat-message {
  font-size: 1.2rem;
  font-weight: 700;
  border: 2px solid #242424;
  border-radius: 1rem;
}
</style>

<script setup lang="ts">
import { HighlightedMessage } from 'src/utils/HighlightMesasge'
import ChatMessageChunk from './ChatMessageChunk.vue';
import { computed } from 'vue';

export type ChatMessageProps = {
  id: string;
  author: string;
  message: HighlightedMessage
  timestamp: string;
}

const props = defineProps<ChatMessageProps>()

const timeAgo = computed(() => {
  const date = new Date(props.timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(months / 12)

  if (years > 0) return `${years} years ago`
  if (months > 0) return `${months} months ago`
  if (days > 0) return `${days} days ago`
  if (hours > 0) return `${hours} hours ago`
  if (minutes > 0) return `${minutes} minutes ago`
  if (seconds > 10) return `${seconds} seconds ago`
  return 'Just now'
})
</script>