import React, { useState, useEffect } from 'react';
import { useResume } from '../../context/ResumeContext';
import { Loader2 } from 'lucide-react';

const GenerationStep = () => {
  const { resumeData, updateResumeData } = useResume();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('preparing');
  const [isComplete, setIsComplete] = useState(false);

  const steps = [
    { id: 'preparing', label: 'Preparando dados' },
    { id: 'generating', label: 'Gerando currículo' },
    { id: 'optimizing', label: 'Otimizando layout' },
    { id: 'finalizing', label: 'Finalizando' }
  ];

  useEffect(() => {
    // Simulate generation process
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsComplete(true);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    // Update current step based on progress
    const stepInterval = setInterval(() => {
      if (progress < 25) setCurrentStep('preparing');
      else if (progress < 50) setCurrentStep('generating');
      else if (progress < 75) setCurrentStep('optimizing');
      else setCurrentStep('finalizing');
    }, 100);

    return () => {
      clearInterval(interval);
      clearInterval(stepInterval);
    };
  }, [progress]);

  const handleContinue = () => {
    updateResumeData({ currentStep: resumeData.currentStep + 1 });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Gerando seu Currículo</h2>
        <p className="mt-2 text-gray-600">
          {isComplete 
            ? 'Seu currículo foi gerado com sucesso!' 
            : 'Por favor, aguarde enquanto processamos seu currículo'}
        </p>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-right text-sm text-gray-500">
          {progress}%
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step) => (
          <div 
            key={step.id}
            className={`flex items-center p-4 rounded-lg ${
              currentStep === step.id 
                ? 'bg-blue-50 border border-blue-200'
                : progress >= steps.findIndex(s => s.id === step.id) * 25
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-gray-50 border border-gray-200'
            }`}
          >
            {currentStep === step.id ? (
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin mr-3" />
            ) : progress >= steps.findIndex(s => s.id === step.id) * 25 ? (
              <svg
                className="w-5 h-5 text-green-500 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <div className="w-5 h-5 border-2 border-gray-300 rounded-full mr-3" />
            )}
            <span className={`font-medium ${
              currentStep === step.id 
                ? 'text-blue-700'
                : progress >= steps.findIndex(s => s.id === step.id) * 25
                  ? 'text-green-700'
                  : 'text-gray-500'
            }`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Action button */}
      {isComplete && (
        <div className="flex justify-center pt-6">
          <button
            onClick={handleContinue}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Continuar para Edição
          </button>
        </div>
      )}
    </div>
  );
};

export default GenerationStep;