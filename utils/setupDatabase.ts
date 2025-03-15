import { supabase } from './supabase';

// Track if setup has been attempted to avoid duplicate calls
let setupAttempted = false;
let setupSuccessful = false;

export async function setupDatabase() {
  // Only run setup once
  if (setupAttempted) {
    return { success: setupSuccessful };
  }
  
  setupAttempted = true;
  console.log('Checking database setup...');
  
  try {
    // Check if profiles table exists
    const { data: profilesExists, error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (profilesError && profilesError.message.includes('does not exist')) {
      console.log('Profiles table does not exist. Creating...');
      
      // Create profiles table
      const { error: createProfilesError } = await supabase.rpc('create_profiles_table');
      
      if (createProfilesError) {
        console.error('Error creating profiles table:', createProfilesError);
        
        // Try direct SQL as fallback
        try {
          const { error: sqlError } = await supabase.rpc('execute_sql', {
            sql_query: `
              CREATE TABLE IF NOT EXISTS public.profiles (
                id UUID REFERENCES auth.users(id) PRIMARY KEY,
                full_name TEXT,
                avatar_url TEXT,
                role TEXT CHECK (role IN ('admin', 'manager', 'developer', 'client')),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
              );
            `
          });
          
          if (sqlError) {
            console.error('Error creating profiles table with SQL:', sqlError);
            setupSuccessful = false;
            return { success: false, error: sqlError };
          }
        } catch (fallbackError) {
          console.error('Error in SQL fallback:', fallbackError);
          setupSuccessful = false;
          return { success: false, error: fallbackError };
        }
      }
      
      console.log('Profiles table created successfully');
    } else if (profilesError) {
      console.error('Error checking profiles table:', profilesError);
      setupSuccessful = false;
      return { success: false, error: profilesError };
    } else {
      console.log('Profiles table already exists');
    }
    
    setupSuccessful = true;
    return { success: true };
  } catch (error) {
    console.error('Error setting up database:', error);
    setupSuccessful = false;
    return { success: false, error };
  }
} 