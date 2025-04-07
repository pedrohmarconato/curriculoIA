import React, { useState, useEffect } from 'react';
import { useResume } from '../../context/ResumeContext';
// Corrige o caminho de importação para o cliente Supabase
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
  AlertCircle
} from 'lucide-react';
import { initMercadoPago, Wallet as MPWallet } from '@mercadopago/sdk-react';
import { useCredits } from '../../hooks/useCredits';
import { analyzeResume, extractResumeFromPDF, extractResumeFromLinkedIn, generateVisualResume } from '../../lib/resume-ai';
import ResumePreview from '../ResumePreview';
import toast from 'react-hot-toast';

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
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [resumePreviewData, setResumePreviewData] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    generatePreview();
  }, []);

  const generatePreview = async () => {
    setIsGeneratingPreview(true);
    try {
      let resumeText = '';
      
      if (resumeData.resumeFile?.url) {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/resume-ai`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'extract',
            data: { url: resumeData.resumeFile.url }
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || 'Failed to extract resume text');
        }
        resumeText = result.data;
      } else if (resumeData.linkedinProfile) {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/resume-ai`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'linkedin',
            data: { url: resumeData.linkedinProfile }
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || 'Failed to extract LinkedIn profile');
        }
        resumeText = result.data;
      } else {
        throw new Error('No resume source provided');
      }

      // Get user session to obtain the access token
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        console.error('Error getting session or user not authenticated:', sessionError);
        // Optionally, trigger logout or show a message
        setLoading(false);
        setError('Authentication error. Please log in again.');
        return; // Stop execution if not authenticated
      }
      const accessToken = sessionData.session.access_token;

      // Call the 'analyze' action of the Supabase function
      const analyzeResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/resume-ai`, {
        method: 'POST',
        headers: {
          // Use the user's access token for authorization
          'Authorization': `Bearer ${accessToken}`,
          // The anon key is often needed as an API key for the gateway
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'analyze',
          data: { text: resumeText } // Ensure resumeText has the correct content
        })
      });

      if (!analyzeResponse.ok) {
        const errorData = await analyzeResponse.json().catch(() => ({ error: 'Failed to parse error response' }));
        throw new Error(errorData.error || `HTTP error! status: ${analyzeResponse.status}`);
      }

      const analyzeResult = await analyzeResponse.json();
      if (!analyzeResult.success) {
        throw new Error(analyzeResult.error || 'Failed to analyze resume');
      }

      const generateResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/resume-ai`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate',
          data: {
            resume: analyzeResult.data,
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
        })
      });

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json().catch(() => ({ error: 'Failed to parse error response' }));
        throw new Error(errorData.error || `HTTP error! status: ${generateResponse.status}`);
      }

      const generateResult = await generateResponse.json();
      if (!generateResult.success) {
        throw new Error(generateResult.error || 'Failed to generate visual resume');
      }

      setResumePreviewData(analyzeResult.data);
      setPreviewHtml(generateResult.data);
      setRetryCount(0);
    } catch (error) {
      console.error('Error generating preview:', error);
      
      if (retryCount < maxRetries) {
        console.log(`Retrying preview generation (attempt ${retryCount + 1}/${maxRetries})`);
        setRetryCount(prev => prev + 1);
        setTimeout(generatePreview, 2000 * (retryCount + 1));
      } else {
        toast.error('Não foi possível gerar a prévia do currículo. Por favor, tente novamente mais tarde.', {
          duration: 5000,
          icon: <AlertCircle className="text-red-500" />,
        });
      }
    } finally {
      setIsGeneratingPreview(false);
    }
  };

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
          <h3 className="text-xl font-semibold text-gray-900">
            Prévia do Currículo
          </h3>
          {isGeneratingPreview ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
              <p className="mt-4 text-gray-600">Gerando prévia do currículo...</p>
            </div>
          ) : resumePreviewData ? (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div dangerouslySetInnerHTML={{ __html: previewHtml || '' }} />
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                Não foi possível gerar a prévia do currículo.
                Por favor, tente novamente.
              </p>
              <button
                onClick={generatePreview}
                disabled={isGeneratingPreview}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
              >
                {isGeneratingPreview ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Tentando novamente...</span>
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4" />
                    <span>Tentar Novamente</span>
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