const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // react-markdown ESM 모듈 모킹
    '^react-markdown$': '<rootDir>/src/__mocks__/react-markdown.tsx',
    // remark-gfm ESM 모듈 모킹
    '^remark-gfm$': '<rootDir>/src/__mocks__/remark-gfm.js',
    // next/server 모킹 (NextRequest/NextResponse)
    '^next/server$': '<rootDir>/src/__mocks__/next/server.js',
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/', '<rootDir>/e2e/'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/_*.{js,jsx,ts,tsx}',
  ],
  // ESM 모듈을 CommonJS로 변환하도록 설정
  transformIgnorePatterns: [
    '/node_modules/(?!(react-markdown|remark-gfm|remark-.*|unified|bail|is-plain-obj|trough|vfile.*|unist-.*|mdast-.*|micromark.*|decode-named-character-reference|character-entities|property-information|hast-.*|space-separated-tokens|comma-separated-tokens|html-url-attributes|stringify-entities|character-entities-html4|ccount|escape-string-regexp|markdown-table|zwitch|longest-streak|devlop|trim-lines)/)',
  ],
}

module.exports = createJestConfig(customJestConfig)

