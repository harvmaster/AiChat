<template>
  <q-layout view="lHh Lpr lFf" class="page-background">
    <q-header class="row justify-center bg-transparent">
      <div class="col-12 text-center header-background text-h3 text-weight-bold q-pa-md">AI Chat</div>
      <div class="col-12 col-md-auto input-border q-pa-sm row">
        <q-input v-model="token" input-class="col-auto text-white my-input text-h6" borderless placeholder="OpenAI Token" filled text-color="white" :type="showToken ? 'password' : 'text'" />
        <div class="col-auto self-center q-px-md">
          <q-btn flat round dense icon="visibility" color="white" @click="toggleToken" />
        </div>
      </div>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style lang="scss" scoped>
.page-background {
  background-color: #141414;
  // background-color: #ffffff;
}

.header-background {
  background-image: linear-gradient(0deg, hsla(0%, 0%, 8%, 0%), hsla(0%, 0%, 8%, 100%), hsla(0%, 0%, 8%, 100%));
}

// .token-input {
//   border: 2px solid $secondary;
//   border-radius: 1rem;
//   width: 30em;
// }

.input-border {
  border: 2px solid $secondary;
  border-radius: 1rem;
}
</style>

<script setup lang="ts">
import { ref } from 'vue'

const token = ref('')
const showToken = ref(false)

const toggleToken = () => {
  showToken.value = !showToken.value
}
</script>
