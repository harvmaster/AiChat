<template>
  <div class="options-container">
    <form autocorrect="off">
      <textarea 
      v-if="selectedModel" 
      v-model="advancedSettingsBuffer"
      :style="inputStyles" 
      class="json-editor text-white text-h6 bg-primary" 
      autocorrect="off" 
      spellcheck="false"
      placeholder="Advanced Settings"
      />
    </form>
  </div>
</template>

<style scoped lang="scss">
.options-container {
  width: 100%;
  height: 100%;
  padding: 1em;
  background-color: $secondary;
  border-radius: 2em;
}

.json-editor {
  display: block;
  border: none;
  width: 100%;
  height: 70vh;
  background-color: $primary;
  
  border-radius: 1em;
  padding: 1em;

  overflow-y: auto;

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

  &::-webkit-resizer {
    display: none;
  }
}
.json-editor:focus {
  outline: none;
}
</style>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { app } from 'boot/app'
import { OpenModel } from 'src/services/models';

const selectedModel = computed<OpenModel | undefined>(() => app.settings.value.selectedModel as OpenModel)
const advancedSettingsBuffer = ref<string>('')
const jsonError = ref<boolean>(false)

const inputStyles = computed(() => {
  return {
    border: jsonError.value ? '1px solid red' : '1px solid transparent',
  }
})

watch(app.settings, (newValue, oldValue) => {
  console.log('test')
  advancedSettingsBuffer.value = JSON.stringify(selectedModel.value?.advancedSettings, null, 2)
})

watch(advancedSettingsBuffer, (newValue, oldValue) => {
  try {
    selectedModel.value!.advancedSettings = JSON.parse(newValue)
    jsonError.value = false
  } catch (e) {
    console.error(e)
    jsonError.value = true
  }
})

onMounted(() => {
  advancedSettingsBuffer.value = JSON.stringify(selectedModel.value?.advancedSettings, null, 2)
})
</script>