import { useState } from 'react';
import { useResume } from '../../context/ResumeContext';
import { Github, Mail, Linkedin, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const LoginStep = () => {
  const { setResumeData } = useResume();
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleSocialLogin = async (provider: 'github' | 'google' | 'linkedin') => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: provider === 'google' ? {
            access_type: 'offline',
            prompt: 'consent',
          } : undefined
        }
      });

      if (error) throw error;

      if (data) {
        toast.success(`Login com ${provider} iniciado`);
      }
    } catch (err) {
      toast.error('Erro ao fazer login. Por favor, tente novamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isRegistering) {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name
            }
          }
        });

        if (error) throw error;

        if (data) {
          toast.success('Cadastro realizado com sucesso! Verifique seu email.');
          setIsRegistering(false);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });

        console.log('Login attempt result:', { data, error }); // DEBUG LOG
        if (error) throw error;

        if (data.user) {
          setResumeData(prev => ({
            ...prev,
            isAuthenticated: true,
            currentStep: 2,
            user: {
              id: data.user.id,
              email: data.user.email || '',
              name: data.user.user_metadata?.full_name || ''
            }
          }));
          toast.success('Login realizado com sucesso!');
        }
      }
    } catch (err) {
      toast.error(isRegistering ? 'Erro ao criar conta.' : 'Erro ao fazer login.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (showEmailForm) {
    return (
      <div className="max-w-md mx-auto space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary mb-3">
            {isRegistering ? 'Criar Conta' : 'Entrar'}
          </h2>
          <p className="text-primary/70">
            {isRegistering
              ? 'Preencha seus dados para criar uma conta'
              : 'Entre com seu email e senha'}
          </p>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          {isRegistering && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-primary mb-1">
                Nome Completo
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-secondary rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="Seu nome completo"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-primary mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-secondary rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-primary mb-1">
              Senha
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              minLength={6}
              className="w-full px-4 py-2 border border-secondary rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors duration-200"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                {isRegistering ? 'Criar Conta' : 'Entrar'}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="text-center space-y-4">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-accent hover:underline"
          >
            {isRegistering
              ? 'Já tem uma conta? Entre aqui'
              : 'Não tem uma conta? Cadastre-se'}
          </button>
          <button
            onClick={() => setShowEmailForm(false)}
            className="block mx-auto text-primary/70 hover:text-primary"
          >
            Voltar para opções de login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-primary mb-3">Bem-vindo(a)!</h2>
        <p className="text-primary/70">
          Escolha uma das opções abaixo para continuar
        </p>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => handleSocialLogin('google')}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-secondary rounded-lg text-primary hover:bg-secondary/10 transition-colors duration-200"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="font-medium">Continuar com Google</span>
        </button>

        <button
          onClick={() => handleSocialLogin('linkedin')}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-secondary rounded-lg text-primary hover:bg-secondary/10 transition-colors duration-200"
        >
          <Linkedin className="h-5 w-5 text-[#0A66C2]" />
          <span className="font-medium">Continuar com LinkedIn</span>
        </button>

        <button
          onClick={() => handleSocialLogin('github')}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-secondary rounded-lg text-primary hover:bg-secondary/10 transition-colors duration-200"
        >
          <Github className="h-5 w-5" />
          <span className="font-medium">Continuar com GitHub</span>
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-secondary" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-primary/70">Ou</span>
          </div>
        </div>

        <button
          onClick={() => setShowEmailForm(true)}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors duration-200"
        >
          <Mail className="h-5 w-5" />
          <span className="font-medium">Continuar com Email</span>
        </button>
      </div>

      <div className="text-center text-sm text-primary/70">
        <p>
          Ao continuar, você concorda com nossos{' '}
          <a href="#" className="text-accent hover:underline">
            Termos de Serviço
          </a>{' '}
          e{' '}
          <a href="#" className="text-accent hover:underline">
            Política de Privacidade
          </a>
        </p>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg shadow-xl">
            <Loader2 className="h-8 w-8 animate-spin text-accent mx-auto" />
            <p className="mt-2 text-sm text-primary">Processando...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginStep;