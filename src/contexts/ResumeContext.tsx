import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ResumeData } from '../types/resume';

// Define a estrutura para as 8 seções essenciais processadas pela IA
export interface ResumeSections {
  CabecalhoImpactante: string;
  ResumoProfissionalPersuasivo: string;
  PalavrasChaveOtimizadas: string;
  ExperienciaProfissional: string;
  CompetenciasTecnicasComportamentais: string;
  FormacaoAcademicaCertificacoes: string;
  RealizacoesDestacadas: string;
  ConteudoComplementar: string;
}

// Define o tipo para as chaves das seções
export type SectionKey = keyof ResumeSections;

// Define a estrutura para o status de confirmação das seções
export type SectionConfirmationStatus = Record<SectionKey, boolean>;

// Interface do contexto
interface ResumeContextType {
  // Propriedades originais
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  updateResumeData: (updates: Partial<ResumeData>) => void;
  
  // Propriedades para os dados processados pela IA
  processedResumeData: ResumeSections | null;
  setProcessedResumeData: React.Dispatch<React.SetStateAction<ResumeSections | null>>;
  updateProcessedSection: (section: SectionKey, content: string) => void;
  
  // Propriedades para o status de confirmação
  sectionConfirmationStatus: SectionConfirmationStatus;
  setSectionConfirmed: (section: SectionKey, status: boolean) => void;
  getConfirmationStatus: (section: SectionKey) => boolean;
  areAllSectionsConfirmed: () => boolean;
}

// Criar o contexto
const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

// Hook para usar o contexto
export const useResume = () => {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
};

// Provedor do contexto
export const ResumeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estado para os dados originais do currículo
  const [resumeData, setResumeData] = useState<ResumeData>({
    currentStep: 1,
    isAuthenticated: false,
    currentSection: 'profile'
  });

  // Estado para os dados processados pela IA
  const [processedResumeData, setProcessedResumeData] = useState<ResumeSections | null>(() => {
    const savedData = localStorage.getItem('processedResumeData');
    try {
      return savedData ? JSON.parse(savedData) : null;
    } catch (e) {
      console.error("Falha ao analisar processedResumeData do localStorage", e);
      return null;
    }
  });

  // Estado para o status de confirmação das seções
  const [sectionConfirmationStatus, setSectionConfirmationStatus] = useState<SectionConfirmationStatus>(() => {
    const savedStatus = localStorage.getItem('sectionConfirmationStatus');
    const defaultStatus: SectionConfirmationStatus = {
      CabecalhoImpactante: false,
      ResumoProfissionalPersuasivo: false,
      PalavrasChaveOtimizadas: false,
      ExperienciaProfissional: false,
      CompetenciasTecnicasComportamentais: false,
      FormacaoAcademicaCertificacoes: false,
      RealizacoesDestacadas: false,
      ConteudoComplementar: false,
    };
    try {
      // Garantir que todas as chaves existam, mesmo carregando do armazenamento
      const loadedStatus = savedStatus ? JSON.parse(savedStatus) : {};
      return { ...defaultStatus, ...loadedStatus };
    } catch (e) {
      console.error("Falha ao analisar sectionConfirmationStatus do localStorage", e);
      return defaultStatus;
    }
  });

  // Persistir estados no localStorage
  useEffect(() => {
    if (processedResumeData) {
      localStorage.setItem('processedResumeData', JSON.stringify(processedResumeData));
    } else {
      localStorage.removeItem('processedResumeData');
    }
  }, [processedResumeData]);

  useEffect(() => {
    localStorage.setItem('sectionConfirmationStatus', JSON.stringify(sectionConfirmationStatus));
  }, [sectionConfirmationStatus]);

  // Função para atualizar o resumeData
  const updateResumeData = useCallback((updates: Partial<ResumeData>) => {
    setResumeData(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  // Função para atualizar uma seção específica dos dados processados
  const updateProcessedSection = useCallback((section: SectionKey, content: string) => {
    setProcessedResumeData(prev => {
      if (!prev) return null;
      return { ...prev, [section]: content };
    });
  }, []);

  // Função para definir o status de confirmação de uma seção
  const setSectionConfirmed = useCallback((section: SectionKey, status: boolean) => {
    setSectionConfirmationStatus(prev => ({ ...prev, [section]: status }));
  }, []);

  // Função para obter o status de confirmação de uma seção
  const getConfirmationStatus = useCallback((section: SectionKey): boolean => {
    return sectionConfirmationStatus[section] ?? false;
  }, [sectionConfirmationStatus]);

  // Função para verificar se todas as seções foram confirmadas
  const areAllSectionsConfirmed = useCallback((): boolean => {
    return Object.values(sectionConfirmationStatus).every(status => status);
  }, [sectionConfirmationStatus]);

  // Valores do contexto
  const contextValue: ResumeContextType = {
    resumeData,
    setResumeData,
    updateResumeData,
    processedResumeData,
    setProcessedResumeData,
    updateProcessedSection,
    sectionConfirmationStatus,
    setSectionConfirmed,
    getConfirmationStatus,
    areAllSectionsConfirmed
  };

  return (
    <ResumeContext.Provider value={contextValue}>
      {children}
    </ResumeContext.Provider>
  );
};