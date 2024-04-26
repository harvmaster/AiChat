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

export interface BaseModel {
  id: string;
  name: string;
  model: string;
  sendChat(request: ChatCompletionRequest, callback?: (result: ChatCompletionResponse) => void,): Promise<ChatCompletionResponse>;
}

export type BaseProvider = {
  id: string;
  name: string;
  type: string;
}

export interface ClosedModel extends BaseModel {
  provider: ClosedProvider
}
export interface ClosedProvider extends BaseProvider {
  token: Ref<string>;
  isClosed: true;
}

export interface OpenModel extends BaseModel  {
  provider: OpenProvider
}
export interface OpenProvider extends BaseProvider {
  name: string;
  url: Ref<string>;
  isClosed: false;
}

export type Model = ClosedModel | OpenModel;

export type Provider = ClosedProvider | OpenProvider;