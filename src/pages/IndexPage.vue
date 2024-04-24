<template>
  <q-page class="row items-center justify-evenly q-pa-md">
    <div class="col-12 col-md-8 row">
      <!-- Chat history -->
      <div class="col-12 row q-pb-md">
        <div class="col-12 q-py-sm" v-for="message of messages" :key="message.id">
          <div
            class="full-width card-background text-white chat-message"
          >
            <q-card-section>
              <q-item-label>
                <div v-html="message.text" />
              </q-item-label>
            </q-card-section>
          </div>
        </div>
      </div>

      <!-- Chat input -->
      <div class="col-12 row bg-accent q-pa-md rounded-borders input-border">
        <div class="col text-h6 self-center q-pl-md row">
          <textarea
            type="textarea"
            class="my-input full-width text-white self-center"
            placeholder="Send a message"
            v-model="input"
            :rows="inputRows"
            @keyup="log"
            @keypress.enter.exact="sendMessage"
            @keydown.tab="handleTab"
          >
          </textarea>
        </div>
        <div class="col-auto self-center">
          <q-btn flat round dense icon="send" color="primary" @click="() => sendMessage()" />
        </div>
      </div>
    </div>
  </q-page>
</template>

<style lang="scss">
p {
  margin: 0;
}

.card-background {
  background-color: #141414;
}

.input-border {
  border: 2px solid #242424;
  border-radius: 1rem;
}

.chat-message {
  font-size: 1.2rem;
  font-weight: 700;
  border: 2px solid #242424;
  border-radius: 1rem;
}
</style>

<script setup lang="ts">
import { computed, ref, nextTick } from 'vue';
import { marked } from 'marked';
import Prism from 'prismjs';
import getHighlightedChunks from 'src/utils/HighlightMesasge';

const input = ref('');
const inputElement = ref<HTMLTextAreaElement | null>(null);

const messages = ref([
  { id: 1, text: 'Hello, how can I help you?', isBot: true },
]);

const sendMessage = async (event?: KeyboardEvent) => {
  // Dont do anything if its an empty message
  if (!input.value.trim()) return;

  getHighlightedChunks(input.value);
  
  // Is in code block
  const codeWrapperStarts = input.value.match(/^(?:\n|^)```.{1,4}/mgi) || [];
  const wholeCode = input.value.match(/(^(?:\n|^)```.{1,4}\n)([^]*?)(\n```)/gmi) || [];

  if (codeWrapperStarts.length != wholeCode.length) {
    return;
  }

  // Cancel the event, were submitting it
  if (event) {
    event.preventDefault();
  }

  // console.log(input.value.replaceAll('\n', '<br>'))

  if (input.value.length > 1) {
    let markup = await marked.parse(input.value)
    markup = markup.replaceAll('\n', '<br>')
    // console.log(markup)

    const noLines = markup.replaceAll(/<br>/g, '∂');
    const codeBlocks = noLines.match(/<code[^>]*>.*?<\/code>/g)?.map(block => block.split('∂').join('\n'));

    if (codeBlocks) {
      codeBlocks.forEach((codeBlock) => {
        const domParser = new DOMParser();

        const language = codeBlock.match(/<code class="language-(.*?)">/)?.[1] || 'javascript';
        const code = codeBlock
          .replace(/<code[^>]*>/, '')
          .replace(/<\/code>/, '');

        const parsed = domParser.parseFromString(code, 'text/html');
        const formattedCode = parsed.body.textContent || '';

        console.log(formattedCode)

        const highlightedCode = Prism.highlight(
          formattedCode,
          Prism.languages[language],
          language
        );


        markup = markup.replace(
          codeBlock.replaceAll(/\n/g, '<br>'),
          `<code class="language-${language}">${highlightedCode}</code>`
        );
      });
      // markup = markup.replaceAll('<br><pre>', '<pre>');
      markup = markup.replaceAll('</pre><br>', '</pre>');
    }

    if (markup.endsWith('<br>')) {
      markup = markup.slice(0, -4);
    }

    const mark = await getHighlightedChunks(input.value);
    
    messages.value.push({
      id: messages.value.length + 1,
      text: mark.markup,
      isBot: false,
    });
    messages.value.push({
      id: messages.value.length + 1,
      text: markup,
      isBot: false,
    });
    input.value = '';
    setTimeout(() => {
      messages.value.push({
        id: messages.value.length + 1,
        text: 'I am a bot, I do not understand you.',
        isBot: true,
      });
    }, 1000);
  }
};

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
};

const log = (value: any) => {
  console.log(input.value);
};

const inputRows = computed(() => {
  return Math.min(10, input.value.split('\n').length);
});
</script>
