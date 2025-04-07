import React from 'react';
import { useResume } from '../../context/ResumeContext';
import { Download, Globe, FileText, Share2 } from 'lucide-react';

const DeliveryStep = () => {
  const { resumeData } = useResume();

  const handleDownloadPDF = () => {
    // TODO: Implement PDF download
    console.log('Downloading PDF...');
  };

  const handleDownloadHTML = () => {
    // TODO: Implement HTML download
    console.log('Downloading HTML...');
  };

  const handleShare = () => {
    // TODO: Implement sharing functionality
    console.log('Sharing resume...');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Seu Currículo está Pronto!</h2>
        <p className="mt-2 text-gray-600">
          Baixe ou compartilhe seu currículo nos formatos disponíveis
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Preview */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Prévia do Currículo
          </h3>
          <div className="aspect-[3/4] bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Prévia do currículo</p>
          </div>
        </div>

        {/* Download Options */}
        <div className="space-y-6">
          {/* PDF Download */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <FileText className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium text-gray-900">
                  Versão em PDF
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Formato ideal para impressão e envio por email
                </p>
                <button
                  onClick={handleDownloadPDF}
                  className="mt-4 flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar PDF
                </button>
              </div>
            </div>
          </div>

          {/* HTML Version */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Globe className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium text-gray-900">
                  Versão Web
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Seu currículo como uma página web interativa
                </p>
                <button
                  onClick={handleDownloadHTML}
                  className="mt-4 flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar HTML
                </button>
              </div>
            </div>
          </div>

          {/* Share */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Share2 className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium text-gray-900">
                  Compartilhar
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Compartilhe seu currículo com recrutadores
                </p>
                <button
                  onClick={handleShare}
                  className="mt-4 flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
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
        </ul>
      </div>
    </div>
  );
};

export default DeliveryStep;