import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import AuthDebug from '@/components/AuthDebug';
import DatabaseSetup from '@/components/DatabaseSetup';

export const metadata: Metadata = {
  title: 'AIProjectHub - Centralized Project Management',
  description: 'Centralized AI Application Project Management Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <DatabaseSetup />
          {children}
          <AuthDebug />
        </AuthProvider>
      </body>
    </html>
  );
} 