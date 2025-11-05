const { config } = require('dotenv');

config();

module.exports = ({ config }) => ({
  ...config,
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://rtxqdcbfjxumrxfozntp.supabase.co',
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0eHFkY2Jmanh1bXJ4Zm96bnRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjM4NjIsImV4cCI6MjA3NzMzOTg2Mn0.SipdQHK3hNiM9tBztL9sCu5aoUJBwAPDBcDKst2P_wM',
  },
});


