<template>
  <q-page class="row items-stretch q-pa-md justify-center">
    <div class="col-12 col-md-8 col-lg-6 column">
      <!-- Chat history -->
      <div class="col relative full-width">
        <chat-history ref="ChatHistoryElement" v-if="currentConversation" class="row q-pb-md scrollable q-pr-sm" :messages="currentConversation.messages" />
      </div>

      <!-- Chat input -->
      <div class="col-auto row q-pa-md row justify-center">
        <chat-input class="col-12" :loading="loading" @message="handleMessage" />

        <div class="col-auto row q-pt-md justify-center">
          <div class="row pill model-settings-button cursor-pointer" @click="toggleSettings" :class="app.settings.value.selectedModel?.provider.isClosed ? 'q-pa-md' : 'q-pa-sm'">
            <div class="col-auto text-blue-2 text-h6 text-center">
              {{ app.settings.value.selectedModel?.provider.name }}
              ({{ app.settings.value.selectedModel?.model }})
            </div>
            <div class="col-auto text-blue-2 text-h6 q-px-sm">
              <q-icon name="keyboard_arrow_up" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <settings-dialog ref="SettingsDialogElement" />
  </q-page>
</template>

<style scoped lang="scss">
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
.model-settings-button {
  background-color: $primary;
  border: 2px solid $secondary;
  border-radius: 1rem;
  color: white;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background-color 0.25s;
}
.model-settings-button:hover {
  background-color: $secondary;
}
</style>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import { app } from 'boot/app';

import useCurrentConversation from 'src/composeables/useCurrentConversation';

import ChatHistory from 'src/components/ChatMessage/ChatHistory.vue';
import ChatInput from 'src/components/ChatInput/ChatInput.vue';
import SettingsDialog from 'src/components/Settings/SettingsDialog.vue';

import useChatInput from 'src/composeables/useChatInput';
import { useRouter } from 'vue-router';

const router = useRouter()

const currentConversation = useCurrentConversation();

const SettingsDialogElement = ref<InstanceType<typeof SettingsDialog> | null>(null);
const ChatHistoryElement = ref<InstanceType<typeof ChatHistory> | null>(null);

watch(currentConversation, (oldConversation, newConversation) => {
  if (oldConversation?.id == newConversation?.id) return;
  if (ChatHistoryElement.value) {
    nextTick(() => ChatHistoryElement.value?.scrollToBottom());
  }
})

const toggleSettings = () => {
  SettingsDialogElement.value?.toggleVisible();
}

const { loading, addUserMessage, addAssisstantMessage } = useChatInput();
const handleMessage = async (message: string): Promise<void> => {
  if (!currentConversation.value) {
    const conversation = app.createConversation()
    router.push(`/${conversation.id}`).then(() => {
      handleMessage(message)
    })
    return
  }

  await addUserMessage(currentConversation.value, message);
  await addAssisstantMessage(currentConversation.value);
}
</script>