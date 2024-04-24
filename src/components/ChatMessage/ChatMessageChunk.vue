<template>
  <br v-if="showGaps.top" />
  <div v-html="markup" />
  <br v-if="showGaps.bottom" />
</template>

<style>

</style>

<script lang="ts" setup>
import { computed } from 'vue';

import { Chunk } from 'src/utils/HighlightMesasge'

export type ChatMessageChunkProps = Chunk & {
  index: number;
  parentLength: number;
}

const props = defineProps<ChatMessageChunkProps>()

const markup = computed(() => {
  if (props.type == 'code') return props.output.highlighted || props.output.markup
  
  let markup = props.output.markup
  if (markup.endsWith('<br>')) markup = markup.slice(0, -4)

  return markup
})

const showGaps = computed(() => {
  const showTopGap = (props.type == 'code') && (props.index != 0)
  const showBottomGap = (props.type == 'code') && (props.index != props.parentLength - 1)
  return {
    top: showTopGap,
    bottom: showBottomGap
  }
})
</script>