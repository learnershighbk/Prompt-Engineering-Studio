import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResponseViewer from '@/components/playground/ResponseViewer';

jest.mock('@/hooks/useLanguage', () => ({
  useLanguage: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'playground.streaming': '스트리밍 중...',
        'playground.emptyResponse': '응답이 없습니다',
        'common.copy': '복사',
        'common.copied': '복사됨',
      };
      return translations[key] || key;
    },
  }),
}));

Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
  },
});

describe('ResponseViewer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('마크다운 콘텐츠를 렌더링한다', () => {
    const markdownContent = '# 제목\n\n이것은 **굵은** 텍스트입니다.';
    render(
      <ResponseViewer content={markdownContent} isStreaming={false} />
    );

    expect(screen.getByText('제목')).toBeInTheDocument();
    expect(screen.getByText('이것은')).toBeInTheDocument();
    expect(screen.getByText('굵은')).toBeInTheDocument();
  });

  it('스트리밍 상태 인디케이터를 표시한다', () => {
    render(
      <ResponseViewer content="테스트 응답" isStreaming={true} />
    );

    expect(screen.getByText('스트리밍 중...')).toBeInTheDocument();
  });

  it('스트리밍이 아닐 때 인디케이터를 표시하지 않는다', () => {
    render(
      <ResponseViewer content="테스트 응답" isStreaming={false} />
    );

    expect(screen.queryByText('스트리밍 중...')).not.toBeInTheDocument();
  });

  it('복사 버튼을 표시한다', () => {
    render(
      <ResponseViewer content="테스트 응답" isStreaming={false} />
    );

    expect(screen.getByRole('button', { name: /복사/i })).toBeInTheDocument();
  });

  it('복사 버튼 클릭 시 클립보드에 복사한다', async () => {
    const user = userEvent.setup();
    const content = '테스트 응답 내용';
    const writeText = jest.spyOn(navigator.clipboard, 'writeText');

    render(
      <ResponseViewer content={content} isStreaming={false} />
    );

    const copyButton = screen.getByRole('button', { name: /복사/i });
    await user.click(copyButton);

    expect(writeText).toHaveBeenCalledWith(content);
  });

  it('복사 성공 시 "복사됨" 메시지를 표시한다', async () => {
    const user = userEvent.setup();
    jest.useFakeTimers();

    render(
      <ResponseViewer content="테스트 응답" isStreaming={false} />
    );

    const copyButton = screen.getByRole('button', { name: /복사/i });
    await user.click(copyButton);

    expect(screen.getByText('복사됨')).toBeInTheDocument();

    jest.advanceTimersByTime(2000);
    jest.useRealTimers();
  });

  it('스트리밍 중일 때 복사 버튼이 비활성화된다', () => {
    render(
      <ResponseViewer content="테스트 응답" isStreaming={true} />
    );

    const copyButton = screen.getByRole('button', { name: /복사/i });
    expect(copyButton).toBeDisabled();
  });

  it('빈 콘텐츠일 때 빈 상태 메시지를 표시한다', () => {
    render(
      <ResponseViewer content="" isStreaming={false} />
    );

    expect(screen.getByText('응답이 없습니다')).toBeInTheDocument();
  });

  it('스트리밍 중일 때는 빈 상태를 표시하지 않는다', () => {
    render(
      <ResponseViewer content="" isStreaming={true} />
    );

    expect(screen.queryByText('응답이 없습니다')).not.toBeInTheDocument();
  });

  it('마크다운 코드 블록을 렌더링한다', () => {
    const codeContent = '```javascript\nconst x = 1;\n```';
    render(
      <ResponseViewer content={codeContent} isStreaming={false} />
    );

    expect(screen.getByText('const x = 1;')).toBeInTheDocument();
  });

  it('콘텐츠가 없을 때 복사 버튼을 표시하지 않는다', () => {
    render(
      <ResponseViewer content="" isStreaming={false} />
    );

    expect(screen.queryByRole('button', { name: /복사/i })).not.toBeInTheDocument();
  });
});

