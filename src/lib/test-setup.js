/**
 * Test Setup - Browser API Mocks
 * 
 * This file sets up mocks for browser APIs (localStorage, window, navigator)
 * that are needed for testing in Node.js/Bun environments.
 * 
 * Import this BEFORE importing any modules that use browser APIs.
 */

// Mock localStorage
class LocalStorageMock {
  constructor() {
    this.store = {}
  }

  getItem(key) {
    return this.store[key] || null
  }

  setItem(key, value) {
    this.store[key] = String(value)
  }

  removeItem(key) {
    delete this.store[key]
  }

  clear() {
    this.store = {}
  }

  get length() {
    return Object.keys(this.store).length
  }

  key(index) {
    const keys = Object.keys(this.store)
    return keys[index] || null
  }
}

// Set up global localStorage
global.localStorage = new LocalStorageMock()

// Mock window object
global.window = {
  location: {
    origin: 'http://localhost:3000',
    pathname: '/',
    search: '',
  },
  history: {
    replaceState: () => {},
  },
}

// Mock navigator
global.navigator = {
  clipboard: {
    writeText: (text) => Promise.resolve(),
  },
}

// Mock document (if needed)
global.document = {
  getElementById: () => null,
}

export { LocalStorageMock }

