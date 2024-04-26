<template>
  <q-dialog v-model="show" class="">
    <div>
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
            <q-scroll-area class="col-12" style="height: 50vh; width: 15em">
              <q-list class="">
                <q-item
                  v-for="profile in profiles"
                  :key="profile.id"
                  clickable
                  v-ripple
                  @click="selectedTab = 'profiles'"
                  class=""
                  :class="'profiles' == selectedTab ? 'highlightTab' : ''"
                >
                  <q-item-section>
                    <q-item-label class="text-white">{{ profile.name }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-scroll-area>
            <div class="col-12 bg-primary">
              <q-btn flat round dense icon="add" color="white" @click="selectedTab = 'profiles'" />
            </div> 
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
  border-radius: 2em;
}


@media screen and (min-width: 1000px) {
  .settings-dialog {
    max-height: 60vh;
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
import { ref } from 'vue'

const show = ref(true)
const selectedTab = ref('profiles')

const profiles = ref([
  { id: 1, name: 'Profile 1' },
  { id: 2, name: 'Profile 2' },
  { id: 3, name: 'Profile 3' },
  { id: 4, name: 'Profile 4' },
  { id: 5, name: 'Profile 5' },
  { id: 6, name: 'Profile 6' },
  { id: 7, name: 'Profile 7' },
  { id: 8, name: 'Profile 8' },
  { id: 9, name: 'Profile 9' },
  { id: 10, name: 'Profile 10' },
  { id: 11, name: 'Profile 11' },
  { id: 12, name: 'Profile 12' },
  { id: 13, name: 'Profile 13' },
  { id: 14, name: 'Profile 14' },
  { id: 15, name: 'Profile 15' },
  { id: 16, name: 'Profile 16' },
  { id: 17, name: 'Profile 17' },
  { id: 18, name: 'Profile 18' },
  { id: 19, name: 'Profile 19' },
  { id: 20, name: 'Profile 20' },
  { id: 21, name: 'Profile 21' },
  { id: 22, name: 'Profile 22' },
  { id: 23, name: 'Profile 23' },
  { id: 24, name: 'Profile 24' },
  { id: 25, name: 'Profile 25' },
  { id: 26, name: 'Profile 26' },
  { id: 27, name: 'Profile 27' },
  { id: 28, name: 'Profile 28' },
  { id: 29, name: 'Profile 29' },
  { id: 30, name: 'Profile 30' },
  { id: 31, name: 'Profile 31' },
  { id: 32, name: 'Profile 32' },
  { id: 33, name: 'Profile 33' }
])
</script>