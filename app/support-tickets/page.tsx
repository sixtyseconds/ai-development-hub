'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { clearCache, supabase } from '@/utils/supabase';
import { FiRefreshCw, FiPlus, FiFilter, FiCheck, FiX, FiClock, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import type { SupportTicket, Client } from '@/utils/supabase-types';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function SupportTicketsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [clientFilter, setClientFilter] = useState<string | null>(null);
  const [assignedToMeFilter, setAssignedToMeFilter] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for direct data fetching
  const [supportTickets, setSupportTickets] = useState<(SupportTicket & { 
    clients: Pick<Client, 'id' | 'name' | 'logo_url'>,
    profiles: { full_name: string }
  })[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<{ id: string; title: string } | null>(null);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch support tickets with client data only, not attempting to join profiles directly
      let query = supabase
        .from('support_tickets')
        .select(`
          *,
          clients(id, name, logo_url)
        `)
        .order('submitted_at', { ascending: false });
      
      // Apply filters
      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }
      
      if (priorityFilter) {
        query = query.eq('priority', priorityFilter);
      }
      
      if (clientFilter) {
        query = query.eq('client_id', clientFilter);
      }
      
      if (assignedToMeFilter && user) {
        query = query.eq('assigned_to', user.id);
      }
      
      console.log('Executing support tickets query...');
      const { data: ticketsData, error: ticketsError } = await query;
      
      if (ticketsError) {
        console.error('Error fetching tickets:', ticketsError);
        
        // Check for RLS policy violation
        if (ticketsError.message?.includes('policy') || ticketsError.code === 'PGRST301') {
          throw new Error(`Permission denied: You don't have access to view support tickets. This may be due to Row Level Security policies.`);
        }
        
        throw new Error(`Failed to fetch tickets: ${ticketsError.message}`);
      }
      
      // Get all unique assigned_to user IDs
      const assignedUserIds = ticketsData
        ?.filter(ticket => ticket.assigned_to)
        .map(ticket => ticket.assigned_to)
        .filter((id, index, self) => self.indexOf(id) === index);
      
      // If we have assigned users, fetch their profiles separately
      let profilesMap: Record<string, { full_name: string }> = {};
      
      if (assignedUserIds && assignedUserIds.length > 0) {
        console.log('Fetching profiles data for assigned users...');
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', assignedUserIds);
        
        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          // Just log this error but don't throw, we can still show tickets without profile names
        } else if (profilesData) {
          // Create a map of profile data by ID for easy lookup
          profilesMap = profilesData.reduce((acc, profile) => {
            acc[profile.id] = { full_name: profile.full_name };
            return acc;
          }, {} as Record<string, { full_name: string }>);
        }
      }
      
      // Fetch clients for filter
      console.log('Fetching clients data...');
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('id, name')
        .order('name');
        
      if (clientsError) {
        console.error('Error fetching clients:', clientsError);
        throw new Error(`Failed to fetch clients: ${clientsError.message}`);
      }
      
      // Manually add profiles data to tickets
      const ticketsWithProfiles = ticketsData?.map(ticket => {
        return {
          ...ticket,
          profiles: ticket.assigned_to ? (profilesMap[ticket.assigned_to] || { full_name: 'Unknown User' }) : { full_name: 'Unassigned' }
        };
      });
      
      setSupportTickets(ticketsWithProfiles || []);
      setClients(clientsData || []);
      console.log(`Fetched ${ticketsData?.length || 0} tickets and ${clientsData?.length || 0} clients`);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : (typeof err === 'object' && err !== null)
          ? JSON.stringify(err)
          : 'Failed to load data';
      setError(errorMessage);
      toast.error(`Error loading support tickets: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, priorityFilter, clientFilter, assignedToMeFilter, user]);
  
  // Load data on mount
  useEffect(() => {
    if (user) {
      clearCache();
      fetchData();
    }
  }, [user, fetchData]);

  // Handle delete ticket
  const handleDeleteClick = (ticket: SupportTicket) => {
    setTicketToDelete({ id: ticket.id, title: ticket.title });
    setDeleteModalOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!ticketToDelete) return;
    
    try {
      const { error } = await supabase
        .from('support_tickets')
        .delete()
        .eq('id', ticketToDelete.id);
        
      if (error) throw error;
      
      toast.success('Support ticket deleted successfully');
      fetchData(); // Refresh data
      setDeleteModalOpen(false);
      setTicketToDelete(null);
    } catch (err) {
      console.error('Error deleting support ticket:', err);
      toast.error('Failed to delete support ticket');
    }
  };

  // Filter support tickets by client if clientFilter is set and by search term
  const filteredSupportTickets = supportTickets
    ?.filter(ticket => {
      // Filter by client
      const matchesClient = !clientFilter || ticket.client_id === clientFilter;
      
      // Filter by search term
      const matchesSearch = !searchTerm || 
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ticket.description && ticket.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesClient && matchesSearch;
    });

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig = {
      new: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'New' },
      in_progress: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'In Progress' },
      resolved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Resolved' },
      closed: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Closed' },
      escalated: { bg: 'bg-red-100', text: 'text-red-800', label: 'Escalated' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  // Priority badge component
  const PriorityBadge = ({ priority }: { priority: string }) => {
    const priorityConfig = {
      low: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Low' },
      medium: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Medium' },
      high: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'High' },
      critical: { bg: 'bg-red-100', text: 'text-red-800', label: 'Critical' },
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Loading state
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

  // Will redirect in the useEffect
  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="page-header mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Support Tickets</h1>
          <p className="text-gray-500">Manage and track client support tickets</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center"
            onClick={fetchData}
            disabled={isLoading}
          >
            <FiRefreshCw className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} size={16} />
            Refresh
          </button>
          <Link 
            href="/support-tickets/new" 
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark flex items-center"
          >
            <FiPlus className="mr-2" size={16} />
            New Ticket
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* Search input */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-48">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiFilter className="text-gray-400" />
              </div>
              <select
                value={statusFilter || 'all'}
                onChange={(e) => setStatusFilter(e.target.value === 'all' ? null : e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
                <option value="escalated">Escalated</option>
              </select>
            </div>
          </div>
          
          <div className="w-full md:w-48">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiFilter className="text-gray-400" />
              </div>
              <select
                value={priorityFilter || 'all'}
                onChange={(e) => setPriorityFilter(e.target.value === 'all' ? null : e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          
          <div className="w-full md:w-48">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiFilter className="text-gray-400" />
              </div>
              <select
                value={clientFilter || 'all'}
                onChange={(e) => setClientFilter(e.target.value === 'all' ? null : e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
                disabled={isLoading}
              >
                <option value="all">All Clients</option>
                {clients?.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="w-full md:w-auto flex items-center">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={assignedToMeFilter}
                onChange={(e) => setAssignedToMeFilter(e.target.checked)}
                className="form-checkbox h-5 w-5 text-primary rounded border-gray-300 focus:ring-primary"
              />
              <span className="ml-2 text-sm text-gray-700">Assigned to me</span>
            </label>
          </div>
        </div>
      </div>

      {/* Add this JSX after the filters section and before the tickets list */}
      {error && (
        <div className="bg-danger/10 text-danger p-4 rounded-lg mb-6">
          <div className="flex items-start">
            <FiX className="mt-1 mr-2 flex-shrink-0" />
            <div>
              <h3 className="font-medium">Error loading support tickets</h3>
              <p className="text-sm mt-1">{error}</p>
              <button
                onClick={() => fetchData()}
                className="mt-3 px-3 py-1.5 bg-danger text-white rounded-md text-sm flex items-center"
              >
                <FiRefreshCw className="mr-2" size={14} />
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Support Tickets Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading support tickets...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            <p>Error loading support tickets: {error}</p>
            <button
              onClick={fetchData}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              Retry
            </button>
          </div>
        ) : filteredSupportTickets && filteredSupportTickets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSupportTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{ticket.title}</div>
                      {ticket.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">{ticket.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {ticket.clients?.name || 'Unknown Client'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {ticket.profiles?.full_name || 'Unassigned'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <FiClock className="mr-1 text-gray-400" size={14} />
                        {formatDate(ticket.submitted_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        href={`/support-tickets/${ticket.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title="View Ticket"
                      >
                        <FiEye size={18} />
                      </Link>
                      <Link 
                        href={`/support-tickets/${ticket.id}/edit`}
                        className="text-primary hover:text-primary-dark mr-3"
                        title="Edit Ticket"
                      >
                        <FiEdit size={18} />
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(ticket)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete Ticket"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p>No support tickets found. {searchTerm || statusFilter || priorityFilter || clientFilter || assignedToMeFilter ? 'Try adjusting your filters.' : ''}</p>
            <Link 
              href="/support-tickets/new" 
              className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              <FiPlus className="inline mr-2" size={16} />
              Create your first support ticket
            </Link>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && ticketToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <FiTrash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Support Ticket</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete the support ticket "{ticketToDelete.title}"? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setTicketToDelete(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
} 