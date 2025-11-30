import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IdInput from '@/components/auth/IdInput';

jest.mock('@/hooks/useLanguage', () => ({
  useLanguage: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'login.placeholder': '학번을 입력하세요',
        'login.subtitle': '학번 입력',
        'login.button': '시작하기',
        'login.error': '9자리 숫자를 입력해주세요',
        'common.loading': '로딩 중...',
      };
      return translations[key] || key;
    },
  }),
}));

describe('IdInput', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('9자리 숫자 입력을 허용한다', async () => {
    const user = userEvent.setup();
    render(<IdInput onSubmit={mockOnSubmit} isLoading={false} />);

    const input = screen.getByPlaceholderText('학번을 입력하세요');
    await user.type(input, '202400001');

    expect(input).toHaveValue('202400001');
  });

  it('숫자가 아닌 문자 입력을 차단한다', async () => {
    const user = userEvent.setup();
    render(<IdInput onSubmit={mockOnSubmit} isLoading={false} />);

    const input = screen.getByPlaceholderText('학번을 입력하세요');
    await user.type(input, '12345abcd');

    expect(input).toHaveValue('12345');
  });

  it('9자리 초과 입력을 차단한다', async () => {
    const user = userEvent.setup();
    render(<IdInput onSubmit={mockOnSubmit} isLoading={false} />);

    const input = screen.getByPlaceholderText('학번을 입력하세요');
    await user.type(input, '1234567890');

    expect(input).toHaveValue('123456789');
  });

  it('유효한 입력 후 제출 시 onSubmit을 호출한다', async () => {
    const user = userEvent.setup();
    render(<IdInput onSubmit={mockOnSubmit} isLoading={false} />);

    const input = screen.getByPlaceholderText('학번을 입력하세요');
    const button = screen.getByRole('button', { name: /시작하기/i });

    await user.type(input, '202400001');
    await user.click(button);

    expect(mockOnSubmit).toHaveBeenCalledWith('202400001');
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  it('로딩 상태에서 버튼이 비활성화된다', () => {
    render(<IdInput onSubmit={mockOnSubmit} isLoading={true} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('에러 메시지를 표시한다', () => {
    render(
      <IdInput
        onSubmit={mockOnSubmit}
        isLoading={false}
        error="Invalid ID"
      />
    );

    expect(screen.getByText('Invalid ID')).toBeInTheDocument();
  });

  it('9자리 미만 입력 시 제출 버튼이 비활성화된다', async () => {
    const user = userEvent.setup();
    render(<IdInput onSubmit={mockOnSubmit} isLoading={false} />);

    const input = screen.getByPlaceholderText('학번을 입력하세요');
    const button = screen.getByRole('button');

    await user.type(input, '12345');

    expect(button).toBeDisabled();
  });

  it('Enter 키로 제출할 수 있다', async () => {
    const user = userEvent.setup();
    render(<IdInput onSubmit={mockOnSubmit} isLoading={false} />);

    const input = screen.getByPlaceholderText('학번을 입력하세요');
    await user.type(input, '202400001');
    await user.keyboard('{Enter}');

    expect(mockOnSubmit).toHaveBeenCalledWith('202400001');
  });
});


