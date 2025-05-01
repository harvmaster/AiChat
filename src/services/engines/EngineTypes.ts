// ./EngineTypes.ts
import { OpenAIEngine } from './OpenAI';
import { OllamaEngine } from './Ollama';
import { GroqEngine } from './Groq';
import { ClaudeEngine } from './Claude'
import { LlamaEngine } from './Llama';

export const ENGINES = {
  openai: OpenAIEngine,
  ollama: OllamaEngine,
  groq: GroqEngine,
  claude: ClaudeEngine,
  llama: LlamaEngine
} as const;

// export type EngineType = 'openai' | 'ollama';
export type EngineType = keyof typeof ENGINES
export type EngineHandler = typeof ENGINES[EngineType];