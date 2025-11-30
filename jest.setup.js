import '@testing-library/jest-dom'

// TextEncoder/TextDecoder 폴리필 (스트리밍 응답 테스트용)
const { TextEncoder, TextDecoder } = require('util')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// ReadableStream 폴리필 (스트리밍 응답 테스트용)
// Node.js 18+에서는 global ReadableStream이 있지만, Jest 환경(jest-environment-jsdom)에서는 제공되지 않음
if (typeof global.ReadableStream === 'undefined') {
  // Node.js 18+에서는 stream/web에서 ReadableStream을 가져올 수 있음
  const { ReadableStream } = require('stream/web')
  global.ReadableStream = ReadableStream
}

// Headers 폴리필 - Response 폴리필보다 먼저 정의해야 함
global.Headers = class MockHeaders {
  constructor(init = {}) {
    this._headers = new Map()
    if (init) {
      // Headers 인스턴스를 받은 경우
      if (init instanceof MockHeaders || (init.constructor && init.constructor.name === 'MockHeaders')) {
        init._headers.forEach((value, key) => {
          this._headers.set(key, value)
        })
      } else if (Array.isArray(init)) {
        // [['key', 'value'], ...] 형태
        init.forEach(([key, value]) => {
          this._headers.set(key.toLowerCase(), value)
        })
      } else if (typeof init === 'object') {
        // { key: 'value', ... } 형태
        Object.entries(init).forEach(([key, value]) => {
          this._headers.set(key.toLowerCase(), value)
        })
      }
    }
  }
  get(name) { return this._headers.get(name.toLowerCase()) || null }
  set(name, value) { this._headers.set(name.toLowerCase(), value) }
  has(name) { return this._headers.has(name.toLowerCase()) }
  delete(name) { this._headers.delete(name.toLowerCase()) }
  forEach(callback) { this._headers.forEach((value, key) => callback(value, key, this)) }
  entries() { return this._headers.entries() }
  keys() { return this._headers.keys() }
  values() { return this._headers.values() }
  [Symbol.iterator]() { return this._headers.entries() }
}

// Response 폴리필 (스트리밍 응답 테스트용)
// Node.js 18+에서는 global Response가 있지만, Jest 환경(jest-environment-jsdom)에서는 제공되지 않음
if (typeof global.Response === 'undefined') {
  // Node.js 18+에서는 undici에서 Response를 가져올 수 있음
  try {
    const { Response } = require('undici')
    global.Response = Response
  } catch (e) {
    // undici가 없는 경우, Node.js의 내장 Response 사용 시도
    // Node.js 18+에서는 global Response가 있을 수 있음
    if (typeof Response !== 'undefined') {
      global.Response = Response
    } else {
      // 최후의 수단: 간단한 Response 폴리필 제공
      // Headers는 이미 정의되어 있으므로 사용 가능
      global.Response = class Response {
        constructor(body, init = {}) {
          this.body = body
          this.status = init.status || 200
          this.statusText = init.statusText || ''
          // Headers 인스턴스를 받은 경우 그대로 사용, 아니면 새로 생성
          if (init.headers && typeof init.headers.get === 'function') {
            this.headers = init.headers
          } else {
            this.headers = new Headers(init.headers || {})
          }
          this.ok = this.status >= 200 && this.status < 300
        }
        async json() {
          if (typeof this.body === 'string') {
            return JSON.parse(this.body)
          }
          return this.body
        }
        async text() {
          if (typeof this.body === 'string') {
            return this.body
          }
          return JSON.stringify(this.body)
        }
      }
    }
  }
}

// next/server 모킹 클래스 (전역 Web API 폴리필용)
const { NextRequest, NextResponse } = require('./src/__mocks__/next/server')

// 전역 Web API 폴리필
global.Request = NextRequest
// Response는 위에서 이미 설정했으므로 NextResponse로 덮어쓰지 않음
// global.Response는 Web API의 Response를 사용
global.fetch = jest.fn()

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


