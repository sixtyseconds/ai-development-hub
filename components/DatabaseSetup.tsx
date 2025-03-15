'use client';

import { useEffect, useState, useRef } from 'react';
import { setupDatabase } from '@/utils/setupDatabase';

export default function DatabaseSetup() {
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);
  const setupAttempted = useRef(false);

  useEffect(() => {
    const runSetup = async () => {
      // Only run setup once
      if (setupAttempted.current) return;
      setupAttempted.current = true;
      
      try {
        console.log('Starting database setup check...');
        const result = await setupDatabase();
        
        if (result.success) {
          console.log('Database setup completed successfully');
          setIsSetupComplete(true);
        } else {
          console.error('Database setup failed:', result.error);
          setSetupError('Failed to set up database');
        }
      } catch (error) {
        console.error('Error during database setup:', error);
        setSetupError('Error during database setup');
      }
    };

    runSetup();
  }, []);

  // This component doesn't render anything visible
  return null;
} 