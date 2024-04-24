<template>
  <q-layout view="lHh Lpr lFf" class="page-background">
    <q-header class="row justify-center bg-transparent q-px-md">
      <div class="col-auto visible-on-small self-center">
        <q-btn flat round dense icon="menu" color="white" @click="toggleDrawer" />
      </div>
      <div class="col col-md-12 header-background text-h3 text-weight-bold q-pa-md row justify-center">
        <div class="rainbow-text col-auto">
          AI Chat
        </div>
      </div>
      <div class="col-12 col-md-auto input-border q-pa-sm row bg-primary">
        <q-input v-model="token" input-class="col-auto text-white my-input text-h6" borderless placeholder="OpenAI Token" filled text-color="white" :type="showToken ? 'password' : 'text'" />
        <div class="col-auto self-center q-px-md">
          <q-btn flat round dense icon="visibility" color="white" @click="toggleToken" />
        </div>
      </div>
    </q-header>

    <q-drawer 
      show-if-above
      v-model="drawer"
      side="left"
      class="bg-secondary text-white q-pa-sm"
    >
      <div class="drawer-item row" clickable @click="createNewConversation">
        <div class="col-auto text-weight-bolder q-pl-md q-pr-lg rainbow-text">
          AI
        </div>
        <div class="drawer-item-text col self-center">
          <div class="text-weight-bold">New Chat</div>
        </div>
        <div class="drawer-item-icon col-auto q-px-md">
          <q-icon name="library_add" />
        </div>
      </div>
      <q-separator class="bg-white"/>
      <div class="drawer-item row q-col-gutter-x-sm" v-for="conversation of sortedConversation" :key="conversation.id" :conversation="conversation" @click="() => routeToConversation(conversation.id)">
        <!-- <div class="drawer-item-icon col-auto">
          <q-icon name="note" />
        </div> -->
        <div class="drawer-item-text col self-center">
          <div class="text-weight-bold">{{ conversation.summary }}</div>
        </div>

        <div class="drawer-item-interactions col-auto row">
          <q-btn class="self-center" flat round dense icon="delete" color="red-4" @click.stop.prevent="conversationStore.deleteConversation(conversation.id)" />
        </div>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style lang="scss" scoped>
.page-background {
  background-color: #141414;
}

.header-background {
  background-image: linear-gradient(0deg, hsla(0%, 0%, 8%, 0%), hsla(0%, 0%, 8%, 100%), hsla(0%, 0%, 8%, 100%));
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
@media screen and (max-width: 600px) {
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
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useTokenStore } from 'src/stores/tokenStore';

import { useConversationStore } from 'src/stores/conversations';
import { useRouter } from 'vue-router';

const router = useRouter()

const tokenStore = useTokenStore()
const token = ref('')
const showToken = ref(false)

const toggleToken = () => {
  showToken.value = !showToken.value
}

const updateToken = () => {
  tokenStore.setToken(token.value)
}

watch(token, updateToken, { immediate: true })

const drawer = ref(false)
const toggleDrawer = () => {
  drawer.value = !drawer.value
}

const conversationStore = useConversationStore()

const createNewConversation = () => {
  router.push('/')
}

const sortedConversation = computed(() => {
  return [...conversationStore.conversations].sort((a, b) => b.messages.sort((c, d) => c.timestamp - d.timestamp)[0]?.timestamp - a.messages.sort((c, d) => c.timestamp - d.timestamp)[0]?.timestamp)
})
const routeToConversation = (id: string) => {
  router.push(`/${id}`)
}

onMounted(async () => {
  conversationStore.readFromDb()
})
</script>
