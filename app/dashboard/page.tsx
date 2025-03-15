'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import StatsCard from '@/components/StatsCard';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseQuery } from '@/utils/useSupabase';
import { clearCache } from '@/utils/supabase';
import { 
  FiFileText, 
  FiMessageSquare, 
  FiExternalLink, 
  FiUsers,
  FiRefreshCw, 
  FiPlus 
} from 'react-icons/fi';

export default function Dashboard() {
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

  // Fetch projects with optimized query
  const { 
    data: projects, 
    count: projectsCount, 
    isLoading: projectsLoading,
    refetch: refetchProjects,
    error: projectsError
  } = useSupabaseQuery('projects', {
    select: '*',
    filters: { status: 'in_progress' },
    enabled: !!user && isPageMounted,
    dependencies: [isPageMounted, user?.id],
  });

  // Fetch feature requests with optimized query
  const { 
    data: featureRequests, 
    count: featureRequestsCount,
    isLoading: featureRequestsLoading,
    refetch: refetchFeatureRequests,
    error: featureRequestsError
  } = useSupabaseQuery('feature_requests', {
    select: '*',
    limit: 10,
    orderBy: { column: 'submitted_at', ascending: false },
    enabled: !!user && isPageMounted,
    dependencies: [isPageMounted, user?.id],
  });

  // Fetch support tickets with optimized query
  const { 
    data: supportTickets, 
    count: supportTicketsCount,
    isLoading: supportTicketsLoading,
    refetch: refetchSupportTickets,
    error: supportTicketsError
  } = useSupabaseQuery('support_tickets', {
    select: '*',
    filters: { status: 'new' },
    limit: 5,
    orderBy: { column: 'submitted_at', ascending: false },
    enabled: !!user && isPageMounted,
    dependencies: [isPageMounted, user?.id],
  });

  // Fetch clients with optimized query
  const { 
    data: clients, 
    count: clientsCount,
    isLoading: clientsLoading,
    refetch: refetchClients,
    error: clientsError
  } = useSupabaseQuery('clients', {
    select: '*',
    enabled: !!user && isPageMounted,
    dependencies: [isPageMounted, user?.id],
  });

  // Fetch recent activity with optimized query
  const { 
    data: activityLogs,
    isLoading: activityLogsLoading,
    refetch: refetchActivityLogs,
    error: activityLogsError
  } = useSupabaseQuery('activity_logs', {
    select: '*, profiles(full_name)',
    limit: 10,
    orderBy: { column: 'created_at', ascending: false },
    enabled: !!user && isPageMounted,
    dependencies: [isPageMounted, user?.id],
  });

  // Check if all data is loaded
  useEffect(() => {
    if (!projectsLoading && !featureRequestsLoading && !supportTicketsLoading && 
        !clientsLoading && !activityLogsLoading && !dataInitialized && user) {
      setDataInitialized(true);
    }
  }, [
    projectsLoading, 
    featureRequestsLoading, 
    supportTicketsLoading, 
    clientsLoading, 
    activityLogsLoading,
    dataInitialized,
    user
  ]);

  // Handle any data fetching errors
  useEffect(() => {
    const errors = [
      projectsError, 
      featureRequestsError, 
      supportTicketsError, 
      clientsError, 
      activityLogsError
    ].filter(Boolean);
    
    if (errors.length > 0) {
      console.error('Data fetching errors:', errors);
    }
  }, [
    projectsError, 
    featureRequestsError, 
    supportTicketsError, 
    clientsError, 
    activityLogsError
  ]);

  // Refresh all data
  const refreshAllData = useCallback(() => {
    clearCache(); // Clear cache before refetching
    refetchProjects();
    refetchFeatureRequests();
    refetchSupportTickets();
    refetchClients();
    refetchActivityLogs();
  }, [
    refetchProjects, 
    refetchFeatureRequests, 
    refetchSupportTickets, 
    refetchClients, 
    refetchActivityLogs
  ]);

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
          <p className="mt-4 text-gray">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Will redirect in the useEffect
  if (!user) {
    return null;
  }

  const isDataLoading = projectsLoading || featureRequestsLoading || supportTicketsLoading || clientsLoading;

  return (
    <DashboardLayout>
      <div className="page-header mb-8">
        <h1 className="text-2xl font-semibold mb-2">Dashboard</h1>
        <p className="text-gray">Overview of all AI projects, client requests and support tickets</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Active Projects"
          value={projectsCount || 0}
          icon={<FiFileText size={20} />}
          bgColor="bg-primary/10"
          textColor="text-primary"
          trend={{ value: isDataLoading ? "Loading..." : `${projectsCount || 0} total`, isUp: true }}
          isLoading={projectsLoading}
        />
        <StatsCard
          title="Feature Requests"
          value={featureRequestsCount || 0}
          icon={<FiMessageSquare size={20} />}
          bgColor="bg-secondary/10"
          textColor="text-secondary"
          trend={{ value: isDataLoading ? "Loading..." : `${featureRequestsCount || 0} total`, isUp: true }}
          isLoading={featureRequestsLoading}
        />
        <StatsCard
          title="Open Support Tickets"
          value={supportTicketsCount || 0}
          icon={<FiExternalLink size={20} />}
          bgColor="bg-warning/10"
          textColor="text-warning"
          trend={{ value: isDataLoading ? "Loading..." : `${supportTicketsCount || 0} total`, isUp: false }}
          isLoading={supportTicketsLoading}
        />
        <StatsCard
          title="Active Clients"
          value={clientsCount || 0}
          icon={<FiUsers size={20} />}
          bgColor="bg-info/10"
          textColor="text-info"
          trend={{ value: isDataLoading ? "Loading..." : `${clientsCount || 0} total`, isUp: true }}
          isLoading={clientsLoading}
        />
      </div>

      {/* Main Dashboard Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity Feed */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Recent Activity</h2>
              <button 
                className="btn btn-secondary"
                onClick={refreshAllData}
                disabled={activityLogsLoading}
              >
                <FiRefreshCw className={`mr-2 ${activityLogsLoading ? 'animate-spin' : ''}`} size={16} />
                Refresh
              </button>
            </div>
            <div className="card-body">
              <div className="max-h-[400px] overflow-y-auto">
                {activityLogsLoading ? (
                  <div className="py-4 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-gray">Loading activity...</p>
                  </div>
                ) : activityLogs && activityLogs.length > 0 ? (
                  activityLogs.map((activity: any) => (
                    <div key={activity.id} className="py-4 border-b border-gray-light flex">
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-4 flex-shrink-0">
                        <FiFileText size={18} />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">{activity.profiles?.full_name || 'Unknown User'}</span>
                          <span className="text-xs text-gray">
                            {new Date(activity.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm">{activity.action} {activity.entity_type} {activity.details?.name || ''}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-center text-gray">No recent activity found</div>
                )}
              </div>
            </div>
            <div className="card-footer">
              <button className="btn btn-secondary">View All Activity</button>
            </div>
          </div>
        </div>

        {/* Recent Support Tickets */}
        <div>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Recent Support Tickets</h2>
              <button className="btn btn-primary">
                <FiPlus className="mr-2" size={16} />
                New Ticket
              </button>
            </div>
            <div className="card-body">
              {supportTicketsLoading ? (
                <div className="py-4 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-gray">Loading tickets...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-light">
                      <tr>
                        <th className="py-3 px-4 text-left">ID</th>
                        <th className="py-3 px-4 text-left">Title</th>
                        <th className="py-3 px-4 text-left">Status</th>
                        <th className="py-3 px-4 text-left">Priority</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supportTickets && supportTickets.length > 0 ? (
                        supportTickets.map((ticket: any) => (
                          <tr key={ticket.id} className="hover:bg-light">
                            <td className="py-3 px-4 border-b border-gray-light">#{ticket.id.substring(0, 4)}</td>
                            <td className="py-3 px-4 border-b border-gray-light">{ticket.title}</td>
                            <td className="py-3 px-4 border-b border-gray-light">
                              <span className={`badge badge-${ticket.status === 'new' ? 'warning' : 'info'}`}>
                                {ticket.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3 px-4 border-b border-gray-light">{ticket.priority}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-gray">No tickets found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="card-footer">
              <button className="btn btn-secondary">View All Tickets</button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 