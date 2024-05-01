import { watch, reactive } from "vue";
import getHighlightedChunks from "../HighlightMessage";
import { ChatMessage } from "src/services/models";

type MessageContent = {
  raw: string;
  markup?: string;
  chunks?: Chunk[];
}

type Chunk = {
  raw: string;
  output: HighlightedChunk;
  type: 'code' | 'text';
}

type HighlightedChunk = {
  markup: string;
  highlighted?: string;
}

type Database__Message = {
  id: string;
  author: string;
  content: string;
  modelId: string;
  createdAt: number;
}

export type MessageProps = {
  id: string;
  author: string;
  content: MessageContent;
  modelId?: string;
  createdAt?: number;
}

export class Message {
  public id: string;
  public author: string;
  readonly content = reactive<{ value: MessageContent }>({ value: { raw: '' } });
  public modelId: string;
  public createdAt: number;

  constructor(props: MessageProps) {
    watch(() => this.content.value.raw, (oldVal, newVal) => {
      if (oldVal === newVal) return
      this.highlightMessage()
    })
    
    this.id = props.id;
    this.author = props.author;
    this.content.value = props.content;
    this.modelId = props.modelId || '';
    this.createdAt = props.createdAt || Date.now();
  }

  public toDatabaseMessage (): Database__Message {
    return {
      id: this.id,
      author: this.author,
      content: this.content.value.raw,
      modelId: this.modelId,
      createdAt: this.createdAt
    }
  }

  public async highlightMessage (): Promise<void> {
    const highlightedChunks = await getHighlightedChunks(this.content.value.raw);
    this.content.value.markup = highlightedChunks.markup;
    this.content.value.chunks = highlightedChunks.chunks;
  }

  public toChatMessage (): ChatMessage {
    return {
      content: this.content.value.raw,
      role: this.author === 'user' ? 'user' : 'assistant'
    }
  }
}

export default Message