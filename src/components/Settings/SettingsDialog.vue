<template>
  <q-dialog
    v-model="show"
    class="row justify-center"
    transition-show="slide-up"
    transition-hide="slide-down"
    maximized
    :seamless="false"
  >
    <!-- Wrap contents in this div to provide the floating card effect -->
    <div class="q-pa-md row full-width full-height" @click="toggleVisible">
      <div class="col-12 col-md" />

      <!-- Content -->
      <div
        class="q-pa-md self-end content-container row justify-center col-auto bg-secondary relative"
        @click.stop=""
      >
        <div class="absolute-top-right q-pa-md mobile-only z-top">
          <q-btn class="z-top" flat round dense icon="close" color="white" @click="toggleVisible" />
        </div>

        <!-- List of models -->
        <div class="col-12 col-md-auto">
          <model-list />

          <div class="row">
            <!-- Provider Creator Button -->
            <q-btn
              class="text-bold"
              outline
              color="white"
              flat
              icon="add"
              round
              @click="() => (showEngineCreator = !showEngineCreator)"
            >
              <q-tooltip> Add Connection </q-tooltip>
            </q-btn>  
  
            <!-- Metrics checkbox -->
            <q-checkbox
              v-model="app.settings.value.showMetrics"
              label="Show Metrics"
              class="text-white text-weight-medium"
            />
          </div>
        </div>

        <q-separator
          v-if="Platform.is.mobile"
          horizontal
          class="col-12 bg-accent text-accent q-pm-xs"
          style="background-color: white; height: 2px"
        />

        <!-- Model Editor -->
        <div class="col-12 col-md row fit-content">
          <div class="row col-12 col-md-auto q-pa-md fit-content">
            <!-- Model Editors based on type of model -->
            <connection-creator v-if="showEngineCreator" />

            <closed-source-model-editor 
              v-else-if="selectedModel && selectedModel.engine.isClosed"
            />

            <open-source-model-editor
              v-else-if="selectedModel && !selectedModel.engine.isClosed"
              @toggleAdvanced="() => (showAdvanced = !showAdvanced)"
            />
          </div>
        </div>
      </div>
      <!-- End content -->

      <div class="col-12 col-md self-end q-px-md q-pt-md overflow-hidden">
        <transition
          enter-active-class="animated slideInUp"
          leave-active-class="animated slideOutDown"
        >
          <fixed-options-editor v-if="showAdvanced" @click.stop="" />
        </transition>
      </div>
    </div>
  </q-dialog>
</template>

<style lang="scss" scoped>
.content-container {
  min-height: calc(100vh - 2em);
  max-height: 100vh;
  max-width: 100vw;
  height: fit-content;
  width: fit-content;
  border-radius: 2em 2em 2em 2em;
}

@media screen and (min-width: 1000px) {
  .content-container {
    min-height: 10em;
    max-height: 40vh;
    max-width: 40em;
    overflow-y: auto;
  }
}
</style>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { app } from 'boot/app';
import { Platform } from 'quasar';

import ModelList from './ModelList.vue';
import ClosedSourceModelEditor from './ClosedSourceModelEditor.vue';
import OpenSourceModelEditor from './OpenSourceModelEditor.vue';
import FixedOptionsEditor from './FixedOptionsEditor.vue';
import ConnectionCreator from './ConnectionCreator.vue';

const show = ref(false);
const toggleVisible = () => {
  show.value = !show.value;
};
const showEngineCreator = ref(false);

const selectedModel = computed(() => app.settings.value.selectedModel);

const showAdvanced = ref(false);
watch(
  () => app.settings.value.selectedModel,
  () => {
    showEngineCreator.value = false;
    if (app.settings.value.selectedModel?.engine.isClosed) showAdvanced.value = false;
  }
);

defineExpose({ toggleVisible: () => toggleVisible() });
</script>
