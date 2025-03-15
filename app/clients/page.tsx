'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseQuery } from '@/utils/useSupabase';
import { clearCache } from '@/utils/supabase';
import { FiRefreshCw, FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';

export default function ClientsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isPageMounted, setIsPageMounted] = useState(false);
  const [dataInitialized, setDataInitialized] = useState(false);

  // Clear cache when component mounts to ensure fresh data after navigation
  useEffect(() => {
    // Only clear cache once when the component mounts
    if (!isPageMounted) {
      clearCache();
      setIsPageMounted(true);
    }
    
    return () => {
      // Don't set isPageMounted to false on unmount to prevent re-clearing cache
      // when component re-renders due to state changes
    };
  }, []);

  // Fetch clients with optimized query
  const { 
    data: clients, 
    count: clientsCount,
    isLoading: clientsLoading,
    refetch: refetchClients,
    error: clientsError
  } = useSupabaseQuery('clients', {
    select: '*',
    orderBy: { column: 'name', ascending: true },
    enabled: !!user && isPageMounted,
    dependencies: [isPageMounted, user?.id],
  });

  // Check if all data is loaded
  useEffect(() => {
    if (!clientsLoading && !dataInitialized && user) {
      setDataInitialized(true);
    }
  }, [clientsLoading, dataInitialized, user]);

  // Handle any data fetching errors
  useEffect(() => {
    if (clientsError) {
      console.error('Data fetching error:', clientsError);
    }
  }, [clientsError]);

  // Refresh data
  const refreshData = useCallback(() => {
    clearCache(); // Clear cache before refetching
    refetchClients();
  }, [refetchClients]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Loading state while authentication is in progress
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // Loading state while data is being fetched
  if (!dataInitialized && user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray">Loading clients data...</p>
        </div>
      </div>
    );
  }

  // Will redirect in the useEffect
  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="page-header mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Clients</h1>
          <p className="text-gray">Manage your client relationships</p>
        </div>
        <div className="flex space-x-2">
          <button 
            className="btn btn-secondary"
            onClick={refreshData}
            disabled={clientsLoading}
          >
            <FiRefreshCw className={`mr-2 ${clientsLoading ? 'animate-spin' : ''}`} size={16} />
            Refresh
          </button>
          <button className="btn btn-primary">
            <FiPlus className="mr-2" size={16} />
            Add Client
          </button>
        </div>
      </div>

      {/* Clients List */}
      <div className="card">
        <div className="card-body p-0">
          {clientsLoading ? (
            <div className="py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-gray">Loading clients...</p>
            </div>
          ) : clients && clients.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {clients.map((client: any) => (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{client.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-500">{client.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-500">{client.phone || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-500">{client.company || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          client.status === 'active' ? 'bg-green-100 text-green-800' : 
                          client.status === 'inactive' ? 'bg-gray-100 text-gray-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {client.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-primary hover:text-primary-dark mr-3">
                          <FiEdit size={18} />
                        </button>
                        <button className="text-red-500 hover:text-red-700">
                          <FiTrash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-gray">No clients found. Add your first client to get started.</p>
              <button className="btn btn-primary mt-4">
                <FiPlus className="mr-2" size={16} />
                Add Client
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 