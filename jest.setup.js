// Import Jest DOM matchers
import '@testing-library/jest-dom';

// Mock environment variables for Supabase
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock-supabase-url.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-supabase-key';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    pathname: '/',
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Supabase client
jest.mock('./utils/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
          limit: jest.fn(() => ({
            range: jest.fn(),
          })),
        })),
        limit: jest.fn(() => ({
          range: jest.fn(),
        })),
        count: jest.fn(),
        order: jest.fn(() => ({
          range: jest.fn(),
        })),
        range: jest.fn(),
      })),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    })),
    rpc: jest.fn(),
  },
  fetchFromTable: jest.fn(),
  fetchWithCache: jest.fn(),
  clearCache: jest.fn(),
  batchQueries: jest.fn(),
}));

// Mock timing functions for better control in tests
jest.mock('./utils/supabaseClient', () => {
  const originalModule = jest.requireActual('./utils/supabaseClient');
  return {
    ...originalModule,
    // Mock the supabase instance to avoid initialization errors
    supabase: {
      auth: {
        signInWithPassword: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        getSession: jest.fn(),
        onAuthStateChange: jest.fn(() => ({
          data: { subscription: { unsubscribe: jest.fn() } },
        })),
      },
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(),
            limit: jest.fn(() => ({
              range: jest.fn(),
            })),
          })),
          limit: jest.fn(() => ({
            range: jest.fn(),
          })),
          count: jest.fn(),
          order: jest.fn(() => ({
            range: jest.fn(),
          })),
          range: jest.fn(),
        })),
        insert: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      })),
      rpc: jest.fn(),
    },
  };
});

// Set timeout to 10 seconds for all tests
jest.setTimeout(10000);

// Fix for TextEncoder not available in test environment
if (typeof TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder;
}

// Fix for TextDecoder not available in test environment
if (typeof TextDecoder === 'undefined') {
  global.TextDecoder = require('util').TextDecoder;
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Set up to suppress console errors during tests
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' && (
      args[0].includes('Warning:') ||
      args[0].includes('Not implemented:') ||
      args[0].includes('Error:')
    )
  ) {
    return;
  }
  originalConsoleError(...args);
};

// Reset all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
}); 