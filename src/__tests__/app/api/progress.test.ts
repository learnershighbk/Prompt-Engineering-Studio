import { GET, POST } from '@/app/api/[[...hono]]/route';
import { NextRequest } from 'next/server';

let currentMockData: any = {};

const createMockSupabase = (mockData: any) => ({
  from: jest.fn((table: string) => {
    if (table === 'progress') {
      return {
        select: jest.fn((columns?: string) => {
          const selectMock = {
            eq: jest.fn(() => ({
              order: jest.fn().mockResolvedValue(mockData.progress?.select || { data: [], error: null }),
            })),
          };
          // getProgressForApi는 select('lesson_slug, completed, completed_at').eq()를 사용
          if (columns) {
            return {
              eq: jest.fn().mockResolvedValue(mockData.progress?.select || { data: [], error: null }),
            };
          }
          return selectMock;
        }),
        upsert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn().mockResolvedValue(mockData.progress?.upsert || { data: null, error: null }),
          })),
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

describe('/api/progress', () => {
  beforeEach(() => {
    currentMockData = {};
  });

  describe('GET', () => {
    it('사용자 진도 조회 성공', async () => {
      currentMockData = {
        progress: {
          select: {
            data: [
              {
                lesson_slug: 'intro',
                completed: true,
                completed_at: '2025-11-25T10:30:00.000Z',
              },
              {
                lesson_slug: 'zero-shot',
                completed: true,
                completed_at: '2025-11-25T11:00:00.000Z',
              },
            ],
            error: null,
          },
        },
      };

      const request = new NextRequest('http://localhost:3000/api/progress?userId=550e8400-e29b-41d4-a716-446655440001', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.progress).toBeDefined();
      expect(Array.isArray(data.progress)).toBe(true);
      expect(data.summary).toBeDefined();
      expect(data.summary.total).toBe(4);
      expect(data.summary.completed).toBe(2);
    });

    it('존재하지 않는 사용자 처리', async () => {
      currentMockData = {
        progress: {
          select: {
            data: [],
            error: null,
          },
        },
      };

      const request = new NextRequest('http://localhost:3000/api/progress?userId=550e8400-e29b-41d4-a716-446655440001', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.progress).toBeDefined();
      expect(Array.isArray(data.progress)).toBe(true);
      expect(data.summary.completed).toBe(0);
    });
  });

  describe('POST', () => {
    it('학습 완료 저장 성공', async () => {
      currentMockData = {
        progress: {
          upsert: {
            data: {
              lesson_slug: 'zero-shot',
              completed: true,
              completed_at: '2025-11-25T12:00:00.000Z',
            },
            error: null,
          },
        },
      };

      const request = new NextRequest('http://localhost:3000/api/progress', {
        method: 'POST',
        body: JSON.stringify({
          userId: '550e8400-e29b-41d4-a716-446655440001',
          lessonSlug: 'zero-shot',
          completed: true,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.progress).toBeDefined();
      expect(data.progress.lessonSlug).toBe('zero-shot');
      expect(data.progress.completed).toBe(true);
    });

    it('유효하지 않은 lessonSlug 처리', async () => {
      const request = new NextRequest('http://localhost:3000/api/progress', {
        method: 'POST',
        body: JSON.stringify({
          userId: '550e8400-e29b-41d4-a716-446655440001',
          lessonSlug: 'invalid-lesson',
          completed: true,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.error.code).toBe('INVALID_LESSON');
    });

    it('userId 누락 시 에러', async () => {
      const request = new NextRequest('http://localhost:3000/api/progress', {
        method: 'POST',
        body: JSON.stringify({
          lessonSlug: 'zero-shot',
          completed: true,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });
});


