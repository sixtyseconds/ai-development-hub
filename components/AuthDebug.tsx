'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function AuthDebug() {
  const { user, profile, session, isLoading } = useAuth();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded shadow-lg border border-gray-200 max-w-md text-xs z-50 opacity-80 hover:opacity-100 transition-opacity">
      <h3 className="font-bold mb-2 text-sm">Auth Debug</h3>
      <div className="mb-2">
        <div className="font-semibold">Loading: {isLoading ? 'Yes' : 'No'}</div>
        <div className="font-semibold">Authenticated: {user ? 'Yes' : 'No'}</div>
      </div>
      {user && (
        <div className="mb-2">
          <div className="font-semibold">User:</div>
          <div className="ml-2">ID: {user.id}</div>
          <div className="ml-2">Email: {user.email}</div>
        </div>
      )}
      {profile && (
        <div className="mb-2">
          <div className="font-semibold">Profile:</div>
          <div className="ml-2">Name: {profile.full_name}</div>
          <div className="ml-2">Role: {profile.role}</div>
        </div>
      )}
      {!user && !isLoading && (
        <div className="text-danger">Not authenticated</div>
      )}
    </div>
  );
} 