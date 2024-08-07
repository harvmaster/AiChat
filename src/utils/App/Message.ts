import { watch, reactive, ref, Ref } from 'vue';
import getHighlightedChunks from '../HighlightMessage';
import { ChatMessage, Model } from 'src/services/engines';
import { MessageProps, MessageContent, Database__Message } from 'src/types';

import MessageImage from './MessageImage';

export class Message {
  public id: string;
  public author: string;
  readonly content = reactive<{ value: MessageContent }>({ value: { raw: '' } });
  public modelId: string;
  public createdAt: number;

  public images: MessageImage[];

  // generating is actually ref<boolean> but it is set to boolean to avoid issues with the app parent holding it in a reactive. Further context down below
  public generating: boolean = ref(false) as unknown as boolean;

  // abort function is defined to the abort function of the model. This is used to stop the model from generating a response
  public abort: () => void = () => null;

  constructor(props: MessageProps) {
    watch(
      () => this.content.value.raw,
      (oldVal, newVal) => {
        if (oldVal === newVal) return;
        this.highlightMessage();
      }
    );

    this.id = props.id;
    this.author = props.author;
    this.content.value = props.content;
    this.modelId = props.modelId || '';
    this.createdAt = props.createdAt || Date.now();

    this.images = props.images?.map((image) => new MessageImage(image)) || [];
  }

  public async highlightMessage(): Promise<void> {
    const highlightedChunks = await getHighlightedChunks(this.content.value.raw);
    this.content.value.markup = highlightedChunks.markup;
    this.content.value.chunks = highlightedChunks.chunks;
  }

  public setContent(content: string): void {
    this.content.value.raw = content;
  }

  public toDatabaseMessage(): Database__Message {
    return {
      id: this.id,
      author: this.author,
      content: this.content.value.raw,
      modelId: this.modelId,
      images: this.images.map((image) => image.src),
      createdAt: this.createdAt,
    };
  }

  public toChatMessage(): ChatMessage {
    return {
      images: this.images.map((image) => image.src),
      content: this.content.value.raw,
      role: this.author === 'user' ? 'user' : 'assistant',
    };
  }

  public async generateAssistantResponse(model: Model, chatHistory: ChatMessage[]): Promise<void> {
    this.setGenerating(true);

    const { response, abort } = model.sendChat({ messages: chatHistory }, (res) => {
      this.content.value.raw += res.message.content;
    });
    this.abort = abort;
    await response;

    this.setGenerating(false);
  }

  /* 
    This class is used in a reactive container. The reactive container removes the refs of its children.
    This method exists to set the generating property of the message.
    If this message is called from the Conversation class, the generating property is a ref<boolean>. This is because the conversation does not hold reference to it as a reactive element.
    If this message is called through the UI or something beyong the conversation, the generating property is a boolean.
  */
  public setGenerating(generating: boolean): void {
    if (typeof this.generating === 'boolean') {
      this.generating = generating;
      return;
    }

    (this.generating as unknown as Ref<boolean>).value = generating;
  }
}

export default Message;
