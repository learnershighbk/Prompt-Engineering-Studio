import { POST } from '@/app/api/[[...hono]]/route';
import { NextRequest } from 'next/server';

// Supabase 모킹
const createMockSupabase = (mockData: any) => ({
  from: jest.fn((table: string) => {
    if (table === 'users') {
      const tableMock = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            maybeSingle: jest.fn().mockResolvedValue(mockData.users?.maybeSingle || { data: null, error: null }),
          })),
        })),
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn().mockResolvedValue(mockData.users?.insert || { data: null, error: null }),
          })),
        })),
      };
      return tableMock;
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

let currentMockData: any = {};

jest.mock('@/backend/middleware/supabase', () => ({
  withSupabase: () => async (c: any, next: any) => {
    const mockSupabase = createMockSupabase(currentMockData);
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

describe('/api/auth', () => {
  beforeEach(() => {
    currentMockData = {};
  });

  describe('POST', () => {
    it('유효한 9자리 학번으로 신규 사용자 생성', async () => {
      currentMockData = {
        users: {
          maybeSingle: { data: null, error: null },
          insert: {
            data: {
              id: '550e8400-e29b-41d4-a716-446655440000',
              student_id: '202400001',
              user_type: 'student',
              language: 'ko',
              created_at: '2025-11-25T10:00:00.000Z',
              updated_at: '2025-11-25T10:00:00.000Z',
            },
            error: null,
          },
        },
      };

      const request = new NextRequest('http://localhost:3000/api/auth', {
        method: 'POST',
        body: JSON.stringify({ studentId: '202400001' }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.user).toBeDefined();
      expect(data.user.studentId).toBe('202400001');
      expect(data.isNewUser).toBe(true);
    });

    it('유효한 9자리 학번으로 기존 사용자 조회', async () => {
      currentMockData = {
        users: {
          maybeSingle: {
            data: {
              id: '550e8400-e29b-41d4-a716-446655440000',
              student_id: '202400001',
              user_type: 'student',
              language: 'ko',
              created_at: '2025-11-25T10:00:00.000Z',
              updated_at: '2025-11-25T10:00:00.000Z',
            },
            error: null,
          },
        },
      };

      const request = new NextRequest('http://localhost:3000/api/auth', {
        method: 'POST',
        body: JSON.stringify({ studentId: '202400001' }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user).toBeDefined();
      expect(data.user.studentId).toBe('202400001');
      expect(data.isNewUser).toBe(false);
    });

    it('9자리 미만 입력 시 400 에러', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth', {
        method: 'POST',
        body: JSON.stringify({ studentId: '12345678' }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.error.code).toBe('INVALID_STUDENT_ID');
    });

    it('9자리 초과 입력 시 400 에러', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth', {
        method: 'POST',
        body: JSON.stringify({ studentId: '1234567890' }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.error.code).toBe('INVALID_STUDENT_ID');
    });

    it('숫자가 아닌 문자 입력 시 400 에러', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth', {
        method: 'POST',
        body: JSON.stringify({ studentId: '12345678a' }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.error.code).toBe('INVALID_STUDENT_ID');
    });

    it('빈 값 입력 시 400 에러', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth', {
        method: 'POST',
        body: JSON.stringify({ studentId: '' }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.error.code).toBe('INVALID_STUDENT_ID');
    });
  });
});

