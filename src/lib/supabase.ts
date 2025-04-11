import { createClient } from '@supabase/supabase-js';
import { Configuration, OpenAIApi } from 'openai';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create OpenAI configuration
export const openaiConfig = new Configuration({
  apiKey: openaiApiKey
});

// Create OpenAI client
export const openai = new OpenAIApi(openaiConfig);