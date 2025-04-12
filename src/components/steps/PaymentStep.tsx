// src/components/steps/PaymentStep.tsx
import React, { useContext } from 'react';
// TODO: Importe o contexto REAL de autenticação/usuário
// import { AuthContext } from '../../contexts/AuthContext';

// Exemplo de tipo para o usuário (ajuste conforme sua estrutura real)
interface User {
  id: string;
  email: string; // Assumimos que o email é obrigatório para um usuário logado
  name?: string;
}

// Exemplo de tipo para o contexto de autenticação (ajuste conforme sua estrutura real)
interface AuthContextType {
  user: User | null; // Usuário logado ou null
  loading: boolean; // Indica carregamento inicial dos dados/sessão
  isAuthenticated: boolean; // Flag explícita de autenticação
}

// Exemplo: Contexto mock para demonstração. Remova ou substitua pelo seu real.
const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const PaymentStep = () => {
  // --- Obtenha dados do Contexto Real ---
  // Descomente e ajuste conforme seu AuthContext real:
  // const authContext = useContext(AuthContext);
  // if (!authContext) {
  //   // Isso não deveria acontecer se o Provider estiver configurado corretamente
  //   throw new Error('AuthContext não encontrado. Verifique o AuthProvider.');
  // }
  // const { user, loading, isAuthenticated } = authContext;
  // --- Fim do Contexto Real ---

  // --- Simulação para desenvolvimento/teste (Remova ao usar contexto real) ---
  const isAuthenticated = true; // Simula usuário autenticado
  const loading = false; // Simula que dados carregaram
  const user: User | null = isAuthenticated ? { id: '123', email: 'user@example.com', name: 'Test User' } : null; // Simula dados do usuário se autenticado
  // --- Fim da Simulação ---

  // 1. Estado de Carregamento Inicial
  // Mostra um loader enquanto o AuthContext verifica a sessão, etc.
  if (loading) {
    return <div>Verificando sessão...</div>;
  }

  // 2. Verificação de Autenticação e Dados Essenciais
  // Se não estiver autenticado ou (por algum erro) não houver dados do usuário, impede o acesso.
  // Isso é uma salvaguarda, a proteção de rota deve ser a primeira linha de defesa.
  if (!isAuthenticated || !user) {
     console.error('Erro: Acesso não autorizado ou dados do usuário ausentes no PaymentStep.');
     // Idealmente, um hook ou componente de Rota Protegida já teria redirecionado para /login
     // Poderia adicionar um redirecionamento aqui como fallback:
     // useEffect(() => { navigate('/login'); }, [navigate]);
     return <div>Acesso não autorizado. Você será redirecionado para o login.</div>;
  }

  // A partir daqui, podemos assumir que `isAuthenticated` é true e `user` não é null.
  // ... resto do código do componente (handleInitiatePayment, return JSX)

  const handleInitiatePayment = () => {
    // Lógica para iniciar o pagamento

    // Acesso seguro ao email usando encadeamento opcional e verificação
    // A linha abaixo é um exemplo de onde o erro pode ocorrer (linha 130 no seu código original)
    const userEmail = user?.email; // Usar encadeamento opcional

    // Verificar se o email existe antes de prosseguir
    if (userEmail) {
      console.log(`Iniciando processo de pagamento para o email: ${userEmail}`);
      // ... chamar API de pagamento, etc.
    } else {
      console.error('Erro: Email do usuário não encontrado. Não é possível iniciar o pagamento.');
      // Opcional: Mostrar uma mensagem de erro para o usuário
      alert('Não foi possível encontrar seu email para iniciar o pagamento. Por favor, tente fazer login novamente.');
    }
  };

  // Adicionar uma verificação de carregamento antes de renderizar
  if (loading) {
     return <div>Carregando dados do usuário...</div>;
  }

  // Opcional: Verificar se o usuário existe após o carregamento
  // if (!user) {
  //   return <div>Erro: Usuário não encontrado. Por favor, faça login.</div>;
  // }

  return (
    <div>
      <h2>Etapa de Pagamento</h2>
      {/* Exibe o email do usuário associado ao pagamento */}
      <p>Pagamento para: <strong>{user.email}</strong></p>
      <button
        onClick={handleInitiatePayment}
        // Desabilitar o botão se o email não estiver disponível
        disabled={!user?.email || loading}
      >
        Prosseguir para Pagamento
      </button>
      {/* ... resto do JSX */}
    </div>
  );
};

export default PaymentStep;

// Adicionando um Provider mock para o exemplo funcionar isoladamente
// Em sua aplicação real, você terá seu próprio UserProvider
export const MockUserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user] = React.useState<User | null>({ id: '123', email: 'test@example.com', name: 'Test User' });
  const [loading] = React.useState<boolean>(false);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
};

// Nota: A linha do erro original (130) pode ter mudado de número com estas alterações.
// O ponto crucial é a lógica dentro de handleInitiatePayment.
