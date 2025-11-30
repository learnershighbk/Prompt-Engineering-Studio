import { PATCH } from '@/app/api/[[...hono]]/route';
import { NextRequest } from 'next/server';

const createMockSupabase = (mockData: any) => ({
  from: jest.fn((table: string) => {
    if (table === 'users') {
      return {
        update: jest.fn(() => ({
          eq: jest.fn().mockResolvedValue(mockData.users?.update || { data: null, error: null }),
        })),
      };
    }
    return {
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
        })),
      })),
    };
  }),
});

jest.mock('@/backend/middleware/supabase', () => ({
  withSupabase: () => async (c: any, next: any) => {
    const mockSupabase = createMockSupabase({});
    c.set('supabase', mockSupabase);
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

describe('/api/user/language', () => {
  describe('PATCH', () => {
    it('언어 변경 성공 (ko → en)', async () => {
      const mockSupabase = createMockSupabase({
        users: {
          update: {
            data: { id: '550e8400-e29b-41d4-a716-446655440000', language: 'en' },
            error: null,
          },
        },
      });

      jest.spyOn(require('@/backend/middleware/supabase'), 'withSupabase').mockImplementation(() => async (c: any, next: any) => {
        c.set('supabase', mockSupabase);
        await next();
      });

      const request = new NextRequest('http://localhost:3000/api/user/language', {
        method: 'PATCH',
        body: JSON.stringify({
          userId: '550e8400-e29b-41d4-a716-446655440000',
          language: 'en',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.language).toBe('en');
    });

    it('언어 변경 성공 (en → ko)', async () => {
      const mockSupabase = createMockSupabase({
        users: {
          update: {
            data: { id: '550e8400-e29b-41d4-a716-446655440000', language: 'ko' },
            error: null,
          },
        },
      });

      jest.spyOn(require('@/backend/middleware/supabase'), 'withSupabase').mockImplementation(() => async (c: any, next: any) => {
        c.set('supabase', mockSupabase);
        await next();
      });

      const request = new NextRequest('http://localhost:3000/api/user/language', {
        method: 'PATCH',
        body: JSON.stringify({
          userId: '550e8400-e29b-41d4-a716-446655440000',
          language: 'ko',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.language).toBe('ko');
    });

    it('유효하지 않은 언어 코드 에러', async () => {
      const request = new NextRequest('http://localhost:3000/api/user/language', {
        method: 'PATCH',
        body: JSON.stringify({
          userId: '550e8400-e29b-41d4-a716-446655440000',
          language: 'fr',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.error.code).toBe('INVALID_LANGUAGE');
    });

    it('userId 누락 시 에러', async () => {
      const request = new NextRequest('http://localhost:3000/api/user/language', {
        method: 'PATCH',
        body: JSON.stringify({
          language: 'en',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });
});


