import React, { useState, useCallback } from 'react';
import { useResume } from '../../context/ResumeContext';
import { Upload, Linkedin, FileText, PlusCircle, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const UploadStep = () => {
  const { resumeData, updateResumeData } = useResume();
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [hasFile, setHasFile] = useState(false);
  const [hasLinkedin, setHasLinkedin] = useState(false);

  const validateLinkedinUrl = (url: string) => {
    const linkedinRegex = /^https:\/\/([\w]+\.)?linkedin\.com\/in\/[A-z0-9_-]+\/?$/;
    return linkedinRegex.test(url);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if user is authenticated
    const user = supabase.auth.getUser();
    if (!user) {
      toast.error('Você precisa estar logado para enviar arquivos.');
      return;
    }

    // Check file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Formato de arquivo não suportado. Use PDF ou DOC/DOCX.');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Tamanho máximo: 10MB');
      return;
    }

    setIsUploading(true);
    try {
      // Upload to Supabase Storage with user ID in path
      const fileExt = file.name.split('.').pop();
      const userId = resumeData.user?.id;
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('resumes')
        .upload(fileName, file, {
          onUploadProgress: (progress) => {
            setUploadProgress((progress.loaded / progress.total) * 100);
          },
        });

      if (error) throw error;

      if (data) {
        const { data: { publicUrl } } = supabase.storage
          .from('resumes')
          .getPublicUrl(data.path);

        updateResumeData({
          resumeFile: {
            url: publicUrl,
            type: file.type,
            name: file.name
          }
        });
        
        setHasFile(true);
        toast.success('Arquivo enviado com sucesso!');
      }
    } catch (error) {
      toast.error('Erro ao enviar arquivo. Tente novamente.');
      console.error(error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleLinkedinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkedinUrl) {
      toast.error('Por favor, insira seu perfil do LinkedIn');
      return;
    }

    if (!validateLinkedinUrl(linkedinUrl)) {
      toast.error('URL do LinkedIn inválida');
      return;
    }

    try {
      updateResumeData({ linkedinProfile: linkedinUrl });
      setHasLinkedin(true);
      toast.success('Perfil do LinkedIn vinculado com sucesso!');
    } catch (error) {
      toast.error('Erro ao vincular perfil do LinkedIn. Tente novamente.');
      console.error(error);
    }
  };

  const handleCreateNew = () => {
    updateResumeData({ currentStep: resumeData.currentStep + 1 });
    toast.success('Vamos criar seu currículo do zero!');
  };

  const handleContinue = useCallback(() => {
    if (!hasFile && !hasLinkedin) {
      toast.error('Envie um arquivo ou vincule seu LinkedIn para continuar');
      return;
    }
    updateResumeData({ currentStep: resumeData.currentStep + 1 });
  }, [hasFile, hasLinkedin, resumeData.currentStep, updateResumeData]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-primary mb-3">Como deseja começar?</h2>
        <p className="text-lg text-primary/70">
          Você pode enviar seu currículo existente, vincular seu LinkedIn ou criar um novo do zero.
          <br />
          <span className="text-accent font-medium">Dica: Combine PDF + LinkedIn para melhores resultados!</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column - File Upload & LinkedIn */}
        <div className="space-y-6">
          {/* File Upload */}
          <div className="bg-white rounded-xl shadow-sm border border-secondary/50 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-primary mb-1">Upload de Currículo</h3>
                  <p className="text-primary/70 text-sm mb-4">
                    Envie seu currículo em PDF ou DOC/DOCX
                  </p>
                </div>
                {hasFile && (
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                )}
              </div>
              
              <label className={`mt-4 flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 
                ${hasFile ? 'border-green-500 bg-green-50' : 'border-secondary hover:bg-secondary/5'}`}>
                <div className="flex flex-col items-center justify-center">
                  {hasFile ? (
                    <p className="text-green-600 font-medium">Arquivo enviado com sucesso!</p>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-accent mb-2" />
                      <p className="text-sm text-primary/70">
                        Arraste ou clique para fazer upload
                      </p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </label>

              {isUploading && (
                <div className="mt-4 space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-accent h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-primary/70 text-right">{Math.round(uploadProgress)}%</p>
                </div>
              )}
            </div>
          </div>

          {/* LinkedIn Integration */}
          <div className="bg-white rounded-xl shadow-sm border border-secondary/50 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-[#0A66C2]/10 rounded-lg">
                  <Linkedin className="w-6 h-6 text-[#0A66C2]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-primary mb-1">Perfil LinkedIn</h3>
                  <p className="text-primary/70 text-sm mb-4">
                    Importe seus dados profissionais
                  </p>
                </div>
                {hasLinkedin && (
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                )}
              </div>

              <form onSubmit={handleLinkedinSubmit} className="mt-4">
                <div className="relative">
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/seu-perfil"
                    className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent transition-all
                      ${hasLinkedin ? 'border-green-500 bg-green-50' : 'border-secondary'}`}
                  />
                  <button
                    type="submit"
                    disabled={hasLinkedin}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-colors
                      ${hasLinkedin 
                        ? 'bg-green-100 text-green-600 cursor-not-allowed' 
                        : 'bg-[#0A66C2] text-white hover:bg-[#0A66C2]/90'}`}
                  >
                    {hasLinkedin ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <ArrowRight className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column - Create New & Continue */}
        <div className="space-y-6">
          {/* Create New */}
          <div className="bg-gradient-to-br from-accent/5 to-accent/10 rounded-xl shadow-sm border border-accent/20 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-accent/20 rounded-lg">
                  <PlusCircle className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-1">Criar do Zero</h3>
                  <p className="text-primary/70 text-sm mb-4">
                    Não tem currículo? Sem problemas!
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                <p className="text-primary/80">
                  Nosso assistente irá guiá-lo no processo de criação do seu currículo profissional, 
                  passo a passo, de forma simples e intuitiva.
                </p>
                <button
                  onClick={handleCreateNew}
                  className="w-full px-6 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>Criar Novo Currículo</span>
                </button>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-white rounded-xl shadow-sm border border-secondary/50 p-6">
            <h4 className="font-medium text-primary mb-4">Por que combinar PDF + LinkedIn?</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                </div>
                <span className="text-sm text-primary/70">Análise mais precisa do seu perfil</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                </div>
                <span className="text-sm text-primary/70">Sugestões personalizadas mais relevantes</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                </div>
                <span className="text-sm text-primary/70">Melhor formatação e organização dos dados</span>
              </li>
            </ul>
          </div>

          {/* Continue Button */}
          {(hasFile || hasLinkedin) && (
            <button
              onClick={handleContinue}
              className="w-full px-6 py-4 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors duration-200 flex items-center justify-center space-x-2 shadow-sm"
            >
              <span>Continuar com {hasFile && hasLinkedin ? 'PDF + LinkedIn' : hasFile ? 'PDF' : 'LinkedIn'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {isUploading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl">
            <Loader2 className="h-8 w-8 animate-spin text-accent mx-auto" />
            <p className="mt-2 text-sm text-primary">Processando arquivo...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadStep;