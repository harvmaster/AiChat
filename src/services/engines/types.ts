export type ChatMessage = {
  content: string;
  role: 'user' | 'assistant' | 'system';
  images?: string[];
};

export type ChatHistory = ChatMessage[];

export type ChatCompletionRequestOptions = {
  messages: ChatHistory;
  stream?: boolean;
};

export type ChatCompletionResponse = {
  message: {
    finished: boolean;
    content: string;
  };
};

export type TextGenerationRequest = {
  prompt: string;
};

export type ChatGenerationResponse = {
  abort: () => void;
  response: Promise<ChatCompletionResponse>;
};

export type PortableEngine = EngineProps & {
  id: string;
};

export type PortableModel = {
  id: string;
  name: string;
  model: string;
  engine: PortableEngine;
  advancedSettings: Partial<ModelSettings>;
  createdAt?: number;
};

export type ModelProps = {
  id?: string;
  name: string;
  model: string;
  createdAt?: number;
  advancedSettings?: Partial<ModelSettings>;
};

export interface BaseModel {
  id: string;
  name: string;
  model: string;
  createdAt?: number;

  engine: Engine;

  advancedSettings: Partial<ModelSettings>;
  capabilities: Capabilities;

  sendChat(
    request: ChatCompletionRequestOptions,
    callback?: (result: ChatCompletionResponse) => void
  ): ChatGenerationResponse;
  generateText(
    request: TextGenerationRequest,
    callback?: (result: ChatCompletionResponse) => void
  ): ChatGenerationResponse;
  createShareableURL(portableModel?: PortableModel): string;
  toPortableModel(): PortableModel;
}

export type BaseEngineProps = {
  id?: string;
  name: string;
  type: string;
  createdAt?: number;
};

export interface BaseEngine {
  id: string;
  name: string;
  type: string;
  createdAt: number;
  createModel(model: ModelProps): Model;
}

export interface ClosedModel extends BaseModel {
  engine: ClosedEngine;
}

export type ClosedEngineProps = BaseEngineProps & {
  token: string;
};

export interface ClosedEngine extends BaseEngine {
  token: string;
  isClosed: true;
}

export interface OpenModel extends BaseModel {
  engine: OpenEngine;
}

export type OpenEngineProps = BaseEngineProps & {
  url: string;
};

export interface OpenEngine extends BaseEngine {
  url: string;
  isClosed: false;
}

export type Model = ClosedModel | OpenModel;
export type Engine = ClosedEngine | OpenEngine;
export type EngineProps = ClosedEngineProps | OpenEngineProps;

export type ModelSettings = {
  num_keep: number;
  seed: number;
  num_predict: number;
  top_k: number;
  top_p: number;
  tfs_z: number;
  typical_p: number;
  repeat_last_n: number;
  temperature: number;
  repeat_penalty: number;
  presence_penalty: number;
  frequency_penalty: number;
  mirostat: number;
  mirostat_tau: number;
  mirostat_eta: number;
  penalize_newline: boolean;
  stop: string[];
  numa: boolean;
  num_ctx: number;
  num_batch: number;
  num_gqa: number;
  num_gpu: number;
  main_gpu: number;
  low_vram: boolean;
  f16_kv: boolean;
  vocab_only: boolean;
  use_mmap: boolean;
  use_mlock: boolean;
  rope_frequency_base: number;
  rope_frequency_scale: number;
  num_thread: number;
  image_detail: 'auto' | 'low' | 'high';
};

export const SupportLevelEnum = {
  0: 'UNSUPPORTED',
  1: 'SUPPORTED',
  2: 'UNKNOWN',
} as const;

export const SupportLevel = {
  UNSUPPORTED: 0,
  SUPPORTED: 1,
  UNKNOWN: 2,
} as const;

export type SupportLevel = (typeof SupportLevel)[keyof typeof SupportLevel];

export type Capabilities = {
  text: SupportLevel;
  image: SupportLevel;
  // video: SupportLevel;
  // audio: SupportLevel;
};
