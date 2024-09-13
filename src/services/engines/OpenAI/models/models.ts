import { SupportLevel } from "../../types"

export const MODELS = {
  'gpt-o1-preview': {
    model: 'GPT-o1-Preview',
    external_name: 'o1-preview',
    capabilities: {
      text: SupportLevel.SUPPORTED,
      image: SupportLevel.SUPPORTED
    }
  },
  'gpt-o1-mini': {
    odel: 'GPT-o1-mini',
    external_name: 'o1-mini',
    capabilities: {
      text: SupportLevel.SUPPORTED,
      image: SupportLevel.SUPPORTED
    }
  },
  'gpt-4o': {
    model: 'GPT-4o',
    external_name: 'gpt-4o',
    capabilities: {
      text: SupportLevel.SUPPORTED,
      image: SupportLevel.SUPPORTED
    },
  },
  'gpt-4o-mini': {
    model: 'GPT-4o-mini',
    external_name: 'gpt-4o-mini',
    capabilities: {
      text: SupportLevel.SUPPORTED,
      image: SupportLevel.SUPPORTED
    },
  },
  'gpt-4-turbo': {
    model: 'GPT-4-Turbo',
    external_name: 'gpt-4-turbo',
    capabilities: {
      text: SupportLevel.SUPPORTED,
      image: SupportLevel.SUPPORTED
    },
  },
  'gpt-3.5-turbo': {
    model: 'GPT-3.5-Turbo',
    external_name: 'gpt-3.5-turbo',
    capabilities: {
      text: SupportLevel.SUPPORTED,
      image: SupportLevel.UNSUPPORTED
    },
  }
} as const