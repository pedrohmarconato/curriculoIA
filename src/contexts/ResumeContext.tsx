import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';Callback } from 'react';
import { ResumeData } from '../types/resume';
// Define the structure for the 8 essential sections processed by AI
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

type SectionKey = keyof ResumeSections;

// Define the structure for confirmation status
type SectionConfirmationStatus = Record<SectionKey, boolean>;
interface ResumeContextType {
  resumeData: ResumeData;
interface ResumeContextType {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  updateResumeData: (updates: Partial<ResumeData>) => void;
  processedResumeData: ResumeSections | null; // Holds the AI-processed data
  setProcessedResumeData: React.Dispatch<React.SetStateAction<ResumeSections | null>>;
  updateProcessedSection: (section: SectionKey, content: string) => void;
  sectionConfirmationStatus: SectionConfirmationStatus;
  setSectionConfirmed: (section: SectionKey, status: boolean) => void;
  getConfirmationStatus: (section: SectionKey) => boolean;
  areAllSectionsConfirmed: () => boolean;
  // State for AI-processed resume data
  const [processedResumeData, setProcessedResumeData] = useState<ResumeSections | null>(() => {
    const savedData = localStorage.getItem('processedResumeData');
    try {
      return savedData ? JSON.parse(savedData) : null;
    } catch (e) {
      console.error("Failed to parse processedResumeData from localStorage", e);
      return null;
    }
  });

  // State for section confirmation status
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
      // Ensure all keys exist even if loading from storage
      const loadedStatus = savedStatus ? JSON.parse(savedStatus) : {};
      return { ...defaultStatus, ...loadedStatus };
    } catch (e) {
      console.error("Failed to parse sectionConfirmationStatus from localStorage", e);
      return defaultStatus;
    }
  });

  // --- Persistence Effects ---

  useEffect(() => {
    if (processedResumeData) {
      localStorage.setItem('processedResumeData', JSON.stringify(processedResumeData));
    } else {
      localStorage.removeItem('processedResumeData'); // Clear if null
    }
  }, [processedResumeData]);

  useEffect(() => {
    localStorage.setItem('sectionConfirmationStatus', JSON.stringify(sectionConfirmationStatus));
  }, [sectionConfirmationStatus]);


  // --- Functions for EditResumeDataStep ---

  const updateProcessedSection = useCallback((section: SectionKey, content: string) => {
    setProcessedResumeData(prev => {
      if (!prev) return null; // Should ideally not happen if called correctly
      return { ...prev, [section]: content };
    });
    // Optionally reset confirmation status when section is edited
    // setSectionConfirmationStatus(prev => ({ ...prev, [section]: false }));
  }, []);

  const setSectionConfirmed = useCallback((section: SectionKey, status: boolean) => {
    setSectionConfirmationStatus(prev => ({ ...prev, [section]: status }));
  }, []);

  const getConfirmationStatus = useCallback((section: SectionKey): boolean => {
    return sectionConfirmationStatus[section] ?? false;
  }, [sectionConfirmationStatus]);

  const areAllSectionsConfirmed = useCallback((): boolean => {
    return Object.values(sectionConfirmationStatus).every(status => status);
  }, [sectionConfirmationStatus]);const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export const useResume = () => {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
};

export const ResumeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [resumeData, setResumeData] = useState<ResumeData>({
    currentStep: 1,
    isAuthenticated: false,
    currentSection: 'profile'
  });

  const updateResumeData = (updates: Partial<ResumeData>) => {
    setResumeData(prev => ({
      ...prev,
      ...updates
    }));
  };

  return (
    <ResumeContext.Provider value={{ resumeData, setResumeData, updateResumeData }}>
      {children}
    </ResumeContext.Provider>
  );
    <ResumeContext.Provider value={{
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
    }}>