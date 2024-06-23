// ./EngineTypes.ts
import { OpenAIEngine } from './OpenAI';
import { OllamaEngine } from './Ollama';


export const ENGINES = {
  openai: OpenAIEngine,
  ollama: OllamaEngine,
} as const;

// export type EngineType = 'openai' | 'ollama';
export type EngineType = keyof typeof ENGINES
export type EngineHandler = typeof ENGINES[EngineType];