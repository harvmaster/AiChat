<template>
  <div
    class="full-width card-background text-white q-py-sm"
  >
    <div class="chat-message q-pa-md row">
      <div class="col-12 q-pb-md row">
        <div class="col row q-col-gutter-x-sm">
          <div class="col-12 self-center flat-line-height text-h6 text-weight-bold opacity-75">{{ props.author }}</div>
          <div class="col-12 self-end flat-line-height text-caption opacity-50">{{ timeAgo }}</div>
        </div>
        <div class="col-auto">
          <q-btn flat round dense icon="delete" color="red-4 opacity-50" @click="deleteMessage" />
        </div>
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
  font-weight: 500;
  border: 2px solid #242424;
  border-radius: 1rem;
}
.relative {
  position: relative;
}
</style>

<script setup lang="ts">
import { computed, onMounted, ref, defineEmits } from 'vue';
import ChatMessageChunk from './ChatMessageChunk.vue';
import { HighlightedMessage } from 'src/utils/HighlightMesasge'

export type ChatMessageProps = {
  id: string;
  author: string;
  message: HighlightedMessage
  timestamp: number;
}

const props = defineProps<ChatMessageProps>()
const emits = defineEmits<{
  (e: 'delete', id: string): void
}>()

const now = ref(new Date())
const timeSinceTimer = () => {
  setInterval(() => {
    now.value = new Date()
  }, 15000)
}

const timeAgo = computed(() => {
  const date = new Date(props.timestamp)
  const diff = now.value.getTime() - date.getTime()
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

onMounted(() => {
  timeSinceTimer()
})

const deleteMessage = () => {
  emits('delete', props.id)
}
</script>