<template>
  <div v-if="selectedModel && selectedModel.provider.isClosed" class="column align-start">
    <div class="col-auto text-h6 text-white q-pb-sm">
      {{ selectedModel.name }}
    </div>

    <div class="col-auto row items-start">
      <div class="fit-content q-py-sm">
        <div class="input-container">
          <input class="my-input text-white text-h6" v-model="selectedModel.provider.token" placeholder="API Token"/>
        </div>
      </div>
    </div>

    <div class="col-auto row">
      <div class="row fit-content">
        <div class="col-12 text-white">Temperature</div>
        <counter-input class="col-auto" v-model="selectedModel.advancedSettings.temperature" :step="0.1" @update:model-value="clampTemperature"/>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.input-container {
  border: 1px solid $primary;
  border-radius: 1em;
  padding: 1em;
  max-width: 20em;
}
.align-start {
  align-content: start;
}
</style>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { app } from 'boot/app'

import CounterInput from '../Inputs/CounterInput.vue';

const selectedModel = computed(() => app.settings.value.selectedModel)

const clampTemperature = () => {
  if (!selectedModel.value) return
  let temperature = parseFloat(parseFloat(selectedModel.value.advancedSettings.temperature.toString()).toFixed(2))
  if (temperature > 2) temperature = 2
  if (temperature < 0) temperature = 0
  selectedModel.value.advancedSettings.temperature = temperature
}
</script>

