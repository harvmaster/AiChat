<template>
  <q-page class="row items-center justify-evenly q-pa-md">
    <div class="col-12 col-md-8 col-lg-6 row">
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
      <div class="col-12 row q-pt-md justify-center">
        <select v-model="aiAgentSelector" class="text-white bg-primary my-select">
          <option v-for="option in aiAgentOptions" :key="option" :value="option">{{ option }}</option>
        </select>
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
  font-weight: 500;
  border: 2px solid $secondary;
  border-radius: 1rem;
}

.my-select {
  background-color: $primary;
  border: 2px solid $secondary;
  border-radius: 1rem;
  color: white;
  padding: 0.5rem 1rem;
  cursor: pointer;
}
</style>

<script setup lang="ts">
import { computed, ref, nextTick, watch, onMounted, onActivated } from 'vue';
import OpenAI from 'openai';
import { useRouter } from 'vue-router';

import { useTokenStore } from 'src/stores/tokenStore';
import { useConversationStore } from 'src/stores/conversations';
import ChatMessage, { ChatMessageProps } from 'src/components/ChatMessage/ChatMessage.vue';

import getHighlightedChunks from 'src/utils/HighlightMesasge';
import { response } from 'express';
import { ChatCompletionChunk } from 'openai/resources/chat/completions';

const router = useRouter()

const tokenStore = useTokenStore();
const conversationStore = useConversationStore();

const input = ref('');
const aiAgentSelector = ref('ollama (:11434)');
const aiAgentOptions = ref([
  'openai-gpt-3.5-turbo',
  'openai-gpt-4-turbo',
  'ollama (:11434)'
])

const currentConversationId = computed(() => router.currentRoute.value.params.id as string);

const messages = ref<ChatMessageProps[]>([
  { id: '1', author: 'AI', message: {
    input: 'Hello World',
    markup: '<p>Hello World</p>',
    chunks: [
      { input: 'Hello World', output: { markup: '<p>Hello World</p>'}, type: 'text'  }
    ]
  }, timestamp: Date.now()},
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
    // Is in a current conversation
    let conversationId = router.currentRoute.value.params.id as string;
    if (!conversationId) {
      conversationId = generateUUID()
      conversationStore.addConversation({
        id: conversationId,
        summary: input.value,
        messages: [],
      })
      router.push('/' + conversationId)
    }

    const openai = new OpenAI({ apiKey: tokenStore.token, dangerouslyAllowBrowser: true });

    const mark = await getHighlightedChunks(input.value);

    const message = {
      id: generateUUID(),
      author: 'User',
      message: mark,
      timestamp: Date.now(),
    }
    
    messages.value.push(message);

    const formattedMessage = messages.value.map(message => {
      return {
        role: message.author === 'AI' ? 'assistant' : 'user',
        content: message.message.input,
      } as OpenAI.ChatCompletionMessage;
    })

    await conversationStore.addMessage(conversationId, {
      id: message.id,
      author: 'User',
      content: input.value,
      timestamp: message.timestamp,
    })

    input.value = '';

    const responseId = generateUUID();
    const agent = getAIAgent();
    const stream = await agent(formattedMessage, true)
    if (!stream) {
      return;
    }

    const asyncStream = stream as AsyncIterable<ChatCompletionChunk | Uint8Array>;
    for await (const chunk of asyncStream) {
      // console.log(chunk.choices[0]?.delta?.content)
      let decoded
      if (chunk instanceof Uint8Array) {
        const decodedChunk = new TextDecoder().decode(chunk)
        const body = JSON.parse(decodedChunk) as { message: { content: string } }
        const content = body?.message?.content
        decoded = content
      }
      if (!(chunk instanceof Uint8Array) && chunk.choices[0]?.delta?.content && !decoded) {
        decoded = chunk.choices[0]?.delta?.content;
      }
      if (!(chunk instanceof Uint8Array) && !chunk.choices[0]?.delta?.content) {
        continue;
      }
      // get existing message
      const message = messages.value.find(message => message.id === '' + responseId);
      const currentText = message?.message.input || '';
      const markup = await getHighlightedChunks(currentText + decoded || '');

      if (!message) {
        messages.value.push({
          id: '' + responseId,
          message: markup,
          author: 'AI',
          timestamp: Date.now(),
        })
      } else {
        message.message = markup;
      }
      
      scrollToBottom()
    }

    const response = messages.value.find(message => message.id === '' + responseId);
    if (!response) {
      return;
    }
    await conversationStore.addMessage(conversationId, {
      id: response.id,
      author: 'AI',
      content: response?.message.input,
      timestamp: response.timestamp,
    })

    if (messages.value.length < 4) {
      const formattedMessage = messages.value.map(message => {
        return {
          role: message.author === 'AI' ? 'assistant' : 'user',
          content: message.message.input,
        } as OpenAI.ChatCompletionMessage;
      })

      const summary = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{
          role: 'system',
          content: `Summarise this conversation in no more than 6 words`,
        },
          {
            role: 'user',
            content: `Summarise: ${formattedMessage.map(message => message.content).join(' ')}`,
          }
        ],
      });
      if (!summary.choices[0]?.message?.content) {
        return;
      }
      conversationStore.updateConversation(conversationId, summary.choices[0]?.message?.content)
    }
  }
};

const deleteMessage = async (id: string) => {
  await conversationStore.deleteMessage(currentConversationId.value, id);
  await getMessages()
  if (messages.value.length == 0) {
    router.push('/')
  }
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
  const scroll = () => {
    const element = document.getElementById('chat-input')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }
  scroll()
}

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const getMessages = async () => {
  const conversationId = router.currentRoute.value.params.id as string;
  if (!conversationId) {
    messages.value = [
      { id: '1', author: 'AI', message: await getHighlightedChunks('Tell me what you\'d like to do'), timestamp: Date.now()},
    ]
    return
  }
  
  const conversation = conversationStore.conversations.find(conversation => conversation.id == conversationId);
  if (!conversation) {
    messages.value = [
      { id: '1', author: 'AI', message: await getHighlightedChunks('Tell me what you\'d like to do'), timestamp: Date.now()},
    ]
    return
  }
  
  const formattedMessagesPromises = conversation.messages.map(async message => {
    const mark = await getHighlightedChunks(message.content);
    return {
      id: message.id,
      author: message.author,
      timestamp: message.timestamp,
      message: mark,
    }
  })
  const formattedMessage = await Promise.all(formattedMessagesPromises);

  messages.value = formattedMessage || [];
}

const getAIAgent = () => {
  const selected = aiAgentSelector.value;
  if (selected == 'openai-gpt-3.5-turbo') {
    const openai = new OpenAI({ apiKey: tokenStore.token, dangerouslyAllowBrowser: true });
    const agent = (messages: OpenAI.ChatCompletionMessage[], stream: boolean) => openai.chat.completions.create({ model: 'gpt-3.5-turbo', messages, stream });
    return agent
  }

  if (selected == 'openai-gpt-4-turbo') {
    const openai = new OpenAI({ apiKey: tokenStore.token, dangerouslyAllowBrowser: true });
    const agent = (messages: OpenAI.ChatCompletionMessage[], stream: boolean) => openai.chat.completions.create({ model: 'gpt-4-turbo', messages, stream });
    return agent
  }

  const agent = async (messages: OpenAI.ChatCompletionMessage[], stream: boolean) => {
    const url = 'http://localhost:11434/api/chat';
    const res = await fetch(url, {
      method: 'POST',
      // headers: {
      //   'Content-Type': 'application/json',
      // },
      body: JSON.stringify({ model: 'llama2', messages }),
    })
    return res.body
  }
  return agent
}

watch(currentConversationId, () => {
  getMessages()
  scrollToBottom()
})

onMounted(async () => {
  await conversationStore.readFromDb()
  getMessages()
  scrollToBottom()
})
</script>
