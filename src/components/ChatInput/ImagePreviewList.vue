<template>
  <div class="image-preview-list row q-pb-sm">
    <transition-group name="fade" >  
      <div class="col-auto image-preview-item q-pa-sm" v-for="image in props.images" :key="image.src" >
        <ImagePreview class="" :src="image.src" />
      </div>
    </transition-group>
  </div>
</template>

<style lang="scss" scoped>
.image-preview-list {
  // Keep on single line
  max-width: 100%;
  overflow-x: scroll;
  white-space: nowrap;
  flex-wrap: nowrap;

  // Scroll bar secondary color
  &::-webkit-scrollbar {
    height: 0.5em;
  }
  &::-webkit-scrollbar-thumb {
    background-color: $secondary;
    border-radius: 1em;
  }
  &::-webkit-scrollbar-track {
    background-color: $primary;
  }
}

@media screen and (max-width: 600px) {
  .image-preview-item {
    width: 33.33%;
    max-width: 10em;
  }
}

.image-preview-item {
  width: 45%;
  max-width: 10em;
}

</style>

<script setup lang="ts">
import { defineProps } from 'vue'

import ImagePreview, { ImagePreviewProps } from './ImagePreview.vue';

export type ImagePreviewListProps = {
  images: ImagePreviewProps[]
}

const props = withDefaults(defineProps<ImagePreviewListProps>(), {
  images: () => []
})
</script>