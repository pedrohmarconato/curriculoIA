import React, { useState, useEffect } from 'react';
import { useResume } from '../../contexts/ResumeContext';
import ProcessarCurriculo from '../ProcessarCurriculo';
import { ArrowRight, ArrowLeft, FileText } from 'lucide-react';
import { extractTextFromPdf } from '../../utils/extractPdfText';
import EditResumeDataStep from './EditResumeDataStep'; // Importando o componente de edição

const ResumeProcessingStep = () => {
  const { resumeData, updateResumeData, processedResumeData } = useResume();
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  // Verifica se passou para o próximo passo após o processamento
  const [completedProcessing, setCompletedProcessing] = useState(false);

  // Extrair texto do PDF se estiver disponível
  useEffect(() => {
    const extractText = async () => {
      if (resumeData.resumeFile?.url && !extractedText && !isExtracting) {
        try {
          setIsExtracting(true);
          const text = await extractTextFromPdf(resumeData.resumeFile.url);
          setExtractedText(text);
        } catch (error) {
          console.error('Erro ao extrair texto do PDF:', error);
        } finally {
          setIsExtracting(false);
        }
      }
    };

    extractText();
  }, [resumeData.resumeFile, extractedText, isExtracting]);

  const handleBack = () => {
    updateResumeData({ currentStep: resumeData.currentStep - 1 });
  };

  const handleContinue = () => {
    updateResumeData({ currentStep: resumeData.currentStep + 1 });
  };

  const handleProcessingComplete = () => {
    setCompletedProcessing(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary mb-3">
          Processamento e Estruturação do Currículo
        </h2>
        <p className="text-lg text-primary/70">
          Nesta etapa, nosso assistente inteligente vai analisar seu currículo e 
          estruturá-lo nas 8 seções essenciais para maximizar seu impacto.
        </p>
      </div>

      {/* Conteúdo principal - alterna entre processamento e edição */}
      {!completedProcessing ? (
        // Etapa de processamento com IA
        <ProcessarCurriculo 
          resumeText={extractedText || ''} 
          onComplete={handleProcessingComplete}
        />
      ) : (
        // Etapa de edição dos dados processados
        <div className="bg-white rounded-xl shadow-sm border border-secondary p-6">
          <h3 className="text-xl font-semibold text-primary mb-4">
            Edite as Seções do Seu Currículo
          </h3>
          <p className="mb-6 text-primary/70">
            Seu currículo foi estruturado nas 8 seções essenciais. 
            Revise e edite cada seção conforme necessário.
          </p>
          
          {/* Inclui o componente de edição do currículo */}
          <EditResumeDataStep />
        </div>
      )}

      {/* Informações sobre o arquivo */}
      {resumeData.resumeFile && (
        <div className="bg-gray-50 p-4 rounded-lg flex items-start gap-3">
          <FileText className="w-6 h-6 text-primary" />
          <div>
            <h4 className="font-medium text-primary">Arquivo de Origem</h4>
            <p className="text-sm text-primary/70">{resumeData.resumeFile.name}</p>
            {extractedText && (
              <p className="text-xs text-primary/60 mt-1">
                {extractedText.length} caracteres extraídos
              </p>
            )}
          </div>
        </div>
      )}

      {/* Botões de navegação */}
      <div className="flex justify-between pt-4">
        <button
          onClick={handleBack}
          className="flex items-center px-6 py-2 text-primary bg-white border border-secondary rounded-lg hover:bg-secondary/5 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar
        </button>

        {processedResumeData && (
          <button
            onClick={handleContinue}
            className="flex items-center px-6 py-2 text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors"
          >
            Continuar
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ResumeProcessingStep;