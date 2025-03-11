'use client';

import { useEffect, useState } from 'react';
import { setupDatabase } from '@/utils/setupDatabase';

export default function DatabaseSetup() {
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);

  useEffect(() => {
    const runSetup = async () => {
      try {
        const result = await setupDatabase();
        if (result.success) {
          setIsSetupComplete(true);
        } else {
          setSetupError('Failed to set up database');
          console.error('Database setup failed:', result.error);
        }
      } catch (error) {
        setSetupError('Error during database setup');
        console.error('Database setup error:', error);
      }
    };

    runSetup();
  }, []);

  // This component doesn't render anything visible
  return null;
} 