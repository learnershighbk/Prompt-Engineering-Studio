import { render, screen } from '@testing-library/react';
import ProgressBar from '@/components/learn/ProgressBar';

jest.mock('@/hooks/useLanguage', () => ({
  useLanguage: () => ({
    t: (key: string, params?: Record<string, string | number>) => {
      const translations: Record<string, string> = {
        'learn.progressText': `${params?.completed}/${params?.total} 완료`,
      };
      return translations[key] || key;
    },
  }),
}));

describe('ProgressBar', () => {
  it('진행률을 표시한다 (예: 2/4)', () => {
    render(<ProgressBar completed={2} total={4} />);

    expect(screen.getByText('2/4 완료')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('0% 진행률을 표시한다', () => {
    render(<ProgressBar completed={0} total={4} />);

    expect(screen.getByText('0/4 완료')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '0');
  });

  it('50% 진행률을 표시한다', () => {
    render(<ProgressBar completed={2} total={4} />);

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '50');
  });

  it('100% 진행률을 표시한다', () => {
    render(<ProgressBar completed={4} total={4} />);

    expect(screen.getByText('4/4 완료')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '100');
  });

  it('퍼센트 바 너비를 올바르게 계산한다', () => {
    const { container } = render(<ProgressBar completed={1} total={4} />);

    const progressBar = container.querySelector('[role="progressbar"] > div');
    expect(progressBar).toHaveStyle({ width: '25%' });
  });

  it('total이 0일 때 0%를 표시한다', () => {
    render(<ProgressBar completed={0} total={0} />);

    expect(screen.getByText('0%')).toBeInTheDocument();

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '0');
  });

  it('진행률 바에 접근성 속성을 가진다', () => {
    render(<ProgressBar completed={2} total={4} />);

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
    expect(progressbar).toHaveAttribute('aria-valuenow', '50');
    expect(progressbar).toHaveAttribute('aria-label', '2/4 완료');
  });
});





