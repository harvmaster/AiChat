import { Ref } from 'vue';
import type { ChatCompletionMessageParam } from 'openai/resources';


export type ChatMessage = ChatCompletionMessageParam

export type ChatHistory = ChatMessage[];

export type ChatCompletionRequest = {
  messages: ChatHistory;
  stream?: boolean;
}

export type ChatCompletionResponse = {
  message: {
    finished: boolean;
    content: string
  }
}

export type ChatCompletionRequestOptions = {
  stream: boolean;
}

export interface Model {
  id: string;
  name: string;
  sendChat(request: ChatCompletionRequest, callback?: (result: ChatCompletionResponse) => void,): Promise<ChatCompletionResponse>;
}

export type BaseProvider = {
  id: string;
  name: string;
}

export type ClosedModel = Model & {
  provider: ClosedProvider
}
export type ClosedProvider = BaseProvider & {
  token: Ref<string>;
  isClosed: true;
}

export type OpenModel = Model & {
  provider: OpenProvider
}
export type OpenProvider = BaseProvider & {
  name: string;
  url: Ref<string>;
  isClosed: false;
}

export interface Provider extends BaseProvider {};