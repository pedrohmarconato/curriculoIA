import React, { useState, useEffect, useCallback } from 'react';
import { useResume } from '../../context/ResumeContext';
import { supabase } from '../../lib/supabase';
import { 
  CreditCard, 
  Wallet, 
  CheckCircle2,
  Shield, 
  Star, 
  Zap,
  Clock,
  Users,
  Mail,
  Phone,
  Globe,
  Award,
  ArrowRight,
  Loader2,
  AlertCircle,
  FileText
} from 'lucide-react';
import { initMercadoPago, Wallet as MPWallet } from '@mercadopago/sdk-react';
import { useCredits } from '../../hooks/useCredits';
import ResumePreview from '../ResumePreview';
import toast from 'react-hot-toast';
import { extractTextFromPdf, looksLikeResume } from '../../utils/extractPdfText';
import { parseResumeText, createBasicResumeData } from '../../utils/resumeParser';

initMercadoPago(import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY);

const plans = [
  {
    id: 'premium',
    name: 'Premium',
    price: 49.99,
    credits: 5,
    description: 'Ideal para profissionais em busca de destaque',
    isPopular: true,
    color: 'blue',
    features: [
      { icon: Globe, text: 'Site profissional personalizado' },
      { icon: Star, text: 'Design premium exclusivo' },
      { icon: Mail, text: 'Botão de contato por email' },
      { icon: Clock, text: '6 meses de hospedagem' },
      { icon: Users, text: 'Suporte prioritário' },
      { icon: Award, text: 'Certificado digital' }
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 89.99,
    credits: 10,
    description: 'Solução completa para sua carreira',
    color: 'purple',
    features: [
      { icon: Globe, text: 'Site profissional personalizado' },
      { icon: Star, text: 'Design premium exclusivo' },
      { icon: Mail, text: 'Botão de contato por email' },
      { icon: Phone, text: 'Integração com WhatsApp' },
      { icon: Clock, text: '12 meses de hospedagem' },
      { icon: Users, text: 'Suporte VIP 24/7' },
      { icon: Award, text: 'Certificado digital premium' },
      { icon: Zap, text: 'Análise de SEO mensal' }
    ]
  }
];

const PaymentStep = () => {
  const { resumeData, updateResumeData } = useResume();
  const { credits, loading: creditsLoading } = useCredits(resumeData.user?.id);
  const [selectedPlan, setSelectedPlan] = useState('premium');
  const [paymentMethod, setPaymentMethod] = useState('credit');
  const [isProcessing, setIsProcessing] = useState(false);
  const [preferenceId, setPreferenceId] = useState(null);
  const [previewHtml, setPreviewHtml] = useState(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [resumePreviewData, setResumePreviewData] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Função para extrair texto do currículo a partir de um arquivo ou perfil do LinkedIn
  const extractResumeText = useCallback(async () => {
    console.log('Extraindo texto do currículo');
    
    if (resumeData.resumeFile?.url) {
      console.log('Extraindo de arquivo PDF:', resumeData.resumeFile.url);
      try {
        const { data, error } = await supabase.functions.invoke('resume-ai', {
          body: {
            action: 'extract',
            data: { url: resumeData.resumeFile.url }
          }
        });

        if (error) {
          console.error('Erro ao extrair texto do PDF:', error);
          throw new Error(`Falha ao extrair texto do PDF: ${error.message}`);
        }

        console.log('Texto extraído com sucesso do PDF');
        return data;
      } catch (error) {
        console.error('Erro ao extrair texto do PDF:', error);
        throw error;
      }
    } else if (resumeData.linkedinProfile) {
      console.log('Extraindo do perfil LinkedIn:', resumeData.linkedinProfile);
      try {
        const { data, error } = await supabase.functions.invoke('resume-ai', {
          body: {
            action: 'linkedin',
            data: { url: resumeData.linkedinProfile }
          }
        });

        if (error) {
          console.error('Erro ao extrair perfil do LinkedIn:', error);
          throw new Error(`Falha ao extrair perfil do LinkedIn: ${error.message}`);
        }

        console.log('Dados extraídos com sucesso do LinkedIn');
        return data;
      } catch (error) {
        console.error('Erro ao extrair perfil do LinkedIn:', error);
        throw error;
      }
    } else {
      throw new Error('Nenhuma fonte de currículo fornecida');
    }
  }, [resumeData.resumeFile, resumeData.linkedinProfile]);

  // Função para analisar o texto do currículo
  const analyzeResumeText = useCallback(async (resumeText) => {
    console.log('Analisando texto do currículo:', resumeText ? 'Texto disponível' : 'VAZIO');
    
    if (!resumeText) {
      throw new Error('Texto do currículo está vazio');
    }

    try {
      const { data, error } = await supabase.functions.invoke('resume-ai', {
        body: {
          action: 'analyze',
          data: { text: resumeText }
        }
      });

      if (error) {
        console.error('Erro ao analisar currículo:', error);
        throw new Error(`Falha ao analisar currículo: ${error.message}`);
      }

      console.log('Currículo analisado com sucesso');
      return data;
    } catch (error) {
      console.error('Erro ao analisar currículo:', error);
      throw error;
    }
  }, []);

  // Função para gerar visual do currículo
  const generateVisualResume = useCallback(async (analyzeData) => {
    console.log('Gerando visual do currículo');
    
    try {
      const { data, error } = await supabase.functions.invoke('resume-ai', {
        body: {
          action: 'generate',
          data: {
            resume: analyzeData,
            style: {
              colors: {
                primary: '#1E2749',
                secondary: '#F5E6D3',
                accent: '#FF7F6B',
                background: '#FFFFFF',
                text: '#2D3748'
              },
              style: 'modern'
            }
          }
        }
      });

      if (error) {
        console.error('Erro ao gerar visual do currículo:', error);
        throw new Error(`Falha ao gerar visual do currículo: ${error.message}`);
      }

      console.log('Visual do currículo gerado com sucesso');
      return data;
    } catch (error) {
      console.error('Erro ao gerar visual do currículo:', error);
      throw error;
    }
  }, []);

  // Função para extrair dados do PDF diretamente no frontend
  const extractResumeData = useCallback(async () => {
    setIsGeneratingPreview(true);
    console.log("Iniciando extração de dados do PDF no frontend");
    
    try {
      // Verificar se temos a URL do PDF
      if (!resumeData.resumeFile?.url) {
        console.error("URL do PDF não disponível");
        throw new Error("URL do PDF não disponível");
      }
      
      console.log("URL do PDF:", resumeData.resumeFile.url);
      
      // Extrair o texto do PDF
      const extractedText = await extractTextFromPdf(resumeData.resumeFile.url);
      console.log("Texto extraído do PDF:", extractedText.substring(0, 500) + "...");
      
      // Verificar se o texto parece um currículo
      if (!looksLikeResume(extractedText)) {
        console.warn("O texto extraído não parece ser um currículo");
        toast.warning("O arquivo enviado não parece ser um currículo. Usando dados básicos.");
        
        const basicData = createBasicResumeData(resumeData.user?.name, resumeData.user?.email);
        setResumePreviewData(basicData);
        updateResumeData({ resumeData: basicData });
        return basicData;
      }
      
      // Analisar o texto para extrair informações estruturadas
      const extractedData = parseResumeText(extractedText, resumeData.user?.name, resumeData.user?.email);
      console.log("Dados estruturados extraídos:", extractedData);
      
      // Definir os dados estruturados para exibição
      setResumePreviewData(extractedData);
      
      // Guardar os dados no contexto para uso posterior
      updateResumeData({
        resumeData: extractedData
      });
      
      return extractedData;
    } catch (error) {
      console.error("Erro ao processar currículo:", error);
      toast.error("Não foi possível extrair informações completas do seu currículo. Exibindo versão simplificada.", {
        duration: 5000,
        icon: <AlertCircle className="text-amber-500" />
      });
      
      // Usar os dados básicos do usuário em caso de falha
      const basicData = createBasicResumeData(resumeData.user?.name, resumeData.user?.email);
      
      setResumePreviewData(basicData);
      updateResumeData({ resumeData: basicData });
      return null;
    } finally {
      setIsGeneratingPreview(false);
    }
  }, [resumeData.resumeFile, resumeData.user, updateResumeData]);
  
  // Função para analisar o texto do currículo e extrair informações estruturadas
  const parseResumeText = (text, userName, userEmail) => {
    // Implementação simplificada de análise de currículo
    // Na prática, você poderia usar regex mais robustos ou até mesmo OpenAI API
    
    // Estrutura básica que vamos preencher
    const resumeData = {
      personalInfo: {
        name: userName || "Nome não encontrado",
        contact: {
          email: userEmail || "",
          phone: "",
          location: ""
        }
      },
      experience: [],
      education: [],
      skills: {
        technical: [],
        interpersonal: [],
        tools: []
      },
      languages: []
    };
    
    // Extrair telefone (formato básico)
    const phoneRegex = /\(?\d{2,3}\)?[-.\s]?\d{4,5}[-.\s]?\d{4}/g;
    const phoneMatches = text.match(phoneRegex);
    if (phoneMatches && phoneMatches.length > 0) {
      resumeData.personalInfo.contact.phone = phoneMatches[0];
    }
    
    // Extrair localização (cidades comuns brasileiras)
    const locationRegex = /(São Paulo|Rio de Janeiro|Brasília|Salvador|Belo Horizonte|Curitiba|Fortaleza|Manaus|Recife|Porto Alegre)([,-\s].*?)?$/gmi;
    const locationMatches = text.match(locationRegex);
    if (locationMatches && locationMatches.length > 0) {
      resumeData.personalInfo.contact.location = locationMatches[0].trim();
    }
    
    // Extrair experiência profissional
    // Procurar por padrões como "Experiência" ou "Experiência Profissional"
    const experienceSection = extractSection(text, ['experiência', 'experiência profissional', 'experiencias', 'histórico profissional']);
    
    if (experienceSection) {
      // Tentar encontrar empresas e cargos
      const companyRegex = /(?:^|\n)([A-Z][A-Za-z\s]+)(?:\s*[-–]\s*|\n|:)([^\n]+)/g;
      let match;
      
      while ((match = companyRegex.exec(experienceSection)) !== null) {
        if (match.length >= 2) {
          resumeData.experience.push({
            company: match[1].trim(),
            role: match[2] ? match[2].trim() : "Cargo não especificado",
            period: {
              start: "2020-01", // Valores padrão
              end: "present"
            },
            description: "Responsável por...",
            achievements: []
          });
        }
      }
    }
    
    // Se não encontramos experiências, adicionar uma padrão
    if (resumeData.experience.length === 0) {
      resumeData.experience.push({
        company: "Empresa atual",
        role: "Cargo atual",
        period: {
          start: "2020-01",
          end: "present"
        },
        description: "Detalhes disponíveis na versão completa após a compra",
        achievements: ["Acesso a todas as conquistas após a compra"]
      });
    }
    
    // Extrair educação
    const educationSection = extractSection(text, ['educação', 'formação', 'formação acadêmica', 'escolaridade']);
    
    if (educationSection) {
      // Tentar encontrar instituições e cursos
      const educationRegex = /(?:^|\n)([A-Z][A-Za-z\s]+)(?:\s*[-–]\s*|\n|:)([^\n]+)/g;
      let match;
      
      while ((match = educationRegex.exec(educationSection)) !== null) {
        if (match.length >= 2) {
          resumeData.education.push({
            institution: match[1].trim(),
            degree: "Graduação",
            field: match[2] ? match[2].trim() : "Área não especificada",
            period: {
              start: "2015-01",
              end: "2019-12"
            }
          });
        }
      }
    }
    
    // Se não encontramos educação, adicionar uma padrão
    if (resumeData.education.length === 0) {
      resumeData.education.push({
        institution: "Instituição de Ensino",
        degree: "Graduação",
        field: "Sua área de formação",
        period: {
          start: "2015-01",
          end: "2019-12"
        }
      });
    }
    
    // Extrair habilidades
    const skillsSection = extractSection(text, ['habilidades', 'competências', 'skills', 'conhecimentos']);
    
    if (skillsSection) {
      // Dividir por linhas ou vírgulas
      const skillItems = skillsSection.split(/[,\n;]/).map(item => item.trim()).filter(item => item.length > 0);
      
      // Adicionar como habilidades técnicas
      skillItems.forEach(skill => {
        if (skill.length > 2 && skill.length < 30) { // Filtrar entradas muito curtas ou muito longas
          resumeData.skills.technical.push({
            name: skill,
            level: determineSkillLevel(skill, text)
          });
        }
      });
    }
    
    // Se não encontramos habilidades, adicionar algumas padrão
    if (resumeData.skills.technical.length === 0) {
      resumeData.skills.technical = [
        { name: "Habilidade Técnica 1", level: "avançado" },
        { name: "Habilidade Técnica 2", level: "intermediário" }
      ];
    }
    
    // Adicionar algumas habilidades interpessoais padrão
    resumeData.skills.interpersonal = [
      { name: "Comunicação", level: "avançado" },
      { name: "Trabalho em Equipe", level: "avançado" }
    ];
    
    // Extrair idiomas
    const languagesSection = extractSection(text, ['idiomas', 'línguas', 'languages']);
    
    if (languagesSection) {
      // Procurar por idiomas comuns
      const commonLanguages = ['português', 'inglês', 'espanhol', 'francês', 'alemão', 'italiano', 'japonês', 'mandarim'];
      
      commonLanguages.forEach(language => {
        const languageRegex = new RegExp(`${language}\\s*[-:.]?\\s*(básico|intermediário|avançado|fluente|nativo)`, 'i');
        const match = languagesSection.match(languageRegex);
        
        if (match) {
          resumeData.languages.push({
            name: language.charAt(0).toUpperCase() + language.slice(1),
            level: match[1].toLowerCase()
          });
        }
      });
    }
    
    // Se não encontramos idiomas, adicionar Português como padrão
    if (resumeData.languages.length === 0) {
      resumeData.languages = [
        { name: "Português", level: "nativo" },
        { name: "Inglês", level: "intermediário" }
      ];
    }
    
    return resumeData;
  };
  
  // Função para extrair uma seção do texto
  const extractSection = (text, sectionHeaders) => {
    // Converter texto para minúsculas para facilitar a busca
    const lowerText = text.toLowerCase();
    
    let startIndex = -1;
    let endIndex = text.length;
    
    // Encontrar o início da seção (usando qualquer um dos headers fornecidos)
    for (const header of sectionHeaders) {
      const headerIndex = lowerText.indexOf(header);
      if (headerIndex !== -1 && (startIndex === -1 || headerIndex < startIndex)) {
        startIndex = headerIndex;
      }
    }
    
    if (startIndex === -1) {
      return null; // Seção não encontrada
    }
    
    // Avançar até o fim do cabeçalho
    startIndex = lowerText.indexOf('\n', startIndex);
    if (startIndex === -1) {
      startIndex = 0; // Se não encontrar quebra de linha, usar o texto inteiro
    } else {
      startIndex += 1; // Pular a quebra de linha
    }
    
    // Procurar pelo próximo cabeçalho comum em currículos
    const nextSectionHeaders = [
      'experiência', 'experiências', 'formação', 'educação', 
      'habilidades', 'competências', 'idiomas', 'línguas',
      'certificações', 'cursos', 'referências', 'objetivo'
    ];
    
    for (const header of nextSectionHeaders) {
      const headerIndex = lowerText.indexOf(header, startIndex);
      if (headerIndex !== -1 && headerIndex < endIndex) {
        endIndex = headerIndex;
      }
    }
    
    return text.substring(startIndex, endIndex).trim();
  };
  
  // Função para determinar o nível de habilidade
  const determineSkillLevel = (skill, fullText) => {
    const levels = ['básico', 'intermediário', 'avançado', 'especialista'];
    
    // Procurar pelo padrão "habilidade - nível" ou similar
    const skillLevelRegex = new RegExp(`${skill}\\s*[-:.]?\\s*(básico|intermediário|avançado|especialista)`, 'i');
    const match = fullText.match(skillLevelRegex);
    
    if (match && match[1]) {
      return match[1].toLowerCase();
    }
    
    // Caso não encontre um nível explícito, atribuir um nível "intermediário" como padrão
    return 'intermediário';
  };
  
  // Função para criar dados básicos do currículo
  const createBasicResumeData = (name, email) => {
    return {
      personalInfo: {
        name: name || "Seu Nome",
        contact: {
          email: email || "",
          phone: "",
          location: ""
        }
      },
      experience: [{
        company: "Sua experiência profissional será mostrada aqui",
        role: "Seu cargo atual",
        period: {
          start: "Data início",
          end: "present"
        },
        description: "Após a compra, você terá acesso aos detalhes completos do seu currículo.",
        achievements: ["Todos os seus destaques serão mostrados após a compra"]
      }],
      education: [{
        institution: "Sua instituição de ensino",
        degree: "Seu grau acadêmico",
        field: "Sua área de formação",
        period: {
          start: "Data início",
          end: "Data conclusão"
        }
      }],
      skills: {
        technical: [
          { name: "Suas habilidades técnicas", level: "avançado" },
          { name: "Serão mostradas aqui", level: "intermediário" }
        ],
        interpersonal: [
          { name: "Comunicação", level: "avançado" },
          { name: "Trabalho em Equipe", level: "avançado" }
        ],
        tools: []
      },
      languages: [
        { name: "Português", level: "nativo" },
        { name: "Inglês", level: "intermediário" }
      ]
    };
  };
  
  // Função para gerar prévia do currículo
  const generatePreview = useCallback(async () => {
    setIsGeneratingPreview(true);
    console.log("Gerando prévia do currículo");
    
    try {
      // Se já temos dados analisados, usamos eles
      if (resumeData.resumeData) {
        console.log("Usando dados de currículo já analisados");
        setResumePreviewData(resumeData.resumeData);
        return;
      }
      
      // Se temos um PDF, tentamos extrair os dados
      if (resumeData.resumeFile?.url) {
        console.log("Tentando extrair dados do PDF");
        await extractResumeData();
        return;
      }
      
      // Se não temos dados nem arquivo, usamos os dados do usuário
      console.log("Usando dados básicos do usuário");
      const userData = {
        personalInfo: {
          name: resumeData.user?.name || "Nome do Usuário",
          contact: {
            email: resumeData.user?.email || "email@exemplo.com",
            phone: "",
            location: ""
          }
        },
        experience: [
          {
            company: "Mostraremos as informações do seu currículo aqui",
            role: "Seu cargo atual",
            period: {
              start: "Data início",
              end: "present"
            },
            description: "Após a compra, você terá acesso a todos os recursos para personalizar seu currículo profissional.",
            achievements: ["Personalize suas conquistas", "Destaque suas habilidades"]
          }
        ],
        education: [
          {
            institution: "Instituição de Ensino",
            degree: "Seu Grau",
            field: "Sua Área",
            period: {
              start: "Data início",
              end: "Data fim"
            }
          }
        ],
        skills: {
          technical: [
            { name: "Habilidade 1", level: "avançado" },
            { name: "Habilidade 2", level: "intermediário" },
            { name: "Habilidade 3", level: "básico" }
          ],
          interpersonal: [
            { name: "Comunicação", level: "avançado" },
            { name: "Trabalho em Equipe", level: "avançado" }
          ],
          tools: [
            { name: "Ferramenta 1", level: "intermediário" },
            { name: "Ferramenta 2", level: "avançado" }
          ]
        },
        languages: [
          { name: "Português", level: "nativo" },
          { name: "Inglês", level: "intermediário" }
        ]
      };
      
      setResumePreviewData(userData);
    } catch (error) {
      console.error('Erro ao gerar prévia:', error);
      toast.error('Houve um erro ao gerar a prévia. Tentando novamente com dados simplificados.', {
        duration: 5000,
        icon: <AlertCircle className="text-amber-500" />,
      });
      
      // Mesmo com erro, mostramos alguma coisa
      setResumePreviewData({
        personalInfo: {
          name: resumeData.user?.name || "Nome do Usuário",
          contact: {
            email: resumeData.user?.email || "email@exemplo.com",
            phone: "",
            location: ""
          }
        },
        experience: [
          {
            company: "Dados de exemplo",
            role: "Função de exemplo",
            period: {
              start: "2020-01",
              end: "present"
            },
            description: "Esta é uma prévia de exemplo do seu currículo.",
            achievements: [""]
          }
        ],
        education: [{
          institution: "Universidade",
          degree: "Graduação",
          field: "Área",
          period: {
            start: "2015-01",
            end: "2019-12"
          }
        }],
        skills: {
          technical: [
            { name: "Habilidade Técnica", level: "avançado" }
          ],
          interpersonal: [
            { name: "Habilidade Interpessoal", level: "avançado" }
          ],
          tools: [
            { name: "Ferramenta", level: "intermediário" }
          ]
        },
        certifications: [],
        languages: [
          { name: "Idioma", level: "avançado" }
        ]
      });
    } finally {
      setIsGeneratingPreview(false);
    }
  }, [resumeData.resumeData, resumeData.resumeFile, resumeData.user, extractResumeData]);

  useEffect(() => {
    // Inicializa a prévia e tenta extrair dados do PDF automaticamente
    if (resumeData.resumeFile?.url && !resumeData.resumeData) {
      extractResumeData();
    } else {
      generatePreview();
    }
  }, [resumeData.resumeFile, resumeData.resumeData, extractResumeData, generatePreview]);

  const createPreference = async () => {
    setIsProcessing(true);
    try {
      const selectedPlanData = plans.find(plan => plan.id === selectedPlan);
      if (!selectedPlanData) throw new Error('Plano não encontrado');

      const response = await fetch('/api/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `Plano ${selectedPlanData.name}`,
          price: selectedPlanData.price,
          quantity: 1,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar preferência de pagamento');
      }

      const data = await response.json();
      if (data.id) {
        setPreferenceId(data.id);
      } else {
        throw new Error('Erro ao criar preferência de pagamento');
      }
    } catch (error) {
      console.error('Error creating preference:', error);
      toast.error('Erro ao iniciar pagamento. Tente novamente.', {
        duration: 5000,
        icon: <AlertCircle className="text-red-500" />,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (paymentMethod === 'credit') {
      await createPreference();
    } else if (paymentMethod === 'pix') {
      setIsProcessing(true);
      try {
        const response = await fetch('/api/create-pix', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            planId: selectedPlan,
            amount: plans.find(p => p.id === selectedPlan)?.price,
          }),
        });

        if (!response.ok) {
          throw new Error('Erro ao gerar PIX');
        }

        const data = await response.json();
        if (data.qrCode) {
          toast.success('QR Code PIX gerado com sucesso!');
        } else {
          throw new Error('Erro ao gerar PIX');
        }
      } catch (error) {
        console.error('Error creating PIX:', error);
        toast.error('Erro ao gerar PIX. Tente novamente.', {
          duration: 5000,
          icon: <AlertCircle className="text-red-500" />,
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Escolha seu Plano</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Invista no seu futuro profissional com nossos planos premium. 
          Escolha a solução que melhor se adapta às suas necessidades.
        </p>
        {!creditsLoading && (
          <p className="mt-2 text-blue-600 font-medium">
            Você possui {credits} crédito{credits !== 1 ? 's' : ''} disponível{credits !== 1 ? 'is' : ''}
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Resume Preview */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Prévia do Currículo
          </h3>
          {isGeneratingPreview ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
              <p className="mt-4 text-gray-600">Gerando prévia do currículo...</p>
            </div>
          ) : resumePreviewData ? (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {previewHtml ? (
                <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
              ) : (
                <div className="p-6">
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
                          {resumePreviewData.experience.map((exp, idx) => (
                            <div key={idx} className="border-l-2 border-accent pl-4 py-1">
                              <h4 className="font-medium">{exp.role}</h4>
                              <p className="text-sm text-gray-600">{exp.company}</p>
                              <p className="text-sm text-gray-500">{exp.period.start} - {exp.period.end === 'present' ? 'Atual' : exp.period.end}</p>
                              <p className="mt-2 text-gray-700">{exp.description}</p>
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
                          {resumePreviewData.education.map((edu, idx) => (
                            <div key={idx} className="border-l-2 border-accent pl-4 py-1">
                              <h4 className="font-medium">{edu.degree} em {edu.field}</h4>
                              <p className="text-sm text-gray-600">{edu.institution}</p>
                              <p className="text-sm text-gray-500">{edu.period.start} - {edu.period.end === 'present' ? 'Atual' : edu.period.end}</p>
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
                            {resumePreviewData.skills.technical.map((skill, idx) => (
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
                            {resumePreviewData.skills.interpersonal.map((skill, idx) => (
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
                            {resumePreviewData.languages.map((lang, idx) => (
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
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                Não foi possível gerar a prévia do currículo.
                Por favor, tente novamente.
              </p>
              <button
                onClick={() => {
                  toast.info("Tentando extrair dados do seu currículo...");
                  setIsGeneratingPreview(true);
                  extractResumeData()
                    .then(() => toast.success("Dados extraídos com sucesso!"))
                    .catch(err => {
                      console.error("Erro na extração:", err);
                      toast.error("Falha ao extrair dados. Por favor, continue com a compra.");
                    })
                    .finally(() => setIsGeneratingPreview(false));
                }}
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

        {/* Plans */}
        <div className="space-y-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative rounded-2xl transition-all duration-300 cursor-pointer group
                ${selectedPlan === plan.id 
                  ? 'border-2 border-blue-500 bg-white shadow-xl scale-[1.02]' 
                  : 'border border-gray-200 bg-white/50 hover:border-blue-300 hover:shadow-lg'
                }
                ${plan.isPopular ? 'md:-mt-4' : ''}
              `}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                    Mais Popular
                  </div>
                </div>
              )}

              <div className="p-8">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-gray-600 mt-1">{plan.description}</p>
                  </div>
                  {selectedPlan === plan.id && (
                    <div className="bg-blue-100 rounded-full p-2">
                      <CheckCircle2 className="w-6 h-6 text-blue-600" />
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900">R$ {plan.price.toFixed(2)}</span>
                    <span className="ml-2 text-gray-500">/único</span>
                  </div>
                  <p className="mt-1 text-sm text-blue-600 font-medium">
                    Inclui {plan.credits} créditos
                  </p>
                </div>

                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <feature.icon className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature.text}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`mt-8 w-full py-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2
                    ${selectedPlan === plan.id
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 group-hover:bg-gray-200'
                    }
                  `}
                >
                  {selectedPlan === plan.id ? (
                    <>
                      Plano Selecionado
                      <CheckCircle2 className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      Selecionar Plano
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">
          Método de Pagamento
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div
            onClick={() => setPaymentMethod('credit')}
            className={`flex items-center p-6 rounded-xl cursor-pointer transition-all duration-200
              ${paymentMethod === 'credit'
                ? 'bg-blue-50 border-2 border-blue-500'
                : 'border border-gray-200 hover:border-blue-300'
              }
            `}
          >
            <div className="bg-blue-100 rounded-lg p-3 mr-4">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Cartão de Crédito</p>
              <p className="text-sm text-gray-500 mt-1">
                Visa, Mastercard, Elo, American Express
              </p>
            </div>
            {paymentMethod === 'credit' && (
              <CheckCircle2 className="w-6 h-6 text-blue-500 ml-auto" />
            )}
          </div>

          <div
            onClick={() => setPaymentMethod('pix')}
            className={`flex items-center p-6 rounded-xl cursor-pointer transition-all duration-200
              ${paymentMethod === 'pix'
                ? 'bg-blue-50 border-2 border-blue-500'
                : 'border border-gray-200 hover:border-blue-300'
              }
            `}
          >
            <div className="bg-blue-100 rounded-lg p-3 mr-4">
              <Wallet className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">PIX</p>
              <p className="text-sm text-gray-500 mt-1">
                Transferência instantânea
              </p>
            </div>
            {paymentMethod === 'pix' && (
              <CheckCircle2 className="w-6 h-6 text-blue-500 ml-auto" />
            )}
          </div>
        </div>

        {/* Security Badges */}
        <div className="mt-8 flex items-center justify-center gap-8 py-6 border-t border-gray-100">
          <div className="flex items-center text-gray-500">
            <Shield className="w-5 h-5 mr-2 text-green-500" />
            <span className="text-sm">Pagamento Seguro</span>
          </div>
          <div className="flex items-center text-gray-500">
            <Award className="w-5 h-5 mr-2 text-green-500" />
            <span className="text-sm">Garantia de 30 dias</span>
          </div>
          <div className="flex items-center text-gray-500">
            <Clock className="w-5 h-5 mr-2 text-green-500" />
            <span className="text-sm">Acesso Imediato</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => updateResumeData({ currentStep: resumeData.currentStep - 1 })}
          className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Voltar
        </button>

        {preferenceId ? (
          <MPWallet 
            initialization={{ preferenceId }}
            customization={{ texts: { action: 'Pagar' } }}
          />
        ) : (
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="px-8 py-4 font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processando...</span>
              </>
            ) : (
              <>
                <span>Finalizar Compra</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Terms and Trust */}
      <div className="text-center space-y-4">
        <p className="text-sm text-gray-500">
          Ao finalizar a compra, você concorda com nossos{' '}
          <a href="#" className="text-blue-600 hover:underline">Termos de Serviço</a>
          {' '}e{' '}
          <a href="#" className="text-blue-600 hover:underline">Política de Privacidade</a>
        </p>
        <div className="flex items-center justify-center text-gray-400 text-sm">
          <Shield className="w-4 h-4 mr-2" />
          <span>Pagamento processado de forma segura pelo Mercado Pago</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentStep;