import React, { useState } from 'react';
import { useResume } from '../../contexts/ResumeContext';
import { 
  Palette, 
  Layout, 
  Image, 
  ArrowRight, 
  ArrowLeft,
  Upload,
  Trash2,
  CheckCircle2,
  Linkedin
} from 'lucide-react';
import { ColorPalette, ResumeStyle } from '../../types/resume';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const colorPalettes: ColorPalette[] = [
  {
    id: 'modern',
    name: 'Moderno',
    colors: {
      primary: '#1E2749',
      secondary: '#F5E6D3',
      accent: '#FF7F6B',
      background: '#FDFBF7',
      text: '#2D3748'
    },
    preview: 'https://images.unsplash.com/photo-1589998059171-988d887df646?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'minimal',
    name: 'Minimalista',
    colors: {
      primary: '#2D3748',
      secondary: '#EDF2F7',
      accent: '#4299E1',
      background: '#FFFFFF',
      text: '#1A202C'
    },
    preview: 'https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'creative',
    name: 'Criativo',
    colors: {
      primary: '#553C9A',
      secondary: '#FAF5FF',
      accent: '#B794F4',
      background: '#FFFFFF',
      text: '#44337A'
    },
    preview: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'professional',
    name: 'Profissional',
    colors: {
      primary: '#234E52',
      secondary: '#E6FFFA',
      accent: '#38B2AC',
      background: '#FFFFFF',
      text: '#1A202C'
    },
    preview: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'elegant',
    name: 'Elegante',
    colors: {
      primary: '#744210',
      secondary: '#FFFFF0',
      accent: '#D69E2E',
      background: '#FFFFFF',
      text: '#2D3748'
    },
    preview: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&w=800&q=80'
  }
];

const resumeStyles: ResumeStyle[] = [
  {
    id: 'classic',
    name: 'Clássico',
    description: 'Layout tradicional e profissional, ideal para áreas corporativas',
    preview: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'modern',
    name: 'Moderno',
    description: 'Design contemporâneo com elementos visuais marcantes',
    preview: 'https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'creative',
    name: 'Criativo',
    description: 'Layout dinâmico ideal para áreas criativas e design',
    preview: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'minimal',
    name: 'Minimalista',
    description: 'Design limpo e direto, focado em conteúdo',
    preview: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'tech',
    name: 'Tecnológico',
    description: 'Layout moderno ideal para profissionais de tecnologia',
    preview: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80'
  }
];

const PersonalizationStep = () => {
  const { resumeData, updateResumeData } = useResume();
  const [selectedPalette, setSelectedPalette] = useState<string>('modern');
  const [selectedStyle, setSelectedStyle] = useState<string>('classic');
  const [useLinkedinPhoto, setUseLinkedinPhoto] = useState(true);
  const [customPhoto, setCustomPhoto] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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
      const fileName = `${userId}/photo-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('photos')
        .upload(fileName, file);

      if (error) throw error;

      if (data) {
        const { data: { publicUrl } } = supabase.storage
          .from('photos')
          .getPublicUrl(data.path);

        setCustomPhoto(publicUrl);
        setUseLinkedinPhoto(false);
        toast.success('Foto enviada com sucesso!');
      }
    } catch (error) {
      toast.error('Erro ao enviar foto. Tente novamente.');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleNext = () => {
    updateResumeData({
      currentStep: 5,
      personalization: {
        selectedStyle,
        selectedPalette,
        useLinkedinPhoto,
        customPhoto: customPhoto || undefined
      }
    });
  };

  const handleBack = () => {
    updateResumeData({ currentStep: resumeData.currentStep - 1 });
  };

  const removeCustomPhoto = () => {
    setCustomPhoto(null);
    setUseLinkedinPhoto(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary mb-3">Personalize seu Currículo</h2>
        <p className="text-lg text-primary/70">
          Escolha as opções que melhor representam seu estilo profissional
        </p>
      </div>

      {/* Color Palettes */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-6">
          <Palette className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-semibold text-primary">Paleta de Cores</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {colorPalettes.map((palette) => (
            <div
              key={palette.id}
              onClick={() => setSelectedPalette(palette.id)}
              className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-200 ${
                selectedPalette === palette.id 
                  ? 'ring-2 ring-accent scale-[1.02]' 
                  : 'hover:scale-[1.01]'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <img 
                src={palette.preview} 
                alt={palette.name}
                className="w-full h-32 object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h4 className="text-white font-medium">{palette.name}</h4>
                <div className="flex gap-2 mt-2">
                  {Object.values(palette.colors).map((color, index) => (
                    <div
                      key={index}
                      className="w-6 h-6 rounded-full border border-white"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              {selectedPalette === palette.id && (
                <div className="absolute top-2 right-2 bg-accent text-white p-1 rounded-full">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Resume Styles */}
      <div className="space-y-4 pt-6">
        <div className="flex items-center gap-2 mb-6">
          <Layout className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-semibold text-primary">Estilo do Currículo</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resumeStyles.map((style) => (
            <div
              key={style.id}
              onClick={() => setSelectedStyle(style.id)}
              className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-200 ${
                selectedStyle === style.id 
                  ? 'ring-2 ring-accent scale-[1.02]' 
                  : 'hover:scale-[1.01]'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <img 
                src={style.preview} 
                alt={style.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h4 className="text-white font-medium">{style.name}</h4>
                <p className="text-white/80 text-sm mt-1">{style.description}</p>
              </div>
              {selectedStyle === style.id && (
                <div className="absolute top-2 right-2 bg-accent text-white p-1 rounded-full">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Photo Options */}
      <div className="space-y-4 pt-6">
        <div className="flex items-center gap-2 mb-6">
          <Image className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-semibold text-primary">Foto do Perfil</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LinkedIn Photo Option */}
          <div
            onClick={() => setUseLinkedinPhoto(true)}
            className={`relative cursor-pointer rounded-xl border-2 p-6 transition-all duration-200 ${
              useLinkedinPhoto 
                ? 'border-accent bg-accent/5' 
                : 'border-secondary hover:border-accent/50'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#0A66C2]/10 rounded-lg">
                <Linkedin className="w-6 h-6 text-[#0A66C2]" />
              </div>
              <div>
                <h4 className="font-medium text-primary">Usar foto do LinkedIn</h4>
                <p className="text-sm text-primary/70 mt-1">
                  Importar automaticamente sua foto profissional
                </p>
              </div>
            </div>
          </div>

          {/* Custom Photo Upload */}
          <div
            className={`relative rounded-xl border-2 p-6 transition-all duration-200 ${
              !useLinkedinPhoto 
                ? 'border-accent bg-accent/5' 
                : 'border-secondary'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/10 rounded-lg">
                <Upload className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h4 className="font-medium text-primary">Enviar foto personalizada</h4>
                <p className="text-sm text-primary/70 mt-1">
                  Upload de uma foto de sua escolha
                </p>
              </div>
            </div>

            {customPhoto ? (
              <div className="mt-4 relative">
                <img 
                  src={customPhoto} 
                  alt="Foto do perfil"
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <button
                  onClick={removeCustomPhoto}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="mt-4 flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-secondary/5">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 text-primary/40 mb-2" />
                  <p className="text-sm text-primary/70">Clique para fazer upload</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={isUploading}
                />
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-8">
        <button
          onClick={handleBack}
          className="flex items-center px-6 py-2 text-primary bg-white border border-secondary rounded-lg hover:bg-secondary/5 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar
        </button>
        <button
          onClick={handleNext}
          className="flex items-center px-6 py-2 text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors"
        >
          Continuar
          <ArrowRight className="w-5 h-5 ml-2" />
        </button>
      </div>

      {isUploading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto" />
            <p className="mt-2 text-sm text-primary">Enviando foto...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalizationStep;