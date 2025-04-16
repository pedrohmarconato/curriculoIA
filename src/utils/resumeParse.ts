import { ResumeData } from '../lib/resume-ai';

// Funções utilitárias básicas para parsing, caso não existam implementações reais
function detectName(text: string): string | null { return null; }
function detectEmail(text: string): string | null { return null; }
function detectPhone(text: string): string | null { return null; }
function detectLocation(text: string): string | null { return null; }
function extractObjective(text: string): string | null { return null; }

/**
 * Analisa um currículo a partir do texto extraído
 */
export const parseResumeText = (text: string, userName?: string, userEmail?: string): ResumeData => {
  console.log('Analisando texto do currículo via método local');
  
  // Estrutura básica que vamos preencher
  const resumeData: ResumeData = {
    personalInfo: {
      name: userName || detectName(text) || "Nome não detectado",
      contact: {
        email: userEmail || detectEmail(text) || "",
        phone: detectPhone(text) || "",
        location: detectLocation(text) || ""
      }
    },
    objective: {
      summary: extractObjective(text) || "Profissional dedicado buscando aplicar minha experiência e conhecimentos em um ambiente desafiador."
    },
    experience: [],
    education: [],
    skills: {
      technical: [],
      interpersonal: [],
      tools: []
    },
    certifications: [],
    languages: [],
    marketExperience: {
      details: []
    }
  };
  // FIM do preenchimento do objeto resumeData
  return resumeData;
};

/**
 * Cria dados básicos de currículo para fallback
 */
export function createBasicResumeData(userName?: string, userEmail?: string): ResumeData {
  return {
    personalInfo: {
      name: userName || 'Seu Nome',
      contact: {
        email: userEmail || '',
        phone: '',
        location: ''
      }
    },
    objective: {
      summary: 'Profissional dedicado buscando novas oportunidades.'
    },
    experience: [
      {
        company: 'Empresa',
        role: 'Cargo',
        period: { start: '2020-01', end: 'present' },
        description: 'Descreva suas responsabilidades e realizações.',
        achievements: ['Conquista ou responsabilidade importante']
      }
    ],
    education: [
      {
        institution: 'Instituição de Ensino',
        degree: 'Grau Acadêmico',
        field: 'Área de Estudo',
        period: { start: '2015-01', end: '2019-12' }
      }
    ],
    skills: {
      technical: [
        { name: 'Habilidade Técnica', level: 'intermediário' }
      ],
      interpersonal: [
        { name: 'Comunicação', level: 'avançado' }
      ],
      tools: [
        { name: 'MS Office', level: 'avançado' }
      ]
    },
    languages: [
      { name: 'Português', level: 'nativo' },
      { name: 'Inglês', level: 'intermediário' }
    ],
    certifications: [],
    marketExperience: {
      details: []
    }
  };
}