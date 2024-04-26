<template>
  <q-dialog v-model="show" class="" position="bottom" :seamless="false" full-width>
    <div class="q-pa-md row justify-center fit-content">
      <div class="row bg-secondary settings-dialog q-pa-md overflow-hidden">

        

        <!-- Main Content -->
        <div class="col-12 col-md row ">

          <!-- Profile Selection Menu -->
          <div class="col-12 col-md-auto row">
            <div class="col-12 scroll-area">
            <!-- <q-scroll-area class="col-12" style="height: 30vh; min-width: 15em"> -->
              <q-list class="fit">

                <div
                  v-for="group of groupedModels"
                  :key="group[0].provider.id"
                >
                  <div class="text-h6 text-white row">
                    <div class="col-auto self-center q-pr-sm"> 
                      {{ group[0].provider.name }}
                    </div>
                    <div class="col-auto">
                      <q-btn class="text-bold " outline color="white" flat icon="add" round @click="openModelCreator">
                        <q-tooltip>
                          Add Model
                        </q-tooltip>
                      </q-btn>
                    </div>
                  </div>
                  <q-item
                    v-for="model of group"
                    :key="model.id"
                    clickable
                    v-ripple
                    @click="() => selectModel(model)"
                  >
                    <q-item-section>
                      <q-item-label class="text-white">{{ model.name }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </div>

                <div class="q-pa-md text-white text-bold row cursor-pointer">
                  <div class="col-auto self-center">
                    Add Provider
                  </div>
                  <div class="col-auto self-center text-h6 q-px-md">
                    +
                  </div>
                  
                  <q-popup-edit ref="addProviderPopup" v-model="newProvider" label="Provider" class="bg-accent" >
                    <input v-model="newProvider" autofocus class="my-input text-white text-h6" placeholder="Provider Name" @keydown.enter="createProvider"/>
                  </q-popup-edit>

                  <!-- <q-btn class="text-bold " outline color="positive" @click="openModelCreator">
                    Add Provider
                  </q-btn> -->
                </div>

              </q-list>
            <!-- </q-scroll-area> -->
            </div>
          </div>

          <!-- Model Editor -->
          <div class="col-12 col-md row fit-content">
            <div class="row col-12 col-md-auto q-pa-md">

              <!-- Model Creator -->
              <div v-if="modelCreator" class="row">
                <div class="col-12 row">
                  <div class="col-12">
                    <!-- <q-input filled v-model="modelCreatorData.provider.name" placeholder="Provider" input-class="text-white" label-color="white" bg-color="accent" color="white"/> -->
                  </div>
                  <q-dialog v-model="modelCreator" class="settings-dialog" :seamless="false">
                    <div class="q-pa-md text-h6 text-white">
                      test
                    </div>
                  </q-dialog>

                </div>
                <!-- <div class="form-input" style="width: 15em"> -->
                  <!-- <input class="q-pa-md my-input text-white" v-model="modelCreatorData.provider.name" /> -->
                <!-- </div> -->
              </div>

              <!-- Closed Model Editor -->
              <div v-else-if="selectedModel && selectedModel.provider.isClosed" class="row">
                <div class="col-12 text-h6 text-white q-pb-sm">
                  {{ selectedModel.name }}
                </div>
                <div class="col-12 row">
                  <div class="col-12 q-py-sm">
                    <q-input filled v-model="selectedModel.provider.token" label="API Key" input-class="text-white" label-color="white" bg-color="accent" color="white"/>
                  </div>
                  <div class="col-auto q-py-sm row q-pa-sm">
                    <div class="col-12 text-white">Temperature</div>
                    <div class="col-auto row">
                      <counter-input class="col-auto" v-model="selectedModel.temperature" :step="0.1" @update:model-value="clampTemperature"/>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Open Model Editor -->
              <div v-else-if="selectedModel && !selectedModel.provider.isClosed" class="col-12 row items-start justify-start align-start">
                <div class="text-white col-12 row">
                  <div class="col-auto q-pr-sm">
                    <q-btn flat round dense icon="edit" color="white" @click="focusOpenModelName" />
                  </div>
                  <input ref="openModelName" class="my-input text-white my-number-input text-h6 col-auto" v-model="selectedModel.name" />
                </div>

                <div class="col-12 row items-start">
                  <div class="fit-content q-py-sm">
                    <div class="input-container">
                      <input class="my-input text-white text-h6" v-model="selectedModel.provider.url" placeholder="URL"/>
                    </div>
                  </div>
                </div>

                <div class="col-12 row">
                  <div class="row fit-content">
                    <div class="col-12 text-white">Temperature</div>
                    <counter-input class="col-auto" v-model="selectedModel.temperature" :step="0.1" @update:model-value="clampTemperature"/>
                  </div>
                </div>
              </div>


            </div>
          </div>


        </div>  
      </div>
    </div>
  </q-dialog>
</template>

<style lang="scss" scoped>
.form-input-border {
  border: 2px solid $primary;
  border-radius: 1em;
}
.input-container {
  border: 1px solid $primary;
  border-radius: 1em;
  padding: 1em;
  max-width: 20em;
}
.align-start {
  align-content: start;
}
.settings-dialog {
  max-height: 100vh;
  max-width: 100vw;
  border-radius: 2em 2em 2em 2em;
}

.fit-content {
  width: fit-content;
}

.scroll-area {
  min-height: 10em;
  height: fit-content;
  max-height: 50vh;
  width: 100%;

  overflow-y: auto;
  overflow-x: hidden;
  display: flow;

  // Attractive scroll bar
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
}

@media screen and (min-width: 1000px) {
  .settings-dialog {
    max-height: 40vh;
    max-width: 60vw;
    overflow-y: auto;
  }
  .scroll-area {
    width: 15em;
    min-height: 10em;
    height: fit-content;
    max-height: 30vh;
  }
}

</style>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { app } from 'boot/app'

import { QPopupEdit } from 'quasar';
import { Model, OpenModel } from 'src/services/models/types';

import CounterInput from 'components/Inputs/CounterInput.vue'
import { OllamaModel, OllamaProvider } from 'src/services/models/ollama';
import generateUUID from 'src/composeables/generateUUID'

const show = ref(true)
const modelCreator = ref(false)
const selectedModel = computed(() => app.settings.value.selectedModel)

const addProviderPopup = ref<QPopupEdit | null>(null)
const openModelName = ref<HTMLInputElement | null>(null)


const generateProvider = () => new OllamaProvider(generateUUID(), '', '')
const generateModel = () => new OllamaModel(generateUUID(), generateProvider(), 1, 'Example model')

const newProvider = ref('')

const models = app.models.value

type ModelGroups = {
  [key: string]: Model[]
}
const groupedModels = computed(() => {
  const grouped: ModelGroups = {}
  console.log(models)
  models.forEach(model => {
    if (!grouped[model.provider.id]) {
      grouped[model.provider.id] = []
    }
    grouped[model.provider.id].push(model)
  })
  return grouped
})

const log = (model: Model) => {
  console.log(model)
}

const openModelCreator = () => {
  modelCreator.value = true
}

const selectModel = (model: Model) => {
  modelCreator.value = false
  app.settings.value.selectedModel = model
}

const clampTemperature = () => {
  if (!selectedModel.value) return
  let temperature = parseFloat(parseFloat(selectedModel.value.temperature.toString()).toFixed(2))
  if (temperature > 2) temperature = 2
  if (temperature < 0) temperature = 0
  selectedModel.value.temperature = temperature
}

const createProvider = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    app.models.value.push(new OllamaModel(generateUUID(), new OllamaProvider(generateUUID(), newProvider.value, ''), 1, 'Example model'))
    modelCreator.value = false
    addProviderPopup.value?.hide()
    newProvider.value = ''
  }
}

const focusOpenModelName = () => {
  const input = openModelName.value as HTMLInputElement
  input.focus()
}

</script>