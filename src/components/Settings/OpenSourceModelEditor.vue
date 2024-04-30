<template>
  <div v-if="selectedModel && !selectedModel.provider.isClosed" class="column align-start fit-content">
    <div class="text-white col-auto row q-pb-sm">
      <div class="col-auto q-pr-sm">
        <q-btn flat round dense icon="edit" color="white" @click="focusOpenModelName" />
      </div>
      <input ref="openModelName" class="my-input text-white my-number-input text-h6 col" v-model="selectedModel.model" />
      <div class="col-auto">
        <q-btn flat round dense icon="delete" color="red-4" @click="deleteModel" />
      </div>
    </div>

    <div class="col-auto row items-start">
      <div class="col-12 col-md-auto q-py-sm">
        <div class="input-container">
          <input class="my-input text-white text-h6" v-model="selectedModel.provider.url" placeholder="URL"/>
        </div>
      </div>
    </div>

    <div class="col-auto row">
      <div class="row fit-content q-py-sm">
        <div class="col-12 text-white">Temperature</div>
        <counter-input class="col-auto" v-model="selectedModel.advancedSettings.temperature!" :step="0.1" @update:model-value="clampTemperature"/>
      </div>
    </div>

    <div class="col-auto row q-py-sm">
      <div class="fit-content">
        <q-btn flat label="Advanced Settings" rounded color="blue-3" @click="toggleAdvanced"/>
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
import { computed, ref, defineEmits, watch} from 'vue'
import { app } from 'boot/app'

import CounterInput from '../Inputs/CounterInput.vue';

import deleteModelFromDatabase from 'src/utils/Database/Models/deleteModel'
import { OpenModel } from 'src/services/models';

const selectedModel = computed<OpenModel | undefined>(() => app.settings.value.selectedModel as OpenModel)

const clampTemperature = () => {
  if (!selectedModel.value) return
  if (!selectedModel.value.advancedSettings) return selectedModel.value.advancedSettings = { temperature: 1 }
  if (!selectedModel.value.advancedSettings.temperature && isNaN(selectedModel.value.advancedSettings.temperature as number)) return selectedModel.value.advancedSettings.temperature = 1
  
  let temperature = parseFloat(parseFloat(selectedModel.value.advancedSettings.temperature?.toString() as string).toFixed(2))
  if (isNaN(temperature)) temperature = 1
  if (temperature > 2) temperature = 2
  if (temperature < 0) temperature = 0
  selectedModel.value.advancedSettings.temperature = temperature
}

const openModelName = ref<HTMLInputElement | null>(null)
const focusOpenModelName = () => {
  if (!selectedModel.value) return
  openModelName.value?.focus()
}

const deleteModel = () => {
  if (!selectedModel.value) return
  deleteModelFromDatabase(selectedModel.value)
  app.models.value = app.models.value.filter(model => model.id !== selectedModel.value?.id)
  app.settings.value.selectedModel = app.models.value[0]
}

watch(() => app.settings.value.selectedModel?.advancedSettings.temperature, () => {
  clampTemperature()
})

const toggleAdvanced = () => {
  emits('toggleAdvanced')
}

const emits = defineEmits(['toggleAdvanced'])
</script>
