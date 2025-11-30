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

// Lazy initialization을 위한 getter - 테스트 환경에서의 모듈 로드 시점 인스턴스 생성 방지
export const openai = {
  get chat() {
    return getOpenAI().chat;
  },
  get completions() {
    return getOpenAI().completions;
  },
  get embeddings() {
    return getOpenAI().embeddings;
  },
  get files() {
    return getOpenAI().files;
  },
  get images() {
    return getOpenAI().images;
  },
  get models() {
    return getOpenAI().models;
  },
};

