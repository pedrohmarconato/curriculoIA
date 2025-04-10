import React, { useState } from 'react';
import { useResume } from '../../contexts/ResumeContext';
import { 
  User, 
  Settings, 
  CreditCard, 
  Bell, 
  Shield, 
  Clock,
  Sun,
  Moon,
  Globe,
  Upload,
  Edit3,
  Lock,
  AlertCircle
} from 'lucide-react';
import ProfileSection from './ProfileSection';
import SystemSettings from './SystemSettings';
import CreditsSection from './CreditsSection';
import ActivityHistory from './ActivityHistory';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

const UserArea = () => {
  const { resumeData, updateResumeData } = useResume();
  const { theme, toggleTheme } = useTheme();

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'settings', label: 'Configurações', icon: Settings },
    { id: 'credits', label: 'Créditos', icon: CreditCard },
    { id: 'activity', label: 'Atividades', icon: Clock },
  ];

  const renderContent = () => {
    switch (resumeData.currentSection) {
      case 'profile':
        return <ProfileSection />;
      case 'settings':
        return <SystemSettings />;
      case 'credits':
        return <CreditsSection />;
      case 'activity':
        return <ActivityHistory />;
      default:
        return <ProfileSection />;
    }
  };

  if (!resumeData.isAuthenticated || !resumeData.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Cabeçalho */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            Área do Usuário
          </h1>
          <p className="text-primary/70">
            Gerencie seu perfil, configurações e créditos
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Barra Lateral */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => updateResumeData({ currentSection: tab.id as any })}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${resumeData.currentSection === tab.id
                      ? 'bg-accent text-white'
                      : 'hover:bg-accent/5 text-primary'
                    }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>

            {/* Ações Rápidas */}
            <div className="mt-8 space-y-4">
              <h3 className="text-sm font-medium text-primary/70 px-4">
                Ações Rápidas
              </h3>
              
              {/* Alternar Tema */}
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary/10 text-primary"
              >
                {theme === 'light' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
                <span>Alternar Tema</span>
              </button>

              {/* Notificações */}
              <button
                onClick={() => toast.success('Notificações atualizadas')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary/10 text-primary"
              >
                <Bell className="w-5 h-5" />
                <span>Notificações</span>
              </button>

              {/* Privacidade */}
              <button
                onClick={() => toast.success('Configurações de privacidade atualizadas')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary/10 text-primary"
              >
                <Shield className="w-5 h-5" />
                <span>Privacidade</span>
              </button>
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-secondary">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserArea;