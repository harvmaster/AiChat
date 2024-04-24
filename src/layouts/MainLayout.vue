<template>
  <q-layout view="lHh Lpr lFf" class="page-background">
    <q-header class="row justify-center bg-transparent q-px-md">
      <div class="col-auto visible-on-small self-center">
        <q-btn flat round dense icon="menu" color="white" @click="toggleDrawer" />
      </div>
      <div class="col col-md-12 text-center header-background text-h3 text-weight-bold q-pa-md">AI Chat</div>
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
      class="bg-secondary"
    >
      <q-list class="text-white">
        <q-item>
          <div class="text-h6">
            Conversations
          </div>
        </q-item>
        <q-item class="full-width" v-for="conversation of sortedConversation" :key="conversation.id" :conversation="conversation" clickable v-ripple :to="`/${conversation.id}`" active-class="bg-accent">
          <q-item-section>
            <q-item-label class="text-h6">{{ conversation.summary }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable @click="createNewConversation">
          <q-item-section avatar>
            <q-icon name="add" class="text-white" size="2em" />
          </q-item-section>
          <q-item-section class="text-h6">
            New Conversation
          </q-item-section>
        </q-item>
      </q-list>
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

onMounted(async () => {
  conversationStore.readFromDb()
})
</script>
