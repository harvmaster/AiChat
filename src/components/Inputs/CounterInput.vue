<template>
  <div class="row">
    <!-- Input which looks like -> (- | num | +)  -->
    <div class="col-3">
      <button class="counter-button counter-button--left relative" @click="decrement" v-ripple>
        -
      </button>
    </div>
    <div class="col-auto">
      <div class="counter-input fit-content" @input="isNumber">{{ model }}</div>
    </div>
    <div class="col-3">
      <button class="counter-button counter-button--right relative" @click="increment" v-ripple>
        +
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.fit-content {
  min-width: 3.5rem;
  width: fit-content;
  max-width: 5rem;
}
.counter-button {
  background-color: #f1f1f1;
  border: 1px solid #ccc;
  border-radius: 0.5rem 0 0 0.5rem;
  color: #333;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.5rem 1rem;
  text-align: center;
  width: 100%;
  transform: translateY(0);
  transition: transform 0.1s;
}
.counter-button:active {
  background-color: #e1e1e1;
  transform: translateY(1px);
}
.counter-button--right {
  border-radius: 0 0.5rem 0.5rem 0;
}
.counter-button--right:active {
  background-color: #e1e1e1;
  transform: translateY(1px);
}
.counter-button--left {
  border-radius: 0.5rem 0 0 0.5rem;
}
.counter-button--left:active {
  background-color: #e1e1e1;
  transform: translateY(1px);
}

.counter-input {
  background-color: #f1f1f1;
  border: 1px solid #ccc;
  // border-radius: 0.5rem;
  font-size: 1rem;
  padding: 0.5rem 1rem;
  overflow-y: hidden;
  overflow-x: hidden;
  text-wrap: nowrap;

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &:focus {
    outline: none;
  }
}
</style>

<script lang="ts" setup>
import { defineModel, ref } from 'vue';

export type CounterInputProps = {
  step?: number;
  min?: number;
  max?: number;
};

const props = withDefaults(defineProps<CounterInputProps>(), {
  step: 1,
});

const model = defineModel<number>({ required: true });
if (isNaN(model.value)) {
  model.value = 0;
}

const increment = () => {
  model.value += props.step;
};

const decrement = () => {
  model.value -= props.step;
};

const debounceTimer = ref<NodeJS.Timeout | null>(null);
const isNumber = (event: Event) => {
  const target = event.target as HTMLDivElement;
  const value = target.innerText;
  if (!isNaN(Number(value))) {
    if (props.min && Number(value) < props.min) {
      model.value = props.min;
    } else if (props.max && Number(value) > props.max) {
      model.value = props.max;
    } else {
      model.value = Number(value);
    }
  }

  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value);
  }
  debounceTimer.value = setTimeout(() => {
    target.innerText = model.value.toString();
  }, 250);
};
</script>
