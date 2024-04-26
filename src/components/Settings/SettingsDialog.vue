<template>
  <q-dialog v-model="show" class="" position="bottom" seamless>
    <div class="q-pa-md">
      <div class="row bg-secondary settings-dialog">

        <!-- Sidebar -->
        <div class="col-auto row items-start q-pa-md category-menu">

          <!-- Settings -->
          <div class="col-12 row q-pa-sm q-px-md settings-category">
            <div class="col-auto self-center">
              <q-icon name="settings" class="text-white" size="2em"/>
            </div>
            <div class="q-pl-sm col-auto text-h6 text-white self-center">
              Settings
            </div>
          </div>

          <!-- Profile -->
          <div class="col-12 row q-pa-sm q-pl-sm q-pr-xl settings-category">
            <div class="col-auto self-center">
              <q-icon name="person" class="text-white" size="2em"/>
            </div>
            <div class="q-pl-sm col-auto text-h6 text-white self-center">
              Profiles
            </div>
          </div>

          <!-- Models -->
          <div class="col-12 row q-pa-sm q-px-md settings-category">
            <div class="col-auto self-center">
              <q-icon name="settings" class="text-white" size="2em"/>
            </div>
            <div class="q-pl-sm col-auto text-h6 text-white self-center">
              Models
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="col row">

          <!-- Profile Selection Menu -->
          <div class="col-auto row">
            <q-scroll-area class="col-12" style="height: 30vh; width: 15em">
              <q-list class="">
                <div
                  v-for="group of groupedModels"
                  :key="group[0].provider.id"
                >
                  <div class="text-h6 text-white q-pt-md">
                    {{ group[0].provider.name }}
                  </div>
                  <q-item
                    v-for="model of group"
                    :key="model.id"
                    clickable
                    v-ripple
                    @click="() => log(model)"
                  >
                    <q-item-section>
                      <q-item-label class="text-white">{{ model.name }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </div>
              </q-list>
            </q-scroll-area>
          </div>

          <!-- Profile Settings -->
          <div class="col">
            <div class="row q-pa-md">
              <div class="col-auto">
                <q-icon name="person" class="text-white" size="md"/>
              </div>
              <div class="col-auto text-white">
                Profile Settings
              </div>
            </div>
          </div>


        </div>  
      </div>
    </div>
  </q-dialog>
</template>

<stytle scoped lang="scss">
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
</stytle>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { app } from 'boot/app'
import { Model } from 'src/services/models/types';

const show = ref(true)
const selectedTab = ref('profiles')

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

</script>