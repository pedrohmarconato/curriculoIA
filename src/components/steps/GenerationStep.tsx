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