import Anthropic from '@anthropic-ai/sdk';

let anthropicInstance: Anthropic | null = null;

export const getAnthropic = (): Anthropic => {
  if (anthropicInstance) {
    return anthropicInstance;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set');
  }

  anthropicInstance = new Anthropic({
    apiKey,
  });

  return anthropicInstance;
};




