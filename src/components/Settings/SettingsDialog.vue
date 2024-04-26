<template>
  <q-dialog v-model="show" class="" position="bottom" :seamless="false">
    <div class="q-pa-md">
      <div class="row bg-secondary settings-dialog q-pa-md">

        

        <!-- Main Content -->
        <div class="col-12 col-md row">

          <!-- Profile Selection Menu -->
          <div class="col-12 col-md-auto row">
            <q-scroll-area class="col-12" style="height: 30vh; min-width: 15em">
              <q-list class="fit">

                <div
                  v-for="group of groupedModels"
                  :key="group[0].provider.id"
                >
                  <div class="text-h6 text-white">
                    {{ group[0].provider.name }}
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

                <div class="q-pa-md">
                  <q-btn class="text-bold " outline color="positive" @click="openModelCreator">
                    Add Model
                  </q-btn>
                </div>

              </q-list>
            </q-scroll-area>
          </div>

          <!-- Model Editor -->
          <div class="col-12 col-md">
            <div class="row q-pa-md">

              <!-- Model Creator -->
              <div v-if="modelCreator" class="">
                <div class="form-input" style="width: 15em">
                  <input class="q-pa-md my-input text-white" v-model="selectedModel.name" />
                </div>
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
                      <counter-input class="col-auto" v-model="selectedModel.provider.temperature" :step="0.1" @update:model-value="clampTemperature"/>
                      <!-- <input class="col-auto q-pt-sm q-px-md my-input text-white text-h6" type="number" inputmode="decimal" step="0.1" min="0" max="2" v-model.number="selectedModel.provider.temperature" @change="clampTemperature" /> -->
                    </div>
                  </div>
                </div>
              </div>

              <!-- Open Model Editor -->
              <div v-else-if="selectedModel && !selectedModel.provider.isClosed">
                <div class="form-input-border q-pa-sm text-white">
                  <input class="q-pa-md my-input text-white my-number-input" type="number" inputmode="decimal" v-model="selectedModel.name" />
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
.my-number-input {
  width: 5em;

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  } 
  
}
.settings-dialog {
  max-height: 100vh;
  max-width: 100vw;
  border-radius: 2em 2em 2em 2em;
}

@media screen and (min-width: 1000px) {
  .settings-dialog {
    max-height: 30vh;
    max-width: 60vw;
  }
}

.fit-content {
  width: fit-content;
}
.highlightTab {
  background-color: #2c2c2c;
}

.settings-category {
  border-radius: 1em;
  cursor: pointer;
}
.settings-category:hover {
  background-color: #2c2c2c;
}

.category-menu {
  display: flow;
}
</style>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { app } from 'boot/app'
import { Model } from 'src/services/models/types';

import CounterInput from 'components/Inputs/CounterInput.vue'

const show = ref(true)
const modelCreator = ref(false)
const selectedModel = computed(() => app.settings.value.selectedModel)

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
  let temperature = parseFloat(parseFloat(selectedModel.value.provider.temperature).toFixed(2))
  if (temperature > 2) temperature = 2
  if (temperature < 0) temperature = 0
  selectedModel.value.provider.temperature = temperature
}

</script>