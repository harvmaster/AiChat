<template>
  <div class="col-12 bg-primary q-pa-md rounded-borders input-border row">

    <!-- Image Preview ROW -->
    <div v-if="images.length" class="col-12 q-pb-sm">
      <image-preview-list class="full-width" :images="images" />
    </div>

    <!-- Text Input Field -->
    <div class="col text-h6 self-center q-pl-md row">
      <textarea
        id="chat-input"
        type="textarea"
        class="my-input full-width text-white self-center"
        placeholder="Send a message"
        v-model="input"
        :rows="inputRows"
        :disabled="loading"
        @keypress.enter.exact="sendMessage"
        @keydown.tab="handleTab"
        >
      </textarea>
    </div>
  
    <!-- Image / File Upload -->
    <div class="col-auto self-center q-px-sm">
      <q-btn flat round dense icon="attach_file" color="accent" @click="openImageBrowser" />
    </div>

    <!-- Loading Icon / Submit Button -->
    <div class="col-auto self-center">
      <q-spinner-grid v-if="loading" color="white" size="2rem" class="q-pl-sm"/>
      <q-btn v-else flat round dense icon="send" color="accent" @click="() => sendMessage()" />
    </div>

  </div>
</template>

<style lang="scss" scoped>

</style>

<script setup lang="ts">
import { computed, nextTick, defineEmits } from 'vue'

import useInput from 'src/composeables/useInput'
import isInCodeBlock from 'src/composeables/isInCodeblock'

import ImagePreviewList from './ImagePreviewList.vue'
import MessageImage from 'src/utils/App/MessageImage';
import { UserMessageInput } from 'src/types';

const { input, images } = useInput()

defineProps<{
  loading: boolean
}>()

const emits = defineEmits<{
  message: [message: UserMessageInput]
}>()

const sendMessage = async (event?: KeyboardEvent) => {
  // Input has content
  if (!input.value.trim()) {
    return;
  }

  // Check whether inside code block
  if (isInCodeBlock(input.value)) {
    return
  }

  // prevent enter from being appended
  event?.preventDefault()

  const downscaledImages = await Promise.all(images.value.map((img) => img.downscale(2048, 2048)))

  emits('message', {
    content: input.value,
    images: downscaledImages
  })
  input.value = ''
  images.value = []
  return
}

const handleTab = (event: KeyboardEvent) => {
  const codeWrappers = input.value.split('```');
  if (codeWrappers.length % 2 == 0) {
    event.preventDefault();
    const target = event.target as HTMLTextAreaElement;
    const cursorPosition = target?.selectionStart

    input.value =
      input.value.substring(0, cursorPosition) +
      '  ' +
      input.value.substring(cursorPosition);
    nextTick(() => {  
      const target = event.target as HTMLTextAreaElement;
      target.selectionStart = target.selectionEnd = cursorPosition + 2;
    });
  }
}

const inputRows = computed(() => {
  return Math.min(5, Math.max(1, input.value.split('\n').length))
})

const openImageBrowser = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.multiple = true
  input.onchange = (event) => {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (!files) {
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        if (typeof data === 'string') {
          const img = new MessageImage(data);
          images.value.push(img);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  input.click();
}
</script>
