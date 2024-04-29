<template>
  <div class="col-12 bg-primary q-pa-md rounded-borders input-border row">
    <div class="col text-h6 self-center q-pl-md row">
      <textarea
        id="chat-input"
        type="textarea"
        class="my-input full-width text-white self-center"
        placeholder="Send a message"
        v-model="input"
        :rows="inputRows"
        :disabled="loading"
        @keypress.enter.exact="sendMessage"
        @keydown.tab="handleTab"
        >
      </textarea>
    </div>
      <div class="col-auto self-center">
        <q-spinner v-if="loading" color="white" />
        <q-btn v-else flat round dense icon="send" color="accent" @click="() => sendMessage()" />
      </div>
  </div>
</template>

<style lang="scss" scoped>

</style>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { app } from 'boot/app'
import { useRouter } from 'vue-router'

import isInCodeBlock from 'src/composeables/isInCodeblock'
import generateUUID from 'src/composeables/generateUUID'

import useCurrentConversation from '../../composeables/useCurrentConversation'
import getHighlightedChunks from 'src/utils/HighlightMessage'
import { Message } from 'src/types'
import { ChatHistory } from 'src/services/models'
import { Notify } from 'quasar'

const router = useRouter()
const input = ref('')

const loading = ref(false)

const currentConveration = useCurrentConversation()

const sendMessage = async (event?: KeyboardEvent) => {
  if (!input.value.trim()) return;

  // Check whether inside code block
  if (isInCodeBlock(input.value)) {
    return
  }

  event?.preventDefault()

  let conversation = currentConveration.value
  if (!conversation) {
    conversation = createConversation()
    router.push(`/${conversation.id}`)
  }

  conversation.messages.push({
    id: generateUUID(),
    content: await getHighlightedChunks(input.value),
    createdAt: Date.now(),
    author: 'user',
    modelId: '',
  })

  const model = app.settings.value.selectedModel
  if (!model) {
    return
  }

  input.value = ''
  loading.value = true

  const messageId = generateUUID()
  const messages = convertMessagesToPrompt(conversation.messages)
  const getConversation = () => app.conversations.value.find(c => c.id === conversation.id)
  
  try {
    const res = await model.sendChat({ messages }, async (response) => {
      const existingMessage = getConversation()?.messages.find(m => m.id === messageId)
      if (existingMessage) {
        const content = `${existingMessage.content.raw}${response.message.content}`
        existingMessage.content = await getHighlightedChunks(content)
      } else {
        getConversation()?.messages.push({
          id: messageId,
          content: await getHighlightedChunks(response.message.content),
          createdAt: Date.now(),
          author: 'assistant',
          modelId: model.id,
        })
      }
    })

    const existingMessage = getConversation()?.messages.find(m => m.id === messageId)
    if (existingMessage) existingMessage.content = await getHighlightedChunks(res.message.content)
  } catch(err) {
    console.error(err)
    Notify.create({
      message: 'Failed to send message, please try again later',
      color: 'negative',
      position: 'bottom',
    })
  }

  loading.value = false

  if (conversation.messages.length < 4) {
    const summaryPrompt = createSummaryPrompt(conversation.messages)

    try {
      const resposne = await model.sendChat({ messages: summaryPrompt })
      const conv = getConversation() || conversation
      conv.summary = resposne.message.content
    } catch (err) {
      console.error(err)
      Notify.create({
        message: 'Failed to summarise conversation, please try again later',
        color: 'negative',
        position: 'top-right',
      })
    }
  }

}

const convertMessagesToPrompt = (messages: Message[]): ChatHistory => {
  return messages.map(message => {
    return {
      content: message.content.raw,
      role: message.author === 'user' ? 'user' : 'assistant',
    }
  })
}


const createConversation = () => {
  const conversation = {
    id: generateUUID(),
    messages: [],
    summary: input.value.slice(0, 20),
    createdAt: Date.now(),
  }

  app.conversations.value.push(conversation)

  return conversation
}

const handleTab = (event: KeyboardEvent) => {
  const codeWrappers = input.value.split('```');
  if (codeWrappers.length % 2 == 0) {
    event.preventDefault();
    const target = event.target as HTMLTextAreaElement;
    const cursorPosition = target?.selectionStart

    input.value =
      input.value.substring(0, cursorPosition) +
      '  ' +
      input.value.substring(cursorPosition);
    nextTick(() => {  
      const target = event.target as HTMLTextAreaElement;
      target.selectionStart = target.selectionEnd = cursorPosition + 2;
    });
  }
}

const inputRows = computed(() => {
  return Math.min(5, Math.max(1, input.value.split('\n').length))
})

const createSummaryPrompt = (messages: Message[]): ChatHistory => {
  const formattedMessages = convertMessagesToPrompt(messages)
  return [
    {
      role: 'system',
      content: 'Summarise this conversation into 5 words or less'
    },
    {
      role: 'user',
      content: formattedMessages.map(m => m.content).join(' ')
    }
  ]
}
</script>