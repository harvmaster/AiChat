import type { ChatCompletionMessageParam } from 'openai/resources';
// import { Stream } from 'openai/streaming';
// import OpenAI from 'openai';


export type ChatMessage = {
  content: string;
  role: 'user' | 'assistant' | 'system';
  images?: string[];
}

export type ChatHistory = ChatMessage[];

export type ChatCompletionRequestOptions = {
  messages: ChatHistory;
  stream?: boolean;
}

export type ChatCompletionResponse = {
  message: {
    finished: boolean;
    content: string
  }
}

export type TextGenerationRequest = {
  prompt: string;
}

export type ChatGenerationResponse = {
  abort: () => void;
  response: Promise<ChatCompletionResponse>;
}

export type ModelURL = {
  id: string;
  name: string;
  model: string;
  provider: OpenProvider;
}

export interface BaseModel {
  id: string;
  name: string;
  model: string;
  createdAt?: number;
  provider: Provider;
  sendChat(request: ChatCompletionRequestOptions, callback?: (result: ChatCompletionResponse) => void,): ChatGenerationResponse;
  generateText(request: TextGenerationRequest, callback?: (result: ChatCompletionResponse) => void,): ChatGenerationResponse;
}

export interface BaseProvider {
  id: string;
  name: string;
  type: string;
  createdAt: number;
}

export interface ClosedModel extends BaseModel {
  provider: ClosedProvider
  advancedSettings: Partial<OllamaOptions>;
  // handleResponse(response: Stream<OpenAI.Chat.Completions.ChatCompletionChunk>, callback?: (result: ChatCompletionResponse) => void): Promise<ChatCompletionResponse>;
}
export interface ClosedProvider extends BaseProvider {
  token: string;
  isClosed: true;
}

export interface OpenModel extends BaseModel  {
  provider: OpenProvider
  advancedSettings: Partial<OllamaOptions>;
  createShareableURL(): string;
  // handleResponse(response: Response, callback?: (result: ChatCompletionResponse) => void): Promise<ChatCompletionResponse>;
}
export interface OpenProvider extends BaseProvider {
  url: string;
  isClosed: false;
}

export type Model = ClosedModel | OpenModel;

export type Provider = ClosedProvider | OpenProvider;

export type OllamaOptions = {
  num_keep: number,
  seed: number,
  num_predict: number,
  top_k: number,
  top_p: number,
  tfs_z: number,
  typical_p: number,
  repeat_last_n: number,
  temperature: number,
  repeat_penalty: number,
  presence_penalty: number,
  frequency_penalty: number,
  mirostat: number,
  mirostat_tau: number,
  mirostat_eta: number,
  penalize_newline: boolean,
  stop: string[],
  numa: boolean,
  num_ctx: number,
  num_batch: number,
  num_gqa: number,
  num_gpu: number,
  main_gpu: number,
  low_vram: boolean,
  f16_kv: boolean,
  vocab_only: boolean,
  use_mmap: boolean,
  use_mlock: boolean,
  rope_frequency_base: number,
  rope_frequency_scale: number,
  num_thread: number
}