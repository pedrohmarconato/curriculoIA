import { supabase } from './supabase';

export interface ResumeData {
  personalInfo: {
    name: string;
    contact: {
      email: string;
      phone?: string;
      location?: string;
    };
  };
  experience: Array<{
    company: string;
    role: string;
    period: {
      start: string;
      end: string | 'present';
    };
    description: string;
    achievements: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    period: {
      start: string;
      end: string | 'present';
    };
  }>;
  skills: {
    technical: Array<{
      name: string;
      level: 'básico' | 'intermediário' | 'avançado' | 'especialista';
    }>;
    interpersonal: Array<{
      name: string;
      level: 'básico' | 'intermediário' | 'avançado' | 'especialista';
    }>;
    tools: Array<{
      name: string;
      level: 'básico' | 'intermediário' | 'avançado' | 'especialista';
    }>;
  };
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
    expirationDate?: string;
  }>;
  languages: Array<{
    name: string;
    level: 'básico' | 'intermediário' | 'avançado' | 'fluente' | 'nativo';
  }>;
}

export interface VisualStyle {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  style: 'modern' | 'classic' | 'creative' | 'minimal' | 'tech';
}

export async function analyzeResume(text: string): Promise<ResumeData> {
  const { data, error } = await supabase.functions.invoke('resume-ai', {
    body: {
      action: 'analyze',
      data: { text },
    },
  });

  if (error) throw error;
  return data.data;
}

export async function generateVisualResume(resume: ResumeData, style: VisualStyle): Promise<string> {
  const { data, error } = await supabase.functions.invoke('resume-ai', {
    body: {
      action: 'generate',
      data: { resume, style },
    },
  });

  if (error) throw error;
  return data.data;
}

export async function extractResumeFromPDF(url: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke('resume-ai', {
    body: {
      action: 'extract',
      data: { url },
    },
  });

  if (error) throw error;
  return data.data;
}

export async function extractResumeFromLinkedIn(url: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke('resume-ai', {
    body: {
      action: 'linkedin',
      data: { url },
    },
  });

  if (error) throw error;
  return data.data;
}