import { Model } from './services/models';
import { ChatMessage } from './services/models';

export interface ConversationI {
  id: string;
  summary: string;
  messages: MessageI[];
  createdAt: number;

  getChatHistory: () => ChatMessage[];
  toDatabaseConversation: () => Database__Conversation;
  loadMessages: () => Promise<void>;
}

export type ConversationProps = {
  id: string;
  summary: string;
  messages: MessageI[];
  createdAt?: number;
}

export type Database__Conversation = {
  id: string;
  summary: string;
  createdAt: number;
}

export type MessageContent = {
  raw: string;
  markup?: string;
  chunks?: Chunk[];
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

export type MessageProps = {
  id: string;
  author: string;
  content: MessageContent;
  modelId?: string;
  createdAt?: number;
}

export interface MessageI {
  id: string;
  author: string;
  content: { value: MessageContent };
  modelId: string;
  createdAt: number;

  toDatabaseMessage: () => Database__Message;
  highlightMessage: () => Promise<void>;
  toChatMessage: () => ChatMessage;
}

export type Database__Message = {
  id: string;
  author: string;
  content: string;
  modelId: string;
  createdAt: number;
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
  advancedSettings?: string;
  providerId: string;
  createdAt: number;
}

export type Settings = {
  selectedModel?: Model;
}

export type Database__Settings = {
  selectedModel: string;
}
