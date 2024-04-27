import { Model } from "./services/models";

export type Conversation = {
  id: string;
  summary: string;

  messages: Message[];
  createdAt: number;
}

export type Message = {
  id: string;
  author: string;
  content: MessageContent;
  modelId: string;
  createdAt: number;
}

export type MessageContent = {
  raw: string;
  markup: string;
  chunks: Chunk[];
}

export type Chunk = {
  raw: string;
  output: HighlightedChunk;
  type: 'code' | 'text';
}

export type HighlightedChunk = {
  markup: string;
  highlighted?: string;
}

export type Database__Provider = {
  id: string;
  name: string;
  type: string;
  url?: string;
  token?: string;
  isClosed: boolean;
  createdAt: number;
}

export type Database__Model = {
  id: string;
  name: string;
  model: string;
  temperature: number;
  providerId: string;
  createdAt: number;
}

export type Settings = {
  selectedModel?: Model;
}

export type Database__Settings = {
  selectedModel: string;
}