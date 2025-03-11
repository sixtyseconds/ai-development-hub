'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { FiBell, FiLayers, FiLogOut, FiSettings, FiUser } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, profile, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close the user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Get user initials for avatar
  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    
    return 'TW'; // Default fallback
  };

  return (
    <header className="bg-white shadow fixed w-full top-0 z-50">
      <div className="flex justify-between items-center px-4 h-16">
        <div className="flex items-center font-bold text-xl text-primary">
          <FiLayers className="mr-2" />
          <span>AIProjectHub</span>
        </div>
        <div className="hidden md:flex gap-6">
          <Link href="/dashboard" className="text-dark font-medium hover:text-primary transition-colors">
            Dashboard
          </Link>
          <Link href="/projects" className="text-dark font-medium hover:text-primary transition-colors">
            Projects
          </Link>
          <Link href="/clients" className="text-dark font-medium hover:text-primary transition-colors">
            Clients
          </Link>
          <Link href="/support" className="text-dark font-medium hover:text-primary transition-colors">
            Support
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative cursor-pointer">
            <FiBell className="text-dark" size={20} />
            <span className="absolute -top-1 -right-1 bg-danger text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-semibold">
              3
            </span>
          </div>
          <div className="relative" ref={userMenuRef}>
            <div 
              className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-semibold cursor-pointer"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              {getInitials()}
            </div>
            
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                <div className="px-4 py-2 border-b border-gray-light">
                  <p className="text-sm font-medium">{profile?.full_name || user?.email}</p>
                  <p className="text-xs text-gray">{profile?.role || 'User'}</p>
                </div>
                <Link 
                  href="/profile" 
                  className="block px-4 py-2 text-sm text-dark hover:bg-gray-light flex items-center"
                >
                  <FiUser className="mr-2" size={16} />
                  Your Profile
                </Link>
                <Link 
                  href="/settings" 
                  className="block px-4 py-2 text-sm text-dark hover:bg-gray-light flex items-center"
                >
                  <FiSettings className="mr-2" size={16} />
                  Settings
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-2 text-sm text-danger hover:bg-gray-light flex items-center"
                >
                  <FiLogOut className="mr-2" size={16} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 