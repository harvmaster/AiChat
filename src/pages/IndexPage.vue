<template>
  <q-page class="row items-center justify-evenly q-pa-md">
    <div class="col-12 col-md-8 row">
      <!-- Chat history -->
      <div class="col-12 row q-pb-md">
        <div class="col-12" v-for="message of messages" :key="message.id">
          <!-- <q-card
            :class="message.isBot ? 'bg-grey-3' : 'bg-primary text-white'"
            class="full-width card-background"
          > -->
          <q-card
            class="full-width card-background text-black chat-message"
          >
            <q-card-section>
              <q-item-label>
                <div v-html="message.text" />
                <!-- {{ message.text }} -->
              </q-item-label>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Chat input -->
      <div class="col-12 row bg-secondary q-pa-md rounded-borders">
        <div class="col text-h6 self-center q-pl-md">
          <textarea
            type="textarea"
            class="my-input full-width text-white"
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
          <q-btn flat round dense icon="send" @click="() => sendMessage()" />
        </div>
      </div>
    </div>
  </q-page>
</template>

<style lang="scss">
pre {
  background-color: #9a7b7b;
  padding: 1rem;
  border-radius: 1rem;
}

.card-background {
  background-color: #D7F9FF;
}

.chat-message {
  font-size: 1.2rem;
  font-weight: 700;
}
</style>

<script setup lang="ts">
import { computed, onMounted, ref, nextTick } from 'vue';
import { marked } from 'marked';
import Prism from 'prismjs';

const input = ref('');

const messages = ref([
  { id: 1, text: 'Hello, how can I help you?', isBot: true },
]);

const sendMessage = async (event?: KeyboardEvent) => {
  // Is in code block
  const codeWrappers = input.value.split('```');
  if (codeWrappers.length % 2 == 0) {
    return;
  }

  const lines = input.value.split('\n');
  if (lines.every((line) => line.length === 0)) {
    console.log('Empty message');
    return;
  }

  if (event) {
    event.preventDefault();
  }

  if (input.value.length > 1) {
    let markup = await marked.parse(input.value);
    console.log(markup);

    const noLines = markup.replaceAll(/\n/g, '∂');
    console.log(noLines);

    const codeBlocks = noLines.match(/<code[^>]*>.*?<\/code>/g)?.map(block => block.split('∂').join('\n'));
    console.log(codeBlocks);

    if (codeBlocks) {
      codeBlocks.forEach((codeBlock) => {
        const domParser = new DOMParser();

        const language = codeBlock.match(/<code class="language-(.*?)">/)?.[1] || 'javascript';

        const code = codeBlock
          .replace(/<code[^>]*>/, '')
          .replace(/<\/code>/, '');
        console.log(code)

        const parsed = domParser.parseFromString(code, 'text/html');
        console.log(parsed.body.textContent);
        const formattedCode = parsed.body.textContent || '';

        const highlightedCode = Prism.highlight(
          formattedCode,
          Prism.languages.typescript,
          language
        );
        markup = markup.replace(
          codeBlock,
          `<code class="language-${language}">${highlightedCode}</code>`
        );
        console.log(markup)
      });
    }

    // const lines = codeBlocks?.join('').split('∂').join('\n');
    // console.log(lines);

    messages.value.push({
      id: messages.value.length + 1,
      text: markup,
      isBot: false,
    });
    nextTick(() => Prism.highlightAll());
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
  console.log(event)
  if (codeWrappers.length % 2 == 0) {
    event.preventDefault();
    const target = event.target as HTMLTextAreaElement;
    const cursorPosition = target?.selectionStart
    // const cursorPosition = event.target?.selectionStart! || 2
    // const cursorPosition = 2
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

onMounted(async () => {
  const text = '```ts\nconst a = 1;\n```';

  const markup = await marked.parse(text);
  console.log(markup);

  const noLines = markup.replaceAll(/\n/g, '∂');
  console.log(noLines);

  const codeBlocks = noLines.match(/<code[^>]*>.*?<\/code>/g);
  console.log(codeBlocks);

  const lines = codeBlocks?.join('').split('∂').join('\n');
  console.log(lines);

  Prism.highlightAll();

  console.log(Prism);
  console.log(Prism.languages);
});
</script>
