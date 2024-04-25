import type { ChatCompletionMessageParam } from "openai/resources";

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

export interface Agent {
  sendChat(request: ChatCompletionRequest, callback?: (result: ChatCompletionResponse) => void,): Promise<ChatCompletionResponse>;
}