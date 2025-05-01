import { PortableModel } from "./types"

export const DefaultModels: PortableModel[] = [
  {
    id: 'default_llama_qwen3_30b',
    name: 'Qwen3-30B-A3B-Q4_K_M',
    engine: {
      id: 'llama',
      name: 'AI Chat',
      type: 'llama',
      token: '',
      url: 'https://ai.ollama.mc.hzuccon.com',
      createdAt: Date.now(),
    },
    model: 'Qwen3-30B-A3B-Q4_K_M.gguf',
    advancedSettings: {},
    createdAt: Date.now(),
  },
  {
    id: 'default_openai_gpt35',
    name: 'GPT-3.5 Turbo',
    engine: {
      id: 'openai',
      name: 'OpenAI',
      type: 'openai',
      token: '',
      url: '',
      createdAt: Date.now(),
    },
    model: 'gpt-3.5-turbo',
    advancedSettings: { temperature: 0.8 },
    createdAt: Date.now(),
  },
  {
    id: 'default_openai_gpt4',
    name: 'GPT-4 Turbo',
    engine: {
      id: 'openai',
      name: 'OpenAI',
      type: 'openai',
      token: '',
      url: '',
      createdAt: Date.now(),
    },
    model: 'gpt-4-turbo',
    advancedSettings: { temperature: 0.8 },
    createdAt: Date.now(),
  },
  {
    id: 'default_openai_gpt4o',
    name: 'GPT-4o',
    engine: {
      id: 'openai',
      name: 'OpenAI',
      type: 'openai',
      token: '',
      url: '',
      createdAt: Date.now(),
    },
    model: 'gpt-4o',
    advancedSettings: { temperature: 0.8 },
    createdAt: Date.now(),
  },
  {
    id: 'default_openai_gpto4mini',
    name: 'GPT-o4 Mini',
    engine: {
      id: 'openai',
      name: 'OpenAI',
      type: 'openai',
      token: '',
      url: '',
      createdAt: Date.now(),
    },
    model: 'gpt-o4-mini',
    advancedSettings: { temperature: 0.8 },
    createdAt: Date.now(),
  },

]

export default DefaultModels