import React, { useState, useRef, useEffect } from 'react';
import { useResume } from '../contexts/ResumeContext';
import { supabase } from '../lib/supabase';
import { 
  User, 
  Settings, 
  LogOut, 
  CreditCard, 
  UserCircle,
  ChevronDown
} from 'lucide-react';
import { useCredits } from '../hooks/useCredits';
import toast from 'react-hot-toast';

const UserMenu = () => {
  const { resumeData, updateResumeData } = useResume();
  const { credits } = useCredits(resumeData.user?.id);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      updateResumeData({
        currentStep: 1,
        isAuthenticated: false,
        showUserArea: false,
        user: undefined
      });

      toast.success('Logout realizado com sucesso');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  const handleNavigateToUserArea = (section: 'profile' | 'settings' | 'credits') => {
    updateResumeData({ 
      currentSection: section,
      showUserArea: true 
    });
    setIsOpen(false);
  };

  if (!resumeData.isAuthenticated || !resumeData.user) {
    return null;
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/5 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
          {resumeData.user.avatar_url ? (
            <img
              src={resumeData.user.avatar_url}
              alt={resumeData.user.name || 'Profile'}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <UserCircle className="w-5 h-5 text-accent" />
          )}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-primary line-clamp-1">
            {resumeData.user.name || resumeData.user.email}
          </p>
          <p className="text-xs text-primary/70">
            {credits} crédito{credits !== 1 ? 's' : ''}
          </p>
        </div>
        <ChevronDown className="w-4 h-4 text-primary/70" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-secondary py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-secondary">
            <p className="font-medium text-primary line-clamp-1">
              {resumeData.user.name || resumeData.user.email}
            </p>
            <p className="text-sm text-primary/70">{resumeData.user.email}</p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => handleNavigateToUserArea('profile')}
              className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-secondary/10 text-primary"
            >
              <User className="w-4 h-4" />
              <span>Gerenciar Perfil</span>
            </button>

            <button
              onClick={() => handleNavigateToUserArea('settings')}
              className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-secondary/10 text-primary"
            >
              <Settings className="w-4 h-4" />
              <span>Configurações</span>
            </button>

            <button
              onClick={() => handleNavigateToUserArea('credits')}
              className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-secondary/10 text-primary"
            >
              <CreditCard className="w-4 h-4" />
              <span>Gerenciar Créditos</span>
              <span className="ml-auto bg-accent/10 text-accent px-2 py-0.5 rounded-full text-xs font-medium">
                {credits}
              </span>
            </button>
          </div>

          {/* Logout */}
          <div className="pt-2 border-t border-secondary">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-red-50 text-red-600"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserMenu