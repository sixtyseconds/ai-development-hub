import { supabase } from './supabase';

export async function setupDatabase() {
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
          throw sqlError;
        }
      }
      
      console.log('Profiles table created successfully');
    } else {
      console.log('Profiles table already exists');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error setting up database:', error);
    return { success: false, error };
  }
} 