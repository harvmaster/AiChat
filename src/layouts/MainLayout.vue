<template>
  <q-layout view="lHh Lpr lFf" class="page-background">
    <q-header class="bg-transparent row justify-center">
      <div class="col-auto text-h3 text-weight-bold q-pa-md">AI Chat</div>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style lang="scss" scoped>
.page-background {
  background-color: #AFCBFF;
}
</style>

<script setup lang="ts"></script>
