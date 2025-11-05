import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';

const config = Constants.expoConfig?.extra ?? {};

if (!config.supabaseUrl || !config.supabaseAnonKey) {
  // Fail fast with a clear error so developers know to set env vars
  console.warn(
    'Missing Supabase configuration. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env and restart the dev server.'
  );
}

export const supabase = createClient(
  config.supabaseUrl || '',
  config.supabaseAnonKey || ''
);


