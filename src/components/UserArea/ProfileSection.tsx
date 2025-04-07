import React, { useState, useRef } from 'react';
import { useResume } from '../../context/ResumeContext';
import { supabase } from '../../lib/supabase';
import { 
  Upload,
  Camera,
  Trash2,
  Loader2,
  CheckCircle2,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const ProfileSection = () => {
  const { resumeData, updateResumeData } = useResume();
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: resumeData.user?.name || '',
    email: resumeData.user?.email || '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, envie apenas imagens.');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem muito grande. Tamanho máximo: 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const userId = resumeData.user?.id;
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/profile-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('photos')
        .upload(fileName, file);

      if (error) throw error;

      if (data) {
        const { data: { publicUrl } } = supabase.storage
          .from('photos')
          .getPublicUrl(data.path);

        // Update user metadata
        const { error: updateError } = await supabase.auth.updateUser({
          data: { avatar_url: publicUrl }
        });

        if (updateError) throw updateError;

        updateResumeData({
          user: {
            ...resumeData.user!,
            avatar_url: publicUrl
          }
        });

        toast.success('Foto atualizada com sucesso!');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Erro ao atualizar foto. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      // Update user data
      const { error } = await supabase.auth.updateUser({
        email: formData.email,
        data: {
          full_name: formData.name,
          phone: formData.phone
        }
      });

      if (error) throw error;

      // Update password if provided
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('As senhas não coincidem');
        }

        const { error: passwordError } = await supabase.auth.updateUser({
          password: formData.newPassword
        });

        if (passwordError) throw passwordError;
      }

      updateResumeData({
        user: {
          ...resumeData.user!,
          name: formData.name,
          email: formData.email
        }
      });

      setIsEditing(false);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erro ao atualizar perfil. Tente novamente.');
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary mb-2">
            Seu Perfil
          </h2>
          <p className="text-primary/70">
            Gerencie suas informações pessoais e preferências
          </p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors
            ${isEditing
              ? 'bg-red-100 text-red-600 hover:bg-red-200'
              : 'bg-accent/10 text-accent hover:bg-accent/20'
            }`}
        >
          {isEditing ? 'Cancelar' : 'Editar Perfil'}
        </button>
      </div>

      {/* Profile Photo */}
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
            {resumeData.user?.avatar_url ? (
              <img
                src={resumeData.user.avatar_url}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-4xl font-medium text-primary">
                {resumeData.user?.name?.charAt(0).toUpperCase() || 
                 resumeData.user?.email?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          {isEditing && (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute bottom-0 right-0 p-2 bg-accent text-white rounded-full hover:bg-accent/90 transition-colors"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handlePhotoUpload}
              />
            </>
          )}
        </div>
        <div>
          <h3 className="font-medium text-primary">
            {resumeData.user?.name || 'Seu Nome'}
          </h3>
          <p className="text-primary/70 text-sm">
            {resumeData.user?.email}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              Nome Completo
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-4 py-2 rounded-lg border border-secondary focus:ring-2 focus:ring-accent focus:border-transparent disabled:bg-secondary/5"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-4 py-2 rounded-lg border border-secondary focus:ring-2 focus:ring-accent focus:border-transparent disabled:bg-secondary/5"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              Telefone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-4 py-2 rounded-lg border border-secondary focus:ring-2 focus:ring-accent focus:border-transparent disabled:bg-secondary/5"
            />
          </div>
        </div>

        {/* Password Change */}
        {isEditing && (
          <div className="pt-6 border-t border-secondary">
            <h3 className="text-lg font-medium text-primary mb-4">
              Alterar Senha
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-primary mb-1">
                  Senha Atual
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-secondary focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-1">
                  Nova Senha
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-secondary focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-1">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-secondary focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        {isEditing && (
          <div className="flex justify-end gap-4">
            <button
              onClick={() => setIsEditing(false)}
              className="px-6 py-2 rounded-lg font-medium text-primary hover:bg-secondary/10 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors"
            >
              Salvar Alterações
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSection;