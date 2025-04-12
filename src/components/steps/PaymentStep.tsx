import React, { useState, useEffect } from 'react';
import { useResume } from '../../contexts/ResumeContext';
import { 
  ArrowRight, 
  ArrowLeft, 
  Loader2, 
  AlertCircle, 
  FileText,
  Award
} from 'lucide-react';
import toast from 'react-hot-toast';
import { processResume } from '../../utils/resumeProcessor';

const PaymentStep = () => {
  const { resumeData, updateResumeData } = useResume();
  const [resumePreviewData, setResumePreviewData] = useState<any>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  /**
   * Inicializa a extração e análise de dados do currículo
   */
  useEffect(() => {
    const initializeResume = async () => {
      // Se já temos dados do currículo no contexto, usá-los
      if (resumeData.resumeData) {
        setResumePreviewData(resumeData.resumeData);
        return;
      }
      
      // Se não temos um arquivo de currículo, não fazer nada
      if (!resumeData.resumeFile?.url) {
        return;
      }
      
      setIsGeneratingPreview(true);
      
      try {
        // Usar o processador de currículos com fallback
        const processedData = await processResume(
          resumeData.resumeFile.url,
          resumeData.user?.id,
          resumeData.user?.name,
          resumeData.user?.email
        );
        
        if (processedData) {
          setResumePreviewData(processedData);
          updateResumeData({ resumeData: processedData });
        } else {
          throw new Error('Falha ao processar currículo');
        }
      } catch (error) {
        console.error('Erro ao processar currículo:', error);
        toast.error('Erro ao processar currículo. Por favor, continue.', {
          duration: 5000
        });
      } finally {
        setIsGeneratingPreview(false);
      }
    };
    
    initializeResume();
  }, [resumeData.resumeData, resumeData.resumeFile, resumeData.user, updateResumeData]);

  const handleProcessResumeManually = async () => {
    if (!resumeData.resumeFile?.url) {
      toast.error('Nenhum arquivo de currículo encontrado');
      return;
    }
    
    setIsGeneratingPreview(true);
    try {
      toast.loading('Processando seu currículo...', { id: 'processing-resume' });
      
      // Usar o processador com fallback
      const processedData = await processResume(
        resumeData.resumeFile.url,
        resumeData.user?.id,
        resumeData.user?.name,
        resumeData.user?.email
      );
      
      if (processedData) {
        setResumePreviewData(processedData);
        updateResumeData({ resumeData: processedData });
        toast.success('Dados extraídos com sucesso!', { id: 'processing-resume' });
      } else {
        throw new Error('Falha ao processar currículo');
      }
    } catch (error) {
      console.error('Erro na extração:', error);
      toast.error('Falha ao extrair dados. Por favor, continue.', { id: 'processing-resume' });
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const handleBack = () => {
    updateResumeData({ currentStep: resumeData.currentStep - 1 });
  };

  const handleContinue = () => {
    updateResumeData({ currentStep: resumeData.currentStep + 1 });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Revisar Dados do Currículo</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Verifique se as informações extraídas do seu currículo estão corretas. 
          Você poderá editá-las na próxima etapa.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        {isGeneratingPreview ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Processando seu currículo...</p>
          </div>
        ) : resumePreviewData ? (
          <div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-primary">{resumePreviewData.personalInfo.name}</h2>
                <p className="text-gray-600">{resumePreviewData.experience[0]?.role || "Profissional"}</p>
              </div>
              <div className="flex flex-col items-end text-sm text-gray-600">
                <p>{resumePreviewData.personalInfo.contact.email}</p>
                {resumePreviewData.personalInfo.contact.phone && (
                  <p>{resumePreviewData.personalInfo.contact.phone}</p>
                )}
                {resumePreviewData.personalInfo.contact.location && (
                  <p>{resumePreviewData.personalInfo.contact.location}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                {/* Experiência */}
                <div>
                  <h3 className="text-lg font-semibold text-primary flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-accent" />
                    Experiência Profissional
                  </h3>
                  <div className="space-y-4">
                    {resumePreviewData.experience.map((exp: any, idx: number) => (
                      <div key={idx} className="border-l-2 border-accent pl-4 py-1">
                        <h4 className="font-medium">{exp.role}</h4>
                        <p className="text-sm text-gray-600">{exp.company}</p>
                        <p className="text-sm text-gray-500">
                          {exp.period.start} - {exp.period.end === 'present' ? 'Atual' : exp.period.end}
                        </p>
                        <p className="mt-2 text-gray-700 line-clamp-2">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Educação */}
                <div>
                  <h3 className="text-lg font-semibold text-primary flex items-center gap-2 mb-4">
                    <Award className="w-5 h-5 text-accent" />
                    Educação
                  </h3>
                  <div className="space-y-4">
                    {resumePreviewData.education.map((edu: any, idx: number) => (
                      <div key={idx} className="border-l-2 border-accent pl-4 py-1">
                        <h4 className="font-medium">{edu.degree} em {edu.field}</h4>
                        <p className="text-sm text-gray-600">{edu.institution}</p>
                        <p className="text-sm text-gray-500">
                          {edu.period.start} - {edu.period.end === 'present' ? 'Atual' : edu.period.end}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Habilidades */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-primary mb-4">Habilidades</h3>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-gray-700">Técnicas</h4>
                    <div className="space-y-2">
                      {resumePreviewData.skills.technical.slice(0, 3).map((skill: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span className="text-sm">{skill.name}</span>
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">{skill.level}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-3">
                    <h4 className="font-medium text-sm text-gray-700">Interpessoais</h4>
                    <div className="space-y-2">
                      {resumePreviewData.skills.interpersonal.slice(0, 3).map((skill: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span className="text-sm">{skill.name}</span>
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">{skill.level}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Idiomas */}
                {resumePreviewData.languages && resumePreviewData.languages.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-primary mb-4">Idiomas</h3>
                    <div className="space-y-2">
                      {resumePreviewData.languages.map((lang: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span className="text-sm">{lang.name}</span>
                          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">{lang.level}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              Não foi possível gerar a prévia do currículo.
              Por favor, tente novamente.
            </p>
            <button
              onClick={handleProcessResumeManually}
              disabled={isGeneratingPreview}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
            >
              {isGeneratingPreview ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processando PDF...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-1" />
                  <span>Extrair Dados do PDF</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={handleBack}
          className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>

        <button
          onClick={handleContinue}
          className="px-8 py-4 font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <span>Continuar</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default PaymentStep;