export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  phone?: string;
  preferences?: {
    theme?: 'light' | 'dark';
    fontSize?: 'small' | 'normal' | 'large' | 'xlarge';
    language?: string;
    timezone?: string;
    notifications?: {
      email?: boolean;
      push?: boolean;
      updates?: boolean;
    };
    privacy?: {
      profileVisibility?: 'public' | 'private';
      showEmail?: boolean;
      showPhone?: boolean;
    };
  };
}

export interface ResumeStyle {
  id: string;
  name: string;
  description: string;
  preview: string;
}

export interface ColorPalette {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  preview: string;
}

export interface PersonalizationOptions {
  selectedStyle?: string;
  selectedPalette?: string;
  useLinkedinPhoto?: boolean;
  customPhoto?: string;
}

export interface ResumeData {
  currentStep: number;
  currentSection?: 'profile' | 'settings' | 'credits' | 'activity';
  isAuthenticated?: boolean;
  showUserArea?: boolean;
  user?: User;
  selectedPlan?: string;
  resumeFile?: {
    url: string;
    type: string;
    name: string;
  };
  linkedinProfile?: string;
  personalization?: PersonalizationOptions;
  resumeData?: any;
}