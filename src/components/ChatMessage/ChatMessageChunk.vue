<template>
  <!-- This may actually be a bad component... multiple components in the top level of the template? -->
  <br v-if="showGaps.top" />
  <div class="relative full-width row">
    <div v-html="markup" class="col-12" />
    <button
      v-if="props.type == 'code'"
      class="absolute-top-right text-white my-button"
      @click="copy"
    >
      <transition name="fade" mode="out-in" :duration="250">
        <q-icon v-if="!copyAnimation" key="copy" name="content_copy" />
        <q-icon v-else key="copy-done" name="done" color="green-4" />
        <!-- <p v-if="copyAnimation" class="text-caption">Copied!</p> -->
      </transition>
    </button>
  </div>
  <br v-if="showGaps.bottom" />
</template>

<style>
p {
  margin: 0;
}
ol {
  margin: 0;
}
ul {
  margin: 0;
}
h1,
h2,
h3,
h4 {
  word-break: break-all;
}
.relative {
  position: relative;
}
.absolute-top-right {
  position: absolute;
  top: 0;
  right: 0;
}

.my-button {
  background-color: #131313cc;
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transform: translate(-0.5rem, 0.5rem);
  transform-origin: center center;
  transition: transform 0.1s;
}
.my-button:hover {
  transform: translate(-0.5em, 0.5em) scale(1.1);
}
.my-button:active {
  transform: translate(-0.5em, 0.5em) scale(1);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { copyToClipboard } from 'quasar';

import { Chunk } from 'src/types';

export type ChatMessageChunkProps = Chunk & {
  index: number;
  parentLength: number;
};

const props = defineProps<ChatMessageChunkProps>();

const markup = computed(() => {
  if (props.type == 'code') return props.output.highlighted || props.output.markup;

  let markup = props.output.markup;
  if (markup.endsWith('<br>')) markup = markup.slice(0, -4);

  return markup;
});

const showGaps = computed(() => {
  const showTopGap = props.type == 'code' && props.index != 0;
  const showBottomGap = props.type == 'code' && props.index != props.parentLength - 1;
  return {
    top: showTopGap,
    bottom: showBottomGap,
  };
});

const copyAnimation = ref(false);
const copyAnimationTimer = ref<NodeJS.Timeout | null>(null);

const getFirstGroup = (regexp: RegExp, str: string) => {
  const array = [...str.matchAll(regexp)];
  return array.map((m) => m[1]);
};

const copy = () => {
  const code = getFirstGroup(/(?:^```.*?\n)([^]*.*)(?:```)/gim, props.raw);

  if (code) copyToClipboard(code.join(''));

  copyAnimation.value = true;
  if (copyAnimationTimer.value) clearTimeout(copyAnimationTimer.value);
  copyAnimationTimer.value = setTimeout(() => {
    copyAnimation.value = false;
  }, 1000);
};
</script>
