import { PortableModel } from "./types"

export const DefaultModels: PortableModel[] = [
  {
    id: 'default_ollama_phi3',
    name: 'AI Chat',
    engine: {
      id: 'ollama',
      name: 'AI Chat',
      type: 'ollama',
      token: '',
      url: 'https://ai.ollama.mc.hzuccon.com',
      createdAt: Date.now(),
    },
    model: 'phi3',
    advancedSettings: { temperature: 0.8 },
    createdAt: Date.now(),
  },
  {
    id: 'default_openai_gpt35',
    name: 'GPT-3.5 Turbo',
    engine: {
      id: 'openai',
      name: 'GPT-3.5 Turbo',
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
      name: 'GPT-4 Turbo',
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
      name: 'GPT-4o',
      type: 'openai',
      token: '',
      url: '',
      createdAt: Date.now(),
    },
    model: 'gpt-4o',
    advancedSettings: { temperature: 0.8 },
    createdAt: Date.now(),
  }
]

export default DefaultModels