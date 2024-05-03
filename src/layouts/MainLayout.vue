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
    </q-header>

    <q-drawer 
      show-if-above
      v-model="drawer"
      side="left"
      class="bg-secondary text-white q-pa-sm"
    >
      <div class="drawer-item row" clickable @click="createConversation">
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
          <div class="text-weight-bold">{{ conversation.summary || conversation.messages.at(0)?.content.value.raw.slice(0, 20) }}</div>
        </div>

        <div class="drawer-item-interactions col-auto row">
          <q-btn class="self-center" flat round dense icon="delete" color="red-4" @click.stop.prevent="() => deleteConversation(conversation)" />
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
</style>

<script setup lang="ts">
import Conversation from 'src/utils/App/Conversation';
import Message from 'src/utils/App/Message';

import { ComputedRef, computed, ref } from 'vue'
import { useRouter } from 'vue-router';
import { app } from 'boot/app'

import deleteConversationFromDatabase from 'src/utils/Database/Conversations/deleteConversation';

const router = useRouter()

const drawer = ref(false)
const toggleDrawer = () => {
  drawer.value = !drawer.value
}

const createConversation = () => {
  router.push('/')
}

const deleteConversation = async (conversation: Conversation) => {
  await deleteConversationFromDatabase(conversation)
  app.conversations.value = app.conversations.value.filter((c) => c.id !== conversation.id)
}

const sortedConversation = computed<Conversation[]>(() => {
  return [...app.conversations.value].sort((a, b) => b.messages.sort((c, d) => c.createdAt - d.createdAt)[0]?.createdAt - a.messages.sort((c, d) => c.createdAt - d.createdAt)[0]?.createdAt)
})
const routeToConversation = (id: string) => {
  router.push(`/${id}`)
}
</script>
