// Combined setup file for Jest tests
// Includes polyfills and mocks for Next.js components

// Import testing library matchers
import '@testing-library/jest-dom'

// Polyfills for Node.js environment
import 'whatwg-fetch'

// Mock Response and Request globals for MSW
global.Response = global.Response || require('node-fetch').Response
global.Request = global.Request || require('node-fetch').Request
global.Headers = global.Headers || require('node-fetch').Headers

// TextEncoder polyfill
global.TextEncoder = global.TextEncoder || class TextEncoder {
  encode(text) {
    return Buffer.from(text, 'utf8')
  }
}

global.TextDecoder = global.TextDecoder || class TextDecoder {
  decode(buffer) {
    return Buffer.from(buffer).toString('utf8')
  }
}

// TransformStream polyfill
global.TransformStream = global.TransformStream || class TransformStream {
  constructor() {
    this.readable = new ReadableStream()
    this.writable = new WritableStream()
  }
}

global.ReadableStream = global.ReadableStream || class ReadableStream {
  constructor() {}
}

global.WritableStream = global.WritableStream || class WritableStream {
  constructor() {}
}

// BroadcastChannel polyfill
global.BroadcastChannel = global.BroadcastChannel || class BroadcastChannel {
  constructor(name) {
    this.name = name
  }
  
  postMessage(message) {
    // No-op for tests
  }
  
  close() {
    // No-op for tests
  }
}

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href, ...props }) => {
    return <a href={href} {...props}>{children}</a>
  }
})

// Mock Next.js Image component
jest.mock('next/image', () => {
  return ({ src, alt, ...props }) => {
    return <img src={src} alt={alt} {...props} />
  }
})
