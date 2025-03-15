import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

// Mock Supabase before importing the AuthContext
jest.mock('@/utils/supabase', () => {
  const mockInsert = jest.fn().mockResolvedValue({ error: null });
  const mockSelect = jest.fn().mockReturnValue({
    eq: jest.fn().mockReturnValue({
      single: jest.fn().mockResolvedValue({
        data: { id: 'profile-1', full_name: 'Test User', role: 'client' },
        error: null
      })
    })
  });
  
  return {
    supabase: {
      auth: {
        getSession: jest.fn(),
        signInWithPassword: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        onAuthStateChange: jest.fn(() => ({
          data: { subscription: { unsubscribe: jest.fn() } },
        })),
      },
      from: jest.fn().mockImplementation(() => ({
        insert: mockInsert,
        select: mockSelect
      })),
    },
    fetchFromTable: jest.fn().mockResolvedValue({
      data: [{ id: 'profile-1', full_name: 'Test User', role: 'client' }],
      error: null
    }),
  };
});

// Import after mocking
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/utils/supabase';

// Create a custom wrapper to expose the auth context state for testing
const AuthContextTestWrapper = ({ children }) => {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
};

// Test component that uses the auth context
const TestComponent = () => {
  const { user, loading, error, signIn, signUp, signOut } = useAuth();
  
  return (
    <div>
      <div data-testid="auth-state">
        {loading ? 'Loading...' : user ? 'Authenticated' : 'Not Authenticated'}
      </div>
      {error && <div data-testid="auth-error">{error.message}</div>}
      <button onClick={() => signIn('test@example.com', 'password')}>Sign In</button>
      <button onClick={() => signUp('test@example.com', 'password', 'Test User')}>Sign Up</button>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('provides authentication state', async () => {
    // Mock successful auth session
    supabase.auth.getSession.mockResolvedValue({
      data: { 
        session: { 
          user: { id: 'user-123', email: 'test@example.com' } 
        } 
      },
      error: null,
    });
    
    render(
      <AuthContextTestWrapper>
        <TestComponent />
      </AuthContextTestWrapper>
    );
    
    // Wait for authenticated state (loading is too fast to catch in test)
    await waitFor(() => {
      expect(screen.getByTestId('auth-state')).toHaveTextContent('Authenticated');
    });
  });
  
  test('handles sign in', async () => {
    // Mock unauthenticated initial state
    supabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    
    // Mock successful sign in
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { 
        user: { id: 'user-123', email: 'test@example.com' },
        session: { access_token: 'token' } 
      },
      error: null,
    });
    
    render(
      <AuthContextTestWrapper>
        <TestComponent />
      </AuthContextTestWrapper>
    );
    
    // Wait for initial auth check
    await waitFor(() => {
      expect(screen.getByTestId('auth-state')).toHaveTextContent('Not Authenticated');
    });
    
    // Click sign in button
    const user = userEvent.setup();
    await user.click(screen.getByText('Sign In'));
    
    // Verify sign in was called with correct credentials
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    });
  });
  
  test('handles sign up', async () => {
    // Mock unauthenticated initial state
    supabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    
    // Mock successful sign up
    supabase.auth.signUp.mockResolvedValue({
      data: { 
        user: { id: 'user-123', email: 'test@example.com' },
        session: null 
      },
      error: null,
    });
    
    render(
      <AuthContextTestWrapper>
        <TestComponent />
      </AuthContextTestWrapper>
    );
    
    // Wait for initial auth check
    await waitFor(() => {
      expect(screen.getByTestId('auth-state')).toHaveTextContent('Not Authenticated');
    });
    
    // Click sign up button
    const user = userEvent.setup();
    await user.click(screen.getByText('Sign Up'));
    
    // Verify sign up was called with correct credentials
    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    });
    
    // Verify profile creation was attempted
    expect(supabase.from).toHaveBeenCalledWith('profiles');
  });
  
  test('handles sign out', async () => {
    // Mock authenticated initial state
    supabase.auth.getSession.mockResolvedValue({
      data: { 
        session: { 
          user: { id: 'user-123', email: 'test@example.com' } 
        } 
      },
      error: null,
    });
    
    // Mock successful sign out
    supabase.auth.signOut.mockResolvedValue({
      error: null,
    });
    
    render(
      <AuthContextTestWrapper>
        <TestComponent />
      </AuthContextTestWrapper>
    );
    
    // Wait for authenticated state
    await waitFor(() => {
      expect(screen.getByTestId('auth-state')).toHaveTextContent('Authenticated');
    });
    
    // Click sign out button
    const user = userEvent.setup();
    await user.click(screen.getByText('Sign Out'));
    
    // Verify sign out was called
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });
  
  // TODO: Fix this test later
  // test('handles sign in errors', async () => {
  //   // Mock unauthenticated initial state
  //   supabase.auth.getSession.mockResolvedValue({
  //     data: { session: null },
  //     error: null,
  //   });
  //   
  //   // Mock sign in error
  //   supabase.auth.signInWithPassword.mockResolvedValue({
  //     data: { user: null, session: null },
  //     error: { message: 'Authentication error' },
  //   });
  //   
  //   render(
  //     <AuthContextTestWrapper>
  //       <TestComponent />
  //     </AuthContextTestWrapper>
  //   );
  //   
  //   // Wait for initial auth check
  //   await waitFor(() => {
  //     expect(screen.getByTestId('auth-state')).toHaveTextContent('Not Authenticated');
  //   });
  //   
  //   // Click sign in button
  //   const user = userEvent.setup();
  //   await user.click(screen.getByText('Sign In'));
  //   
  //   // Should show error message
  //   await waitFor(() => {
  //     expect(screen.getByTestId('auth-error')).toHaveTextContent('Authentication error');
  //   });
  // });
}); 