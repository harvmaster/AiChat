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
      <div class="absolute-bottom-right button-container">
        <q-btn
          v-if="jsonError"
          unelevated
          :disable="loading"
          color="accent"
          class="fix-button"
          label="Fix with AI"
          @click="fixWithAI"
        >
          <q-spinner v-if="loading" />
        </q-btn>
      </div>
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

  position: relative;
}

.button-container {
  padding: 2em;
}

.fix-button {
  border-radius: 0.5em 0.5em 1em 0.5em;
  
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
import { ChatHistory, OpenModel } from 'src/services/models';

import useAIGenerator from 'src/composeables/useAIGenerator'

const selectedModel = computed<OpenModel | undefined>(() => app.settings.value.selectedModel as OpenModel)
const advancedSettingsBuffer = ref<string>('')
const jsonError = ref<boolean>(false)

const inputStyles = computed(() => {
  return {
    border: jsonError.value ? '1px solid red' : '1px solid transparent',
  }
})

const { loading, generateAIResponse } = useAIGenerator()

const fixWithAI = async () => {
  const phi3 = app.models.value.find(m => m.model == 'phi3')
  if (!phi3) return

  // const messages = [
    // { content: 'There is an error in the users JSON. Give the user the entire JSON body back with the error corrected. The shape of the intended object is an Ollama API Request Options. All of these options are optional. DO NOT ADD ANY KEYS THAT ARE NOT ALREADY IN THE USERS PROMPT. Respond in only JSON. Nothing else', role: 'system' },
    // { content: advancedSettingsBuffer.value, role: 'user' }
  // ] as ChatHistory 
  
  const prompt = `Please correct this JSON object to be valid and fit the shape of an Ollama API Request Options Object: \n\n${advancedSettingsBuffer.value}. The expected TS type is Partial<{num_keep: number,seed: number,num_predict: number,top_k: number,top_p: number,tfs_z: number,typical_p: number,repeat_last_n: number,temperature: number,repeat_penalty: number,presence_penalty: number,frequency_penalty: number,mirostat: number,mirostat_tau: number,mirostat_eta: number,penalize_newline: boolean,stop: string[],numa: boolean,num_ctx: number,num_batch: number,num_gqa: number,num_gpu: number,main_gpu: number,low_vram: boolean,f16_kv: boolean,vocab_only: boolean,use_mmap: boolean,use_mlock: boolean,rope_frequency_base: number,rope_frequency_scale: number,num_thread: number}>. Responsd with JSON only. Do not provide the key that where not in the incompelte JSON.`

  advancedSettingsBuffer.value = ''
  const res = await generateAIResponse(phi3, prompt, (message) => {
    advancedSettingsBuffer.value += message.message.content
  })
}

watch(app.settings, () => {
  advancedSettingsBuffer.value = JSON.stringify(selectedModel.value?.advancedSettings, null, 2)
})

watch(advancedSettingsBuffer, (newValue, oldValue) => {
  try {
    selectedModel.value!.advancedSettings = JSON.parse(newValue)
    jsonError.value = false
  } catch (e) {
    jsonError.value = true
  }
})

onMounted(() => {
  advancedSettingsBuffer.value = JSON.stringify(selectedModel.value?.advancedSettings, null, 2)
})
</script>