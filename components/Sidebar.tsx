'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FiGrid, 
  FiFileText, 
  FiUsers, 
  FiMessageSquare, 
  FiExternalLink, 
  FiBarChart2, 
  FiSettings, 
  FiHelpCircle 
} from 'react-icons/fi';

type SidebarLinkProps = {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
};

const SidebarLink = ({ href, icon, label, active }: SidebarLinkProps) => {
  return (
    <li className="sidebar-item mb-1">
      <Link 
        href={href}
        className={`flex items-center py-3 px-2 rounded-md ${
          active 
            ? 'bg-primary text-white' 
            : 'text-dark hover:bg-gray-light'
        }`}
      >
        <span className="mr-3">{icon}</span>
        <span className="md:block hidden">{label}</span>
      </Link>
    </li>
  );
};

type ClientLinkProps = {
  href: string;
  name: string;
  initial: string;
};

const ClientLink = ({ href, name, initial }: ClientLinkProps) => {
  return (
    <Link
      href={href}
      className="flex items-center p-2 rounded hover:bg-gray-light mb-1 text-dark"
    >
      <div className="w-6 h-6 rounded bg-gray-light text-gray flex items-center justify-center font-semibold mr-2">
        {initial}
      </div>
      <div className="text-sm font-medium md:block hidden whitespace-nowrap overflow-hidden text-ellipsis">
        {name}
      </div>
    </Link>
  );
};

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-16 md:w-60 bg-white border-r border-gray-light fixed h-[calc(100vh-64px)] top-16 overflow-y-auto py-6">
      <div className="mb-6 px-4">
        <h3 className="text-xs uppercase text-gray mb-3 px-2 md:block hidden">Main Menu</h3>
        <ul className="sidebar-menu">
          <SidebarLink 
            href="/dashboard" 
            icon={<FiGrid size={20} />} 
            label="Dashboard" 
            active={pathname === '/dashboard'} 
          />
          <SidebarLink 
            href="/projects" 
            icon={<FiFileText size={20} />} 
            label="Projects" 
            active={pathname === '/projects'} 
          />
          <SidebarLink 
            href="/clients" 
            icon={<FiUsers size={20} />} 
            label="Clients" 
            active={pathname === '/clients'} 
          />
          <SidebarLink 
            href="/feature-requests" 
            icon={<FiMessageSquare size={20} />} 
            label="Feature Requests" 
            active={pathname === '/feature-requests'} 
          />
          <SidebarLink 
            href="/support-tickets" 
            icon={<FiExternalLink size={20} />} 
            label="Support Tickets" 
            active={pathname === '/support-tickets'} 
          />
          <SidebarLink 
            href="/analytics" 
            icon={<FiBarChart2 size={20} />} 
            label="Analytics" 
            active={pathname === '/analytics'} 
          />
        </ul>
      </div>
      
      <div className="mb-6 px-4">
        <h3 className="text-xs uppercase text-gray mb-3 px-2 md:block hidden">Active Clients</h3>
        <div className="sidebar-clients max-h-[200px] overflow-y-auto">
          <ClientLink href="/clients/acme" name="Acme Corp" initial="A" />
          <ClientLink href="/clients/techflow" name="TechFlow Inc" initial="T" />
          <ClientLink href="/clients/globalai" name="GlobalAI Solutions" initial="G" />
          <ClientLink href="/clients/nexus" name="Nexus Data" initial="N" />
          <ClientLink href="/clients/vertex" name="Vertex Systems" initial="V" />
        </div>
      </div>
      
      <div className="px-4">
        <h3 className="text-xs uppercase text-gray mb-3 px-2 md:block hidden">Settings</h3>
        <ul className="sidebar-menu">
          <SidebarLink 
            href="/settings" 
            icon={<FiSettings size={20} />} 
            label="Account Settings" 
            active={pathname === '/settings'} 
          />
          <SidebarLink 
            href="/help" 
            icon={<FiHelpCircle size={20} />} 
            label="Help & Documentation" 
            active={pathname === '/help'} 
          />
        </ul>
      </div>
    </aside>
  );
} 