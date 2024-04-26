<template>
  <q-page class="row items-stretch q-pa-md justify-center">
    <div class="col-12 col-md-8 col-lg-6 column">
      <!-- Chat history -->
      <div class="col relative full-width">
        <chat-history class="row q-pb-md scrollable q-pr-sm" :messages="messages" />
      </div>

      <!-- Chat input -->
      <div class="col-auto row q-pa-md row justify-center">
        <chat-input />
        <div class="col-auto row q-pt-md justify-center">
          <select v-model="aiAgentSelector" class="text-white bg-primary my-select">
            <option v-for="option in aiAgentOptions" :key="option" :value="option">{{ option }}</option>
          </select>
        </div>
      </div>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
.my-select {
  background-color: $primary;
  border: 2px solid $secondary;
  border-radius: 1rem;
  color: white;
  padding: 0.5rem 1rem;
  cursor: pointer;
}
.relative {
  position: relative;
}
.scrollable {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  display: flow;

  // Attractive scroll bar
  &::-webkit-scrollbar {
    width: 10px;
    border-radius: 10px;

    &-track {
      background: $secondary;
      border-radius: 10px;
    }

    &-thumb {
      background: $accent;
      border-radius: 10px;
    }

    &-thumb:hover {
      background: $accent;
    }
  }

}
</style>

<script setup lang="ts">
import { computed, ref, nextTick, watch, onMounted, onActivated } from 'vue';
import { useRouter } from 'vue-router';

import { useTokenStore } from 'src/stores/tokenStore';
import useCurrentConversation from 'src/composeables/useCurrentConversation';

import ChatHistory from 'src/components/ChatMessage/ChatHistory.vue';
import ChatInput from 'src/components/ChatInput/ChatInput.vue';
import { Message } from 'src/types';

const router = useRouter()

const tokenStore = useTokenStore();
const currentConversation = useCurrentConversation();

const input = ref('');
const aiAgentSelector = ref('ollama (:11434)');
const aiAgentOptions = ref([
  'openai-gpt-3.5-turbo',
  'openai-gpt-4-turbo',
  'ollama (:11434)'
])

const messages = computed<Message[]>(() => {
  const conversation = currentConversation.value;
  return conversation ? conversation.messages : [];
})

</script>