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
          <q-checkbox
            v-model="app.settings.value.showMetrics"
            label="Show Metrics"
            class="text-white text-weight-medium"
          />
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
            <closed-source-model-editor v-if="selectedModel && selectedModel.provider.isClosed" />
            <open-source-model-editor
              v-else-if="selectedModel && !selectedModel.provider.isClosed"
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

const show = ref(false);
const toggleVisible = () => {
  show.value = !show.value;
};

const selectedModel = computed(() => app.settings.value.selectedModel);

const showAdvanced = ref(false);
watch(
  () => app.settings.value.selectedModel,
  () => {
    if (app.settings.value.selectedModel?.provider.isClosed) showAdvanced.value = false;
  }
);

defineExpose({ toggleVisible: () => toggleVisible() });
</script>
