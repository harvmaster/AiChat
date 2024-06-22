<template>
  <q-layout view="lHh Lpr lFf" class="page-background">
    <q-header class="row justify-center bg-transparent q-px-md">
      <div class="col-auto visible-on-small self-center">
        <q-btn flat round dense icon="menu" color="white" @click="toggleDrawer" />
      </div>
      <div
        class="col col-md-12 header-background text-h3 text-weight-bold q-pa-md row justify-center"
      >
        <div class="rainbow-text col-auto">AI Chat</div>
        <!-- <div class="col-auto">
          <q-btn flat round dense icon="refresh" color="white" @click="printConversations" />
        </div> -->
      </div>
    </q-header>

    <q-drawer show-if-above v-model="drawer" side="left" class="bg-secondary text-white column">
      <div class="drawer-list q-pa-sm col ac-scrollbar">
        <div class="drawer-item row" clickable @click="createConversation">
          <div class="col-auto text-weight-bolder q-pl-md q-pr-lg rainbow-text">AI</div>
          <div class="drawer-item-text col self-center">
            <div class="text-weight-bold">New Chat</div>
          </div>
          <div class="drawer-item-icon col-auto q-px-md">
            <q-icon name="library_add" />
          </div>
        </div>
        <q-separator class="bg-white" />
        <div
          class="drawer-item row q-col-gutter-x-sm"
          v-for="conversation of sortedConversations"
          :key="conversation.id"
          :conversation="conversation"
          @click="() => routeToConversation(conversation.id)"
        >
          <!-- <div class="drawer-item-icon col-auto">
            <q-icon name="note" />
          </div> -->
          <div class="drawer-item-text col self-center">
            <div class="text-weight-bold">
              {{
                conversation.summary || conversation.messages.at(0)?.content.value.raw.slice(0, 20)
              }}
            </div>
          </div>

          <div class="drawer-item-interactions col-auto row">
            <q-btn
              class="self-center"
              flat
              round
              dense
              icon="delete"
              color="red-4"
              @click.stop.prevent="() => deleteConversation(conversation)"
            />
          </div>
        </div>
      </div>
      <div class="drawer-footer row q-pa-sm bg-secondary items-center">
        <div class="github-link col-auto">
          <q-btn
            flat
            round
            icon="img:github-white.svg"
            target="_blank"
            href="https://github.com/harvmaster/AiChat"
          />
        </div>

        <div class="col text-grey-6 text-weight-bolder text-">Version: {{ app.version.value }}</div>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer
      class="bg-secondary text-grey-6 text-weight-medium q-pa-sm"
      v-if="app.settings.value.showMetrics && !app.settings.value.selectedModel?.engine.isClosed"
    >
      <div class="row q-col-gutter-md">
        <div class="col-auto">Tokens/s: {{ app.metrics.value.tps.toFixed(2) }}</div>
        <div class="col-auto">
          Eval_tokens/s:
          {{
            app.metrics.value.prompt_time
              ? (
                  (app.metrics.value.prompt_count / app.metrics.value.prompt_time) *
                  10 ** 9
                )?.toFixed(2)
              : 0
          }}
        </div>
        <div class="col-auto">
          Memory Usage: {{ (app.metrics.value.memory_usage / 1024 / 1024 / 1024).toFixed(2) }} GB
        </div>
      </div>
    </q-footer>
  </q-layout>
</template>

<style lang="scss" scoped>
.page-background {
  background-color: #141414;
}

.header-background {
  background-image: linear-gradient(
    0deg,
    hsla(0%, 0%, 8%, 0%),
    hsla(0%, 0%, 8%, 100%),
    hsla(0%, 0%, 8%, 100%)
  );
}

.input-border {
  border: 2px solid $secondary;
  border-radius: 1rem;
}

.my-input {
  background-color: $primary;
}

.visible-on-small {
  display: none;
}
@media screen and (max-width: 1023px) {
  .visible-on-small {
    display: inline-block;
  }
}
.drawer-item {
  border-radius: 0.5rem;
  margin: 0.5rem;
  padding: 0.5rem;
  cursor: pointer;
  font-size: 1.1rem;
  overflow: hidden;
  position: relative;
}
.drawer-item-interactions {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  transform: translate(0, 0%);
  background-image: linear-gradient(90deg, $accent, $secondary, $secondary);

  visibility: hidden;
  opacity: 0;
  transition: opacity 0.25s, visibility 0s;
}

.drawer-item:hover {
  background-color: $accent;

  .drawer-item-interactions {
    visibility: visible;
    opacity: 1;
  }
}

.drawer-item-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rainbow-text {
  background-image: linear-gradient(to left, rgb(79, 79, 255), rgb(255, 97, 97));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.github-link {
  position: sticky;
  bottom: 0;
  left: 0;
}

.drawer-list {
  overflow-y: auto;
  overflow-x: hidden;
  max-width: 100%;
}
</style>

<script setup lang="ts">
import Conversation from 'src/utils/App/Conversation';

import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { app } from 'boot/app';

import deleteConversationFromDatabase from 'src/utils/Database/Conversations/deleteConversation';

import useModelFromURL from 'src/composeables/useModelFromURL';
import useCurrentConversation from 'src/composeables/useCurrentConversation';

const router = useRouter();
const currentConversation = useCurrentConversation();

const { checkURLForModel } = useModelFromURL();

const drawer = ref(false);
const toggleDrawer = () => {
  drawer.value = !drawer.value;
};

const createConversation = () => {
  router.push('/');
};

const deleteConversation = async (conversation: Conversation) => {
  await deleteConversationFromDatabase(conversation);
  app.conversations.value = app.conversations.value.filter((c) => c.id !== conversation.id);
  sortConversations();

  if (router.currentRoute.value.params.id === conversation.id) {
    router.push('/');
  }
};

const unloadCurrentConversation = () => {
  if (currentConversation.value) {
    currentConversation.value.unloadMessages();
  }
};

const loadConverstionMessages = async (conversation: Conversation) => {
  await conversation.loadMessages();
};

watch(app.conversations.value, () => {
  // console.log('conversations changed, start sorting')
  sortConversations();
});
watch(
  () => app.conversations.value.length,
  () => sortConversations()
);

const sortedConversations = ref<Conversation[]>([]);
const sortConversations = () => {
  sortedConversations.value = app.conversations.value.toSorted(
    (a, b) =>
      b.messages.sort((c, d) => c.createdAt - d.createdAt)[0]?.createdAt -
      a.messages.sort((c, d) => c.createdAt - d.createdAt)[0]?.createdAt
  );
};

const routeToConversation = async (id: string) => {
  const conversation = app.conversations.value.find((c) => c.id === id);
  if (!conversation) {
    return;
  }

  if (router.currentRoute.value.params.id === id) {
    return;
  }

  unloadCurrentConversation();
  await loadConverstionMessages(conversation);
  router.push(`/${id}`);
};

// const printConversations = () => {
//   const cs = app.conversations.value.map(conversation => {
//     return {
//       // lastMessage: conversation.messages.at(-1)?.createdAt,
//       id: conversation.id,
//       messages: conversation.messages,
//       summary: conversation.summary
//     }
//   })

//   console.log(cs)
// }

app.on('app:loaded', () => {
  console.log('app loaded');
  console.log('current conversation', currentConversation.value);
  currentConversation.value?.loadMessages();
  sortConversations();
});

onMounted(() => {
  console.log('mounted');
  currentConversation.value?.loadMessages();
  sortConversations();
  checkURLForModel();
});
</script>
