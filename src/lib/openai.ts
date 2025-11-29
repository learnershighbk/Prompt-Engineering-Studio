import OpenAI from 'openai';

let openaiInstance: OpenAI | null = null;

export const getOpenAI = (): OpenAI => {
  if (openaiInstance) {
    return openaiInstance;
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  openaiInstance = new OpenAI({
    apiKey,
  });

  return openaiInstance;
};

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? '',
});

