<template>
  <div class="col-12 scroll-area">
    <q-list class="fit">
      <transition-group name="slide-x" tag="div">
        <div v-for="group of groupedModels" :key="group[0].engine.id">
          <div class="text-h6 text-white row">
            <!-- Provider Header -->
            <div class="col-auto self-center q-pr-sm">
              {{ group[0].engine.name }}
            </div>
            <div v-if="!group[0].engine.isClosed" class="col-auto">
              <q-btn
                class="text-bold"
                outline
                color="white"
                flat
                icon="add"
                round
                @click="() => addModel(group[0].engine.id)"
              >
                <q-tooltip> Add Model </q-tooltip>
              </q-btn>
            </div>
            <div class="col-auto">
              <q-btn
                class="text-bold"
                outline
                color="green-4"
                icon="bolt"
                flat
                round
                @click="() => refreshModels(group[0].engine)"
              >
                <q-tooltip> Auto Add </q-tooltip>
              </q-btn>
            </div>
          </div>

          <!-- Models of a provider -->
          <transition-group name="slide-x" tag="div">
            <q-item
              v-for="model of group"
              :key="model.id"
              clickable
              v-ripple
              @click="() => selectModel(model)"
            >
              <q-item-section>
                <q-item-label
                  class="text-white model-list-item"
                  :class="selectedModel?.id == model.id ? 'selected-item' : ''"
                  >{{ model.model }}</q-item-label
                >
              </q-item-section>
            </q-item>
          </transition-group>
        </div>

        <!-- Add Provider -->
        <!-- <div class="q-pa-md text-white text-bold row cursor-pointer" key="add-provider">
          <div class="col-auto self-center">Add Provider</div>
          <div class="col-auto self-center text-h6 q-px-md">+</div>

          <q-popup-edit
            ref="addProviderPopup"
            v-model="newProvider"
            label="Provider"
            class="bg-accent"
          >
            <input
              v-model="newProvider"
              autofocus
              class="my-input text-white text-h6"
              placeholder="Provider Name"
              @keydown.enter="createProvider"
            />
          </q-popup-edit>
        </div> -->
      </transition-group>
    </q-list>
  </div>
</template>

<style lang="scss" scoped>
.model-list-item {
  transition: transform 0.5s;
}
.selected-item {
  transform: translateX(1em);
  font-weight: bold;
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
  .scroll-area {
    width: 15em;
    min-height: 10em;
    height: fit-content;
    max-height: 30vh;
  }
}

.slide-x-move,
.slide-x-enter-active,
.slide-x-leave-active {
  transition: all 0.5s;
}
.slide-x-enter-from,
.slide-x-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
.slide-x-leave-active {
  position: absolute;
}
</style>

<script lang="ts" setup>
import { ref, computed, nextTick } from 'vue';
import { app } from 'boot/app';
import generateUUID from 'src/composeables/generateUUID';

import { Notify, QPopupEdit } from 'quasar';

import { Model, Engine } from 'src/services/engines';

const newProvider = ref('');

type ModelGroups = {
  [key: string]: Model[];
};
const groupedModels = computed(() => {
  const grouped: ModelGroups = {};
  app.models.value.forEach((model) => {
    if (!grouped[model.engine.id]) {
      grouped[model.engine.id] = [];
    }
    grouped[model.engine.id].push(model);
  });
  const groupedArray = Object.values(grouped);
  return groupedArray.sort(
    (a: Model[], b: Model[]) => b[0].engine.createdAt - a[0].engine.createdAt
  );
});

const selectedModel = computed(() => app.settings.value.selectedModel);
const selectModel = (model: Model) => {
  app.settings.value.selectedModel = model;
  console.log('Selected model:', model);
};

const addProviderPopup = ref<QPopupEdit | null>(null);
const createProvider = (event: KeyboardEvent) => {
  if (event.key === 'enter') {
    const newEngine = app.engineManager.value.createEngine({
      type: 'ollama',
      name: newProvider.value,
      url: '',
      token: ''
    })

    const newModel = newEngine.createModel({
      id: generateUUID(),
      createdAt: Date.now(),
      name: 'Example model',
      model: 'Example model',
    }).toPortableModel();

    app.engineManager.value.importModel(newModel);
  }
};

const addModel = (engineId: string) => {
  const engine = app.models.value.find((model) => model.engine.id === engineId)?.engine;
  if (!engine) return;
  if (engine.isClosed) {
    return;
  }

  const model = engine.createModel({
    id: generateUUID(),
    createdAt: Date.now(),
    name: 'Example model',
    model: 'Example model'
  });
  app.models.value.push(model);

  nextTick(() => selectModel(model));
};

const refreshModels = async (engine: Engine) => {
  let models: string[] = [];
  try {
    models = await engine.getAvailableModels();
  } catch (error) {
    Notify.create({
      message: (error as Error).message,
      color: 'negative',
      position: 'top-right'
    });

    return
  }

  const existing = app.models.value.filter((model) => model.engine.id === engine.id);
  const toAdd = models.filter((model) => !existing.find((m) => m.model === model));
  
  const newModels = toAdd.map((model) => engine.createModel({
    createdAt: Date.now(),
    name: model,
    model: model
  }).toPortableModel());

  newModels.forEach((model) => app.engineManager.value.importModel(model));
};
</script>
