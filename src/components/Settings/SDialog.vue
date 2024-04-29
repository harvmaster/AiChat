<template>
  <q-dialog v-model="show" class="row justify-center" transition-show="slide-up" transition-hide="slide-down" maximized :seamless="false">
    <!-- Wrap contents in this div to provide the floating card effect -->
    <div class="q-pa-md row full-width full-height" @click="toggleVisible">

      <div class="col-12 col-md" />
    
      <!-- Content -->
      <div class="q-pa-md self-end content-container row justify-center col-auto bg-secondary" @click.stop="" >
        
        <!-- List of models -->
        <div class="col-12 col-md-auto">
          <model-list />
        </div>
        
        <!-- Model Editor -->
        <div class="col-12 col-md row fit-content">
          <div class="row col-12 col-md-auto q-pa-md fit-content">
            
            <!-- Model Editors based on type of model -->
            <closed-source-model-editor v-if="selectedModel && selectedModel.provider.isClosed" />
            <open-source-model-editor v-else-if="selectedModel && !selectedModel.provider.isClosed" />
            
          </div>
        </div>

        
      </div> 
      <!-- End content -->

      <div class="col-12 col-md self-end q-px-md q-pt-md">
        <fixed-options-editor @click.stop="" />
      </div>

    </div>
  </q-dialog>
</template>

<style lang="scss" scoped>
.content-container {
  max-height: 100vh;
  max-width: 100vw;
  height: fit-content;
  width: fit-content;
  border-radius: 2em 2em 2em 2em;
}

@media screen and (min-width: 1000px) {
  .content-container {
    max-height: 40vh;
    max-width: 40vw;
    overflow-y: auto;
  }
}
</style>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { app } from 'boot/app'

import ModelList from './ModelList.vue'
import ClosedSourceModelEditor from './ClosedSourceModelEditor.vue'
import OpenSourceModelEditor from './OpenSourceModelEditor.vue'
import FixedOptionsEditor from './FixedOptionsEditor.vue'

const show = ref(false)
const toggleVisible = () => {
  show.value = !show.value
}

const selectedModel = computed(() => app.settings.value.selectedModel)



defineExpose({ toggleVisible: () => toggleVisible() })
</script>