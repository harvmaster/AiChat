<template>
  <div class="col-12 bg-primary q-pa-md rounded-borders input-border row">
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
      <div class="col-auto self-center">
        <q-spinner v-if="loading" color="white" class="q-pl-sm"/>
        <q-btn v-else flat round dense icon="send" color="accent" @click="() => sendMessage()" />
      </div>
  </div>
</template>

<style lang="scss" scoped>

</style>

<script setup lang="ts">
import { ref, computed, nextTick, defineEmits } from 'vue'
import isInCodeBlock from 'src/composeables/isInCodeblock'

const input = ref('')

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
</script>