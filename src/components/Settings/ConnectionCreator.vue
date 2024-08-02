<template>
  <div class="column text-white">
    <!-- Type input -->
    <div class="col-auto">
      <div class="text-h5 text-weight-bold">Add Connection</div>
      <div class="row q-gutter-x-sm q-py-sm">
        <div 
          class="option-container col-auto"
          v-ripple
          v-for="engineType in engineTypes"
          :key="engineType"
          :class="{ 'active': engineProps.type == engineType }"
          @click="() => selectEngineType(engineType)"
        >
          {{ engineType }}
        </div>
      </div>
    </div>

    <!-- Name input -->
    <div class="col-auto q-py-sm">
      <input 
        class="my-input text-white text-h6"
        placeholder="Connection Name" 
        v-model="engineProps.name"
      />
    </div>  

    <div class="col-auto q-pa-sm">
      <q-separator color="white" />
    </div>

    <!-- API Token / URL input -->
    <div class="col-auto row items-start">
      <div class="fit-content q-py-sm">
        <div class="input-container pill overflow-hidden bg-accent q-pa-sm">
          <input
            v-if="engineAccessType"
            class="my-input text-white text-h6"
            v-model="engineProps.token"
            placeholder="API Token"
          />
          <input
            v-if="!engineAccessType"
            class="my-input text-white text-h6"
            v-model="engineProps.url"
            placeholder="Host URL"
          />
        </div>
      </div>
    </div>

    <div class="col-auto">
      <q-checkbox v-model="shouldRequestModels" label="Add Available Mdoels" color="accent" />
    </div>

    <!-- Create button -->
    <div class="col-auto row justify-end">
      <q-btn
        outline
        rounded
        class="q-mt-md"
        color="blue-4"
        label="Connect"
        :disable="!isValidEngine"
        @click="createEngine"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.option-container {
  color: white;
  border: solid 1px $blue-4;
  border-radius: 100vw;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.option-container:hover{
  background-color: $blue-2;
  color: $accent;
}

.active {
  background-color: $blue-3;
  color: $accent;
}

</style>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { app } from 'boot/app'

import { EngineProps } from 'src/services/engines';
import { EngineType } from 'src/services/engines/EngineTypes';

const engineProps = ref<EngineProps>({
  type: 'ollama',
  name: '',
  token: '',
  url: ''
})

const shouldRequestModels = ref(false)

const selectedModel = computed(() => app.settings.value.selectedModel)
const engineTypes = computed<EngineType[]>(() => app.engineManager.value.getEngineTypes())
const engineAccessType = computed<boolean>(() => app.engineManager.value.getEngineHandler(engineProps.value.type).isClosed)

const isValidEngine = computed(() => validateEngineProps(engineProps.value) === '')

const selectEngineType = (engineType: EngineType) => {
  engineProps.value.type = engineType.toLowerCase() as EngineType
}

const createEngine = async () => {
  const engine = app.engineManager.value.createEngine(engineProps.value)
  if (shouldRequestModels.value) {
    const availableModels = await engine.getAvailableModels()
    const models = availableModels.map(model => engine.createModel({ name: model, model }).toPortableModel())
    models.forEach(model => app.engineManager.value.importModel(model))
  } else {
    const exampleModel = engine.createModel({ name: 'Example Model', model: 'example' }).toPortableModel()
    app.engineManager.value.importModel(exampleModel)
  }
}

const validateEngineProps = (props: EngineProps) => {
  if (!props.name) {
    return 'Connection name is required'
  }
  if (!engineAccessType.value && !props.url) {
    return 'Host URL is required'
  }
  return ''
}
</script>