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
        @keypress.enter.exact="sendMessage"
        @keydown.tab="handleTab"
        >
      </textarea>
    </div>
      <div class="col-auto self-center">
        <q-btn flat round dense icon="send" color="accent" @click="() => sendMessage()" />
      </div>
  </div>
</template>

<style lang="scss" scoped>
.input-border {
  border: 2px solid $secondary;
  border-radius: 1rem;
}
</style>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { app } from 'boot/app'
import { useRouter } from 'vue-router'

import isInCodeBlock from 'src/composeables/isInCodeblock'
import useCurrentConversation from '../../composeables/useCurrentConversation'
import getHighlightedChunks from 'src/utils/HighlightMessage'

const router = useRouter()
const input = ref('')

const currentConveration = useCurrentConversation()

const sendMessage = async (event?: KeyboardEvent) => {
  if (!input.value.trim()) return;

  // Check whether inside code block
  if (isInCodeBlock(input.value)) {
    return
  }

  let conversation = currentConveration.value
  console.log(conversation)
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

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
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

</script>../../composeables/useCurrentConversation