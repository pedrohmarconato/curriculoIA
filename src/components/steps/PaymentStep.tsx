import React, { useState, useCallback, useEffect } from 'react';
import { useResume } from '../../contexts/ResumeContext';
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
import { ResumeData } from '../../lib/resume-ai';

// Inicializa o MercadoPago com a chave pública (certifique-se que esta variável existe)
if (import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY) {
  initMercadoPago(import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY);
}

// Planos disponíveis
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
  
  // Estados
  const [selectedPlan, setSelectedPlan] = useState('premium');
  const [paymentMethod, setPaymentMethod] = useState('credit');
  const [isProcessing, setIsProcessing] = useState(false);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [resumePreviewData, setResumePreviewData] = useState<ResumeData | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  // Função para extrair dados do PDF
  const extractResumeData = useCallback(async () => {
    if (!resumeData.resumeFile?.url) {
      toast.error("URL do PDF não disponível");
      return null;
    }
    
    setIsGeneratingPreview(true);
    
    try {
      // Extrair texto do PDF
      const extractedText = await extractTextFromPdf(resumeData.resumeFile.url);
      
      // Verificar se o texto parece ser um currículo - apenas uma vez
      const isResume = looksLikeResume(extractedText);
      if (!isResume) {
        toast("O arquivo enviado não parece ser um currículo. A visualização pode não ser ideal.", {
          icon: '⚠️',
          style: {
            borderRadius: '10px',
            background: '#FEF3C7',
            color: '#92400E',
          },
          // Evitar duplicação adicionando um ID
          id: 'resume-warning',
        });
      }
      
      // Criar dados simples de currículo para visualização
      const basicData: ResumeData = {
        personalInfo: {
          name: resumeData.user?.name || "Nome não encontrado",
          contact: {
            email: resumeData.user?.email || "",
            phone: "",
            location: ""
          }
        },
        experience: [{
          company: "Empresa",
          role: "Cargo/Função",
          period: {
            start: "2020-01",
            end: "present"
          },
          description: "Detalhes da sua experiência profissional aparecerão aqui após a compra.",
          achievements: ["Conquistas e responsabilidades serão listadas aqui."]
        }],
        education: [{
          institution: "Instituição de Ensino",
          degree: "Grau Acadêmico",
          field: "Área de Estudo",
          period: {
            start: "2015-01",
            end: "2019-12"
          }
        }],
        skills: {
          technical: [
            { name: "Habilidade Técnica 1", level: "avançado" },
            { name: "Habilidade Técnica 2", level: "intermediário" }
          ],
          interpersonal: [
            { name: "Comunicação", level: "avançado" },
            { name: "Trabalho em Equipe", level: "avançado" }
          ],
          tools: [
            { name: "Microsoft Office", level: "avançado" }
          ]
        },
        languages: [
          { name: "Português", level: "nativo" },
          { name: "Inglês", level: "intermediário" }
        ],
        certifications: []
      };
      
      // Definir dados para visualização
      setResumePreviewData(basicData);
      updateResumeData({ resumeData: basicData });
      
      return basicData;
    } catch (error) {
      console.error("Erro ao processar PDF:", error);
      toast.error("Não foi possível extrair informações do PDF. Exibindo versão simplificada.");
      return null;
    } finally {
      setIsGeneratingPreview(false);
    }
  }, [resumeData.resumeFile, resumeData.user, updateResumeData]);

  // Gerar prévia do currículo
  const generatePreview = useCallback(async () => {
    setIsGeneratingPreview(true);
    
    try {
      // Se já temos dados analisados, usamos eles
      if (resumeData.resumeData) {
        setResumePreviewData(resumeData.resumeData);
        return;
      }
      
      // Se temos um PDF, tentamos extrair os dados
      if (resumeData.resumeFile?.url) {
        await extractResumeData();
        return;
      }
      
      // Se não temos dados nem arquivo, usamos os dados do usuário
      const userData: ResumeData = {
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
            company: "Compre um plano para ver detalhes completos",
            role: "Seu cargo atual",
            period: {
              start: "2020-01",
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
              start: "2015-01",
              end: "2019-12"
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
        ],
        certifications: []
      };
      
      setResumePreviewData(userData);
    } catch (error) {
      console.error('Erro ao gerar prévia:', error);
      toast.error('Houve um erro ao gerar a prévia. Tentando novamente com dados simplificados.');
      
      // Dados básicos de fallback
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

  // Inicializa a prévia do currículo ao carregar o componente
  useEffect(() => {
    if (resumeData.resumeFile?.url && !resumeData.resumeData) {
      extractResumeData();
    } else {
      generatePreview();
    }
  }, [resumeData.resumeFile, resumeData.resumeData, extractResumeData, generatePreview]);

  // Criar preferência de pagamento para o MercadoPago
  const createPreference = async () => {
    setIsProcessing(true);
    try {
      const selectedPlanData = plans.find(plan => plan.id === selectedPlan);
      if (!selectedPlanData) throw new Error('Plano não encontrado');

      const { data, error } = await supabase.functions.invoke('create-preference', {
        body: {
          title: `Plano ${selectedPlanData.name}`,
          price: selectedPlanData.price,
          quantity: 1,
        },
      });

      if (error) throw error;

      if (data && data.id) {
        setPreferenceId(data.id);
      } else {
        throw new Error('Erro ao criar preferência de pagamento');
      }
    } catch (error) {
      console.error('Erro ao criar preferência:', error);
      toast.error('Erro ao iniciar pagamento. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Criar pagamento PIX
  const createPixPayment = async () => {
    setIsProcessing(true);
    try {
      const selectedPlanData = plans.find(plan => plan.id === selectedPlan);
      if (!selectedPlanData) throw new Error('Plano não encontrado');

      const { data, error } = await supabase.functions.invoke('create-pix', {
        body: {
          planId: selectedPlan,
          amount: selectedPlanData.price,
        },
      });

      if (error) throw error;

      if (data && data.qrCode) {
        // Aqui você poderia mostrar o QR code para o usuário
        toast.success('QR Code PIX gerado com sucesso!');
      } else {
        throw new Error('Erro ao gerar PIX');
      }
    } catch (error) {
      console.error('Erro ao gerar PIX:', error);
      toast.error('Erro ao gerar PIX. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Processar pagamento conforme método selecionado
  const handlePayment = async () => {
    if (paymentMethod === 'credit') {
      await createPreference();
    } else if (paymentMethod === 'pix') {
      await createPixPayment();
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
                  toast("Tentando extrair dados do seu currículo...", {
                  icon: 'ℹ️',
                  style: {
                    borderRadius: '10px',
                    background: '#E0F2FE',
                    color: '#0369A1',
                  },
                  id: 'extract-info', // ID único para evitar duplicação
                });
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
          <div className="mercadopago-button-container">
            {/* Renderização condicional do botão do MercadoPago */}
            {typeof MPWallet === 'function' && (
              <MPWallet 
                initialization={{ preferenceId }}
                customization={{ texts: { action: 'Pagar' } }}
              />
            )}
          </div>
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