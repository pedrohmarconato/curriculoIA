import React, { useState, useEffect } from 'react';
import { useResume } from '../../contexts/ResumeContext';
import { 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Cpu,
  PenTool,
  Layers
} from 'lucide-react';
import { processResume } from '../../utils/resumeProcessor';
import ResumeCategories from './ResumeCategories';
import ResumeEditSections from '../ResumeEditSections';
import toast from 'react-hot-toast';

const GenerationStep = () => {
  const { resumeData, updateResumeData } = useResume();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('preparing');
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [processingDetails, setProcessingDetails] = useState('');
  const [extractedResumeData, setExtractedResumeData] = useState<any>(null);
  const [showCategoriesEditor, setShowCategoriesEditor] = useState(false);

  const steps = [
    { id: 'preparing', label: 'Preparando dados' },
    { id: 'analyzing', label: 'Analisando currículo' },
    { id: 'generating', label: 'Gerando conteúdo' },
    { id: 'optimizing', label: 'Otimizando layout' },
    { id: 'finalizing', label: 'Finalizando' }
  ];

  // Iniciar processo de extração e análise do currículo
  useEffect(() => {
    const processResumeData = async () => {
      try {
        setIsLoading(true);
        setProcessingDetails('Iniciando processamento do arquivo...');
        
        // Verificar se temos fonte de dados (PDF ou LinkedIn)
        if (!resumeData.resumeFile?.url && !resumeData.linkedinProfile) {
          throw new Error('Nenhuma fonte de dados encontrada');
        }

        // Iniciar progresso
        setProgress(10);
        setCurrentStep('preparing');
        setProcessingDetails('Extraindo dados do documento...');
        
        // Processar o currículo (PDF ou LinkedIn)
        let processedData;
        if (resumeData.resumeFile?.url) {
          processedData = await processResume(
            resumeData.resumeFile.url,
            resumeData.user?.id,
            resumeData.user?.name,
            resumeData.user?.email
          );
        } else if (resumeData.linkedinProfile) {
          // TODO: Implementar processamento específico para LinkedIn
          setProcessingDetails('Extraindo dados do LinkedIn...');
          // Simular processamento para fins de demonstração
          await new Promise(resolve => setTimeout(resolve, 2000));
          processedData = null; // Substituir por dados reais
        }

        // Verificar se temos dados
        if (!processedData) {
          throw new Error('Não foi possível extrair dados do currículo');
        }

        // Atualizar progresso
        setProgress(40);
        setCurrentStep('analyzing');
        setProcessingDetails('Analisando informações do currículo...');
        
        // Simular tempo de processamento da IA
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Atualizar progresso
        setProgress(70);
        setCurrentStep('generating');
        setProcessingDetails('Gerando conteúdo otimizado...');

        // Adicionar objetivo profissional se não existir
        if (!processedData.objective) {
          processedData.objective = {
            summary: 'Profissional dedicado buscando aplicar minha experiência e habilidades em um ambiente desafiador e colaborativo.'
          };
        }

        // Adicionar campo para detalhes de mercado
        if (!processedData.marketExperience) {
          processedData.marketExperience = {
            details: processedData.experience.map((exp) => ({
              company: exp.company,
              extendedDescription: exp.description,
              keywords: 'experiência profissional, ' + exp.role.toLowerCase()
            }))
          };
        }

        // Atualizar progresso
        setProgress(90);
        setCurrentStep('optimizing');
        setProcessingDetails('Formatando categorias do currículo...');
        
        // Salvar dados processados
        setExtractedResumeData(processedData);
        
        // Atualizar progresso
        setProgress(100);
        setCurrentStep('finalizing');
        setProcessingDetails('Pronto para revisão!');
        
        // Exibir editor de categorias
        setShowCategoriesEditor(true);
        
        toast.success('Currículo processado com sucesso!');
      } catch (error) {
        console.error('Erro ao processar currículo:', error);
        toast.error('Erro ao processar currículo. Tente novamente.');
        
        // Criar dados básicos para não interromper o fluxo
        const basicData = {
          personalInfo: {
            name: resumeData.user?.name || 'Seu Nome',
            contact: {
              email: resumeData.user?.email || '',
              phone: '',
              location: ''
            }
          },
          objective: {
            summary: 'Profissional dedicado buscando novas oportunidades.'
          },
          experience: [{
            company: 'Empresa',
            role: 'Cargo',
            period: { start: '2020-01', end: 'present' },
            description: 'Descreva suas responsabilidades e realizações.',
            achievements: ['Conquista ou responsabilidade importante']
          }],
          education: [{
            institution: 'Instituição de Ensino',
            degree: 'Grau Acadêmico',
            field: 'Área de Estudo',
            period: { start: '2015-01', end: '2019-12' }
          }],
          skills: {
            technical: [
              { name: 'Habilidade Técnica', level: 'intermediário' }
            ],
            interpersonal: [
              { name: 'Comunicação', level: 'avançado' }
            ],
            tools: [
              { name: 'MS Office', level: 'avançado' }
            ]
          },
          languages: [
            { name: 'Português', level: 'nativo' },
            { name: 'Inglês', level: 'intermediário' }
          ],
          certifications: [],
          marketExperience: {
            details: []
          }
        };
        
        setExtractedResumeData(basicData);
        setShowCategoriesEditor(true);
      } finally {
        setIsLoading(false);
      }
    };

    // Iniciar processamento
    if (!extractedResumeData && !showCategoriesEditor) {
      processResumeData();
    }
  }, [resumeData, extractedResumeData]);

  // Atualizar categoria de dados do currículo
  const handleCategoryUpdate = (category: string, data: any) => {
    if (!extractedResumeData) return;
    
    const updatedData = {...extractedResumeData};
    
    switch(category) {
      case 'personalInfo':
        updatedData.personalInfo = data;
        break;
      case 'objective':
        updatedData.objective = data;
        break;
      case 'experience':
        updatedData.experience = data;
        break;
      case 'education':
        updatedData.education = data;
        break;
      case 'skills':
        if (!updatedData.skills) updatedData.skills = {};
        updatedData.skills.technical = data;
        break;
      case 'softSkills':
        if (!updatedData.skills) updatedData.skills = {};
        updatedData.skills.interpersonal = data;
        break;
      case 'languages':
        updatedData.languages = data;
        break;
      case 'certifications':
        updatedData.certifications = data;
        break;
      case 'toolsAndTech':
        if (!updatedData.skills) updatedData.skills = {};
        updatedData.skills.tools = data;
        break;
      case 'marketExperience':
        updatedData.marketExperience = data;
        break;
    }
    
    setExtractedResumeData(updatedData);
  };

  // Concluir a edição e continuar para a próxima etapa
  const handleComplete = () => {
    // Atualizar os dados do currículo no contexto global
    updateResumeData({ 
      resumeData: extractedResumeData,
      currentStep: resumeData.currentStep + 1 
    });
    
    setIsComplete(true);
    toast.success('Currículo finalizado com sucesso!');
  };

  // NOVA ESTRUTURA DE ETAPAS
  const visualSteps = [
    { id: 'preparing', label: 'Preparação dos Dados', icon: FileText },
    { id: 'generating', label: 'Gerando HTML', icon: Cpu },
    { id: 'reviewing', label: 'Revisão de Estruturas', icon: Layers },
    { id: 'publishing', label: 'Publicando seu currículo', icon: PenTool },
    { id: 'finished', label: 'Finalizado', icon: CheckCircle2 }
  ];

  const [visualStep, setVisualStep] = useState('preparing');

  // Estado para dados editáveis
  const [editableResumeData, setEditableResumeData] = useState<any>(null);

  // Simulação de recebimento dos dados da IA ao entrar na etapa de revisão
  useEffect(() => {
    if (visualStep === 'reviewing' && extractedResumeData) {
      setEditableResumeData(extractedResumeData);
    }
  }, [visualStep, extractedResumeData]);

  // Animação de transição entre etapas
  const handleNextStep = () => {
    const idx = visualSteps.findIndex(s => s.id === visualStep);
    if (idx < visualSteps.length - 1) setVisualStep(visualSteps[idx + 1].id);
  };

  // Exemplo de animação para etapa ativa
  const StepBox = ({ step, active, children }: any) => (
    <div
      className={`relative flex flex-col items-center justify-center w-full max-w-md mx-auto my-2 px-4 py-3 rounded-xl shadow card transition-all duration-500 bg-white/90 dark:bg-darkSurface/90 border border-accent/20 dark:border-darkAccent/25
        ${active ? 'scale-105 z-10 ring-2 ring-accent/30 dark:ring-darkAccent/30 animate-fadeInUp' : 'opacity-80 grayscale'}
        ${!active ? 'cursor-pointer hover:opacity-100 hover:scale-100' : ''}`}
      style={{ minHeight: active ? 170 : 56, maxHeight: active ? 400 : 56, overflow: 'hidden', transition: 'all 0.4s cubic-bezier(.4,2,.6,1)' }}
      onClick={() => !active && setVisualStep(step.id)}
    >
      <div className="flex items-center gap-2 mb-2">
        <step.icon size={22} className="text-accent dark:text-darkAccent" />
        <h2 className="text-base font-bold tracking-wide">{step.label}</h2>
      </div>
      {active && <div className="w-full">{children}</div>}
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full py-8">
      {visualSteps.map((step) => (
        <StepBox key={step.id} step={step} active={visualStep === step.id}>
          {visualStep === 'preparing' && (
            <div className="flex flex-col gap-3 items-center animate-fadeInUp">
              <p className="mb-2 text-center text-base font-medium text-primary dark:text-darkPrimary">
                Extraindo e analisando seu PDF e/ou LinkedIn para preencher todas as categorias profissionais…
              </p>
              <ul className="text-left text-sm font-franie">
                <li>• Cabeçalho Profissional</li>
                <li>• Resumo Profissional</li>
                <li>• Competências Centrais e Técnicas</li>
                <li>• Experiência Profissional</li>
                <li>• Formação Acadêmica</li>
                <li>• Seção de Diferenciação</li>
                <li>• Elemento Final de Engajamento</li>
              </ul>
              <div className="mt-6 flex flex-col items-center">
                <Loader2 className="animate-spin text-accent dark:text-darkAccent" size={36} />
                <span className="mt-2 text-xs text-gray-500 dark:text-darkSecondary">Preparando dados…</span>
              </div>
            </div>
          )}
          {visualStep === 'generating' && (
            <div className="flex flex-col items-center animate-fadeInUp">
              <p className="mb-4 text-center">Gerando HTML do currículo…</p>
              <Loader2 className="animate-spin text-accent dark:text-darkAccent" size={32} />
            </div>
          )}
          {visualStep === 'reviewing' && (
            <div className="flex flex-col items-center animate-fadeInUp w-full">
              <p className="mb-4 text-center font-semibold">Revise e edite cada seção do seu currículo gerado pela IA:</p>
              {editableResumeData ? (
                <ResumeEditSections
                  resumeData={editableResumeData}
                  onChange={setEditableResumeData}
                />
              ) : (
                <Loader2 className="animate-spin text-accent dark:text-darkAccent" size={32} />
              )}
              <button
                className="btn-primary mt-6"
                onClick={handleNextStep}
                type="button"
              >
                Publicar currículo
              </button>
            </div>
          )}
          {visualStep === 'publishing' && (
            <div className="flex flex-col items-center animate-fadeInUp">
              <p className="mb-4 text-center">Publicando seu currículo…</p>
              <Loader2 className="animate-spin text-accent dark:text-darkAccent" size={32} />
            </div>
          )}
          {visualStep === 'finished' && (
            <div className="flex flex-col items-center animate-fadeInUp">
              <CheckCircle2 size={40} className="text-green-500 mb-2" />
              <p className="text-lg font-bold">Currículo pronto!</p>
              <span className="text-sm text-gray-500 dark:text-darkSecondary">Você pode revisar, editar ou baixar seu currículo agora.</span>
            </div>
          )}
        </StepBox>
      ))}
      {/* Botão de simulação para avançar etapas (remover depois de integrar com backend real) */}
      {visualStep !== 'reviewing' && visualStep !== 'finished' && (
        <button
          className="btn-primary mt-8"
          onClick={handleNextStep}
          type="button"
          disabled={visualStep === 'finished'}
        >
          Próxima etapa
        </button>
      )}
    </div>
  );
};

export default GenerationStep;