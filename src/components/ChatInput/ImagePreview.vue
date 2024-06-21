<template>
  <div class="image-preview square">
    <q-img :src="props.src" class="square">
      <div class="absolute-top-right button-container bg-transparent">
        <q-btn class="image-fab" icon="delete" round dense color="red-4" @click="deleteImage" />
      </div>
    </q-img>
  </div>
</template>

<style lang="scss" scoped>
.image-preview {
  border-radius: 10%;
  overflow: hidden;
  transition: transform 0.3s;
}
.image-preview:hover {
  cursor: pointer;
  transform: translateY(-0.25em);
  --show-fab: 100;
}
.image-fab {
  transition: opacity 0.3s;
  opacity: var(--show-fab, 0);
  border-radius: 20%;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}
.button-container {
  padding: 0.5em;
}
</style>

<script setup lang="ts">
import useInput from 'src/composeables/useInput';

export type ImagePreviewProps = {
  src: string;
};

const props = withDefaults(defineProps<ImagePreviewProps>(), {
  src: '',
});

const { images } = useInput();

const deleteImage = () => {
  images.value = images.value.filter((image) => image.src !== props.src);
};
</script>
