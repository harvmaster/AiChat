<template>
  <q-dialog v-model="show" class="" position="bottom" :seamless="false" full-width>
    <div class="q-pa-md row justify-center fit-content height-70vh items-end" @click="toggleVisible">
      <div class="row relative full-height" @click.stop="() => {}">
        <div class="self-end settings-dialog q-pa-md row bg-secondary">

        <!-- Main Content -->
        <div class="col-12 col-md row ">

          <!-- Profile Selection Menu -->
          <div class="col-12 col-md-auto row">
            <model-list />
          </div>

          <q-separator v-if="Platform.is.mobile" horizontal class="col-12 bg-accent text-accent q-pm-xs" style="background-color: white; height: 2px"/>

          <!-- Model Editor -->
          <div class="col-12 col-md row fit-content">
            <div class="row col-12 col-md-auto q-pa-md fit-content">

              <!-- Model Editors based on type of model -->
              <closed-source-model-editor v-if="selectedModel && selectedModel.provider.isClosed" />
              <open-source-model-editor v-else-if="selectedModel && !selectedModel.provider.isClosed" />

            </div>
          </div>


        </div> 
      </div>
      <div v-if="showAdvanced" ref="advancedSettingsMenu" class="advanced-input-container row items-end" :style="`width: calc(${advancedSettingsMenuWidth}px - 3em)`"  @click.prevent.stop="() => {}">
        <div class="col-12 row advanced-input col-12">
          <textarea v-if="selectedModel" class="my-input json-input text-white text-h6 bg-primary" autocorrect="off" v-model="advancedSettingsBuffer" placeholder="Advanced Settings" />
          <div v-if="advancedSettingsErrors" class="advanced-input-error">
            <p class="text-white text-h6">Invalid JSON</p>
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
    max-width: 40vw;
    overflow-y: auto;
  }
  .scroll-area {
    width: 15em;
    min-height: 10em;
    height: fit-content;
    max-height: 30vh;
  }
}
.advanced-input-container {
  position: absolute;
  right: 0;
  bottom: 0;
  min-height: 10em;
  max-height: 70vh;
  height: 100%;
  min-width: 20em;
  width: fit-content;
  overflow: hidden;
  padding: 1em 1em 0em 1em;
  transform: translateX(100%);
  // z-index: 1
}
.advanced-input {
  padding: 1em;
  height: 100%;
  width: 100%;
  background-color: $secondary;
  border-radius: 2em;
  overflow: hidden;
  caret-color: white;
  position: relative;

  z-index: -1;

  &::-webkit-scrollbar {
    width: 10px;
    border-radius: 10px;
    transform: translateX(-1em);

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
.json-input {
  border-radius: 1em;
  padding: 1em;
  display: inline-block;
  width: 100%;

  // white caret
  caret-color: white;
  caret-shape: bar;

  &::-webkit-scrollbar {
    width: 10px;
    border-radius: 10px;
    transform: translateX(-1em);

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

  // Resize Text Area button styling
  &::-webkit-resizer {
    background-color: $accent;
    // border-radius: 1em;
    display: none;
  }

}
.height-70vh {
  height: 70vh;
}
.advanced-input-error {
  position: absolute;
  bottom: 0;
  right: 0;
  left: 0;
  padding: 1em;
  background-color: $red;
  border-radius: 1em 1em 0 0;
  width: 90%;
  transform: translateX(5%);
  // transform: translateY(-100%);
  transition: transform 0.5s;
}
</style>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { app } from 'boot/app'

import { Platform, QPopupEdit } from 'quasar';

import ModelList from './ModelList.vue';
import ClosedSourceModelEditor from './ClosedSourceModelEditor.vue';
import OpenSourceModelEditor from './OpenSourceModelEditor.vue';

const show = ref(false)
const toggleVisible = () => {
  show.value = !show.value
}
defineExpose({ toggleVisible: () => toggleVisible() })

const selectedModel = computed(() => app.settings.value.selectedModel)

const advancedSettingsMenu = ref<HTMLElement | null>(null)
const showAdvanced = ref(true)
const toggleAdvanced = () => {
  showAdvanced.value = !showAdvanced.value
}

const advancedSettingsMenuWidth = computed(() => {
  // Width should be available space from left of element to right side of screen
  if (!advancedSettingsMenu.value) return 0
  const rect = advancedSettingsMenu.value.getBoundingClientRect()
  return window.innerWidth - rect.left
})

const advancedSettingsBuffer = ref('')
const advancedSettingsErrors = ref(false)
watch(advancedSettingsBuffer, () => {
  try {
    console.log('updated Settings')
    const options = JSON.parse(advancedSettingsBuffer.value)
    advancedSettingsErrors.value = false
  } catch (err) {
    advancedSettingsErrors.value = true
    console.error(err)
  }
})

watch(() => selectedModel.value?.id, (newValue, oldValue) => {
  console.log('changed model', selectedModel.value?.advancedSettings)
  advancedSettingsBuffer.value = selectedModel.value?.advancedSettings || ''
})
</script>