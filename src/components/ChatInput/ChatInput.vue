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
import useAIChat from 'src/composeables/useAIChat'
import { ChatHistory } from 'src/services/models'
import { Notify } from 'quasar'

import Message from 'src/utils/App/Message'
import Conversation from 'src/utils/App/Conversation'

const router = useRouter()
const input = ref('')

const { loading, getChatResponse } = useAIChat()

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

  conversation.messages.push(new Message({
    id: generateUUID(),
    content: { raw: input.value },
    createdAt: Date.now(),
    author: 'user',
  }))

  const model = app.settings.value.selectedModel
  if (!model) {
    return
  }

  input.value = ''

  const messageId = generateUUID()
  const messages = conversation.getChatHistory()
  const getConversation = () => app.conversations.value.find(c => c.id === conversation.id)
  
  const message = new Message({
    id: messageId,
    content: { raw: '' },
    createdAt: Date.now(),
    modelId: model.id,
    author: 'assisstant'
  })
  getConversation()?.messages.push(message)

  try {
    const res = await getChatResponse(model, messages, async (response) => {
      message.content.value.raw += response.message.content
    })
    message.content.value.raw = res.message.content
  } catch(err) {
    console.error(err)
    Notify.create({
      message: 'Failed to send message, please try again later',
      color: 'negative',
      position: 'bottom',
    })
  }

  if (conversation.messages.length < 4) {
    const conv = getConversation()
    if (!conv) return
    getConversationSummary(conv)
  }

}

const createConversation = () => {
  const conversation = new Conversation({
    id: generateUUID(),
    messages: [],
    summary: input.value.slice(0, 20),
  })

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

const createSummaryPrompt = (conversation: Conversation): ChatHistory => {
  const formattedMessages = conversation.getChatHistory()
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

const getConversationSummary = async (conversation: Conversation) => {
  try {
    const res = await app.settings.value.selectedModel?.sendChat({ messages: createSummaryPrompt(conversation) })
    if (!res) return
    conversation.summary = res?.message.content
  } catch (err) {
    console.error(err)
    Notify.create({
      message: 'Failed to summarise conversation, please try again later',
      color: 'negative',
      position: 'top-right',
    })
  }
}
</script>