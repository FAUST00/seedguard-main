import { createClient } from '@supabase/supabase-js';

// Hardcoded for static export — NEXT_PUBLIC_ env vars require
// a server-side build step to be injected; this guarantees they're always present
const supabaseUrl = 'https://earfjshpbwcnpqinrrvl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhcmZqc2hwYndjbnBxaW5ycnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3OTA1NDEsImV4cCI6MjA5NjM2NjU0MX0.5H38IPnQsbG-DL6qBW8wXhnq0hDTAr2yPH-Shv2xtvg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
