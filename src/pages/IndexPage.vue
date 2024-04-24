<template>
  <q-page class="row items-center justify-evenly q-pa-md">
    <div class="col-12 col-md-8 row">
      <!-- Chat history -->
      <div class="col-12 row q-pb-md">
        <chat-message v-for="chatMessage of messages" :key="chatMessage.id" :id="chatMessage.id" :author="chatMessage.author" :message="chatMessage.message" :timestamp="chatMessage.timestamp" @delete="deleteMessage"/>
      </div>

      <!-- Chat input -->
      <div class="col-12 row bg-primary q-pa-md rounded-borders input-border">
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
    </div>
  </q-page>
</template>

<style lang="scss">
p {
  margin: 0;
}

.card-background {
  background-color: $primary;
}

.input-border {
  border: 2px solid $secondary;
  border-radius: 1rem;
}

.chat-message {
  font-size: 1.2rem;
  font-weight: 700;
  border: 2px solid $secondary;
  border-radius: 1rem;
}
</style>

<script setup lang="ts">
import { computed, ref, nextTick } from 'vue';
import OpenAI from 'openai';

import { useTokenStore } from 'src/stores/tokenStore';
import ChatMessage, { ChatMessageProps } from 'src/components/ChatMessage/ChatMessage.vue';

import getHighlightedChunks from 'src/utils/HighlightMesasge';

const tokenStore = useTokenStore();

const input = ref('');
const inputElement = ref<HTMLTextAreaElement | null>(null);

const messages = ref<ChatMessageProps[]>([
  { id: '1', author: 'GPT', message: {
    input: 'Hello World',
    markup: '<p>Hello World</p>',
    chunks: [
      { input: 'Hello World', output: { markup: '<p>Hello World</p>'}, type: 'text'  }
    ]
  }, timestamp: new Date().toISOString()},
]);

const sendMessage = async (event?: KeyboardEvent) => {
  // Dont do anything if its an empty message
  if (!input.value.trim()) return;

  // Is in code block
  const codeWrapperStarts = input.value.match(/^(?:\n|^)```..*?/mgi) || [];
  const wholeCode = input.value.match(/(^(?:\n|^)```..*?\n)([^]*?)(\n```)/gmi) || [];

  if (codeWrapperStarts.length != wholeCode.length) {
    return;
  }

  if (event) {
    event.preventDefault();
  }

  if (input.value.length > 1) {
    const openai = new OpenAI({ apiKey: tokenStore.token, dangerouslyAllowBrowser: true });

    const mark = await getHighlightedChunks(input.value);
    
    messages.value.push({
      id: '' + (messages.value.length + 1),
      author: 'User',
      message: mark,
      timestamp: new Date().toISOString(),
    });

    const formattedMessage = messages.value.map(message => {
      return {
        role: message.author === 'GPT' ? 'assistant' : 'user',
        content: message.message.input,
      } as OpenAI.ChatCompletionMessage;
    })

    input.value = '';

    const responseId = messages.value.length + 1;
    const stream = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: formattedMessage,
      stream: true,
    });
    for await (const chunk of stream) {
      // console.log(chunk.choices[0]?.delta?.content)
      if (!chunk.choices[0]?.delta?.content) {
        continue;
      }
      // get existing message
      const message = messages.value.find(message => message.id === '' + responseId);
      const currentText = message?.message.input || '';
      const markup = await getHighlightedChunks(currentText + chunk.choices[0]?.delta?.content || '');

      if (!message) {
        messages.value.push({
          id: '' + responseId,
          message: markup,
          author: 'GPT',
          timestamp: new Date().toISOString(),
        })
      } else {
        message.message = markup;
      }
      
      scrollToBottom()
    }
  }
};

const deleteMessage = (id: string) => {
  messages.value = messages.value.filter(message => message.id !== id);
};

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
};

const log = (value: any) => {
  console.log(input.value);
};

const inputRows = computed(() => {
  return Math.min(15, input.value.split('\n').length);
});


const scrollToBottom = () => {
  // let timer
  const scroll = () => {
    const element = document.getElementById('chat-input')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }
  scroll()
  
}
</script>
