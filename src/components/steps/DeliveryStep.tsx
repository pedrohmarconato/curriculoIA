import React, { useState, useEffect } from 'react';
import { useResume } from '../../contexts/ResumeContext';
import { 
  Download, 
  Globe, 
  FileText, 
  Share2, 
  Loader2, 
  Eye, 
  AlertCircle,
  Check,
  Copy
} from 'lucide-react';
import { generatePDF } from '../../utils/pdfGenerator';
import ResumePreview from '../ResumePreview';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

const DeliveryStep = () => {
  const { resumeData, updateResumeData } = useResume();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('preview');
  const [generatedFiles, setGeneratedFiles] = useState({
    pdf: null,
    html: null,
    shareLink: null
  });
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Gerar arquivos automaticamente ao carregar o componente
  useEffect(() => {
    generateFiles();
  }, []);

  const generateFiles = async () => {
    try {
      setIsGenerating(true);
      setIsLoading(true);
      
      // Verificar se temos dados do currículo
      if (!resumeData.resumeData) {
        throw new Error('Dados do currículo não encontrados');
      }
      
      console.log('Gerando arquivos para entrega...');
      
      // Gerar HTML do currículo
      const htmlContent = generateResumeHTML(resumeData.resumeData, {
        colors: {
          primary: '#1E2749',
          secondary: '#F5E6D3',
          accent: '#FF7F6B',
          background: '#FFFFFF',
          text: '#2D3748'
        },
        style: resumeData.personalization?.selectedStyle || 'modern'
      });
      
      // Gerar PDF a partir do HTML
      const pdfBlob = await generatePDF(resumeData.resumeData, {
        colors: {
          primary: '#1E2749',
          secondary: '#F5E6D3',
          accent: '#FF7F6B',
          background: '#FFFFFF',
          text: '#2D3748'
        },
        style: resumeData.personalization?.selectedStyle || 'modern'
      });
      
      // Gerar link compartilhável
      let shareLink = null;
      try {
        const { data, error } = await supabase.functions.invoke('create-share-link', {
          body: {
            resumeData: resumeData.resumeData,
            style: {
              colors: {
                primary: '#1E2749',
                secondary: '#F5E6D3',
                accent: '#FF7F6B',
                background: '#FFFFFF',
                text: '#2D3748'
              },
              style: resumeData.personalization?.selectedStyle || 'modern'
            },
            userId: resumeData.user?.id
          }
        });
        
        if (error) throw error;
        shareLink = data.shareUrl;
        
      } catch (error) {
        console.error('Erro ao criar link compartilhável:', error);
        // Continue mesmo sem link compartilhável
      }
      
      // Armazenar arquivos gerados
      setGeneratedFiles({
        pdf: pdfBlob,
        html: htmlContent,
        shareLink
      });
      
      // Registrar atividade de geração
      if (resumeData.user?.id) {
        await supabase.from('user_activities').insert({
          user_id: resumeData.user.id,
          activity_type: 'generation',
          metadata: {
            template: resumeData.personalization?.selectedStyle || 'modern',
            fileTypes: ['pdf', 'html', shareLink ? 'web' : null].filter(Boolean)
          }
        });
      }
      
      toast.success('Currículo gerado com sucesso!');
      
    } catch (error) {
      console.error('Erro ao gerar arquivos:', error);
      toast.error('Houve um problema ao gerar os arquivos. Tente novamente.');
    } finally {
      setIsGenerating(false);
      setIsLoading(false);
    }
  };
  
  // Função auxiliar para gerar HTML do currículo
  const generateResumeHTML = (resumeData, style) => {
    // Implementação simples - na versão real, use a função de pdfGenerator.ts
    return `<!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Currículo de ${resumeData.personalInfo.name}</title>
        <style>
          body { font-family: Arial, sans-serif; }
          /* ... demais estilos ... */
        </style>
      </head>
      <body>
        <h1>${resumeData.personalInfo.name}</h1>
        <!-- Resto do conteúdo -->
      </body>
      </html>`;
  };

  const handleDownloadPDF = async () => {
    if (!generatedFiles.pdf) {
      toast.error('PDF ainda não está pronto. Aguarde ou tente novamente.');
      return;
    }
    
    try {
      // Criar URL do blob e iniciar download
      const url = URL.createObjectURL(generatedFiles.pdf);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Curriculo_${resumeData.resumeData.personalInfo.name.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Registrar download
      if (resumeData.user?.id) {
        await supabase.from('user_activities').insert({
          user_id: resumeData.user.id,
          activity_type: 'download',
          metadata: { file_type: 'pdf' }
        });
        
        // Decrementar crédito se aplicável
        if (resumeData.selectedPlan) {
          await supabase.rpc('use_credit', { p_user_id: resumeData.user.id });
        }
      }
      
      toast.success('PDF baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      toast.error('Erro ao baixar o arquivo. Tente novamente.');
    }
  };

  const handleDownloadHTML = async () => {
    if (!generatedFiles.html) {
      toast.error('Arquivo HTML ainda não está pronto.');
      return;
    }
    
    try {
      // Criar blob do HTML e iniciar download
      const blob = new Blob([generatedFiles.html], {type: 'text/html'});
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Curriculo_${resumeData.resumeData.personalInfo.name.replace(/\s+/g, '_')}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Registrar download
      if (resumeData.user?.id) {
        await supabase.from('user_activities').insert({
          user_id: resumeData.user.id,
          activity_type: 'download',
          metadata: { file_type: 'html' }
        });
      }
      
      toast.success('HTML baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao baixar HTML:', error);
      toast.error('Erro ao baixar o arquivo. Tente novamente.');
    }
  };

  const handleShareLink = async () => {
    if (!generatedFiles.shareLink) {
      toast.error('Link compartilhável ainda não está disponível.');
      return;
    }
    
    try {
      // Copiar para a área de transferência
      await navigator.clipboard.writeText(generatedFiles.shareLink);
      
      // Registrar compartilhamento
      if (resumeData.user?.id) {
        await supabase.from('user_activities').insert({
          user_id: resumeData.user.id,
          activity_type: 'share',
          metadata: { share_type: 'link' }
        });
      }
      
      toast.success('Link copiado para a área de transferência!');
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      toast.error('Erro ao copiar o link. Tente manualmente.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Título e descrição */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Seu Currículo está Pronto!</h2>
        <p className="mt-2 text-gray-600">
          Baixe ou compartilhe seu currículo nos formatos disponíveis
        </p>
      </div>

      {/* Tabs de navegação */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-3 font-medium flex items-center ${
              activeTab === 'preview' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Eye className="w-4 h-4 mr-2" />
            Visualização
          </button>
          <button
            onClick={() => setActiveTab('download')}
            className={`px-4 py-3 font-medium flex items-center ${
              activeTab === 'download' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </button>
          <button
            onClick={() => setActiveTab('share')}
            className={`px-4 py-3 font-medium flex items-center ${
              activeTab === 'share' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar
          </button>
        </div>
        
        <div className="p-6">
          {/* Aba de Visualização */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div className="aspect-[3/4] max-h-[700px] overflow-hidden bg-gray-50 rounded-lg shadow-inner">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <p className="ml-2 text-gray-600">Carregando prévia...</p>
                  </div>
                ) : (
                  <div className="h-full overflow-auto">
                    <ResumePreview
                      resumeData={resumeData.resumeData}
                      style={{
                        colors: {
                          primary: '#1E2749',
                          secondary: '#F5E6D3',
                          accent: '#FF7F6B',
                          background: '#FFFFFF',
                          text: '#2D3748'
                        },
                        style: resumeData.personalization?.selectedStyle || 'modern'
                      }}
                    />
                  </div>
                )}
              </div>
              
              <div className="flex justify-center">
                <button
                  onClick={() => setShowPreviewModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver em tela cheia
                </button>
              </div>
            </div>
          )}
          
          {/* Aba de Downloads */}
          {activeTab === 'download' && (
            <div className="space-y-6">
              {/* PDF Download */}
              <div className="flex items-start border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 p-3 bg-red-100 rounded-lg">
                  <FileText className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    Versão em PDF
                  </h3>
                  <p className="mt-1 text-gray-500">
                    Formato ideal para impressão e envio por email. Pronto para usar em processos seletivos.
                  </p>
                  <button
                    onClick={handleDownloadPDF}
                    disabled={isGenerating || !generatedFiles.pdf}
                    className="mt-4 flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Baixar PDF
                  </button>
                </div>
              </div>
              
              {/* HTML Download */}
              <div className="flex items-start border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 p-3 bg-blue-100 rounded-lg">
                  <Globe className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    Versão Web (HTML)
                  </h3>
                  <p className="mt-1 text-gray-500">
                    Seu currículo como uma página web. Ideal para hospedar online ou personalizar ainda mais.
                  </p>
                  <button
                    onClick={handleDownloadHTML}
                    disabled={isGenerating || !generatedFiles.html}
                    className="mt-4 flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Baixar HTML
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Aba de Compartilhamento */}
          {activeTab === 'share' && (
            <div className="space-y-6">
              <div className="flex items-start border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 p-3 bg-green-100 rounded-lg">
                  <Share2 className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    Link Compartilhável
                  </h3>
                  <p className="mt-1 text-gray-500">
                    Compartilhe seu currículo online com recrutadores, empresas ou nas redes sociais.
                  </p>
                  
                  {generatedFiles.shareLink ? (
                    <div className="mt-4">
                      <div className="flex">
                        <input
                          type="text"
                          readOnly
                          value={generatedFiles.shareLink}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md bg-gray-50 focus:outline-none"
                        />
                        <button
                          onClick={handleShareLink}
                          className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 flex items-center"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="mt-2 text-xs text-gray-500 flex items-center">
                        <Check className="w-4 h-4 text-green-500 mr-1" />
                        Este link ficará disponível por 30 dias
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={generateFiles}
                      disabled={isGenerating}
                      className="mt-4 flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isGenerating ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Share2 className="h-4 w-4 mr-2" />
                      )}
                      Gerar Link Compartilhável
                    </button>
                  )}
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Informações sobre compartilhamento
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <ul className="list-disc space-y-1 pl-5">
                        <li>Links compartilháveis ficam ativos por 30 dias</li>
                        <li>Você pode ver os acessos na sua área de usuário</li>
                        <li>Alterações no currículo refletem no link compartilhado</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Informações Adicionais */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-2">
          Próximos Passos
        </h3>
        <ul className="space-y-2 text-blue-800">
          <li className="flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            Baixe seu currículo nos formatos disponíveis
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            Compartilhe o link com recrutadores
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            Mantenha suas informações sempre atualizadas
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            Veja estatísticas de visualização na sua área de usuário
          </li>
        </ul>
        
        <div className="mt-4 pt-4 border-t border-blue-200">
          <p className="text-blue-800">
            <strong>Dica:</strong> Atualize regularmente seu currículo, especialmente após novas experiências ou cursos.
          </p>
        </div>
      </div>
      
      {/* Créditos e plano */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Seu plano e créditos
            </h3>
            <p className="text-gray-600 mb-4">
              {resumeData.selectedPlan ? (
                <>Você está usando o plano <strong>{resumeData.selectedPlan}</strong> 
                  com <strong>{resumeData.credits || 0} crédito(s)</strong> restante(s).</>
              ) : (
                <>Você está usando o modo gratuito. Faça upgrade para mais recursos.</>
              )}
            </p>
          </div>
          <button 
            onClick={() => updateResumeData({ currentSection: 'credits', showUserArea: true })}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Ver planos disponíveis
          </button>
        </div>
      </div>
      
      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-6xl mx-4 h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Visualização do Currículo</h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-1 rounded-full hover:bg-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-gray-50 p-4">
              <ResumePreview
                resumeData={resumeData.resumeData}
                style={{
                  colors: {
                    primary: '#1E2749',
                    secondary: '#F5E6D3',
                    accent: '#FF7F6B',
                    background: '#FFFFFF',
                    text: '#2D3748'
                  },
                  style: resumeData.personalization?.selectedStyle || 'modern'
                }}
                isInteractive={true}
                onDownload={(format) => {
                  if (format === 'pdf') {
                    handleDownloadPDF();
                  } else {
                    handleDownloadHTML();
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryStep;