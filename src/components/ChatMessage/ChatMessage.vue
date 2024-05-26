<template>
  <div
    class="full-width card-background text-white q-py-sm"
  >
    <div class="chat-message q-pa-md row">
      <div class="col-12 q-pb-md row">

        <!-- Message header -> author, timestamp -->
        <div class="col row q-col-gutter-x-sm">
          <div class="col-12 self-center flat-line-height text-h6 text-weight-bold opacity-75">{{ props.message.author }}</div>
          <div class="col-12 self-end flat-line-height text-caption opacity-50">{{ timeAgo }}</div>
        </div>

        <!-- Message header -> Regenerate button, Stop Button, DeleteButton -->
        <div class="col-auto row">
          <transition name="fade">
            <div class="q-mr-sm" v-if="!loading && isLastMessage && props.message.author != 'user'">

            <!-- 
              Commented out due to being inconsistent with results. Need to explore prompts in order to activate again
              Intended use: Continue generating the message from where the AI left off
              should be able to call message.generateAssistantResponse with the same model and history. Maybe add extra system prompt onto the end
            -->
            <!-- 
              <q-btn flat round dense icon="play_arrow" color="green-3" @click="continueMessage">
                <q-tooltip class="bg-secondary text-weight-bold">
                  <div>Continue...</div>
                </q-tooltip>
              </q-btn>
            -->
              

              <q-btn flat round dense icon="refresh" color="green-3" @click="regenerateMessage">
                <q-tooltip class="bg-secondary text-weight-bold">
                  <div>Regenerate...</div>
                </q-tooltip>
              </q-btn>
            </div>
          </transition>
          <transition>
            <div class="q-mr-sm" v-if="!loading">
              <q-btn flat round dense icon="copy_all" color="blue-3" @click="copyRaw">
                <q-tooltip class="bg-secondary text-weight-bold">
                  <div>Copy Raw</div>
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

      <!-- Message has renderable content -->
      <div v-if="message.content.value.chunks" class="col-12 row">
        <div class="col-12" v-for="(chunk, index) of message.content.value.chunks" :key="chunk.raw" >
          <chat-message-chunk :type="chunk.type" :output="chunk.output" :raw="chunk.raw" :index="index" :parentLength="message.content.value.chunks.length"/>
        </div>

        <!-- Image Preview -->
        <div v-if="message.images.length" class="col-12 row q-pt-sm">
          <div class="col-4 q-pa-sm" v-for="image of message.images" :key="image.src">
            <q-img :src="image.src" class="full-width" style="border-radius: 10%; aspect-ratio: 1;"/>
          </div>
        </div>
      </div>

      <!-- Message has no content but is loading -->
      <div v-else-if="loading" class="col-12">
        <q-spinner-dots />
      </div>

      <!-- Message is not loading and has no content -->
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
import { app } from 'boot/app';
import { computed, onMounted, ref } from 'vue';
import Message from 'src/utils/App/Message';

import useCurrentConversation from 'src/composeables/useCurrentConversation';
import deleteMessageFromDatabase from 'src/utils/Database/Messages/deleteMessage';

import ChatMessageChunk from './ChatMessageChunk.vue';
import { Notify, copyToClipboard } from 'quasar';

export type ChatMessageProps = {
  message: Message;
}

const props = defineProps<ChatMessageProps>()

const currentConveration = useCurrentConversation()
const loading = computed(() => props.message.generating)

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
  props.message.abort()
}

const regenerateMessage = () => {
  if (!currentConveration.value || !app.settings.value.selectedModel) return
  props.message.setContent('')
  props.message.generateAssistantResponse(app.settings.value.selectedModel, currentConveration.value.getChatHistory())
}

const copyRaw = async () => {
  const raw = props.message.content.value.raw
  await copyToClipboard(raw)
  Notify.create({
    message: 'Copied to clipboard',
    color: 'green-3',
    position: 'top-right'
  })
}
</script>