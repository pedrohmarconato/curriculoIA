import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    // Usar fluxo implicit para evitar problemas com Edge Functions
    flowType: 'implicit',
    // Desativar a tentativa de refresh através de funções Edge
    detectSessionInUrl: false,
    storageKey: 'supabase.auth.token'
  }
});

// Initialize OpenAI client (v4+)
export const openai = new OpenAI({
  apiKey: openaiApiKey,
  dangerouslyAllowBrowser: true // Required for client-side usage
});

// Função auxiliar para verificar o estado da sessão
export const checkSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Erro ao verificar sessão:', error);
      return null;
    }
    return session;
  } catch (e) {
    console.error('Erro ao verificar sessão:', e);
    return null;
  }
};

// Função para renovar token manualmente se necessário
export const refreshToken = async () => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      console.error('Erro ao renovar token:', error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Erro ao renovar token:', e);
    return false;
  }
};