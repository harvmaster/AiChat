export const MODELS = {
  '3.5-sonnet': {
    model: 'Claude-3.5-Sonnet',
    external_name: 'claude-3-5-sonnet-latest',
  },
  '3-opus': {
    model: 'Claude-3-Opus',
    external_name: 'claude-3-opus-latest',
  },
  '3-sonnet': {
    model: 'Claude-3-Sonnet',
    external_name: 'claude-3-sonnet-20240229',
  },
  '3-haiku': {
    model: 'Claude-3-Haiku',
    external_name: 'claude-3-haiku-20240307',
  },
} as const;

export default MODELS;
