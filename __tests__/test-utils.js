import { render } from '@testing-library/react';
import { AuthProvider } from '../contexts/AuthContext';

// Custom render function that includes providers
export function renderWithProviders(ui, options = {}) {
  const Wrapper = ({ children }) => {
    return <AuthProvider>{children}</AuthProvider>;
  };

  return render(ui, { wrapper: Wrapper, ...options });
}

// Mock Supabase auth response
export const mockAuthSession = (authenticated = true) => {
  const mockUser = authenticated
    ? {
        id: 'test-user-id',
        email: 'test@example.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      }
    : null;

  const mockSession = authenticated
    ? {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        user: mockUser,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      }
    : null;

  // Mock Supabase auth methods
  const { supabase } = require('../utils/supabase');

  if (authenticated) {
    supabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });
  } else {
    supabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
  }

  return { mockUser, mockSession };
};

// Mock profile data
export const mockProfileData = (role = 'client') => {
  return {
    id: 'test-user-id',
    full_name: 'Test User',
    avatar_url: null,
    role: role,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

// Mock projects data
export const mockProjects = (count = 3) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `project-${i}`,
    name: `Test Project ${i}`,
    description: `Description for test project ${i}`,
    client_id: `client-${i % 2}`,
    status: ['planning', 'in_progress', 'completed'][i % 3],
    start_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    end_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
};

// Mock feature requests data
export const mockFeatureRequests = (count = 5) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `feature-${i}`,
    title: `Feature Request ${i}`,
    description: `Description for feature request ${i}`,
    client_id: `client-${i % 2}`,
    project_id: `project-${i % 3}`,
    status: ['new', 'under_review', 'approved', 'in_development', 'completed'][i % 5],
    priority: ['low', 'medium', 'high', 'critical'][i % 4],
    submitted_by: 'test-user-id',
    submitted_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
};

// Mock support tickets data
export const mockSupportTickets = (count = 4) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `ticket-${i}`,
    title: `Support Ticket ${i}`,
    description: `Description for support ticket ${i}`,
    client_id: `client-${i % 2}`,
    project_id: `project-${i % 3}`,
    status: ['new', 'in_progress', 'resolved', 'closed', 'escalated'][i % 5],
    priority: ['low', 'medium', 'high', 'critical'][i % 4],
    submitted_by: 'test-user-id',
    assigned_to: i % 2 === 0 ? 'assigned-user-id' : null,
    submitted_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
};

// Mock clients data
export const mockClients = (count = 2) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `client-${i}`,
    name: `Client ${i}`,
    logo_url: null,
    primary_color: '#4f46e5',
    secondary_color: '#7c3aed',
    domain: `client${i}.example.com`,
    contact_email: `contact@client${i}.example.com`,
    contact_phone: `+1234567890${i}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
};

// Mock activity logs data
export const mockActivityLogs = (count = 10) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `activity-${i}`,
    user_id: 'test-user-id',
    action: ['created', 'updated', 'deleted', 'approved', 'rejected'][i % 5],
    entity_type: ['project', 'feature_request', 'support_ticket', 'client'][i % 4],
    entity_id: `entity-${i}`,
    details: { name: `Entity ${i}` },
    created_at: new Date(Date.now() - i * 1000 * 60 * 60).toISOString(),
    profiles: {
      full_name: 'Test User',
    },
  }));
}; 