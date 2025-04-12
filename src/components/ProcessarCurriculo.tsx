import React, { useState, useEffect } from 'react';
import { useResume } from '../contexts/ResumeContext';
import { processarCurriculoComIA } from '../utils/processarCurriculoComIA';
import { extractTextFromPdf } from '../utils/extractPdfText';
import { 
  Loader2, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Brain 
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ProcessarCurriculoIAProps {
  pdfUrl?: string;
  resumeText?: string;
  onComplete?: () => void;
}

const ProcessarCurriculoIA: React.FC<ProcessarCurriculoIAProps> = ({ 
  pdfUrl, 
  resumeText: initialText,
  onComplete 
}) => {
  const { 
    processedResumeData, 
    setProcessedResumeData, 
    sectionConfirmationStatus,
    setSectionConfirmed 
  } = useResume();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumeText, setResumeText] = useState<string>(initialText || '');
  const [isTextExtracted, setIsTextExtracted] = useState(!!initialText);

  // Extrair texto do PDF se uma URL for fornecida
  useEffect(() => {
    if (pdfUrl && !isTextExtracted && !isLoading) {
      const extractText = async () => {
        try {
          setIsLoading(true);
          setError(null);
          const text = await extractTextFromPdf(pdfUrl);
          setResumeText(text);
          setIsTextExtracted(true);
          toast.success('Texto extraído do PDF com sucesso!');
        } catch (err) {
          console.error('Erro ao extrair texto do PDF:', err);
          setError('Falha ao extrair texto do PDF. Verifique se o arquivo é válido.');
          toast.error('Erro ao extrair texto do PDF');
        } finally {
          setIsLoading(false);
        }
      };

      extractText();
    }
  }, [pdfUrl, isTextExtracted, isLoading]);

  const handleProcessResume = async () => {
    if (!resumeText || resumeText.trim().length < 100) {
      setError('Texto do currículo muito curto ou vazio. É necessário conteúdo suficiente para análise.');
      toast.error('Texto do currículo muito curto ou vazio');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Reiniciar status de confirmação se necessário
      if (setSectionConfirmed && sectionConfirmationStatus) {
        // Reset all section confirmations
        Object.keys(sectionConfirmationStatus).forEach(section => {
          setSectionConfirmed(section as any, false);
        });
      }

      // Processar currículo
      const processedData = await processarCurriculoComIA(resumeText);

      // Atualizar estado no contexto se dados foram recebidos
      if (processedData) {
        setProcessedResumeData(processedData);
        
        // Chamar callback se fornecido
        if (onComplete) {
          onComplete();
        }
      } else {
        setError('Não foi possível processar o currículo. Tente novamente ou entre em contato com o suporte.');
      }
    } catch (err) {
      console.error('Erro ao processar currículo:', err);
      setError(`Erro ao processar currículo: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-secondary">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-accent/10 rounded-lg">
          <Brain className="w-8 h-8 text-accent" />
        </div>
        <div>
          <h3 className="font-medium text-lg text-primary">Processamento com IA</h3>
          <p className="text-primary/70 text-sm mt-1">
            Analise seu currículo com nossa IA especializada e obtenha uma estrutura otimizada para o mercado
          </p>
        </div>
      </div>

      {/* Status de Extração de Texto */}
      {pdfUrl && !isTextExtracted && (
        <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-lg">
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          ) : (
            <FileText className="w-5 h-5 text-blue-500" />
          )}
          <p className="text-sm text-blue-700">
            {isLoading 
              ? 'Extraindo texto do PDF...' 
              : 'Preparando para extrair texto do PDF...'}
          </p>
        </div>
      )}

      {/* Texto Extraído */}
      {isTextExtracted && resumeText && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-primary">Texto Extraído</h4>
            <span className="flex items-center text-green-600 text-sm">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Pronto para processamento
            </span>
          </div>
          <div className="max-h-36 overflow-y-auto bg-gray-50 p-3 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {resumeText.substring(0, 300)}...
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {resumeText.length} caracteres extraídos
          </p>
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Botão de Processamento */}
      <div className="flex justify-center">
        <button
          onClick={handleProcessResume}
          disabled={isLoading || !isTextExtracted || !resumeText}
          className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 
            ${isLoading || !isTextExtracted || !resumeText
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : 'bg-accent text-white hover:bg-accent/90'
            } transition-colors`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processando...</span>
            </>
          ) : (
            <>
              <Brain className="w-5 h-5" />
              <span>Processar Currículo com IA</span>
            </>
          )}
        </button>
      </div>

      {/* Resumo de Processamento */}
      {processedResumeData && (
        <div className="mt-4 bg-green-50 border border-green-200 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <h4 className="font-medium text-green-800">Processamento Concluído</h4>
          </div>
          <p className="text-sm text-green-700">
            Seu currículo foi processado com sucesso! Você pode agora revisar e editar cada seção.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProcessarCurriculoIA;