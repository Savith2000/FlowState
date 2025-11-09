import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';

const config = Constants.expoConfig?.extra ?? {};

export const supabase = createClient(
  config.supabaseUrl || '',
  config.supabaseAnonKey || ''
);


