import { POST } from '@/app/api/[[...hono]]/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/openai', () => ({
  getOpenAI: jest.fn(() => ({
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  })),
}));

jest.mock('@/backend/middleware/supabase', () => ({
  withSupabase: () => async (c: any, next: any) => {
    c.set('supabase', {
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
          })),
        })),
      })),
    });
    await next();
  },
}));

jest.mock('@/backend/middleware/context', () => ({
  withAppContext: () => async (c: any, next: any) => {
    c.set('logger', {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    });
    c.set('config', {
      supabase: {
        url: 'http://localhost:54321',
        serviceRoleKey: 'test-key',
      },
    });
    await next();
  },
}));

describe('/api/chat', () => {
  describe('POST', () => {
    it('정상 응답 (스트리밍)', async () => {
      const { getOpenAI } = require('@/lib/openai');
      const mockOpenAI = getOpenAI();

      const mockStream = async function* () {
        yield {
          choices: [
            {
              delta: { content: '안녕' },
            },
          ],
        };
        yield {
          choices: [
            {
              delta: { content: '하세요' },
            },
          ],
        };
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockStream());

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          userId: '550e8400-e29b-41d4-a716-446655440000',
          prompt: '안녕하세요',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/event-stream');
      expect(response.headers.get('Cache-Control')).toBe('no-cache');
      expect(response.headers.get('Connection')).toBe('keep-alive');
    });

    it('빈 프롬프트 에러', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          userId: '550e8400-e29b-41d4-a716-446655440000',
          prompt: '',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.error.code).toBe('MISSING_PROMPT');
    });

    it('4000자 초과 에러', async () => {
      const longPrompt = 'a'.repeat(4001);

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          userId: '550e8400-e29b-41d4-a716-446655440000',
          prompt: longPrompt,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.error.code).toBe('PROMPT_TOO_LONG');
    });

    it('OpenAI API 에러 처리', async () => {
      const { getOpenAI } = require('@/lib/openai');
      const mockOpenAI = getOpenAI();

      mockOpenAI.chat.completions.create.mockRejectedValue(new Error('OpenAI API Error'));

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          userId: '550e8400-e29b-41d4-a716-446655440000',
          prompt: '테스트 프롬프트',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
      expect(data.error.code).toBe('AI_API_ERROR');
    });
  });
});

