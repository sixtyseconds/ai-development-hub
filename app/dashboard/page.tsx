'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import StatsCard from '@/components/StatsCard';
import { useAuth } from '@/contexts/AuthContext';
import { 
  FiFileText, 
  FiMessageSquare, 
  FiExternalLink, 
  FiUsers,
  FiRefreshCw, 
  FiPlus 
} from 'react-icons/fi';

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in the useEffect
  }

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
          value={12}
          icon={<FiFileText size={20} />}
          bgColor="bg-primary/10"
          textColor="text-primary"
          trend={{ value: "2 new this month", isUp: true }}
        />
        <StatsCard
          title="Feature Requests"
          value={28}
          icon={<FiMessageSquare size={20} />}
          bgColor="bg-secondary/10"
          textColor="text-secondary"
          trend={{ value: "7 new this week", isUp: true }}
        />
        <StatsCard
          title="Open Support Tickets"
          value={15}
          icon={<FiExternalLink size={20} />}
          bgColor="bg-warning/10"
          textColor="text-warning"
          trend={{ value: "3 less than yesterday", isUp: false }}
        />
        <StatsCard
          title="Active Clients"
          value={8}
          icon={<FiUsers size={20} />}
          bgColor="bg-info/10"
          textColor="text-info"
          trend={{ value: "1 new this month", isUp: true }}
        />
      </div>

      {/* Main Dashboard Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity Feed */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Recent Activity</h2>
              <button className="btn btn-secondary">
                <FiRefreshCw className="mr-2" size={16} />
                Refresh
              </button>
            </div>
            <div className="card-body">
              <div className="max-h-[400px] overflow-y-auto">
                {/* Activity items would be dynamically generated from data */}
                <div className="py-4 border-b border-gray-light flex">
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-4 flex-shrink-0">
                    <FiFileText size={18} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">Sarah Johnson</span>
                      <span className="text-xs text-gray">10 min ago</span>
                    </div>
                    <p className="text-sm">Created a new project <strong>Image Recognition API</strong> for TechFlow Inc.</p>
                  </div>
                </div>
                {/* More activity items would go here */}
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
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-light">
                    <tr>
                      <th className="py-3 px-4 text-left">ID</th>
                      <th className="py-3 px-4 text-left">Client</th>
                      <th className="py-3 px-4 text-left">Status</th>
                      <th className="py-3 px-4 text-left">Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-light">
                      <td className="py-3 px-4 border-b border-gray-light">#4872</td>
                      <td className="py-3 px-4 border-b border-gray-light">Acme Corp</td>
                      <td className="py-3 px-4 border-b border-gray-light">
                        <span className="badge badge-warning">In Progress</span>
                      </td>
                      <td className="py-3 px-4 border-b border-gray-light">High</td>
                    </tr>
                    {/* More tickets would go here */}
                  </tbody>
                </table>
              </div>
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