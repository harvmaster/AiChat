<template>
  <div
    class="full-width card-background text-white q-py-sm"
  >
    <div class="chat-message q-pa-md row">
      <div class="col-12 q-pb-md row">
        <div class="col row q-col-gutter-x-sm">
          <div class="col-12 self-center flat-line-height text-h6 text-weight-bold opacity-75">{{ props.message.author }}</div>
          <div class="col-12 self-end flat-line-height text-caption opacity-50">{{ timeAgo }}</div>
        </div>
        <div class="col-auto row">
          <transition name="fade">
            <div class="q-mr-sm" v-if="!loading && isLastMessage">
              <!-- <q-btn flat round dense icon="play_arrow" color="green-3" @click="continueMessage">
                <q-tooltip class="bg-secondary text-weight-bold">
                  <div>Continue...</div>
                </q-tooltip>
              </q-btn> -->
              <q-btn flat round dense icon="refresh" color="green-3" @click="regenerateMessage">
                <q-tooltip class="bg-secondary text-weight-bold">
                  <div>Regenerate...</div>
                </q-tooltip>
              </q-btn>
            </div>
          </transition>
          <transition name="fade" mode="out-in">
            <q-btn :key="'stop-button'" v-if="loading" flat round dense icon="stop_circle" color="red-4 opacity-50 opacity-h-75 transition-025" @click="stopGeneration" />
            <q-btn :key="'delete-button'" v-else flat round dense icon="delete" :disable="loading" color="red-4 opacity-50 opacity-h-75 transition-025" @click="deleteMessage" />
          </transition>
        </div>
      </div>
      <div v-if="message.content.value.chunks" class="col-12">
        <div class="" v-for="(chunk, index) of message.content.value.chunks" :key="chunk.raw" >
          <chat-message-chunk :type="chunk.type" :output="chunk.output" :raw="chunk.raw" :index="index" :parentLength="message.content.value.chunks.length"/>
        </div>
      </div>
      <div v-else-if="loading" class="col-12">
        <q-spinner-dots />
      </div>
      <div v-else class="col-12 row">
        <div class="col-12 q-pb-md">Failed to load message</div>
        <q-btn outline color="red-4" label="Regenerate Mesasge" @click="regenerateMessage"/>
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
p {
  margin: 0;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>

<script setup lang="ts">
import Message from 'src/utils/App/Message';

import { computed, onMounted, ref } from 'vue';

import useCurrentConversation from 'src/composeables/useCurrentConversation';
import deleteMessageFromDatabase from 'src/utils/Database/Messages/deleteMessage';

import ChatMessageChunk from './ChatMessageChunk.vue';
import useGenerationList from 'src/composeables/useGenerationList';
import useChatInput from 'src/composeables/useChatInput';

export type ChatMessageProps = {
  message: Message;
}

const props = defineProps<ChatMessageProps>()

const currentConveration = useCurrentConversation()

const { currentlyGenerating } = useGenerationList()
const loading = computed(() => !!currentlyGenerating.value[currentConveration.value?.id || '']?.messages[props.message.id])

const isLastMessage = computed(() => {
  if (!currentConveration.value) return false
  return currentConveration.value.messages.at(-1)?.id === props.message.id
})

const now = ref(new Date())
const timeSinceTimer = () => {
  setInterval(() => {
    now.value = new Date()
  },  3623) // 3623 is a prime number, will hopefully make it feel a little more authentic with its updates
}

const timeAgo = computed(() => {
  const date = new Date(props.message.createdAt)
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
  const conversation = currentConveration.value
  if (!conversation) return

  const index = conversation.messages.findIndex(message => message.id === props.message.id)
  if (index === -1) return

  conversation.messages.splice(index, 1)
  deleteMessageFromDatabase(props.message)
}

const stopGeneration = () => {
  currentlyGenerating.value[currentConveration.value?.id || '']?.messages[props.message.id]?.()
}

const { generateAssisstantResponse } = useChatInput()
const regenerateMessage = () => {
  if (!currentConveration.value) return
  props.message.setContent('')
  generateAssisstantResponse(currentConveration.value, props.message)
}
const continueMessage = () => {
  if (!currentConveration.value) return
  generateAssisstantResponse(currentConveration.value, props.message)
}
</script>