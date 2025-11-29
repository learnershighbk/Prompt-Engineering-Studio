import { render, screen } from '@testing-library/react';
import LessonCard from '@/components/learn/LessonCard';

jest.mock('@/hooks/useLanguage', () => ({
  useLanguage: () => ({
    t: (key: string, params?: Record<string, string | number>) => {
      const translations: Record<string, string> = {
        'learn.completed': '완료',
        'learn.duration': `${params?.time}분`,
      };
      return translations[key] || key;
    },
  }),
}));

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('LessonCard', () => {
  const defaultProps = {
    slug: 'intro',
    title: '프롬프트 엔지니어링 소개',
    description: '프롬프트 엔지니어링의 기본 개념을 학습합니다.',
    duration: '10',
    isCompleted: false,
    order: 1,
  };

  it('제목, 설명, 시간을 표시한다', () => {
    render(<LessonCard {...defaultProps} />);

    expect(screen.getByText('프롬프트 엔지니어링 소개')).toBeInTheDocument();
    expect(
      screen.getByText('프롬프트 엔지니어링의 기본 개념을 학습합니다.')
    ).toBeInTheDocument();
    expect(screen.getByText('10분')).toBeInTheDocument();
  });

  it('완료 상태 뱃지를 표시한다', () => {
    render(<LessonCard {...defaultProps} isCompleted={true} />);

    expect(screen.getByText('완료')).toBeInTheDocument();
  });

  it('미완료 상태에서는 뱃지를 표시하지 않는다', () => {
    render(<LessonCard {...defaultProps} isCompleted={false} />);

    expect(screen.queryByText('완료')).not.toBeInTheDocument();
  });

  it('완료 상태에서는 체크 아이콘을 표시한다', () => {
    render(<LessonCard {...defaultProps} isCompleted={true} />);

    const checkIcon = screen.getByRole('img', { hidden: true });
    expect(checkIcon).toBeInTheDocument();
  });

  it('미완료 상태에서는 순서 번호를 표시한다', () => {
    render(<LessonCard {...defaultProps} isCompleted={false} order={2} />);

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('클릭 시 해당 레슨으로 이동하는 링크를 가진다', () => {
    render(<LessonCard {...defaultProps} slug="zero-shot" />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/learn/zero-shot');
  });

  it('완료된 레슨은 특별한 스타일을 가진다', () => {
    const { container } = render(
      <LessonCard {...defaultProps} isCompleted={true} />
    );

    const card = container.querySelector('a > div');
    expect(card).toHaveClass('border-green-500/30');
  });
});

