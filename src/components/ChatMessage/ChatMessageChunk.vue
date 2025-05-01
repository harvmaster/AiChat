<template>
  <!-- This may actually be a bad component... multiple components in the top level of the template? -->
  <br v-if="showGaps.top" />
  <div class="relative full-width row">
    <div v-html="processedMarkup" class="col-12" />
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

@keyframes thoughtPulse {
  0% {
    border-left-color: #4a9eff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  50% {
    border-left-color: #7cb9ff;
    box-shadow: 0 2px 8px rgba(74, 158, 255, 0.2);
  }
  100% {
    border-left-color: #4a9eff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
}

@keyframes thinkingDots {
  0%, 20% {
    content: "Thinking";
  }
  40% {
    content: "Thinking.";
  }
  60% {
    content: "Thinking..";
  }
  80%, 100% {
    content: "Thinking...";
  }
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

think {
  display: block;
  background: linear-gradient(135deg, rgba(25, 25, 35, 0.95), rgba(35, 35, 45, 0.95));
  border-left: 4px solid #4a9eff;
  border-radius: 6px;
  margin: 8px 0;
  padding: 12px 16px;
  color: #a8c5ff;
  font-family: monospace;
  position: relative;
  overflow: hidden;
  animation: thoughtPulse 2s ease-in-out infinite;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Stop pulsing animation when thinking is done */
think.done {
  animation: none;
  border-left-color: #45a845; /* Change to green to indicate completion */
}

think.collapsed {
  max-height: 48px;
  cursor: pointer;
}

think::before {
  content: "🤔 Thinking";
  display: block;
  font-weight: 600;
  color: #4a9eff;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 0.9em;
  margin: 0;
  padding: 0;
  line-height: 24px;
  transition: color 0.3s ease;
}

/* Change the header text and color when done thinking */
think.done::before {
  content: "💭 Thought";
  color: #45a845;
}

think.collapsed::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 48px;
  background: linear-gradient(to bottom, transparent, rgba(25, 25, 35, 0.95));
  opacity: 1;
  transition: opacity 0.3s ease;
}

.think-toggle {
  position: absolute;
  top: 12px;
  right: 12px;
  background: transparent;
  border: none;
  color: #4a9eff;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.think-toggle:hover {
  background: rgba(74, 158, 255, 0.1);
  transform: scale(1.1);
}

.think-content {
  margin-top: 8px;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { copyToClipboard } from 'quasar';

import { Chunk } from 'src/types';

// Declare the window interface extension
declare global {
  interface Window {
    toggleThinkBlock: (blockId: number) => void;
  }
}

export type ChatMessageChunkProps = Chunk & {
  index: number;
  parentLength: number;
};

const props = defineProps<ChatMessageChunkProps>();
const collapsedThinkBlocks = ref(new Set<number>());

const processedMarkup = computed(() => {
  if (props.type == 'code') return props.output.highlighted || props.output.markup;

  let markup = props.output.markup;
  if (markup.endsWith('<br>')) markup = markup.slice(0, -4);
  
  // Process think tags to make them collapsible
  let thinkBlockCount = 0;
  markup = markup.replace(/<think>([\s\S]*?)<\/think>/g, (match, content) => {
    const blockId = thinkBlockCount++;
    const isCollapsed = collapsedThinkBlocks.value.has(blockId);
    const isDone = match.includes('</think>');
    
    // Clean up any nested HTML tags that might interfere with our styling
    const cleanContent = content.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    
    // Create the think block with the content inside
    return `
      <think class="${isCollapsed ? 'collapsed' : ''} ${isDone ? 'done' : ''}" 
            data-think-id="${blockId}" 
            onclick="window.toggleThinkBlock(${blockId})">
        <div class="think-content">${cleanContent}</div>
      </think>
    `.trim();
  });

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

// Expose the toggle function to window so it can be called from the onclick handler
if (typeof window !== 'undefined') {
  window.toggleThinkBlock = (blockId: number) => {
    if (collapsedThinkBlocks.value.has(blockId)) {
      collapsedThinkBlocks.value.delete(blockId);
    } else {
      collapsedThinkBlocks.value.add(blockId);
    }
  };
}
</script>
