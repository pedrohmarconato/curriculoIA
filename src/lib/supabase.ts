import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initialize OpenAI client (v4+)
export const openai = new OpenAI({
  apiKey: openaiApiKey,
  dangerouslyAllowBrowser: true // Required for client-side usage
});
