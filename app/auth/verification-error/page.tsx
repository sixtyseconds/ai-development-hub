'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiAlertCircle, FiLayers, FiMail, FiCheckCircle } from 'react-icons/fi';
import { supabase } from '@/utils/supabase';

export default function VerificationError() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [errorDescription, setErrorDescription] = useState<string | null>(null);

  useEffect(() => {
    // Get error details from URL
    const error = searchParams.get('error');
    const errorCode = searchParams.get('error_code');
    const errorDescription = searchParams.get('error_description');

    if (error) setError(error);
    if (errorCode) setErrorCode(errorCode);
    if (errorDescription) setErrorDescription(errorDescription?.replace(/\+/g, ' '));
  }, [searchParams]);

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      
      if (error) throw error;
      
      setSuccess('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      console.error('Error resending verification:', error);
      setError(error.message || 'Failed to send verification email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center">
            <FiLayers className="h-12 w-12 text-primary" />
          </div>
          <h2 className="mt-6 text-2xl font-extrabold text-dark">
            Verification Error
          </h2>
          <div className="mt-2 flex items-center justify-center text-danger">
            <FiAlertCircle className="mr-2" />
            <p className="text-sm">
              {errorDescription || 'Your verification link has expired or is invalid'}
            </p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4">Request a new verification link</h3>
          
          {error && error !== 'access_denied' && (
            <div className="bg-danger/10 text-danger p-3 rounded-md text-sm flex items-start mb-4">
              <FiAlertCircle className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          {success && (
            <div className="bg-secondary/10 text-secondary p-3 rounded-md text-sm flex items-start mb-4">
              <FiCheckCircle className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}
          
          <form onSubmit={handleResendVerification}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-light rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Enter your email address"
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                <span className="flex items-center">
                  <FiMail className="mr-2" />
                  Resend Verification Email
                </span>
              )}
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <Link href="/login" className="text-sm text-primary hover:text-primary-dark">
              Return to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 