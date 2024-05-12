<template>
  <div class="col-12 bg-primary q-pa-md rounded-borders input-border row">

    <!-- Image Preview ROW -->
    <div class="col-12 q-pb-sm">
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
.image-preview-container {
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
.image-preview {
  border-radius: 10%;
  overflow: hidden;
  // margin-right: 1em;
}
.image-preview:hover {
  cursor: pointer;
  --show-fab: 100;
}
.image-fab {
  transition: opacity 0.3s;
  opacity: var(--show-fab, 0);
  border-radius: 20%;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}
</style>

<script setup lang="ts">
import { ref, computed, nextTick, defineEmits } from 'vue'

import isInCodeBlock from 'src/composeables/isInCodeblock'

import ImagePreviewList, { ImagePreviewListProps } from './ImagePreviewList.vue'
import { ImagePreviewProps } from './ImagePreview.vue';

const input = ref('')
const images = ref<ImagePreviewProps[]>([
  {
    src: 'https://media.istockphoto.com/id/1480959448/photo/data-in-cage-big-data-cloud-computing-blockchain-and-artificial-intelligence-concept.jpg?s=2048x2048&w=is&k=20&c=alXcIWxmpRMk1vqDjG6MWIwNO896rWnayfj3Ewh9vsk='
  },
  {
    src: 'https://media.istockphoto.com/id/1480959448/photo/data-in-cage-big-data-cloud-computing-blockchain-and-artificial-intelligence-concept.jpg?s=2048x2048&w=is&k=20&c=alXcIWxmpRMk1vqDjG6MWIwNO896rWnayfj3Ewh9vsk='
  },
  {
    src: 'https://media.istockphoto.com/id/1480959448/photo/data-in-cage-big-data-cloud-computing-blockchain-and-artificial-intelligence-concept.jpg?s=2048x2048&w=is&k=20&c=alXcIWxmpRMk1vqDjG6MWIwNO896rWnayfj3Ewh9vsk='
  },
  {
    src: 'https://media.istockphoto.com/id/1480959448/photo/data-in-cage-big-data-cloud-computing-blockchain-and-artificial-intelligence-concept.jpg?s=2048x2048&w=is&k=20&c=alXcIWxmpRMk1vqDjG6MWIwNO896rWnayfj3Ewh9vsk='
  }
])

defineProps<{
  loading: boolean
}>()

const emits = defineEmits<{
  message: [message: string]
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

  emits('message', input.value)
  input.value = ''
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
  input.onchange = (event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        if (typeof data === 'string') {
          emits('message', data);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  input.click();
}
</script>