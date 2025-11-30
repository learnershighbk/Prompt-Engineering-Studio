// next/server 모킹 (테스트 환경에서 NextRequest/NextResponse 사용을 위해)

class MockHeaders {
  constructor(init = {}) {
    this._headers = new Map();
    if (init) {
      if (init instanceof MockHeaders) {
        init._headers.forEach((value, key) => {
          this._headers.set(key, value);
        });
      } else if (typeof init === 'object') {
        Object.entries(init).forEach(([key, value]) => {
          this._headers.set(key.toLowerCase(), value);
        });
      }
    }
  }
  get(name) { return this._headers.get(name.toLowerCase()) || null; }
  set(name, value) { this._headers.set(name.toLowerCase(), value); }
  has(name) { return this._headers.has(name.toLowerCase()); }
  delete(name) { this._headers.delete(name.toLowerCase()); }
  forEach(callback) { this._headers.forEach((value, key) => callback(value, key, this)); }
  entries() { return this._headers.entries(); }
  keys() { return this._headers.keys(); }
  values() { return this._headers.values(); }
  [Symbol.iterator]() { return this._headers.entries(); }
}

class NextRequest {
  constructor(url, options = {}) {
    this.url = typeof url === 'string' ? url : url.toString();
    this.method = options.method || 'GET';
    this._body = options.body;
    this.headers = new MockHeaders(options.headers || {});
    this.nextUrl = new URL(this.url);
  }
  async json() {
    if (typeof this._body === 'string') {
      return JSON.parse(this._body);
    }
    return this._body;
  }
  async text() {
    if (typeof this._body === 'string') {
      return this._body;
    }
    return JSON.stringify(this._body);
  }
  get searchParams() {
    return this.nextUrl.searchParams;
  }
}

class NextResponse {
  constructor(body, options = {}) {
    this._body = body;
    this.status = options.status || 200;
    this.statusText = options.statusText || '';
    this.headers = new MockHeaders(options.headers || {});
  }
  async json() {
    if (typeof this._body === 'string') {
      return JSON.parse(this._body);
    }
    if (this._body && typeof this._body.then === 'function') {
      return this._body;
    }
    return this._body;
  }
  async text() {
    if (typeof this._body === 'string') {
      return this._body;
    }
    return JSON.stringify(this._body);
  }
  static json(data, init = {}) {
    const response = new NextResponse(JSON.stringify(data), {
      ...init,
      status: init.status || 200,
    });
    response.headers.set('content-type', 'application/json');
    return response;
  }
  static redirect(url, status = 307) {
    const response = new NextResponse(null, { status });
    response.headers.set('location', url.toString());
    return response;
  }
}

module.exports = {
  NextRequest,
  NextResponse,
};



