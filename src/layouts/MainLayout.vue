<template>
  <q-layout view="lHh Lpr lFf" class="page-background">
    <q-header class="row justify-center bg-transparent">
      <div class="col text-center header-background text-h3 text-weight-bold q-pa-md">AI Chat</div>
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
</style>

<script setup lang="ts"></script>
