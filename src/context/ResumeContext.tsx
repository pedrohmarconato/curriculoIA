import React, { createContext, useContext, useState } from 'react';
import { ResumeData } from '../types/resume';

interface ResumeContextType {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  updateResumeData: (updates: Partial<ResumeData>) => void;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

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
};