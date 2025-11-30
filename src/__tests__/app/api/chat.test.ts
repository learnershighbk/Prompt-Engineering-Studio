import { POST } from '@/app/api/[[...hono]]/route';
import { NextRequest } from 'next/server';

// OpenAI 클래스 전체 모킹 - 실제 OpenAI 인스턴스가 생성되지 않도록
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({}));
});

// @/lib/openai 모킹 - 완전한 모킹으로 실제 코드에서도 모킹된 버전 사용
// Jest 호이스팅을 고려하여 mock factory 내부에서 모든 것을 정의
jest.mock('@/lib/openai', () => {
  const mockCreate = jest.fn();
  const mockOpenAIInstance = {
    chat: {
      completions: {
        create: mockCreate,
      },
    },
  };
  const mockGetOpenAI = jest.fn(() => mockOpenAIInstance);
  
  return {
    getOpenAI: mockGetOpenAI,
    __mockCreate: mockCreate,
    __mockOpenAIInstance: mockOpenAIInstance,
  };
});

jest.mock('hono/streaming', () => ({
  stream: jest.fn((c: any, writerFn: any) => {
    // 실제 hono/streaming은 즉시 Response를 반환하고, writerFn은 비동기로 실행됨
    // 동기적으로 에러가 발생하지 않도록 보장
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        const streamWriter = {
          write: async (data: string) => {
            controller.enqueue(encoder.encode(data));
          },
        };
        
        try {
          // writerFn을 실행하고 Promise를 기다림
          await writerFn(streamWriter);
        } catch (writerError) {
          // writerFn 내부의 catch 블록에서 이미 처리되어야 하지만,
          // 여기서도 처리하여 스트림이 안전하게 닫히도록 함
          console.error('[Stream writer error in mock]', writerError);
          try {
            await streamWriter.write(
              `data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`
            );
          } catch (writeError) {
            console.error('[Stream write error in mock]', writeError);
          }
        } finally {
          // 스트림을 안전하게 닫음
          try {
            controller.close();
          } catch (e) {
            // 이미 닫혔거나 에러 상태인 경우 무시
          }
        }
      },
    });
    
    // 헤더 설정
    const headers = new Headers();
    headers.set('Content-Type', 'text/event-stream');
    headers.set('Cache-Control', 'no-cache');
    headers.set('Connection', 'keep-alive');
    
    // stream() 함수는 즉시 Response를 반환 (동기적으로 에러를 던지지 않음)
    return new Response(readable, {
      status: 200,
      headers: headers,
    });
  }),
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
    // logger.error가 실제 에러를 로깅하도록 설정
    const mockError = jest.fn((...args) => {
      console.error('[Logger Error]', ...args);
    });
    c.set('logger', {
      info: jest.fn(),
      error: mockError,
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
  const originalEnv = process.env;
  // 모킹된 모듈 가져오기
  const openaiModule = jest.requireMock('@/lib/openai');
  const mockGetOpenAI = openaiModule.getOpenAI as jest.MockedFunction<typeof openaiModule.getOpenAI>;
  const mockCreate = openaiModule.__mockCreate as jest.MockedFunction<any>;
  const mockOpenAIInstance = openaiModule.__mockOpenAIInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreate.mockClear();
    // getOpenAI가 항상 모킹된 인스턴스를 반환하도록 보장
    mockGetOpenAI.mockReturnValue(mockOpenAIInstance);
    process.env = {
      ...originalEnv,
      OPENAI_API_KEY: 'test-api-key',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('POST', () => {
    it('정상 응답 (스트리밍)', async () => {
      // OpenAI SDK의 create()는 Promise를 반환하고, resolve되면 async iterable을 반환
      // 따라서 mockResolvedValue에 async generator를 직접 전달
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

      // create()는 Promise<AsyncIterable>을 반환해야 함
      // mockResolvedValue로 async generator를 반환하도록 설정
      const generator = mockStream();
      
      // async generator가 제대로 작동하는지 검증
      expect(generator).toBeDefined();
      expect(typeof generator[Symbol.asyncIterator]).toBe('function');
      
      mockCreate.mockResolvedValue(generator);
      
      // getOpenAI가 모킹된 인스턴스를 반환하도록 다시 설정 (beforeEach에서 이미 설정됨)
      // mockCreate가 올바른 인스턴스에 연결되어 있는지 확인
      expect(mockOpenAIInstance.chat.completions.create).toBe(mockCreate);

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

      // 디버깅: 500 에러인 경우 에러 메시지 확인
      if (response.status !== 200) {
        try {
          const errorData = await response.json();
          console.error('=== Chat test error details ===');
          console.error('Error data:', JSON.stringify(errorData, null, 2));
          console.error('getOpenAI called:', mockGetOpenAI.mock.calls.length, 'times');
          console.error('mockCreate called:', mockCreate.mock.calls.length, 'times');
          if (mockCreate.mock.calls.length > 0) {
            console.error('mockCreate first call args:', mockCreate.mock.calls[0]);
          }
          if (mockCreate.mock.results.length > 0) {
            console.error('mockCreate first result:', mockCreate.mock.results[0]);
          }
          console.error('=== End error details ===');
        } catch (e) {
          const text = await response.text();
          console.error('Chat test error (text):', text);
          console.error('Error parsing error data:', e);
        }
      }

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
      mockCreate.mockRejectedValue(new Error('OpenAI API Error'));

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


