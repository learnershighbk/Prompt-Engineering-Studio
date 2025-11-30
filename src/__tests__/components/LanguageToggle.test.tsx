import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LanguageToggle from '@/components/common/LanguageToggle';

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  refresh: jest.fn(),
  forward: jest.fn(),
  prefetch: jest.fn(),
};

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('next-intl', () => ({
  useLocale: () => 'ko',
  useTranslations: () => (key: string) => key,
  useMessages: () => ({}),
}));

describe('LanguageToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    });
    Storage.prototype.setItem = jest.fn();
    global.fetch = jest.fn();
  });

  it('현재 언어를 표시한다 (ko)', () => {
    jest.spyOn(require('next-intl'), 'useLocale').mockReturnValue('ko');

    render(<LanguageToggle />);

    const koButton = screen.getByRole('radio', { name: /KOR/i });
    const enButton = screen.getByRole('radio', { name: /ENG/i });

    expect(koButton).toHaveAttribute('aria-checked', 'true');
    expect(enButton).toHaveAttribute('aria-checked', 'false');
  });

  it('현재 언어를 표시한다 (en)', () => {
    jest.spyOn(require('next-intl'), 'useLocale').mockReturnValue('en');

    render(<LanguageToggle />);

    const koButton = screen.getByRole('radio', { name: /KOR/i });
    const enButton = screen.getByRole('radio', { name: /ENG/i });

    expect(koButton).toHaveAttribute('aria-checked', 'false');
    expect(enButton).toHaveAttribute('aria-checked', 'true');
  });

  it('언어 전환 시 onChange 콜백이 호출된다', async () => {
    const user = userEvent.setup();
    jest.spyOn(require('next-intl'), 'useLocale').mockReturnValue('ko');

    render(<LanguageToggle />);

    const enButton = screen.getByRole('radio', { name: /ENG/i });
    await user.click(enButton);

    expect(Storage.prototype.setItem).toHaveBeenCalledWith(
      'prompt-lab-language',
      'en'
    );
    expect(mockRouter.refresh).toHaveBeenCalled();
  });

  it('같은 언어를 클릭하면 변경되지 않는다', async () => {
    const user = userEvent.setup();
    jest.spyOn(require('next-intl'), 'useLocale').mockReturnValue('ko');

    render(<LanguageToggle />);

    const koButton = screen.getByRole('radio', { name: /KOR/i });
    await user.click(koButton);

    expect(mockRouter.refresh).not.toHaveBeenCalled();
  });

  it('userId가 있으면 API를 호출한다', async () => {
    const user = userEvent.setup();
    jest.spyOn(require('next-intl'), 'useLocale').mockReturnValue('ko');
    Storage.prototype.getItem = jest.fn((key: string) => {
      if (key === 'userId') return 'test-user-id';
      return null;
    });

    render(<LanguageToggle />);

    const enButton = screen.getByRole('radio', { name: /ENG/i });
    await user.click(enButton);

    expect(global.fetch).toHaveBeenCalledWith('/api/user/language', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'test-user-id', language: 'en' }),
    });
  });
});


