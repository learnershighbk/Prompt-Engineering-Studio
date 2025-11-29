import '@testing-library/jest-dom'

// next/navigation 모킹
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    refresh: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// next-intl 모킹
jest.mock('next-intl', () => ({
  useTranslations: () => (key) => key,
  useLocale: () => 'ko',
  useMessages: () => ({}),
}))

