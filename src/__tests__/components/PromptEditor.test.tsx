import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PromptEditor from '@/components/playground/PromptEditor';

jest.mock('@/hooks/useLanguage', () => ({
  useLanguage: () => ({
    t: (key: string, params?: Record<string, string | number>) => {
      const translations: Record<string, string> = {
        'playground.inputPlaceholder': '프롬프트를 입력하세요',
        'playground.charCount': `${params?.current}/${params?.max}`,
        'playground.executeButton': '실행',
        'playground.emptyResponse': '응답이 없습니다',
        'common.loading': '로딩 중...',
        'common.reset': '초기화',
      };
      return translations[key] || key;
    },
  }),
}));

describe('PromptEditor', () => {
  const defaultProps = {
    value: '',
    onChange: jest.fn(),
    onSubmit: jest.fn(),
    isLoading: false,
    maxLength: 4000,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('텍스트 입력이 가능하다', async () => {
    const user = userEvent.setup();
    const mockOnChange = jest.fn();

    render(
      <PromptEditor {...defaultProps} onChange={mockOnChange} />
    );

    const textarea = screen.getByPlaceholderText('프롬프트를 입력하세요');
    await user.type(textarea, '테스트 프롬프트');

    expect(mockOnChange).toHaveBeenCalled();
  });

  it('글자 수를 표시한다', () => {
    render(<PromptEditor {...defaultProps} value="테스트" />);

    // "테스트"는 한글 3글자이므로 .length는 3
    expect(screen.getByText('3/4000')).toBeInTheDocument();
  });

  it('최대 글자 수 제한을 표시한다', () => {
    const longText = 'a'.repeat(4001);
    render(<PromptEditor {...defaultProps} value={longText} />);

    const textarea = screen.getByPlaceholderText('프롬프트를 입력하세요');
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
  });

  it('제출 버튼 클릭 시 onSubmit을 호출한다', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = jest.fn();

    render(
      <PromptEditor
        {...defaultProps}
        value="테스트 프롬프트"
        onSubmit={mockOnSubmit}
      />
    );

    const submitButton = screen.getByRole('button', { name: /실행/i });
    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  it('빈 값일 때 제출 버튼이 비활성화된다', () => {
    render(<PromptEditor {...defaultProps} value="" />);

    const submitButton = screen.getByRole('button', { name: /실행/i });
    expect(submitButton).toBeDisabled();
  });

  it('최대 글자 수 초과 시 제출 버튼이 비활성화된다', () => {
    const longText = 'a'.repeat(4001);
    render(<PromptEditor {...defaultProps} value={longText} />);

    const submitButton = screen.getByRole('button', { name: /실행/i });
    expect(submitButton).toBeDisabled();
  });

  it('로딩 상태를 표시한다', () => {
    render(<PromptEditor {...defaultProps} isLoading={true} value="테스트" />);

    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
    const submitButton = screen.getByRole('button', { name: /로딩 중/i });
    expect(submitButton).toBeDisabled();
  });

  it('Ctrl/Cmd + Enter로 제출할 수 있다', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = jest.fn();

    render(
      <PromptEditor
        {...defaultProps}
        value="테스트 프롬프트"
        onSubmit={mockOnSubmit}
      />
    );

    const textarea = screen.getByPlaceholderText('프롬프트를 입력하세요');
    await user.type(textarea, '{Control>}{Enter}{/Control}');

    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('초기화 버튼 클릭 시 값을 초기화한다', async () => {
    const user = userEvent.setup();
    const mockOnChange = jest.fn();

    render(
      <PromptEditor
        {...defaultProps}
        value="테스트"
        onChange={mockOnChange}
      />
    );

    const resetButton = screen.getByRole('button', { name: /초기화/i });
    await user.click(resetButton);

    expect(mockOnChange).toHaveBeenCalledWith('');
  });

  it('빈 값일 때 초기화 버튼이 비활성화된다', () => {
    render(<PromptEditor {...defaultProps} value="" />);

    const resetButton = screen.getByRole('button', { name: /초기화/i });
    expect(resetButton).toBeDisabled();
  });
});


